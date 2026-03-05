// ─────────────────────────────────────────────────────────────────────────────
//  ocrProcessor.js  —  OCR Engine for document text extraction
//
//  Uses Tesseract.js to extract text from:
//  - PDF pages (via canvas rendering)
//  - Images (PNG, JPG, etc.)
//  - Scanned documents
//
//  Features:
//  - Offline OCR (no API calls needed)
//  - Multi-language support (default: Indonesian + English)
//  - Progress callback for UI updates
//  - Error handling and fallback
// ─────────────────────────────────────────────────────────────────────────────

import Tesseract from 'tesseract.js';

// Initialize Tesseract worker (lazy loaded on first use)
let ocrWorker = null;

/**
 * Initialize OCR worker with specified languages
 * @param {string[]} languages - Languages to recognize (default: ['ind', 'eng'])
 * @returns {Promise<Tesseract.Worker>}
 */
export const initializeOCRWorker = async (languages = ['ind', 'eng']) => {
  if (ocrWorker) return ocrWorker;

  try {
    ocrWorker = await Tesseract.createWorker({
      logger: (m) => console.log('OCR Progress:', m),
    });

    await ocrWorker.loadLanguage(languages.join('+'));
    await ocrWorker.initialize(languages.join('+'));
    
    return ocrWorker;
  } catch (error) {
    console.error('Failed to initialize OCR worker:', error);
    throw new Error(`OCR initialization failed: ${error.message}`);
  }
};

/**
 * Extract text from an image or canvas using OCR
 * @param {File|Blob|Canvas|string} source - Image file, blob, canvas, or image URL
 * @param {Function} onProgress - Callback for progress updates
 * @param {string[]} languages - Languages to recognize
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromImage = async (
  source,
  onProgress = null,
  languages = ['ind', 'eng']
) => {
  try {
    const worker = await initializeOCRWorker(languages);

    const result = await worker.recognize(source);
    const extractedText = result.data.text;

    if (onProgress) onProgress('OCR text extraction completed');

    return extractedText;
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from all pages in a PDF
 * Requires pdfjs-dist to be already loaded
 * @param {File|Blob} pdfFile - PDF file to process
 * @param {Function} onProgress - Callback for progress updates (receives page number and total)
 * @param {string[]} languages - Languages to recognize
 * @returns {Promise<string>} Combined text from all PDF pages
 */
export const extractTextFromPDF = async (
  pdfFile,
  onProgress = null,
  languages = ['ind', 'eng']
) => {
  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    const worker = await initializeOCRWorker(languages);
    const allText = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 }); // 2x for better OCR

      // Create canvas for page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render page to canvas
      await page.render({ canvasContext: context, viewport }).promise;

      // OCR canvas
      const result = await worker.recognize(canvas);
      allText.push(result.data.text);

      if (onProgress) {
        onProgress(pageNum, pdf.numPages);
      }
    }

    return allText.join('\n\n--- Page Break ---\n\n');
  } catch (error) {
    console.error('PDF OCR extraction failed:', error);
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
};

/**
 * Batch process multiple images for OCR
 * @param {File[]|Blob[]} sources - Array of image files or blobs
 * @param {Function} onProgress - Callback for progress updates
 * @param {string[]} languages - Languages to recognize
 * @returns {Promise<string[]>} Array of extracted text
 */
export const batchExtractText = async (
  sources,
  onProgress = null,
  languages = ['ind', 'eng']
) => {
  try {
    const worker = await initializeOCRWorker(languages);
    const results = [];

    for (let i = 0; i < sources.length; i++) {
      const result = await worker.recognize(sources[i]);
      results.push(result.data.text);

      if (onProgress) {
        onProgress(i + 1, sources.length);
      }
    }

    return results;
  } catch (error) {
    console.error('Batch OCR extraction failed:', error);
    throw new Error(`Batch text extraction failed: ${error.message}`);
  }
};

/**
 * Terminate OCR worker to free resources
 * Call this when done with OCR processing
 * @returns {Promise<void>}
 */
export const terminateOCRWorker = async () => {
  if (ocrWorker) {
    try {
      await ocrWorker.terminate();
      ocrWorker = null;
      console.log('OCR worker terminated');
    } catch (error) {
      console.error('Error terminating OCR worker:', error);
    }
  }
};

/**
 * Convert PDF file to images first, then apply OCR
 * Useful for handling scanned PDFs with degraded text
 * @param {File|Blob} pdfFile - PDF file
 * @param {Function} onProgress - Progress callback
 * @param {string[]} languages - Languages to recognize
 * @returns {Promise<string>} Extracted and cleaned text
 */
export const extractTextFromScannedPDF = async (
  pdfFile,
  onProgress = null,
  languages = ['ind', 'eng']
) => {
  return extractTextFromPDF(pdfFile, onProgress, languages);
};

// ─── Utility: Clean and normalize OCR output ─────────────────────────────────
/**
 * Post-process OCR text to improve quality
 * @param {string} text - Raw OCR output
 * @returns {string} Cleaned text
 */
export const cleanOCRText = (text) => {
  return text
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Fix common OCR errors
    .replace(/[l|1][Oo0]/g, '10') // Common digit confusion
    .replace(/[Oo0][Ll|]/g, '01')
    // Normalize line breaks
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * Check if text appears to be scanned/OCR'd
 * (helps determine if re-OCR is needed)
 * @param {string} text - Text to analyze
 * @returns {boolean}
 */
export const isLikelyOCRText = (text) => {
  if (!text || text.length < 100) return false;
  // Check for high proportion of common OCR errors
  const errors = (text.match(/[l|1Oo0]{5,}/g) || []).length;
  return errors > text.length * 0.01; // >1% error rate suggests OCR
};

export default {
  initializeOCRWorker,
  extractTextFromImage,
  extractTextFromPDF,
  batchExtractText,
  terminateOCRWorker,
  extractTextFromScannedPDF,
  cleanOCRText,
  isLikelyOCRText,
};
