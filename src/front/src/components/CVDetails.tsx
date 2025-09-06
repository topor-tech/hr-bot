import React from 'react'
import { DownloadIcon } from '../utils'
import ContactInfo from './ContactInfo'
import TagsSection from './TagsSection'
import ExtractedTextSection from './ExtractedTextSection'
import type { CV } from '../types/cv'
import './CandidatesPage.css'

interface CVDetailsProps {
  cvInfo: CV
  loading: boolean
  generatingPdf: boolean
  extractingText: boolean
  formatDate: (dateString: string) => string
  onGeneratePDF: (cvId: number) => void
  onExtractText: (cvId: number) => void
  onDownloadFile: (s3Key: string, filename: string) => void
  onPreviewPdf: (s3Key: string) => void
}

const CVDetails: React.FC<CVDetailsProps> = ({
  cvInfo,
  loading,
  generatingPdf,
  extractingText,
  formatDate,
  onGeneratePDF,
  onExtractText,
  onDownloadFile,
  onPreviewPdf
}) => {
  const getFileIcon = (extension: string | null) => {
    if (!extension) return '📄'
    
    const ext = extension.toLowerCase()
    switch (ext) {
      case 'pdf':
        return '📕'
      case 'doc':
      case 'docx':
        return '📘'
      case 'txt':
        return '📄'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      case 'zip':
      case 'rar':
        return '🗜️'
      default:
        return '📄'
    }
  }

  if (loading) {
    return <div className="loading">Loading CV details...</div>
  }

  if (!cvInfo) {
    return (
      <div className="error">
        <p>Failed to load CV details</p>
      </div>
    )
  }

  return (
    <div className="cv-details">
      <h4>{cvInfo.name}</h4>
      <div className="detail-grid">
        <div className="detail-item">
          <strong>ID:</strong> {cvInfo.id}
        </div>
        <div className="detail-item">
          <strong>Uploaded:</strong> {formatDate(cvInfo.uploaded_at)}
        </div>
        <div className="detail-item">
          <strong>Original File:</strong> 
          <span className="file-info">
            <span className="file-icon">{getFileIcon(cvInfo.file_extension)}</span>
            <span className="file-name">{cvInfo.file_original_filename || 'N/A'}</span>
            {cvInfo.file_s3_key && (
              <DownloadIcon
                size={16}
                onClick={() => onDownloadFile(cvInfo.file_s3_key!, cvInfo.file_original_filename || 'file')}
                title="Download original file"
              />
            )}
          </span>
        </div>
        <div className="detail-item">
          <strong>PDF File:</strong>
          {!cvInfo.pdf_file_id ? (
            <button 
              className="generate-pdf-btn" 
              onClick={() => onGeneratePDF(cvInfo.id)}
              disabled={generatingPdf}
            >
              {generatingPdf ? 'Generating...' : 'Generate PDF'}
            </button>
          ) : (
            <span className="file-info">
              <span className="file-icon">{getFileIcon(cvInfo.pdf_file_extension)}</span>
              <span className="file-name">{cvInfo.pdf_file_original_filename || 'N/A'}</span>
              {cvInfo.pdf_file_s3_key && (
                <>
                  <button 
                    className="preview-btn"
                    onClick={() => onPreviewPdf(cvInfo.pdf_file_s3_key!)}
                    title="Preview PDF"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#3b82f6"/>
                    </svg>
                  </button>
                  <DownloadIcon
                    size={16}
                    onClick={() => onDownloadFile(cvInfo.pdf_file_s3_key!, cvInfo.pdf_file_original_filename || 'pdf_file')}
                    title="Download PDF file"
                  />
                </>
              )}
            </span>
          )}
        </div>
      </div>
      
      <ContactInfo
        phoneNumber={cvInfo.phone_number}
        email={cvInfo.email}
        telegram={cvInfo.telegram}
      />
      
      <TagsSection tags={cvInfo.tags} />
      
      <ExtractedTextSection
        extractedText={cvInfo.extracted_text}
        hasPdfFile={!!cvInfo.pdf_file_id}
        isExtracting={extractingText}
        onExtractText={() => onExtractText(cvInfo.id)}
      />
    </div>
  )
}

export default CVDetails
