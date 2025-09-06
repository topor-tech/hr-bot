import React from 'react'
import './VacanciesPage.css'

interface JobTagsSectionProps {
  tags: string[] | null
}

const JobTagsSection: React.FC<JobTagsSectionProps> = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className="detail-section">
      <h5>Tags</h5>
      <div className="tags-container">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export default JobTagsSection
