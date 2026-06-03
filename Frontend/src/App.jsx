import { useEffect, useState } from 'react';
import {
  Blocks,
  CheckCircle2,
  ClipboardList,
  FileText,
  Home,
  Loader2,
  LogOut,
  NotebookPen,
  Sparkles,
  Undo2,
} from 'lucide-react';
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
  const [hasVisitedEditor, setHasVisitedEditor] = useState(false);

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
      setSelectedTemplateId(null);
      setCurrentPage('home');
    }
  };

  const handleCreateNew = () => {
    setSelectedFormId(null);
    setHasVisitedEditor(true);
    setCurrentPage('editor');
  };

  const handleSelectDraft = (formId) => {
    setSelectedFormId(formId);
    setHasVisitedEditor(true);
    setCurrentPage('editor');
  };

  const handleReturnToEditor = () => {
    setHasVisitedEditor(true);
    setCurrentPage('editor');
  };

  const handleGoHome = () => {
    setCurrentPage('home');
    setSelectedSubmissionId(null);
    setSelectedTemplateId(null);
  };

  const handleViewSubmissions = () => {
    setCurrentPage('submissions');
    setSelectedSubmissionId(null);
    setSelectedTemplateId(null);
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

  const navigateHomeSection = (sectionId) => {
    const goToSection = () => {
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (currentPage !== 'home') {
      handleGoHome();
      setTimeout(goToSection, 100);
      return;
    }

    goToSection();
  };

  const isSubmissionsActive =
    currentPage === 'submissions' || currentPage === 'submission_detail';

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white border border-slate-200 rounded-2xl shadow-sm px-10 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-600 mt-4 font-medium">A validar sessão...</p>
        </div>
      </div>
    );
  }

  if (!authToken || !authUser) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  const homeNavItems = [
    { id: 'editor', label: 'Criar', icon: Sparkles },
    { id: 'templates', label: 'Modelos', icon: Blocks },
    { id: 'drafts', label: 'Rascunhos', icon: NotebookPen },
    { id: 'published', label: 'Publicados', icon: CheckCircle2 },
  ];

  return (
    <div className="App min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="px-5 sm:px-8 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <button
              type="button"
              onClick={handleGoHome}
              className="group flex items-center gap-3 text-left w-fit"
              title="Voltar à página inicial"
            >
              <span className="h-11 w-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:bg-indigo-700 group-hover:scale-105 transition-all">
                <FileText size={22} strokeWidth={2.4} />
              </span>

              <span>
                <span className="block text-lg font-black tracking-tight text-slate-900">
                  Ferramenta de Formulários
                </span>
                <span className="block text-sm text-slate-500">
                  Sessão iniciada como{' '}
                  <strong className="text-slate-700">{authUser.name}</strong>
                </span>
              </span>
            </button>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {currentPage !== 'editor' && hasVisitedEditor && (
                <button
                  type="button"
                  onClick={handleReturnToEditor}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
                >
                  <Undo2 size={17} />
                  <span>Continuar edição</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={handleGoHome}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  currentPage === 'home'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Home size={17} />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={handleViewSubmissions}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  isSubmissionsActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300'
                }`}
              >
                <ClipboardList size={17} />
                <span>Ver Submissões</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all"
              >
                <LogOut size={17} />
                <span>Terminar sessão</span>
              </button>
            </div>
          </div>

          {currentPage === 'home' && (
            <nav className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              {homeNavItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateHomeSection(item.id)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all"
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
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