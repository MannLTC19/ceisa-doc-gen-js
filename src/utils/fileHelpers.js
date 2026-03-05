// ─────────────────────────────────────────────────────────────────────────────
//  fileHelpers.js  —  Page-aware text extraction for PDF and DOCX
//  Returns both flat text AND a page-indexed array for two-pass triage
// ─────────────────────────────────────────────────────────────────────────────

import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Use the locally bundled worker — version always matches, no CDN needed
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

const MAX_PAGES = 150; // Hard cap — beyond this even the triage skeleton gets huge

// ─── PDF ─────────────────────────────────────────────────────────────────────
/**
 * Extracts text page-by-page from a PDF file.
 * Returns { pages, totalPages, parsedPages, fullText }
 */
export const extractPagesFromPdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf         = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages  = Math.min(pdf.numPages, MAX_PAGES);

  if (pdf.numPages > MAX_PAGES) {
    console.warn(`📄 Document has ${pdf.numPages} pages — processing first ${MAX_PAGES}.`);
  }

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    const page    = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text    = content.items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim();
    pages.push(text);
  }

  return {
    pages,
    totalPages:  pdf.numPages,
    parsedPages: totalPages,
    fullText:    pages.join('\n\n'),
  };
};

// ─── DOCX ─────────────────────────────────────────────────────────────────────
/**
 * DOCX has no real page boundaries — we estimate ~600 words per page.
 * Returns the same shape as extractPagesFromPdf.
 */
export const extractPagesFromDocx = async (file) => {
  const mammoth     = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result      = await mammoth.extractRawText({ arrayBuffer });
  const fullText    = result.value || '';

  const words          = fullText.split(/\s+/);
  const WORDS_PER_PAGE = 600;
  const pages          = [];

  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    pages.push(words.slice(i, i + WORDS_PER_PAGE).join(' '));
    if (pages.length >= MAX_PAGES) break;
  }

  return {
    pages,
    totalPages:  Math.ceil(words.length / WORDS_PER_PAGE),
    parsedPages: pages.length,
    fullText:    pages.join('\n\n'),
  };
};

// ─── IMAGE (via OCR) ─────────────────────────────────────────────────────────
/**
 * Extracts text from image files using OCR
 * Returns the same shape as other extractors
 */
export const extractPagesFromImage = async (file) => {
  const { extractTextFromImage } = await import('./ocrProcessor.js');
  
  try {
    const text = await extractTextFromImage(file, null, ['ind', 'eng']);
    return {
      pages: [text],
      totalPages: 1,
      parsedPages: 1,
      fullText: text,
    };
  } catch (error) {
    throw new Error(`Gagal mengekstrak teks dari gambar: ${error.message}`);
  }
};

// ─── Unified extractor ────────────────────────────────────────────────────────
/**
 * Auto-detects file type and returns { pages, totalPages, parsedPages, fullText }
 * Supports: PDF (native), DOCX, and image files (PNG, JPG, etc.) via OCR
 */
export const extractDocumentPages = async (file) => {
  const isPdf  = file.type === 'application/pdf';
  const isDocx = file.name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isImage = file.type?.startsWith('image/') ||
    /\.(png|jpg|jpeg|gif|bmp|tiff|webp)$/i.test(file.name);

  if (isPdf)  return await extractPagesFromPdf(file);
  if (isDocx) return await extractPagesFromDocx(file);
  if (isImage) return await extractPagesFromImage(file);

  throw new Error(`Format tidak didukung: "${file.name}". Harap unggah file .pdf, .docx, atau gambar.`);
};

// ─── Legacy flat extractors (kept for backward compatibility) ─────────────────
export const extractTextFromPdf = async (file) => {
  const result = await extractPagesFromPdf(file);
  return result.fullText;
};

export const extractTextFromDocx = async (file) => {
  const result = await extractPagesFromDocx(file);
  return result.fullText;
};