import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PDF_PAGE_LIMIT = 20; // Raised from 10; warn if document is larger

export const extractTextFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const totalPages = pdf.numPages;
    const pagesToRead = Math.min(totalPages, PDF_PAGE_LIMIT);
    
    if (totalPages > PDF_PAGE_LIMIT) {
        console.warn(`PDF has ${totalPages} pages — only reading the first ${PDF_PAGE_LIMIT}. Consider splitting long TOR documents for better AI accuracy.`);
    }

    let text = "";
    for (let i = 1; i <= pagesToRead; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }
    
    return text;
};

export const extractTextFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
};