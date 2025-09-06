import { useState, useEffect } from 'react'
import CVListPanel from './CVListPanel'
import CVPreviewPanel from './CVPreviewPanel'
import PDFPreviewDialog from './PDFPreviewDialog'
import type { CV } from '../types/cv'
import './CandidatesPage.css'

function CandidatesPage() {
  const [cvs, setCvs] = useState<CV[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCv, setSelectedCv] = useState<CV | null>(null)
  const [selectedCvInfo, setSelectedCvInfo] = useState<CV | null>(null)
  const [loadingCvInfo, setLoadingCvInfo] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [extractingText, setExtractingText] = useState(false)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>('')

  const fetchCVs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('http://localhost:8000/api/cv/list')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CVs: ${response.statusText}`)
      }
      
      const data = await response.json()
      setCvs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CVs')
    } finally {
      setLoading(false)
    }
  }

  const fetchCVInfo = async (cvId: number) => {
    try {
      setLoadingCvInfo(true)
      const response = await fetch(`http://localhost:8000/api/cv/info/${cvId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CV info: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSelectedCvInfo(data)
    } catch (err) {
      console.error('Failed to fetch CV info:', err)
      setSelectedCvInfo(null)
    } finally {
      setLoadingCvInfo(false)
    }
  }

  const generatePDF = async (cvId: number) => {
    try {
      setGeneratingPdf(true)
      const response = await fetch(`http://localhost:8000/api/cv/generate-pdf/${cvId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('PDF generated successfully:', data)
      
      // Refresh CV info to show the newly generated PDF
      await fetchCVInfo(cvId)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const extractText = async (cvId: number) => {
    try {
      setExtractingText(true)
      const response = await fetch(`http://localhost:8000/api/cv/extract/${cvId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to extract text: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Text extracted successfully:', data)
      
      // Refresh CV info to show the newly extracted text
      await fetchCVInfo(cvId)
    } catch (err) {
      console.error('Failed to extract text:', err)
      alert('Failed to extract text. Please try again.')
    } finally {
      setExtractingText(false)
    }
  }

  useEffect(() => {
    fetchCVs()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadFile = async (s3Key: string, filename: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/files/download/${s3Key}`)
      
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`)
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download file:', err)
      alert('Failed to download file. Please try again.')
    }
  }

  const previewPdf = async (s3Key: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/files/download/${s3Key}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.statusText}`)
      }
      
      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a URL for the PDF blob
      const url = window.URL.createObjectURL(blob)
      setPdfPreviewUrl(url)
      setShowPdfPreview(true)
    } catch (err) {
      console.error('Failed to load PDF:', err)
      alert('Failed to load PDF for preview. Please try again.')
    }
  }

  const closePdfPreview = () => {
    setShowPdfPreview(false)
    if (pdfPreviewUrl) {
      window.URL.revokeObjectURL(pdfPreviewUrl)
      setPdfPreviewUrl('')
    }
  }


  return (
    <div className="candidates-page">
      <PDFPreviewDialog
        isOpen={showPdfPreview}
        pdfUrl={pdfPreviewUrl}
        onClose={closePdfPreview}
      />
      
      <div className="candidates-layout">
        <CVListPanel
          cvs={cvs}
          selectedCv={selectedCv}
          loading={loading}
          error={error}
          onRefresh={fetchCVs}
          onSelectCv={(cv) => {
                    setSelectedCv(cv)
                    fetchCVInfo(cv.id)
                  }}
          formatDate={formatDate}
        />
        
        <CVPreviewPanel
          selectedCv={selectedCv}
          selectedCvInfo={selectedCvInfo}
          loadingCvInfo={loadingCvInfo}
          generatingPdf={generatingPdf}
          extractingText={extractingText}
          formatDate={formatDate}
          onGeneratePDF={generatePDF}
          onExtractText={extractText}
          onDownloadFile={downloadFile}
          onPreviewPdf={previewPdf}
        />
      </div>
    </div>
  )
}

export default CandidatesPage
