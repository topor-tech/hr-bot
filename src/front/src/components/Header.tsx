import './Header.css'

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'main', label: 'Main' },
    { id: 'vacancies', label: 'Vacancies' },
    { id: 'candidates', label: 'Candidates' }
  ]

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">LLM HR</h1>
        <nav className="navigation">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </nav>
        <div className="user-indicator">
          <span className="user-role">HR-Admin</span>
          <div className="user-avatar">👤</div>
        </div>
      </div>
    </header>
  )
}

export default Header
