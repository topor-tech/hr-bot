import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import JobListPanel from './JobListPanel'
import JobPreviewPanel from './JobPreviewPanel'
import PDFPreviewDialog from './PDFPreviewDialog'
import type { Job } from '../types/job'
import { getApiBaseUrl } from '../utils'
import './VacanciesPage.css'

function VacanciesPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedJobInfo, setSelectedJobInfo] = useState<Job | null>(null)
  const [loadingJobInfo, setLoadingJobInfo] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [extractingText, setExtractingText] = useState(false)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>('')

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${getApiBaseUrl()}/api/jobs/list`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`)
      }
      
      const data = await response.json()
      setJobs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchJobInfo = async (jobId: number) => {
    try {
      setLoadingJobInfo(true)
      const response = await fetch(`${getApiBaseUrl()}/api/jobs/info/${jobId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job info: ${response.statusText}`)
      }
      
      const data = await response.json()
      setSelectedJobInfo(data)
    } catch (err) {
      console.error('Failed to fetch job info:', err)
      setSelectedJobInfo(null)
    } finally {
      setLoadingJobInfo(false)
    }
  }

  const generatePDF = async (jobId: number) => {
    try {
      setGeneratingPdf(true)
      const response = await fetch(`${getApiBaseUrl()}/api/jobs/generate-pdf/${jobId}`, {
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
      
      // Refresh job info to show the newly generated PDF
      await fetchJobInfo(jobId)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const extractText = async (jobId: number) => {
    try {
      setExtractingText(true)
      const response = await fetch(`${getApiBaseUrl()}/api/jobs/extract/${jobId}`, {
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
      
      // Refresh job info to show the newly extracted text
      await fetchJobInfo(jobId)
    } catch (err) {
      console.error('Failed to extract text:', err)
      alert('Failed to extract text. Please try again.')
    } finally {
      setExtractingText(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  // Handle URL parameter for job selection
  useEffect(() => {
    if (id && jobs.length > 0) {
      const jobId = parseInt(id)
      const job = jobs.find(j => j.id === jobId)
      if (job && (!selectedJob || selectedJob.id !== jobId)) {
        setSelectedJob(job)
        fetchJobInfo(jobId)
      }
    } else if (!id && selectedJob) {
      // If no ID in URL but job is selected, clear selection
      setSelectedJob(null)
      setSelectedJobInfo(null)
    }
  }, [id, jobs, selectedJob])

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
      const response = await fetch(`${getApiBaseUrl()}/api/files/download/${s3Key}`)
      
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
      const response = await fetch(`${getApiBaseUrl()}/api/files/download/${s3Key}`)
      
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
    <div className="jobs-page">
      <PDFPreviewDialog
        isOpen={showPdfPreview}
        pdfUrl={pdfPreviewUrl}
        onClose={closePdfPreview}
      />
      
      <div className="jobs-layout">
        {!selectedJob && (
          <JobListPanel
            jobs={jobs}
            selectedJob={selectedJob}
            loading={loading}
            error={error}
            onRefresh={fetchJobs}
            onSelectJob={(job) => {
              navigate(`/jobs/${job.id}`)
            }}
            formatDate={formatDate}
          />
        )}
        
        {selectedJob && (
          <JobPreviewPanel
            selectedJob={selectedJob}
            selectedJobInfo={selectedJobInfo}
            loadingJobInfo={loadingJobInfo}
            generatingPdf={generatingPdf}
            extractingText={extractingText}
            formatDate={formatDate}
            onGeneratePDF={generatePDF}
            onExtractText={extractText}
            onDownloadFile={downloadFile}
            onPreviewPdf={previewPdf}
          />
        )}
      </div>
    </div>
  )
}

export default VacanciesPage
