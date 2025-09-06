import React from 'react'
import CVItem from './CVItem'
import type { CV } from '../types/cv'
import './CandidatesPage.css'

interface CVListPanelProps {
  cvs: CV[]
  selectedCv: CV | null
  loading: boolean
  error: string | null
  onRefresh: () => void
  onSelectCv: (cv: CV) => void
  formatDate: (dateString: string) => string
}

const CVListPanel: React.FC<CVListPanelProps> = ({
  cvs,
  selectedCv,
  loading,
  error,
  onRefresh,
  onSelectCv,
  formatDate
}) => {
  return (
    <div className="cv-list-panel">
      <div className="panel-header">
        <h3>CV List</h3>
        <button onClick={onRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>
      
      {loading && <div className="loading">Loading CVs...</div>}
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={onRefresh} className="retry-btn">
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
            <CVItem
              key={cv.id}
              cv={cv}
              isSelected={selectedCv?.id === cv.id}
              onSelect={onSelectCv}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CVListPanel
