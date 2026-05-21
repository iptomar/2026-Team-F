import { useState } from 'react'
import HomePage from './pages/HomePage'
import FormEditor from './pages/FormEditor'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedFormId, setSelectedFormId] = useState(null)

  // ======================================================
  // CRIAR NOVO FORMULÁRIO
  // ======================================================
  const handleCreateNew = () => {
    setSelectedFormId(null) // Limpa o rascunho selecionado
    setCurrentPage('editor')
  }

  // ======================================================
  // SELECIONAR RASCUNHO EXISTENTE
  // ======================================================
  const handleSelectDraft = (formId) => {
    setSelectedFormId(formId)
    setCurrentPage('editor')
  }

  // ======================================================
  // VOLTAR À PÁGINA INICIAL
  // ======================================================
  const handleGoHome = () => {
    setCurrentPage('home')
    setSelectedFormId(null)
  }

  return (
    <div className="App">
      {currentPage === 'home' && (
        <HomePage 
          onCreateNew={handleCreateNew}
          onSelectDraft={handleSelectDraft}
        />
      )}
      
      {currentPage === 'editor' && (
        <div>
          <button 
            onClick={handleGoHome}
            className="m-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
          >
            ← Voltar
          </button>
          <FormEditor formId={selectedFormId} />
        </div>
      )}
    </div>
  )
}

export default App
