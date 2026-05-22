import { useState } from 'react'
import HomePage from './pages/HomePage'
import FormEditor from './pages/FormEditor'
import WorkflowManager from './components/WorkflowManager';

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const handleCreateNew = () => {
    setCurrentPage('editor')
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      {/* 1. Barra de Navegação Rápida no Topo para Testar a Sprint */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex gap-4 items-center">
        <span className="font-bold text-gray-700 text-sm mr-4">Painel Admin:</span>
        <button
          onClick={() => setCurrentPage('home')}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${currentPage === 'home' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          🏠 Início
        </button>
        <button
          onClick={() => setCurrentPage('workflow')}
          className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${currentPage === 'workflow' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          ⚙️ Parametrizar Workflows
        </button>
      </nav>

      {/* 2. Renderização Condicional das Páginas */}
      {currentPage === 'home' && (
        <HomePage onCreateNew={handleCreateNew} />
      )}

      {currentPage === 'editor' && (
        <div>
          <button
            onClick={() => setCurrentPage('home')}
            className="m-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm shadow-sm transition-colors"
          >
            ← Voltar para o Início
          </button>
          <FormEditor />
        </div>
      )}

      {currentPage === 'editor' && (
        <FormEditor
          formId={selectedFormId}
          authUser={authUser}
          authToken={authToken}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  )
}

export default App