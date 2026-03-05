# OCR Integration Guide - CEISA Document Generator

## Overview

The project now includes **Tesseract.js OCR** library for automatic text extraction from PDF documents and images. This allows the system to accurately read:

- ✅ Scanned PDF documents
- ✅ Image files (PNG, JPG, TIF, etc.)
- ✅ Low-quality or degraded documents
- ✅ Documents in Indonesian and English

## Files Added

### 1. `src/utils/ocrProcessor.js`
Core OCR engine with functions for:
- `extractTextFromImage()` - Extract text from images
- `extractTextFromPDF()` - Extract text from PDF files with OCR
- `batchExtractText()` - Process multiple documents at once
- `cleanOCRText()` - Post-process and clean OCR output
- `terminateOCRWorker()` - Clean up resources

### 2. `src/utils/ocrIntegration.js`
Smart wrapper that provides:
- Automatic fallback: tries native extraction first, then OCR if quality is low
- Quality assessment of extracted text
- Configuration recommendations based on document type
- Batch processing capabilities

## Usage Examples

### Simple Image OCR
```javascript
import { extractTextFromImage, cleanOCRText } from '@/utils/ocrProcessor';

// Extract text from an image file
const imageFile = document.getElementById('imageInput').files[0];
const rawText = await extractTextFromImage(imageFile, (msg) => {
  console.log('Progress:', msg);
});

const cleanedText = cleanOCRText(rawText);
console.log('Extracted text:', cleanedText);
```

### PDF with OCR
```javascript
import { extractTextFromPDF, terminateOCRWorker } from '@/utils/ocrProcessor';

// Extract from PDF with progress tracking
const pdfFile = document.getElementById('pdfInput').files[0];
const text = await extractTextFromPDF(
  pdfFile,
  (currentPage, totalPages) => {
    console.log(`Processing page ${currentPage}/${totalPages}`);
  },
  ['ind', 'eng'] // Languages: Indonesian + English
);

console.log('Full PDF text:', text);

// Clean up when done
await terminateOCRWorker();
```

### Smart Extraction (Recommended)
```javascript
import { extractDocumentWithOCR, getRecommendedOCRConfig } from '@/utils/ocrIntegration';

const file = document.getElementById('documentInput').files[0];

// Get smart configuration based on document
const config = getRecommendedOCRConfig(file);

// Extract with automatic fallback
const result = await extractDocumentWithOCR(file, {
  ...config,
  onProgress: (message, progress) => {
    console.log(`${message} (${progress}%)`);
  },
});

console.log('Method used:', result.method); // 'native', 'ocr', or 'native_fallback'
console.log('Quality score:', result.quality); // 0-100
console.log('OCR applied?', result.ocrApplied);
console.log('Extracted text:', result.fullText);
```

### Batch Processing
```javascript
import { batchExtractWithOCR } from '@/utils/ocrIntegration';

const files = document.getElementById('multiFileInput').files;

const results = await batchExtractWithOCR(Array.from(files), {
  enableOCR: true,
  qualityThreshold: 50,
  onProgress: (msg, progress) => console.log(msg),
});

results.forEach(result => {
  if (result.success) {
    console.log(`${result.file}: ${result.fullText.slice(0, 100)}...`);
  } else {
    console.error(`${result.file}: ${result.error}`);
  }
});
```

## Integration with CEISA Workflow

### Updating AI Processor
To use OCR with the CEISA AI processing pipeline:

```javascript
import { extractDocumentWithOCR } from '@/utils/ocrIntegration';
import { analyzeWithTriage } from '@/utils/aiProcessor';

// Step 1: Extract text with OCR
const extractionResult = await extractDocumentWithOCR(documentFile, {
  enableOCR: true,
  qualityThreshold: 50,
  forceOCR: false, // Use OCR only if needed
  onProgress: (msg) => console.log(msg),
});

// Step 2: Create pages structure
const pages = extractionResult.pages.map((text, idx) => ({
  pageNum: idx + 1,
  preview: text.substring(0, 300),
  fullText: text,
}));

// Step 3: Proceed with triage
const triageResult = await analyzeWithTriage(pages, null);
```

## Configuration Options

### `extractDocumentWithOCR()` Options

```javascript
{
  enableOCR: true,                    // Enable OCR fallback
  qualityThreshold: 50,               // Quality score (0-100) to trigger OCR
  forceOCR: false,                    // Always use OCR regardless
  languages: ['ind', 'eng'],          // OCR languages
  onProgress: (msg, percent) => {}   // Progress callback
}
```

### Language Codes
- `'ind'` - Indonesian
- `'eng'` - English
- `'zho_simp'` - Simplified Chinese
- `'ara'` - Arabic
- `'fra'` - French
- [Full list](https://github.com/naptha/tesseract.js#supported-languages)

## Quality Assessment

The system automatically scores extracted text quality (0-100) based on:
- ✅ Character density (not too sparse)
- ✅ Alphanumeric ratio (mostly readable text)
- ✅ Absence of repeated corruption
- ✅ Presence of common words (English/Indonesian)

**Scores:**
- 0-25: Very poor, OCR recommended
- 26-50: Below average, consider OCR
- 51-75: Good quality
- 76-100: Excellent quality

## Performance Notes

- **First run:** OCR worker initialization takes ~5-10 seconds
- **Per page:** ~2-5 seconds depending on text density and image quality
- **Languages:** Using both 'ind' and 'eng' adds minimal overhead
- **Offline:** All OCR processing happens locally, no API calls

## Troubleshooting

### Issue: OCR is slow
**Solution:** 
- Consider disabling OCR for documents that already have good native text
- Use `qualityThreshold` to only trigger OCR when needed

### Issue: Poor OCR quality
**Solution:**
- Ensure document has reasonable resolution (300+ DPI recommended)
- Try different language combinations
- Use `cleanOCRText()` for post-processing

### Issue: Worker already exists error
**Solution:**
```javascript
import { terminateOCRWorker } from '@/utils/ocrProcessor';
await terminateOCRWorker(); // Reset worker, then try again
```

## Installation Status

✅ `tesseract.js` has been installed
✅ All utilities are ready to use
✅ Development server is running

## Next Steps

1. **Integrate OCR into components** (e.g., TabBRD, TabFSD, etc.)
2. **Add UI feedback** for OCR progress
3. **Test** with sample scanned documents
4. **Monitor** performance and adjust quality thresholds

---

For more information on Tesseract.js:
https://github.com/naptha/tesseract.js
