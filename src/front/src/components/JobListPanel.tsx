import React from 'react'
import JobItem from './JobItem'
import type { Job } from '../types/job'
import './VacanciesPage.css'

interface JobListPanelProps {
  jobs: Job[]
  selectedJob: Job | null
  loading: boolean
  error: string | null
  onRefresh: () => void
  onSelectJob: (job: Job) => void
  formatDate: (dateString: string) => string
}

const JobListPanel: React.FC<JobListPanelProps> = ({
  jobs,
  selectedJob,
  loading,
  error,
  onRefresh,
  onSelectJob,
  formatDate
}) => {
  return (
    <div className="job-list-panel">
      <div className="panel-header">
        <h3>Job List</h3>
        <button onClick={onRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>
      
      {loading && <div className="loading">Loading Jobs...</div>}
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={onRefresh} className="retry-btn">
            Retry
          </button>
        </div>
      )}
      
      {!loading && !error && jobs.length === 0 && (
        <div className="empty-state">
          <p>No jobs found. Upload some job descriptions to get started.</p>
        </div>
      )}
      
      {!loading && !error && jobs.length > 0 && (
        <div className="job-list">
          {jobs.map((job) => (
            <JobItem
              key={job.id}
              job={job}
              isSelected={selectedJob?.id === job.id}
              onSelect={onSelectJob}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default JobListPanel
