import { useState, useEffect } from 'react'
import './CandidatesPage.css'
import { DownloadIcon } from '../utils'

interface CV {
  id: number
  name: string
  uploaded_at: string
  file_id: number
  file_original_filename: string | null
  file_s3_key: string | null
  file_extension: string | null
  pdf_file_id: number | null
  pdf_file_original_filename: string | null
  pdf_file_s3_key: string | null
  pdf_file_extension: string | null
  extracted_text: string | null
  phone_number: string | null
  email: string | null
  telegram: string | null
  tags: string[] | null
}

function CandidatesPage() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCv, setSelectedCv] = useState<CV | null>(null)
  const [selectedCvInfo, setSelectedCvInfo] = useState<CV | null>(null)
  const [loadingCvInfo, setLoadingCvInfo] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>('')

  const fetchCVs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('http://localhost:8000/api/cv/list')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CVs: ${response.statusText}`)
      }
      
      const data = await response.json()
      setCvs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CVs')
    } finally {
      setLoading(false)
    }
  }

  const fetchCVInfo = async (cvId: number) => {
    try {
      setLoadingCvInfo(true)
      const response = await fetch(`http://localhost:8000/api/cv/info/${cvId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CV info: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSelectedCvInfo(data)
    } catch (err) {
      console.error('Failed to fetch CV info:', err)
      setSelectedCvInfo(null)
    } finally {
      setLoadingCvInfo(false)
    }
  }

  const generatePDF = async (cvId: number) => {
    try {
      setGeneratingPdf(true)
      const response = await fetch(`http://localhost:8000/api/cv/generate-pdf/${cvId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('PDF generated successfully:', data)
      
      // Refresh CV info to show the newly generated PDF
      await fetchCVInfo(cvId)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  useEffect(() => {
    fetchCVs()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadFile = async (s3Key: string, filename: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/files/download/${s3Key}`)
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`)
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download file:', err)
      alert('Failed to download file. Please try again.')
    }
  }

  const previewPdf = async (s3Key: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/files/download/${s3Key}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.statusText}`)
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a URL for the PDF blob
      const url = window.URL.createObjectURL(blob)
      setPdfPreviewUrl(url)
      setShowPdfPreview(true)
    } catch (err) {
      console.error('Failed to load PDF:', err)
      alert('Failed to load PDF for preview. Please try again.')
    }
  }

  const closePdfPreview = () => {
    setShowPdfPreview(false)
    if (pdfPreviewUrl) {
      window.URL.revokeObjectURL(pdfPreviewUrl)
      setPdfPreviewUrl('')
    }
  }

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

  return (
    <div className="candidates-page">
      {/* PDF Preview Dialog */}
      {showPdfPreview && (
        <div className="pdf-preview-overlay" onClick={closePdfPreview}>
          <div className="pdf-preview-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-preview-header">
              <h3>PDF Preview</h3>
              <button className="close-btn" onClick={closePdfPreview}>×</button>
            </div>
            <iframe
              src={pdfPreviewUrl}
              className="pdf-preview-iframe"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
      
      <div className="candidates-layout">
        <div className="cv-list-panel">
          <div className="panel-header">
            <h3>CV List</h3>
            <button onClick={fetchCVs} className="refresh-btn">
              Refresh
            </button>
          </div>
          
          {loading && <div className="loading">Loading CVs...</div>}
          
          {error && (
            <div className="error">
              <p>Error: {error}</p>
              <button onClick={fetchCVs} className="retry-btn">
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && cvs.length === 0 && (
            <div className="empty-state">
              <p>No CVs found. Upload some CVs to get started.</p>
            </div>
          )}
          
          {!loading && !error && cvs.length > 0 && (
            <div className="cv-list">
              {cvs.map((cv) => (
                <div
                  key={cv.id}
                  className={`cv-item ${selectedCv?.id === cv.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCv(cv)
                    fetchCVInfo(cv.id)
                  }}
                >
                  <div className="cv-name">{cv.name}</div>
                  <div className="cv-date">{formatDate(cv.uploaded_at)}</div>
                  <div className="cv-id">ID: {cv.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="cv-preview-panel">
          <div className="panel-header">
            <h3>Preview & Details</h3>
          </div>
          
          {selectedCv ? (
            <div className="cv-details">
              {loadingCvInfo ? (
                <div className="loading">Loading CV details...</div>
              ) : selectedCvInfo ? (
                <>
                  <h4>{selectedCvInfo.name}</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>ID:</strong> {selectedCvInfo.id}
                    </div>
                    <div className="detail-item">
                      <strong>Uploaded:</strong> {formatDate(selectedCvInfo.uploaded_at)}
                    </div>
                    <div className="detail-item">
                      <strong>Original File:</strong> 
                      <span className="file-info">
                        <span className="file-icon">{getFileIcon(selectedCvInfo.file_extension)}</span>
                        <span className="file-name">{selectedCvInfo.file_original_filename || 'N/A'}</span>
                        {selectedCvInfo.file_s3_key && (
                          <DownloadIcon
                            size={16}
                            onClick={() => downloadFile(selectedCvInfo.file_s3_key!, selectedCvInfo.file_original_filename || 'file')}
                            title="Download original file"
                          />
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>PDF File:</strong>
                      {!selectedCvInfo.pdf_file_id ? (
                        <button 
                          className="generate-pdf-btn" 
                          onClick={() => generatePDF(selectedCvInfo.id)}
                          disabled={generatingPdf}
                        >
                          {generatingPdf ? 'Generating...' : 'Generate PDF'}
                        </button>
                      ) : (
                        <span className="file-info">
                          <span className="file-icon">{getFileIcon(selectedCvInfo.pdf_file_extension)}</span>
                          <span className="file-name">{selectedCvInfo.pdf_file_original_filename || 'N/A'}</span>
                          {selectedCvInfo.pdf_file_s3_key && (
                            <>
                              <button 
                                className="preview-btn"
                                onClick={() => previewPdf(selectedCvInfo.pdf_file_s3_key!)}
                                title="Preview PDF"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#3b82f6"/>
                                </svg>
                              </button>
                              <DownloadIcon
                                size={16}
                                onClick={() => downloadFile(selectedCvInfo.pdf_file_s3_key!, selectedCvInfo.pdf_file_original_filename || 'pdf_file')}
                                title="Download PDF file"
                              />
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    
                    {/* Contact Information */}
                    {(selectedCvInfo.phone_number || selectedCvInfo.email || selectedCvInfo.telegram) && (
                      <div className="detail-section">
                        <h5>Contact Information</h5>
                        {selectedCvInfo.phone_number && (
                          <div className="detail-item">
                            <strong>Phone:</strong> {selectedCvInfo.phone_number}
                          </div>
                        )}
                        {selectedCvInfo.email && (
                          <div className="detail-item">
                            <strong>Email:</strong> 
                            <a href={`mailto:${selectedCvInfo.email}`} className="email-link">
                              {selectedCvInfo.email}
                            </a>
                          </div>
                        )}
                        {selectedCvInfo.telegram && (
                          <div className="detail-item">
                            <strong>Telegram:</strong> 
                            <a href={`https://t.me/${selectedCvInfo.telegram}`} target="_blank" rel="noopener noreferrer" className="telegram-link">
                              @{selectedCvInfo.telegram}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Tags */}
                    {selectedCvInfo.tags && selectedCvInfo.tags.length > 0 && (
                      <div className="detail-section">
                        <h5>Tags</h5>
                        <div className="tags-container">
                          {selectedCvInfo.tags.map((tag, index) => (
                            <span key={index} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Extracted Text */}
                    {selectedCvInfo.extracted_text && (
                      <div className="detail-section">
                        <h5>Extracted Text</h5>
                        <div className="extracted-text">
                          {selectedCvInfo.extracted_text}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="preview-placeholder">
                    <p>CV preview and extracted data will be displayed here</p>
                  </div>
                </>
              ) : (
                <div className="error">
                  <p>Failed to load CV details</p>
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a CV from the list to view details and preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CandidatesPage
