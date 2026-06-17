// ======================================================
// FRONTEND/src/pages/TemplatesPage.jsx
// Página de modelos reutilizáveis (#104)
// ======================================================

import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

const TemplatesPage = ({ onCreateNew, onSelectTemplate, onFillForm }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/form-templates`);
        if (!response.ok) throw new Error('Erro ao carregar modelos.');
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const statusLabel = (status) => {
    const map = {
      draft:     { label: 'Rascunho',  cls: 'bg-yellow-100 text-yellow-700' },
      published: { label: 'Publicado', cls: 'bg-green-100 text-green-700' },
      archived:  { label: 'Arquivado', cls: 'bg-gray-100 text-gray-500' },
    };
    return map[status] || { label: status, cls: 'bg-gray-100 text-gray-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-indigo-600 font-semibold mb-1">Biblioteca</p>
            <h1 className="text-2xl font-bold text-gray-800">Modelos Reutilizáveis</h1>
            <p className="text-gray-500 text-sm mt-1">
              Todos os formulários criados — edita rascunhos ou preenche os publicados.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm shrink-0"
          >
            + Novo Formulário
          </button>
        </div>

        {/* Estados */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 mt-4">A carregar modelos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <p className="text-gray-500 font-medium">Nenhum modelo criado ainda</p>
            <p className="text-gray-400 text-sm mt-1">Começa por criar um novo formulário</p>
            <button
              onClick={onCreateNew}
              className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
            >
              Criar Formulário
            </button>
          </div>
        )}

        {/* Grelha de modelos */}
        {!loading && !error && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => {
              const st = statusLabel(t.status);
              const isPublished = t.status === 'published';
              return (
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                >
                  {/* Header do card */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 leading-snug">{t.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold shrink-0 ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Corpo */}
                  <div className="flex-1 px-6 py-4">
                    {t.description && (
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{t.description}</p>
                    )}
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{t.fields?.length || 0} campo(s)</span>
                      <span>{formatDate(t.created_at)}</span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                    {isPublished ? (
                      <>
                        <button
                          onClick={() => onFillForm(t.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                        >
                          Preencher
                        </button>
                        <button
                          onClick={() => onSelectTemplate(t.id)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition font-semibold text-sm"
                        >
                          Editar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onSelectTemplate(t.id)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
                      >
                        Continuar Edição
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
