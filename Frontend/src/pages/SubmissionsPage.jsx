// ======================================================
// FRONTEND/src/pages/SubmissionsPage.jsx
// Página de submissões (#104)
// ======================================================

import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

const SubmissionsPage = ({ authToken }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE}/form-submissions`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!response.ok) throw new Error('Erro ao carregar submissões.');
        const data = await response.json();
        setSubmissions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [authToken]);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-5xl mx-auto">

        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-6 mb-8">
          <p className="text-sm text-indigo-600 font-semibold mb-1">Registos</p>
          <h1 className="text-2xl font-bold text-gray-800">Submissões</h1>
          <p className="text-gray-500 text-sm mt-1">
            Todas as respostas submetidas aos formulários publicados.
          </p>
        </div>

        {/* Estados */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 mt-4">A carregar submissões...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-500 font-medium">Nenhuma submissão ainda</p>
            <p className="text-gray-400 text-sm mt-1">
              As respostas aos formulários publicados aparecerão aqui
            </p>
          </div>
        )}

        {/* Lista de submissões */}
        {!loading && !error && submissions.length > 0 && (
          <div className="space-y-3">
            {submissions.map((sub, index) => (
              <div
                key={sub.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Linha principal */}
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-400 w-6">#{index + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {sub.form_template_id
                          ? `Formulário ${sub.form_template_id.slice(0, 8)}...`
                          : 'Formulário desconhecido'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sub.submitted_by ? `Por: ${sub.submitted_by}` : 'Anónimo'} · {formatDate(sub.created_at)}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${expanded === sub.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Detalhes expandidos */}
                {expanded === sub.id && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                    {sub.data && Object.keys(sub.data).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(sub.data).map(([key, value]) => (
                          <div key={key} className="flex gap-3 text-sm">
                            <span className="text-gray-500 font-medium min-w-[120px] shrink-0">{key}:</span>
                            <span className="text-gray-800">
                              {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Sem dados registados.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;
