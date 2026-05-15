import { useState } from 'react'
import HomePage from './pages/HomePage'
import FormEditor from './pages/FormEditor'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const handleCreateNew = () => {
    setCurrentPage('editor')
  }

  return (
    <div className="App">
      {currentPage === 'home' && <HomePage onCreateNew={handleCreateNew} />}
      {currentPage === 'editor' && (
        <div>
          <button 
            onClick={() => setCurrentPage('home')}
            className="m-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            ← Voltar
          </button>
          <FormEditor />
        </div>
      )}
    </div>
  )
}

export default App
