import React from 'react'
import { DownloadIcon } from '../utils'
import JobTagsSection from './JobTagsSection'
import JobExtractedTextSection from './JobExtractedTextSection'
import type { Job } from '../types/job'
import './VacanciesPage.css'

interface JobDetailsProps {
  jobInfo: Job | null
  loading: boolean
  generatingPdf: boolean
  extractingText: boolean
  formatDate: (dateString: string) => string
  onGeneratePDF: (jobId: number) => void
  onExtractText: (jobId: number) => void
  onDownloadFile: (s3Key: string, filename: string) => void
  onPreviewPdf: (s3Key: string) => void
}

const JobDetails: React.FC<JobDetailsProps> = ({
  jobInfo,
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
    return <div className="loading">Loading job details...</div>
  }

  if (!jobInfo) {
    return (
      <div className="error">
        <p>Failed to load job details</p>
      </div>
    )
  }

  return (
    <div className="job-details">
      <h4>{jobInfo.name}</h4>
      <div className="detail-grid">
        <div className="detail-item">
          <strong>ID:</strong> {jobInfo.id}
        </div>
        <div className="detail-item">
          <strong>Created:</strong> {formatDate(jobInfo.created_at)}
        </div>
        <div className="detail-item">
          <strong>Original File:</strong> 
          <span className="file-info">
            <span className="file-icon">{getFileIcon(jobInfo.file_extension)}</span>
            <span className="file-name">{jobInfo.file_original_filename || 'N/A'}</span>
            {jobInfo.file_s3_key && (
              <DownloadIcon
                size={16}
                onClick={() => onDownloadFile(jobInfo.file_s3_key!, jobInfo.file_original_filename || 'file')}
                title="Download original file"
              />
            )}
          </span>
        </div>
        <div className="detail-item">
          <strong>PDF File:</strong>
          {!jobInfo.pdf_file_id ? (
            <button 
              className="generate-pdf-btn" 
              onClick={() => onGeneratePDF(jobInfo.id)}
              disabled={generatingPdf}
            >
              {generatingPdf ? 'Generating...' : 'Generate PDF'}
            </button>
          ) : (
            <span className="file-info">
              <span className="file-icon">{getFileIcon(jobInfo.pdf_file_extension)}</span>
              <span className="file-name">{jobInfo.pdf_file_original_filename || 'N/A'}</span>
              {jobInfo.pdf_file_s3_key && (
                <>
                  <button 
                    className="preview-btn"
                    onClick={() => onPreviewPdf(jobInfo.pdf_file_s3_key!)}
                    title="Preview PDF"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#3b82f6"/>
                    </svg>
                  </button>
                  <DownloadIcon
                    size={16}
                    onClick={() => onDownloadFile(jobInfo.pdf_file_s3_key!, jobInfo.pdf_file_original_filename || 'pdf_file')}
                    title="Download PDF file"
                  />
                </>
              )}
            </span>
          )}
        </div>
      </div>
      
      <JobTagsSection tags={jobInfo.tags} />
      
      <JobExtractedTextSection
        extractedText={jobInfo.extracted_text}
        hasPdfFile={!!jobInfo.pdf_file_id}
        isExtracting={extractingText}
        onExtractText={() => onExtractText(jobInfo.id)}
      />
    </div>
  )
}

export default JobDetails
