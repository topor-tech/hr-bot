import React from 'react'
import './CandidatesPage.css'

interface ContactInfoProps {
  phoneNumber: string | null
  email: string | null
  telegram: string | null
}

const ContactInfo: React.FC<ContactInfoProps> = ({ phoneNumber, email, telegram }) => {
  if (!phoneNumber && !email && !telegram) {
    return null
  }

  return (
    <div className="detail-section">
      <h5>Contact Information</h5>
      {phoneNumber && (
        <div className="detail-item">
          <strong>Phone:</strong> {phoneNumber}
        </div>
      )}
      {email && (
        <div className="detail-item">
          <strong>Email:</strong> 
          <a href={`mailto:${email}`} className="email-link">
            {email}
          </a>
        </div>
      )}
      {telegram && (
        <div className="detail-item">
          <strong>Telegram:</strong> 
          <a href={`https://t.me/${telegram}`} target="_blank" rel="noopener noreferrer" className="telegram-link">
            @{telegram}
          </a>
        </div>
      )}
    </div>
  )
}

export default ContactInfo
