import './MainPage.css'
import DragDropArea from './DragDropArea'

interface MainPageProps {
  showModal: boolean
  modalType: 'vacancy' | 'cv' | null
  fileName: string
  nameInput: string
  isUploading: boolean
  onFileSelect: (file: File) => void
  onButtonClick: (type: 'vacancy' | 'cv') => void
  onModalSubmit: () => void
  onModalClose: () => void
  onNameInputChange: (value: string) => void
}

function MainPage({
  showModal,
  modalType,
  fileName,
  nameInput,
  isUploading,
  onFileSelect,
  onButtonClick,
  onModalSubmit,
  onModalClose,
  onNameInputChange
}: MainPageProps) {
  return (
    <>
      <div className="main-page">
        <div className="upload-section">
          <DragDropArea 
            onFileSelect={onFileSelect}
            fileName={fileName}
          />
          
          <div className="action-buttons">
            <button 
              className="action-btn vacancy-btn"
              onClick={() => onButtonClick('vacancy')}
              disabled={!fileName}
            >
              Add Vacancy
            </button>
            <button 
              className="action-btn cv-btn"
              onClick={() => onButtonClick('cv')}
              disabled={!fileName}
            >
              Add CV
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={onModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add {modalType === 'vacancy' ? 'Vacancy' : 'CV'}</h3>
              <button className="close-btn" onClick={onModalClose}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="name-input">Name:</label>
                <input
                  id="name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => onNameInputChange(e.target.value)}
                  placeholder="Enter name"
                  autoFocus
                />
              </div>
              <div className="file-info">
                <p><strong>File:</strong> {fileName}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={onModalClose}>
                Cancel
              </button>
              <button 
                className="submit-btn" 
                onClick={onModalSubmit}
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

export default MainPage
