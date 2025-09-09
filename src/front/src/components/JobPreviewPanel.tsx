import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JobDetails from './JobDetails.tsx'
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

type NavigationSection = 'preview' | 'interview' | 'candidates' | 'results'

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
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<NavigationSection>('preview')

  const handleBackToJobs = () => {
    navigate('/jobs')
  }

  const navigationSections = [
    { id: 'preview' as NavigationSection, label: 'Preview & Details' },
    { id: 'interview' as NavigationSection, label: 'Interview Script' },
    { id: 'candidates' as NavigationSection, label: 'Select Candidates' },
    { id: 'results' as NavigationSection, label: 'Results' }
  ]
  const renderContent = () => {
    switch (activeSection) {
      case 'preview':
        return selectedJob ? (
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
        )
      case 'interview':
        return (
          <div className="section-content">
            <h4>Interview Script</h4>
            <p>Interview script content will be displayed here.</p>
          </div>
        )
      case 'candidates':
        return (
          <div className="section-content">
            <h4>Select Candidates</h4>
            <p>Candidate selection interface will be displayed here.</p>
          </div>
        )
      case 'results':
        return (
          <div className="section-content">
            <h4>Results</h4>
            <p>Interview results and analysis will be displayed here.</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="job-preview-panel">
      <div className="panel-header">
        <div className="nav-tabs">
          {navigationSections.map((section) => (
            <div
              key={section.id}
              className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
            </div>
          ))}
        </div>
        {selectedJob && (
          <button onClick={handleBackToJobs} className="back-btn">
            ← Back to Jobs
          </button>
        )}
      </div>
      
      {renderContent()}
    </div>
  )
}

export default JobPreviewPanel
