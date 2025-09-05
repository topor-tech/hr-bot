import './Header.css'
import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()
  
  const tabs = [
    { id: 'main', label: 'Main', path: '/' },
    { id: 'vacancies', label: 'Vacancies', path: '/jobs' },
    { id: 'candidates', label: 'Candidates', path: '/candidates' }
  ]

  const isActiveTab = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo-link">
          <h1 className="logo">LLM HR</h1>
        </Link>
        <nav className="navigation">
          {tabs.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`nav-tab ${isActiveTab(tab.path) ? 'active' : ''}`}
            >
              {tab.label}
            </Link>
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
