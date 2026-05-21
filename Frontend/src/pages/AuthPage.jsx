import React, { useState } from 'react';
import {
  loginUser,
  registerUser,
  saveAuthSession,
} from '../services/authApi';

const initialFormState = {
  name: '',
  email: '',
  password: '',
};

const AuthPage = ({ onAuthenticated }) => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isRegisterMode = mode === 'register';

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    if (isRegisterMode && formData.name.trim().length === 0) {
      return 'O nome é obrigatório.';
    }

    if (formData.email.trim().length === 0) {
      return 'O email é obrigatório.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'Introduza um email válido.';
    }

    if (formData.password.length === 0) {
      return 'A palavra-passe é obrigatória.';
    }

    if (isRegisterMode && formData.password.length < 6) {
      return 'A palavra-passe deve ter pelo menos 6 caracteres.';
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const result = isRegisterMode
        ? await registerUser(payload)
        : await loginUser({
            email: payload.email,
            password: payload.password,
          });

      saveAuthSession(result.token, result.user);

      setSuccessMessage(
        isRegisterMode
          ? 'Conta criada com sucesso.'
          : 'Sessão iniciada com sucesso.'
      );

      onAuthenticated(result.user, result.token);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((currentMode) =>
      currentMode === 'login' ? 'register' : 'login'
    );
    setFormData(initialFormState);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="hidden lg:flex flex-col justify-between bg-indigo-700 text-white p-10">
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 mb-8">
              <span className="text-2xl font-bold">GP</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight mb-4">
              Ferramenta de Formulários Parametrizados
            </h1>

            <p className="text-indigo-100 text-lg leading-relaxed">
              Cria, gere e acompanha formulários dinâmicos com suporte a
              workflows e submissões.
            </p>
          </div>

          <div className="mt-10 bg-white/10 rounded-2xl p-5 border border-white/10">
            <p className="text-sm text-indigo-100 mb-2">
              Funcionalidade desta User Story
            </p>
            <ul className="space-y-2 text-sm">
              <li>• Registo de utilizador</li>
              <li>• Login com email e palavra-passe</li>
              <li>• Sessão autenticada por token</li>
              <li>• Logout com invalidação da sessão</li>
            </ul>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold text-indigo-600 mb-2">
              {isRegisterMode ? 'Criar conta' : 'Iniciar sessão'}
            </p>

            <h2 className="text-3xl font-bold text-gray-900">
              {isRegisterMode
                ? 'Registe-se na aplicação'
                : 'Bem-vindo de volta'}
            </h2>

            <p className="text-gray-500 mt-2">
              {isRegisterMode
                ? 'Crie uma conta para aceder de forma identificada.'
                : 'Entre com as suas credenciais para continuar.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegisterMode && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    updateField('name', event.target.value)
                  }
                  placeholder="Nome do utilizador"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  updateField('email', event.target.value)
                }
                placeholder="utilizador@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Palavra-passe
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(event) =>
                  updateField('password', event.target.value)
                }
                placeholder={
                  isRegisterMode
                    ? 'Mínimo 6 caracteres'
                    : 'Introduza a palavra-passe'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-5 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'A processar...'
                : isRegisterMode
                  ? 'Criar conta'
                  : 'Iniciar sessão'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isRegisterMode
              ? 'Já tem conta?'
              : 'Ainda não tem conta?'}

            <button
              type="button"
              onClick={switchMode}
              className="ml-2 font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {isRegisterMode ? 'Iniciar sessão' : 'Criar conta'}
            </button>
          </div>

          <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              Esta autenticação usa a API local do backend em{' '}
              <span className="font-semibold">http://localhost:3000/auth</span>.
              Garanta que o backend está a correr antes de testar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;