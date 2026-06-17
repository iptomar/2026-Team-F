// ======================================================
// FRONTEND/src/pages/FormFillPage.jsx
// Página dedicada ao preenchimento real de um formulário
// ======================================================

import React, { useState, useEffect } from 'react';
import {
  FormLabel,
  FormSectionHeader,
  FormRadioGroup,
  FormCheckbox,
  FormDropdown,
  FormTextInput,
  FormTextArea,
  FormEmailInput,
  FormNumberInput,
  FormDateInput,
} from '../components/DynamicElements';

const FormFillPage = ({ templateId, onBack }) => {
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Lógica de páginas
  const [currentPage, setCurrentPage] = useState(1);
  const fields = template?.fields || [];
  const sortedFields = [...fields].sort((a, b) => (a.order || 0) - (b.order || 0));
  const pageCount = Math.max(1, ...sortedFields.map((f) => f.page || 1));
  const currentFields = sortedFields.filter((f) => (f.page || 1) === currentPage);

  // ======================================================
  // CARREGAR O TEMPLATE
  // ======================================================
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        setErro('');

        const response = await fetch(
          `http://localhost:3000/form-templates/${templateId}`
        );

        if (!response.ok) {
          throw new Error(`Erro ao carregar formulário: ${response.statusText}`);
        }

        const data = await response.json();
        setTemplate(data);
      } catch (err) {
        console.error('Erro ao carregar template:', err);
        setErro(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  // ======================================================
  // HANDLER DE INPUT
  // ======================================================
  const handleInputChange = (fieldId, valor) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: valor,
    }));
    setErro('');
    setSucesso('');
  };

  // ======================================================
  // VALIDAÇÃO E NAVEGAÇÃO DE PÁGINAS
  // ======================================================
  const validarPaginaAtual = () => {
    const camposObrigatorios = currentFields.filter((f) => f.required);
    for (const field of camposObrigatorios) {
      if (field.type === 'label' || field.type === 'section') continue;
      const valor = formData[field.id];
      if (
        valor === undefined || valor === null || valor === '' || valor === false ||
        (Array.isArray(valor) && valor.length === 0)
      ) {
        return `O campo "${field.label}" é obrigatório para avançar.`;
      }
    }
    return null;
  };

  const handleNextPage = () => {
    setErro('');
    const erroValidacao = validarPaginaAtual();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }
    if (currentPage < pageCount) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevPage = () => {
    setErro('');
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // ======================================================
  // SUBMETER FORMULÁRIO
  // ======================================================
  const handleSubmit = async () => {
    setErro('');
    setSucesso('');

    const erroValidacao = validarPaginaAtual();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    const payload = { form_template_id: templateId, data: formData };

    try {
      setIsSubmitting(true);
      const response = await fetch('http://localhost:3000/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultado = await response.json().catch(() => null);

      if (!response.ok) {
        setErro(resultado?.error || 'Erro ao submeter o formulário.');
        return;
      }

      alert('Formulário submetido com sucesso!');
      if (onBack) onBack();
    } catch (err) {
      setErro('Não foi possível conectar ao servidor backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================================================
  // RENDERIZAR CAMPO INTERATIVO
  // ======================================================
  function renderField(field) {
    const valorAtual = formData[field.id] ?? '';

    switch (field.type) {
      case 'label':
        return <FormLabel value={field.label} />;

      case 'radio':
        return (
          <FormRadioGroup
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(valor) => handleInputChange(field.id, valor)} />
        );

      case 'checkbox':
        return (
          <FormCheckbox
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(newArray) => handleInputChange(field.id, newArray)} />
        );

      case 'dropdown':
        return (
          <FormDropdown
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(event) => handleInputChange(field.id, event.target.value)} />
        );

      case 'text':
        return (
          <FormTextInput
            label={field.label}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(valor) => handleInputChange(field.id, valor)} />
        );

      case 'textarea':
        return (
          <FormTextArea
            label={field.label}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(valor) => handleInputChange(field.id, valor)} />
        );

      case 'email':
        return (
          <FormEmailInput
            label={field.label}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(valor) => handleInputChange(field.id, valor)} />
        );

      case 'number':
        return (
          <FormNumberInput
            label={field.label}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(valor) => handleInputChange(field.id, valor)} />
        );

      case 'date':
        return (
          <FormDateInput
            label={field.label}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(valor) => handleInputChange(field.id, valor)} />
        );

      case 'section':
        return (
          <FormSectionHeader
            value={field.label}
            description={field.description}
            fontSize={field.fontSize}
            fontWeight={field.fontWeight}
            textAlign={field.textAlign}
          />
        );

      default:
        return null;
    }
  }

  // ======================================================
  // ESTADOS DE CARREGAMENTO E ERRO
  // ======================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 mt-4">A carregar formulário...</p>
        </div>
      </div>
    );
  }

  if (erro && !template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium text-sm"
          >
            ← Voltar
          </button>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <strong>Erro:</strong> {erro}
          </div>
        </div>
      </div>
    );
  }

  if (!template) return null;

  // ======================================================
  // RENDER PRINCIPAL
  // ======================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-3xl mx-auto">

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
          Voltar à listagem
        </button>

        {/* Cabeçalho */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-5 border-b border-gray-200">
            <p className="text-sm text-indigo-600 font-semibold mb-1">
              Preencher Formulário
            </p>
            <h2 className="text-2xl font-bold text-gray-800">
              {template.name}
            </h2>
            {template.description && (
              <p className="text-gray-600 text-sm mt-2">
                {template.description}
              </p>
            )}
          </div>
        </div>

        {/* Corpo do formulário */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8">

            {/* Mensagens de feedback */}
            {sucesso && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium text-center shadow-sm">
                {sucesso}
              </div>
            )}

            {erro && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium text-center shadow-sm">
                {erro}
              </div>
            )}

            {/* Campos */}
            {pageCount > 1 && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Página {currentPage} de {pageCount}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage >= pageCount}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}

            {currentFields.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                Esta página não contém campos.
              </p>
            ) : (
              currentFields.map((field) => (
                <div key={field.id} className="mb-6">
                  {renderField(field)}
                </div>
              ))
            )}
          </div>

          {/* Rodapé com botão Submeter */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || sortedFields.length === 0}
              className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'A submeter...' : 'Submeter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormFillPage;