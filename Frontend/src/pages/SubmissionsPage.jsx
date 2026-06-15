import React, { useState, useEffect } from 'react';

// ======================================================
// MAPEAMENTO DE BADGES DE ESTADO
// ======================================================
const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
  },
  approved: {
    label: 'Aprovada',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-400',
  },
  rejected: {
    label: 'Rejeitada',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-400',
  },
  submitted: {
    label: 'Submetida',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-400',
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status || 'Desconhecido',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  };

// ======================================================
// UTILITÁRIOS
// ======================================================
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================
const SubmissionsPage = ({ onViewDetails }) => {
  const [submissions, setSubmissions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // ======================================================
  // FETCH DE DADOS
  // ======================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [submissionsRes, templatesRes] = await Promise.all([
          fetch('http://localhost:3000/form-submissions'),
          fetch('http://localhost:3000/form-templates'),
        ]);

        if (!submissionsRes.ok) {
          throw new Error(`Erro ao buscar submissões: ${submissionsRes.statusText}`);
        }
        if (!templatesRes.ok) {
          throw new Error(`Erro ao buscar templates: ${templatesRes.statusText}`);
        }

        const submissionsData = await submissionsRes.json();
        const templatesData = await templatesRes.json();

        setSubmissions(submissionsData);
        setTemplates(templatesData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ======================================================
  // MAPEAMENTO DE TEMPLATE POR ID
  // ======================================================
  const templateMap = {};
  templates.forEach((t) => {
    templateMap[t.id] = t;
  });

  const getTemplateName = (templateId) =>
    templateMap[templateId]?.name || 'Formulário desconhecido';

  // ======================================================
  // FILTRO DE PESQUISA
  // ======================================================
  const filteredSubmissions = submissions.filter((sub) => {
    const templateName = getTemplateName(sub.form_template_id).toLowerCase();
    const statusLabel = (getStatusConfig(sub.status).label || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      !term ||
      templateName.includes(term) ||
      statusLabel.includes(term) ||
      String(sub.id || '').toLowerCase().includes(term);

    const matchesTemplate =
      !selectedTemplate || sub.form_template_id === selectedTemplate;

    const matchesStatus =
      !selectedStatus || sub.status === selectedStatus;

    const submissionDate = sub.submitted_at || sub.created_at;
    const formattedDate = submissionDate
      ? new Date(submissionDate).toISOString().slice(0, 10)
      : '';

    const matchesDate =
      !selectedDate || formattedDate === selectedDate;

    return matchesSearch && matchesTemplate && matchesStatus && matchesDate;
  });

  // ======================================================
  // Limpar filtros
  // ======================================================
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTemplate('');
    setSelectedStatus('');
    setSelectedDate('');
  };

  // ======================================================
  // RENDERIZAÇÃO
  // ======================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Cabeçalho */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col gap-2">
          <p className="text-sm text-indigo-600 font-semibold">
            Submissões
          </p>
          <h2 className="text-2xl font-bold text-gray-800">
            Todas as Submissões
          </h2>
          <p className="text-gray-500">
            Consulte todas as respostas submetidas nos seus formulários.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Barra de pesquisa e contagem */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              Listagem de Submissões
            </h2>
            <p className="text-gray-500 text-sm">
              {filteredSubmissions.length}{' '}
              {filteredSubmissions.length === 1 ? 'submissão encontrada' : 'submissões encontradas'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="">Todos os formulários</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="">Todos os estados</option>
              <option value="pending">Pendente</option>
              <option value="submitted">Submetida</option>
              <option value="approved">Aprovada</option>
              <option value="rejected">Rejeitada</option>
            </select>

            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />

              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 font-semibold transition"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
cd Frontend
        {/* Estado de carregamento */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
            <p className="text-gray-600 mt-4">A carregar submissões...</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Estado vazio */}
        {!loading && !error && filteredSubmissions.length === 0 && (
          <div className="bg-white rounded-xl p-16 text-center border border-gray-200 shadow-sm">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium">
              {searchTerm ? 'Nenhuma submissão encontrada' : 'Ainda não existem submissões'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm
                ? 'Tente ajustar os termos de pesquisa.'
                : 'As submissões aparecerão aqui quando os utilizadores preencherem formulários.'}
            </p>
          </div>
        )}

        {/* Tabela de submissões */}
        {!loading && !error && filteredSubmissions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Formulário de Origem
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Data / Hora
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubmissions.map((submission) => {
                    const statusCfg = getStatusConfig(submission.status);
                    return (
                      <tr
                        key={submission.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                        {/* Formulário de Origem */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {getTemplateName(submission.form_template_id)}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                ID: {submission.id?.slice(0, 8)}…
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Data / Hora */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {formatDate(submission.submitted_at || submission.created_at)}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => onViewDetails(submission.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow-md opacity-80 group-hover:opacity-100"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Ver Detalhe
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsPage;
