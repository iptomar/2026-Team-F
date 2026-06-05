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
  in_progress: {
    label: 'Em Progresso',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-400',
  },
  completed: {
    label: 'Concluída',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-400',
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
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Tipos de campos puramente visuais/estruturais que não contêm respostas
const STRUCTURAL_FIELD_TYPES = ['label', 'heading', 'section', 'divider', 'text_block', 'paragraph', 'spacer'];

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================
const SubmissionDetailPage = ({ submissionId, onBack }) => {
  const [submission, setSubmission] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // ======================================================
  // FETCH DE DADOS (submissão → template associado)
  // ======================================================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar a submissão
        const subRes = await fetch(
          `http://localhost:3000/form-submissions/${submissionId}`
        );
        if (!subRes.ok) {
          throw new Error(`Erro ao buscar submissão: ${subRes.statusText}`);
        }
        const subData = await subRes.json();
        setSubmission(subData);

        // 2. Buscar o template associado
        const tplRes = await fetch(
          `http://localhost:3000/form-templates/${subData.form_template_id}`
        );
        if (!tplRes.ok) {
          throw new Error(`Erro ao buscar template: ${tplRes.statusText}`);
        }
        const tplData = await tplRes.json();
        setTemplate(tplData);
      } catch (err) {
        console.error('Erro ao carregar detalhe:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchDetail();
    }
  }, [submissionId]);

  // ======================================================
  // FETCH DO HISTÓRICO DE TRANSIÇÕES DE ESTADO
  // ======================================================
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const res = await fetch(
          `http://localhost:3000/form-submissions/${submissionId}/history`
        );
        if (!res.ok) {
          console.error('Erro ao buscar histórico:', res.statusText);
          setHistory([]);
          return;
        }
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (submissionId) {
      fetchHistory();
    }
  }, [submissionId]);

  // ======================================================
  // EXTRAIR CAMPOS RESPONDÍVEIS DE QUALQUER ESTRUTURA
  // Suporta: campos simples, secções com sub-campos,
  // e ignora campos puramente estruturais
  // ======================================================
  const extractAnswerableFields = (fields) => {
    if (!fields || !Array.isArray(fields)) return [];

    const result = [];

    const walk = (fieldList, sectionLabel = null) => {
      fieldList.forEach((field) => {
        // Se o campo tem sub-campos (secção / grupo)
        if (field.fields && Array.isArray(field.fields)) {
          walk(field.fields, field.label || field.name || sectionLabel);
          return;
        }

        // Ignorar campos puramente estruturais / labels
        if (STRUCTURAL_FIELD_TYPES.includes(field.type)) {
          return;
        }

        result.push({
          id: field.id,
          label: field.label || field.name || 'Campo sem nome',
          type: field.type,
          section: sectionLabel,
          required: field.required || false,
        });
      });
    };

    walk(fields);
    return result;
  };

  // ======================================================
  // FORMATAR VALOR DA RESPOSTA
  // ======================================================
  const formatAnswer = (value) => {
    if (value === undefined || value === null || value === '') {
      return (
        <span className="text-gray-400 italic">Sem resposta</span>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <span className="text-gray-400 italic">Sem resposta</span>
        );
      }
      return (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              {String(v)}
            </span>
          ))}
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return value ? (
        <span className="inline-flex items-center gap-1 text-green-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Sim
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Não
        </span>
      );
    }

    return <span className="text-gray-800">{String(value)}</span>;
  };

  // ======================================================
  // RENDERIZAÇÃO — CARREGAMENTO
  // ======================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 mt-4">A carregar detalhe da submissão...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDERIZAÇÃO — ERRO
  // ======================================================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium text-sm"
          >
            ← Voltar à lista
          </button>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  if (!submission || !template) return null;

  // ======================================================
  // DADOS DERIVADOS
  // ======================================================
  const statusCfg = getStatusConfig(submission.status);
  const answerableFields = extractAnswerableFields(template.fields);
  const submissionData = submission.data || {};

  // Agrupar campos por secção
  const groupedFields = [];
  let currentSection = null;

  answerableFields.forEach((field) => {
    if (field.section !== currentSection) {
      currentSection = field.section;
      groupedFields.push({ type: 'section', label: currentSection });
    }
    groupedFields.push({ type: 'field', ...field });
  });

  // ======================================================
  // RENDERIZAÇÃO PRINCIPAL
  // ======================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Botão Voltar */}
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium text-sm"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar à lista de submissões
        </button>

        {/* Cabeçalho com metadados */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-indigo-600 font-semibold mb-1">
                  Detalhe da Submissão
                </p>
                <h2 className="text-2xl font-bold text-gray-800">
                  {template.name}
                </h2>
              </div>
              <span
                className={`self-start inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`}></span>
                {statusCfg.label}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Autor */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Autor</p>
                <p className="text-sm font-semibold text-gray-800">
                  {submission.submitted_by || submission.author || 'Anónimo'}
                </p>
              </div>
            </div>

            {/* Data de submissão */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Submetido em</p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatDate(submission.submitted_at || submission.created_at)}
                </p>
              </div>
            </div>

            {/* ID */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">ID</p>
                <p className="text-sm font-semibold text-gray-800 font-mono">
                  {submission.id?.slice(0, 12)}…
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Estados */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800">
                Histórico de Estados
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Registo cronológico das transições de estado desta submissão
            </p>
          </div>

          <div className="px-6 py-5">
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-sm text-gray-500">A carregar histórico...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-400 text-sm">Ainda não existem transições de estado.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Linha vertical da timeline */}
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-100 to-transparent"></div>

                <div className="space-y-6">
                  {history.map((entry, index) => {
                    const prevCfg = getStatusConfig(entry.previous_status);
                    const newCfg = getStatusConfig(entry.new_status);
                    const isLast = index === history.length - 1;

                    return (
                      <div key={entry.id || index} className="relative flex gap-4">
                        {/* Círculo da timeline */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className={`w-[30px] h-[30px] rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                            isLast ? 'bg-indigo-500' : 'bg-indigo-100'
                          }`}>
                            <svg className={`w-3.5 h-3.5 ${isLast ? 'text-white' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>

                        {/* Conteúdo da entrada */}
                        <div className={`flex-1 rounded-xl p-4 transition-colors ${
                          isLast
                            ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100'
                            : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                        }`}>
                          {/* Badges de transição */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${prevCfg.bg} ${prevCfg.text} ${prevCfg.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${prevCfg.dot}`}></span>
                              {prevCfg.label}
                            </span>
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${newCfg.bg} ${newCfg.text} ${newCfg.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${newCfg.dot}`}></span>
                              {newCfg.label}
                            </span>
                          </div>

                          {/* Meta-informação: data e responsável */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDate(entry.changed_at)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {entry.changed_by || 'Sistema'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Respostas do formulário */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">
              Respostas
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {answerableFields.length}{' '}
              {answerableFields.length === 1 ? 'campo' : 'campos'} no formulário
            </p>
          </div>

          {answerableFields.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400">Este formulário não contém campos respondíveis.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groupedFields.map((item, index) => {
                // Cabeçalho de secção
                if (item.type === 'section' && item.label) {
                  return (
                    <div
                      key={`section-${index}`}
                      className="px-6 py-3 bg-gradient-to-r from-gray-50 to-white"
                    >
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                        {item.label}
                      </p>
                    </div>
                  );
                }

                if (item.type !== 'field') return null;

                const answer = submissionData[item.id];
                return (
                  <div
                    key={item.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                      <div className="sm:w-2/5 flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {item.label}
                        </span>
                        {item.required && (
                          <span className="text-red-400 text-xs" title="Obrigatório">*</span>
                        )}
                      </div>
                      <div className="sm:w-3/5 text-sm">
                        {formatAnswer(answer)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailPage;
