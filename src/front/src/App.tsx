import './App.css'
import { useState } from 'react'
import Header from './components/Header'
import DragDropArea from './components/DragDropArea'

function App() {
  const [activeTab, setActiveTab] = useState('main')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'vacancy' | 'cv' | null>(null)
  const [fileName, setFileName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = (file: File) => {
    setFileName(file.name)
    setSelectedFile(file)
    setNameInput(file.name.replace(/\.[^/.]+$/, '')) // Remove extension
  }

  const handleButtonClick = (type: 'vacancy' | 'cv') => {
    setModalType(type)
    setShowModal(true)
  }

  const uploadCV = async (file: File, name: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)

    const response = await fetch('http://localhost:8000/api/cv/add', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload CV: ${response.statusText}`)
    }

    return await response.json()
  }

  const handleModalSubmit = async () => {
    if (modalType === 'cv' && selectedFile) {
      setIsUploading(true)
      try {
        const result = await uploadCV(selectedFile, nameInput)
        console.log('CV uploaded successfully:', result)
        // Reset form
        setShowModal(false)
        setModalType(null)
        setNameInput('')
        setFileName('')
        setSelectedFile(null)
      } catch (error) {
        console.error('Error uploading CV:', error)
        alert('Failed to upload CV. Please try again.')
      } finally {
        setIsUploading(false)
      }
    } else {
      console.log(`Adding ${modalType}: ${nameInput}`)
      // For vacancy, just close modal for now
      setShowModal(false)
      setModalType(null)
      setNameInput('')
      setFileName('')
      setSelectedFile(null)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setModalType(null)
    setNameInput('')
    setFileName('')
    setSelectedFile(null)
  }

  return (
    <>
    <Header activeTab={activeTab} onTabChange={setActiveTab} />
    <div className="app">
      <main className="main-content">
        <div className="upload-section">
          <DragDropArea 
            onFileSelect={handleFileSelect}
            fileName={fileName}
          />
          
          <div className="action-buttons">
            <button 
              className="action-btn vacancy-btn"
              onClick={() => handleButtonClick('vacancy')}
              disabled={!fileName}
            >
              Add Vacancy
            </button>
            <button 
              className="action-btn cv-btn"
              onClick={() => handleButtonClick('cv')}
              disabled={!fileName}
            >
              Add CV
            </button>
          </div>
        </div>
      </main>
    </div>

    {/* Modal */}
    {showModal && (
      <div className="modal-overlay" onClick={handleModalClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Add {modalType === 'vacancy' ? 'Vacancy' : 'CV'}</h3>
            <button className="close-btn" onClick={handleModalClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name-input">Name:</label>
              <input
                id="name-input"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter name"
                autoFocus
              />
            </div>
            <div className="file-info">
              <p><strong>File:</strong> {fileName}</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={handleModalClose}>
              Cancel
            </button>
            <button 
              className="submit-btn" 
              onClick={handleModalSubmit}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : `Add ${modalType === 'vacancy' ? 'Vacancy' : 'CV'}`}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default App
