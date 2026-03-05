// ─────────────────────────────────────────────────────────────────────────────
//  ocrIntegration.js  —  Enhanced document extraction with OCR fallback
//
//  Provides:
//  - OCR-enhanced text extraction (better for scanned documents)
//  - Fallback mechanism: try native extraction → OCR if quality is low
//  - Quality scoring for automatic fallback decision
// ─────────────────────────────────────────────────────────────────────────────

import {
  extractTextFromImage,
  extractTextFromPDF,
  cleanOCRText,
  isLikelyOCRText,
  terminateOCRWorker,
} from './ocrProcessor.js';
import { extractDocumentPages } from './fileHelpers.js';

/**
 * Assess the quality of extracted text
 * @param {string} text - Text to assess
 * @returns {number} Quality score 0-100 (higher is better)
 */
export const assessTextQuality = (text) => {
  if (!text || text.length < 50) return 0;

  let score = 100;

  // Penalize high whitespace ratio
  const whitespaceDensity = (text.match(/\s+/g) || []).length / text.length;
  if (whitespaceDensity > 0.3) score -= 20;

  // Penalize low alphanumeric ratio
  const alphanumericRatio = (text.match(/[a-zA-Z0-9]/g) || []).length / text.length;
  if (alphanumericRatio < 0.3) score -= 30;

  // Penalize repeated characters (sign of corruption)
  const repeatedChars = (text.match(/(.)\1{5,}/g) || []).length;
  score -= repeatedChars * 5;

  // Check for coherent words (Indonesian/English)
  const commonWords = text.match(
    /\b(the|and|or|adalah|dan|atau|untuk|dari|yang|di|ke|dengan|pada|ini|itu)\b/gi
  ) || [];
  const wordiness = commonWords.length / (text.split(/\s+/).length || 1);
  if (wordiness < 0.02) score -= 25;

  return Math.max(0, Math.min(100, score));
};

/**
 * Extract text with optional OCR enhancement
 * Automatically uses OCR if native extraction quality is low
 * @param {File|Blob} file - Document file to extract from
 * @param {Object} options - Configuration options
 *   - enableOCR: boolean (default: true) - Use OCR for low-quality text
 *   - qualityThreshold: number (default: 50) - Quality score to trigger OCR (0-100)
 *   - forceOCR: boolean (default: false) - Always use OCR regardless of quality
 *   - languages: string[] (default: ['ind', 'eng']) - OCR languages
 *   - onProgress: Function - Progress callback
 * @returns {Promise<object>} { pages, fullText, method, quality, ocrApplied }
 */
export const extractDocumentWithOCR = async (file, options = {}) => {
  const {
    enableOCR = true,
    qualityThreshold = 50,
    forceOCR = false,
    languages = ['ind', 'eng'],
    onProgress = null,
  } = options;

  try {
    // Step 1: Try native extraction first
    if (onProgress) onProgress('Extracting text using native methods...', 0);

    let nativeResult = null;
    let hasError = false;

    try {
      nativeResult = await extractDocumentPages(file);
    } catch (error) {
      console.warn('Native extraction failed:', error);
      hasError = true;
    }

    // Step 2: Assess quality and decide if OCR is needed
    const textQuality = nativeResult
      ? assessTextQuality(nativeResult.fullText)
      : 0;

    const shouldUseOCR =
      forceOCR ||
      (enableOCR && (hasError || textQuality < qualityThreshold));

    if (!shouldUseOCR && nativeResult) {
      // Native extraction is good enough
      return {
        pages: nativeResult.pages,
        fullText: nativeResult.fullText,
        method: 'native',
        quality: textQuality,
        ocrApplied: false,
      };
    }

    // Step 3: Apply OCR
    if (!shouldUseOCR) {
      throw new Error('No viable extraction method available');
    }

    if (onProgress) onProgress('Applying OCR for better text recognition...', 30);

    const isPdf = file.type === 'application/pdf';
    let ocrText;

    if (isPdf) {
      ocrText = await extractTextFromPDF(file, onProgress, languages);
    } else {
      ocrText = await extractTextFromImage(file, onProgress, languages);
    }

    // Clean OCR output
    const cleanedText = cleanOCRText(ocrText);
    const ocrQuality = assessTextQuality(cleanedText);

    if (onProgress) onProgress('OCR processing complete', 100);

    // Return OCR result or fallback to native if OCR failed
    if (nativeResult && ocrQuality < textQuality) {
      console.warn('OCR quality lower than native, using native extraction');
      return {
        pages: nativeResult.pages,
        fullText: nativeResult.fullText,
        method: 'native_fallback',
        quality: textQuality,
        ocrApplied: false,
      };
    }

    return {
      pages: cleanedText.split(/\n{2,}/).filter((p) => p.length > 20),
      fullText: cleanedText,
      method: 'ocr',
      quality: ocrQuality,
      ocrApplied: true,
    };
  } catch (error) {
    console.error('Document extraction with OCR failed:', error);
    throw error;
  } finally {
    // Optional: Clean up OCR worker if desired
    // await terminateOCRWorker();
  }
};

/**
 * Batch process multiple documents with OCR
 * @param {File[]|Blob[]} files - Array of document files
 * @param {Object} options - Same options as extractDocumentWithOCR
 * @returns {Promise<Array>} Array of extraction results
 */
export const batchExtractWithOCR = async (files, options = {}) => {
  const results = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await extractDocumentWithOCR(files[i], {
        ...options,
        onProgress: (msg, progress) => {
          if (options.onProgress) {
            options.onProgress(`[File ${i + 1}/${files.length}] ${msg}`, progress);
          }
        },
      });
      results.push({ file: files[i].name, success: true, ...result });
    } catch (error) {
      results.push({
        file: files[i].name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Get OCR configuration recommendations based on document type
 * @param {File} file - Document file
 * @returns {Object} Recommended options
 */
export const getRecommendedOCRConfig = (file) => {
  const fileName = file.name.toLowerCase();
  const fileSize = file.size / 1024 / 1024; // MB

  // Scanned documents usually have larger file sizes
  const isLikelyScanned = fileSize > 5 || fileName.includes('scan');

  return {
    enableOCR: true,
    qualityThreshold: isLikelyScanned ? 40 : 55, // Lower threshold for scanned docs
    forceOCR: isLikelyScanned,
    languages: ['ind', 'eng'],
  };
};

export default {
  assessTextQuality,
  extractDocumentWithOCR,
  batchExtractWithOCR,
  getRecommendedOCRConfig,
};
