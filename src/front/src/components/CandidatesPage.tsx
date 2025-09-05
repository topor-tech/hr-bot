import { useState, useEffect } from 'react'
import './CandidatesPage.css'

interface CV {
  id: number
  name: string
  uploaded_at: string
  file_id: number
  pdf_file_id: number | null
}

function CandidatesPage() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCv, setSelectedCv] = useState<CV | null>(null)

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

  return (
    <div className="candidates-page">
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
                  onClick={() => setSelectedCv(cv)}
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
              <h4>{selectedCv.name}</h4>
              <div className="detail-item">
                <strong>Uploaded:</strong> {formatDate(selectedCv.uploaded_at)}
              </div>
              <div className="detail-item">
                <strong>File ID:</strong> {selectedCv.file_id}
              </div>
              <div className="detail-item">
                <strong>PDF File ID:</strong> {selectedCv.pdf_file_id || 'Not available'}
              </div>
              <div className="detail-item">
                <strong>CV ID:</strong> {selectedCv.id}
              </div>
              
              <div className="preview-placeholder">
                <p>CV preview and extracted data will be displayed here</p>
              </div>
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
