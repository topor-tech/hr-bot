import React from 'react'
import CVDetails from './CVDetails'
import type { CV } from '../types/cv'
import './CandidatesPage.css'

interface CVPreviewPanelProps {
  selectedCv: CV | null
  selectedCvInfo: CV | null
  loadingCvInfo: boolean
  generatingPdf: boolean
  extractingText: boolean
  formatDate: (dateString: string) => string
  onGeneratePDF: (cvId: number) => void
  onExtractText: (cvId: number) => void
  onDownloadFile: (s3Key: string, filename: string) => void
  onPreviewPdf: (s3Key: string) => void
}

const CVPreviewPanel: React.FC<CVPreviewPanelProps> = ({
  selectedCv,
  selectedCvInfo,
  loadingCvInfo,
  generatingPdf,
  extractingText,
  formatDate,
  onGeneratePDF,
  onExtractText,
  onDownloadFile,
  onPreviewPdf
}) => {
  return (
    <div className="cv-preview-panel">
      <div className="panel-header">
        <h3>Preview & Details</h3>
      </div>
      
      {selectedCv ? (
        <CVDetails
          cvInfo={selectedCvInfo}
          loading={loadingCvInfo}
          generatingPdf={generatingPdf}
          extractingText={extractingText}
          formatDate={formatDate}
          onGeneratePDF={onGeneratePDF}
          onExtractText={onExtractText}
          onDownloadFile={onDownloadFile}
          onPreviewPdf={onPreviewPdf}
        />
      ) : (
        <div className="no-selection">
          <p>Select a CV from the list to view details and preview</p>
        </div>
      )}
    </div>
  )
}

export default CVPreviewPanel
