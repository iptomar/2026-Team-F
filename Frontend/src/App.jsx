import { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import FormEditor from './pages/FormEditor';
import FormFillPage from './pages/FormFillPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import {
  clearAuthSession,
  getAuthenticatedUser,
  getStoredToken,
  getStoredUser,
  logoutUser,
  saveAuthSession,
} from './services/authApi';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const [authToken, setAuthToken] = useState(() => getStoredToken());
  const [authUser, setAuthUser] = useState(() => getStoredUser());
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const token = getStoredToken();

      if (!token) {
        setAuthToken(null);
        setAuthUser(null);
        setIsCheckingSession(false);
        return;
      }

      try {
        const result = await getAuthenticatedUser(token);

        setAuthToken(token);
        setAuthUser(result.user);
        saveAuthSession(token, result.user);
      } catch (error) {
        console.error('Sessão inválida:', error);
        clearAuthSession();
        setAuthToken(null);
        setAuthUser(null);
      } finally {
        setIsCheckingSession(false);
      }
    };

    validateSession();
  }, []);

  const handleAuthenticated = (user, token) => {
    setAuthUser(user);
    setAuthToken(token);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      if (authToken) {
        await logoutUser(authToken);
      }
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    } finally {
      clearAuthSession();
      setAuthToken(null);
      setAuthUser(null);
      setSelectedFormId(null);
      setSelectedSubmissionId(null);
      setCurrentPage('home');
    }
  };

  const handleCreateNew = () => {
    setSelectedFormId(null);
    setCurrentPage('editor');
  };

  const handleSelectDraft = (formId) => {
    setSelectedFormId(formId);
    setCurrentPage('editor');
  };

  const handleGoHome = () => {
    setCurrentPage('home');
    setSelectedFormId(null);
    setSelectedSubmissionId(null);
    setSelectedTemplateId(null);
  };

  const handleViewSubmissions = () => {
    setCurrentPage('submissions');
    setSelectedSubmissionId(null);
  };

  const handleViewSubmissionDetail = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setCurrentPage('submission_detail');
  };

  const handleBackToSubmissions = () => {
    setSelectedSubmissionId(null);
    setCurrentPage('submissions');
  };

  const handleFillForm = (templateId) => {
    setSelectedTemplateId(templateId);
    setCurrentPage('fill');
  };

  const handleBackFromFill = () => {
    setSelectedTemplateId(null);
    setCurrentPage('home');
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 mt-4">A validar sessão...</p>
        </div>
      </div>
    );
  }

  if (!authToken || !authUser) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Ferramenta de Formulários
            </h1>
            <p className="text-sm text-gray-500">
              Sessão iniciada como{' '}
              <span className="font-semibold text-gray-700">
                {authUser.name}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentPage !== 'home' && (
              <button
                onClick={handleGoHome}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                ← Voltar à Home
              </button>
            )}

            <button
              onClick={handleViewSubmissions}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                currentPage === 'submissions' || currentPage === 'submission_detail'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              Ver Submissões
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition"
            >
              Terminar sessão
            </button>
          </div>
        </div>

        {/* Navegação por âncoras — apenas na HomePage */}
        {currentPage === 'home' && (
          <nav className="flex items-center gap-6 border-t border-gray-100 pt-3 -mb-1">
            <a href="#editor" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Criar
            </a>
            <a href="#templates" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Modelos
            </a>
            <a href="#drafts" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Rascunhos
            </a>
            <a href="#published" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Publicados
            </a>
          </nav>
        )}
      </header>

      {currentPage === 'home' && (
        <HomePage
          onCreateNew={handleCreateNew}
          onSelectDraft={handleSelectDraft}
          onFillForm={handleFillForm}
          authUser={authUser}
        />
      )}

      {currentPage === 'editor' && (
        <FormEditor
          formId={selectedFormId}
          authUser={authUser}
          authToken={authToken}
          onGoHome={handleGoHome}
        />
      )}

      {currentPage === 'submissions' && (
        <SubmissionsPage onViewDetails={handleViewSubmissionDetail} />
      )}

      {currentPage === 'submission_detail' && selectedSubmissionId && (
        <SubmissionDetailPage
          submissionId={selectedSubmissionId}
          onBack={handleBackToSubmissions}
        />
      )}

      {currentPage === 'fill' && selectedTemplateId && (
        <FormFillPage
          templateId={selectedTemplateId}
          onBack={handleBackFromFill}
        />
      )}
    </div>
  );
}

export default App;