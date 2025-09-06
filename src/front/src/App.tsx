import './App.css'
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import MainPage from './components/MainPage'
import VacanciesPage from './components/VacanciesPage'
import CandidatesPage from './components/CandidatesPage'

function App() {
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

  const uploadVacancy = async (file: File, name: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)

    const response = await fetch('http://localhost:8000/api/jobs/add', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload vacancy: ${response.statusText}`)
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
    } else if (modalType === 'vacancy' && selectedFile) {
      setIsUploading(true)
      try {
        const result = await uploadVacancy(selectedFile, nameInput)
        console.log('Vacancy uploaded successfully:', result)
        // Reset form
        setShowModal(false)
        setModalType(null)
        setNameInput('')
        setFileName('')
        setSelectedFile(null)
      } catch (error) {
        console.error('Error uploading vacancy:', error)
        alert('Failed to upload vacancy. Please try again.')
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setModalType(null)
    setNameInput('')
    setFileName('')
    setSelectedFile(null)
  }

  const handleNameInputChange = (value: string) => {
    setNameInput(value)
  }

  return (
    <Router>
      <Header />
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <MainPage
                  showModal={showModal}
                  modalType={modalType}
                  fileName={fileName}
                  nameInput={nameInput}
                  isUploading={isUploading}
                  onFileSelect={handleFileSelect}
                  onButtonClick={handleButtonClick}
                  onModalSubmit={handleModalSubmit}
                  onModalClose={handleModalClose}
                  onNameInputChange={handleNameInputChange}
                />
              } 
            />
            <Route path="/jobs" element={<VacanciesPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
