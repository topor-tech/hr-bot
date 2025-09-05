import './App.css'
import { useState } from 'react'
import Header from './components/Header'

function App() {
  const [activeTab, setActiveTab] = useState('main')

  return (
    <>
    <Header activeTab={activeTab} onTabChange={setActiveTab} />
    <div className="app">
      <main className="main-content">
        <p>The development is in progress. Please be patient.</p>
      </main>
    </div>
    </>
  )
}

export default App
