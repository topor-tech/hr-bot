import React from 'react'
import './CandidatesPage.css'

interface ExtractedTextSectionProps {
  extractedText: string | null
  hasPdfFile: boolean
  isExtracting: boolean
  onExtractText: () => void
}

const ExtractedTextSection: React.FC<ExtractedTextSectionProps> = ({
  extractedText,
  hasPdfFile,
  isExtracting,
  onExtractText
}) => {
  return (
    <div className="detail-section">
      <h5>Extracted Text</h5>
      {!extractedText && hasPdfFile ? (
        <button 
          className="extract-text-btn" 
          onClick={onExtractText}
          disabled={isExtracting}
        >
          {isExtracting ? 'Extracting...' : 'Extract Text'}
        </button>
      ) : extractedText ? (
        <div className="extracted-text">
          {extractedText}
        </div>
      ) : (
        <div className="no-text-message">
          No PDF file available for text extraction
        </div>
      )}
    </div>
  )
}

export default ExtractedTextSection
