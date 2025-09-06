import React from 'react'
import './CandidatesPage.css'

interface PDFPreviewDialogProps {
  isOpen: boolean
  pdfUrl: string
  onClose: () => void
}

const PDFPreviewDialog: React.FC<PDFPreviewDialogProps> = ({ isOpen, pdfUrl, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="pdf-preview-overlay" onClick={onClose}>
      <div className="pdf-preview-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="pdf-preview-header">
          <h3>PDF Preview</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <iframe
          src={pdfUrl}
          className="pdf-preview-iframe"
          title="PDF Preview"
        />
      </div>
    </div>
  )
}

export default PDFPreviewDialog
