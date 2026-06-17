import { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import FormEditor from './pages/FormEditor';
import FormFill from './pages/FormFill';
import SubmissionsPage from './pages/SubmissionsPage';
import TemplatesPage from './pages/TemplatesPage';
import {
  clearAuthSession,
  getAuthenticatedUser,
  getStoredToken,
  getStoredUser,
  logoutUser,
  saveAuthSession,
} from './services/authApi';

// Ícones SVG inline simples
const IconHome = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconEdit = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconTemplate = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);
const IconInbox = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedFormId, setSelectedFormId] = useState(null);

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
      if (authToken) await logoutUser(authToken);
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    } finally {
      clearAuthSession();
      setAuthToken(null);
      setAuthUser(null);
      setSelectedFormId(null);
      setCurrentPage('home');
    }
  };

  const navigate = (page, formId = null) => {
    setCurrentPage(page);
    setSelectedFormId(formId);
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

  // Itens da navbar
  const navItems = [
    { id: 'home',        label: 'Início',      icon: <IconHome /> },
    { id: 'editor',      label: 'Editor',      icon: <IconEdit /> },
    { id: 'templates',   label: 'Modelos',     icon: <IconTemplate /> },
    { id: 'submissions', label: 'Submissões',  icon: <IconInbox /> },
  ];

  return (
    <div className="App min-h-screen bg-gray-50">

      {/* ================================================
          NAVBAR (#104 — navegação consolidada)
      ================================================ */}
      <header className="bg-white border-b border-gray-200 px-6 py-0 flex items-center justify-between sticky top-0 z-50 shadow-sm">

        {/* Logo + nav links */}
        <div className="flex items-center gap-8">
          <div className="py-4">
            <span className="text-lg font-bold text-indigo-700">GP</span>
            <span className="text-lg font-bold text-gray-800 ml-1">Formulários</span>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-2 px-4 py-5 text-sm font-medium border-b-2 transition-colors ${
                  currentPage === item.id || (item.id === 'editor' && currentPage === 'fill')
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Utilizador + logout */}
        <div className="flex items-center gap-3 py-4">
          <span className="text-sm text-gray-500 hidden sm:block">
            <span className="font-semibold text-gray-700">{authUser.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition text-sm font-medium"
          >
            Terminar sessão
          </button>
        </div>
      </header>

      {/* ================================================
          PÁGINAS
      ================================================ */}
      {currentPage === 'home' && (
        <HomePage
          onCreateNew={() => navigate('editor')}
          onSelectDraft={(id) => navigate('editor', id)}
          onFillForm={(id) => navigate('fill', id)}
          authUser={authUser}
        />
      )}

      {currentPage === 'editor' && (
        <FormEditor
          formId={selectedFormId}
          authUser={authUser}
          authToken={authToken}
          onGoHome={() => navigate('home')}
        />
      )}

      {currentPage === 'fill' && (
        <FormFill
          formId={selectedFormId}
          authUser={authUser}
          authToken={authToken}
          onGoHome={() => navigate('home')}
        />
      )}

      {currentPage === 'templates' && (
        <TemplatesPage
          authUser={authUser}
          authToken={authToken}
          onCreateNew={() => navigate('editor')}
          onSelectTemplate={(id) => navigate('editor', id)}
          onFillForm={(id) => navigate('fill', id)}
        />
      )}

      {currentPage === 'submissions' && (
        <SubmissionsPage
          authUser={authUser}
          authToken={authToken}
        />
      )}
    </div>
  );
}

export default App;
