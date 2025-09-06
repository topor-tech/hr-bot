import React from 'react'
import type { Job } from '../types/job'
import './VacanciesPage.css'

interface JobItemProps {
  job: Job
  isSelected: boolean
  onSelect: (job: Job) => void
  formatDate: (dateString: string) => string
}

const JobItem: React.FC<JobItemProps> = ({ job, isSelected, onSelect, formatDate }) => {
  return (
    <div
      className={`job-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(job)}
    >
      <div className="job-name">{job.name}</div>
      <div className="job-date">{formatDate(job.created_at)}</div>
      <div className="job-id">ID: {job.id}</div>
    </div>
  )
}

export default JobItem
