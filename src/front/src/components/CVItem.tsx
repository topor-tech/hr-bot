import React from 'react'
import type { CV } from '../types/cv'
import './CandidatesPage.css'

interface CVItemProps {
  cv: CV
  isSelected: boolean
  onSelect: (cv: CV) => void
  formatDate: (dateString: string) => string
}

const CVItem: React.FC<CVItemProps> = ({ cv, isSelected, onSelect, formatDate }) => {
  return (
    <div
      className={`cv-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(cv)}
    >
      <div className="cv-name">{cv.name}</div>
      <div className="cv-date">{formatDate(cv.uploaded_at)}</div>
      <div className="cv-id">ID: {cv.id}</div>
    </div>
  )
}

export default CVItem
