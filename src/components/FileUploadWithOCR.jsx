import React, { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle2, AlertCircle, FileText, Image as ImageIcon, Info, TrendingUp } from 'lucide-react';
import { Tooltip } from 'antd';
import { extractDocumentWithOCR, getRecommendedOCRConfig } from '../utils/ocrIntegration';

/**
 * FileUploadWithOCR Component
 * 
 * Reusable file upload component with OCR support
 * Accepts: PDF (native or scanned), Images, Excel, Doc, or any file
 * 
 * Props:
 *   - onFileExtracted: (text, file, metadata) => void - Callback when text is extracted
 *   - acceptedFormats: string - File accept pattern (default: all documents/images)
 *   - label: string - Custom upload label
 *   - enableOCR: boolean - Enable OCR fallback (default: true)
 *   - qualityThreshold: number - Quality score threshold (0-100)
 */
export const FileUploadWithOCR = ({
  onFileExtracted,
  acceptedFormats = '.pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.docx,.doc,.xlsx,.xls',
  label = 'Unggah Dokumen',
  enableOCR = true,
  qualityThreshold = 50,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileName) => {
    const ext = fileName.toLowerCase().split('.').pop();
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'];
    return imageExts.includes(ext) ? ImageIcon : FileText;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress('Initializing...');
    setResult(null);

    try {
      // Get recommended config based on file
      const config = getRecommendedOCRConfig(file);

      // Extract text with OCR
      const extractionResult = await extractDocumentWithOCR(file, {
        enableOCR,
        qualityThreshold,
        languages: ['ind', 'eng'],
        onProgress: (msg, percent) => {
          setProgress(msg || `Processing... ${percent}%`);
        },
      });

      // Prepare metadata
      const metadata = {
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + ' KB',
        fileType: file.type || 'Unknown',
        extractionMethod: extractionResult.method,
        quality: extractionResult.quality,
        ocrApplied: extractionResult.ocrApplied,
        timestamp: new Date().toLocaleString('id-ID'),
      };

      setResult(metadata);
      setProgress('');

      // Call parent callback
      if (onFileExtracted) {
        onFileExtracted(extractionResult.fullText, file, metadata);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('File processing error:', err);
      setError(err.message || 'Gagal memproses file');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#50cd89'; // Green
    if (confidence >= 60) return '#ffc700'; // Yellow
    if (confidence >= 40) return '#ff9500'; // Orange
    return '#f1416c'; // Red
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 90) return 'Sempurna';
    if (confidence >= 80) return 'Sangat Bagus';
    if (confidence >= 70) return 'Bagus';
    if (confidence >= 60) return 'Cukup';
    if (confidence >= 50) return 'Sedang';
    return 'Rendah - Review Manual Direkomendasikan';
  };

  const FileIcon = result ? getFileIcon(result.fileName) : null;

  return (
    <div className={`kt-form-row ${className}`}>
      <label className="kt-label">{label}</label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #3f6ad8',
          borderRadius: 8,
          padding: 16,
          backgroundColor: 'rgba(63, 106, 216, 0.05)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'all 0.3s ease',
        }}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleFileChange}
          disabled={loading}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {loading ? (
            <>
              <Loader2 style={{ width: 32, height: 32, color: '#3f6ad8', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: '#3f6ad8' }}>{progress}</div>
            </>
          ) : error ? (
            <>
              <AlertCircle style={{ width: 32, height: 32, color: '#f1416c' }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: '#f1416c' }}>{error}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                Coba lagi dengan file yang berbeda
              </div>
            </>
          ) : result ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 style={{ width: 32, height: 32, color: '#50cd89' }} />
                {FileIcon && <FileIcon style={{ width: 24, height: 24, color: '#3f6ad8' }} />}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#50cd89' }}>
                {result.fileName}
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                {result.fileSize} • {result.extractionMethod.toUpperCase()}
                {result.ocrApplied && ' • OCR Applied'}
              </div>
              
              {/* Confidence Score Display with Tooltip */}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tooltip title={`OCR Confidence: ${result.confidence}% - ${getConfidenceLabel(result.confidence)}`}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    backgroundColor: getConfidenceColor(result.confidence),
                    borderRadius: 4,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'help'
                  }}>
                    <TrendingUp size={14} />
                    {result.confidence}% Confidence
                  </div>
                </Tooltip>
              </div>

              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                Quality: {result.quality}/100 • {result.timestamp}
              </div>
            </>
          ) : (
            <>
              <Upload style={{ width: 32, height: 32, color: '#3f6ad8' }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: '#3f6ad8' }}>
                Klik atau drag file ke sini
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                PDF, Gambar (PNG, JPG), Doc, Excel, atau format dokumen lainnya
              </div>
              {enableOCR && (
                <div style={{ fontSize: 11, color: '#666', marginTop: 4, fontStyle: 'italic' }}>
                  ✓ OCR tersedia untuk dokumen scanned
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f5f8fa', borderRadius: 6 }}>
          <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div><strong>Tipe:</strong> {result.fileType}</div>
            <div><strong>Ukuran:</strong> {result.fileSize}</div>
            <div><strong>Metode:</strong> {result.extractionMethod}</div>
            <div><strong>Kualitas:</strong> {result.quality}%</div>
            <div><strong>Confidence:</strong> 
              <span style={{ color: getConfidenceColor(result.confidence), fontWeight: 600, marginLeft: 4 }}>
                {result.confidence}%
              </span>
            </div>
            <div><strong>Waktu:</strong> {result.timestamp}</div>
            
            {/* Confidence Interpretation */}
            <div style={{ gridColumn: '1/-1', marginTop: 4, padding: 8, backgroundColor: getConfidenceColor(result.confidence), color: '#fff', borderRadius: 4, fontSize: 11 }}>
              <strong>Confidence Status:</strong> {getConfidenceLabel(result.confidence)}
            </div>
            
            {result.ocrApplied && (
              <div style={{ gridColumn: '1/-1', color: '#50cd89', marginTop: 4 }}>
                ✓ OCR diterapkan untuk text extraction dengan confidence {result.confidence}%
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FileUploadWithOCR;
