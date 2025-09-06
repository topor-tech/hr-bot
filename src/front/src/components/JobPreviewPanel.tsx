import React from 'react'
import JobDetails from './JobDetails'
import type { Job } from '../types/job'
import './VacanciesPage.css'

interface JobPreviewPanelProps {
  selectedJob: Job | null
  selectedJobInfo: Job | null
  loadingJobInfo: boolean
  generatingPdf: boolean
  extractingText: boolean
  formatDate: (dateString: string) => string
  onGeneratePDF: (jobId: number) => void
  onExtractText: (jobId: number) => void
  onDownloadFile: (s3Key: string, filename: string) => void
  onPreviewPdf: (s3Key: string) => void
}

const JobPreviewPanel: React.FC<JobPreviewPanelProps> = ({
  selectedJob,
  selectedJobInfo,
  loadingJobInfo,
  generatingPdf,
  extractingText,
  formatDate,
  onGeneratePDF,
  onExtractText,
  onDownloadFile,
  onPreviewPdf
}) => {
  return (
    <div className="job-preview-panel">
      <div className="panel-header">
        <h3>Preview & Details</h3>
      </div>
      
      {selectedJob ? (
        <JobDetails
          jobInfo={selectedJobInfo}
          loading={loadingJobInfo}
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
          <p>Select a job from the list to view details and preview</p>
        </div>
      )}
    </div>
  )
}

export default JobPreviewPanel
