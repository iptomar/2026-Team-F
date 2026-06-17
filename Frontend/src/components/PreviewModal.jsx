import React, { useState } from 'react';
import { FormLabel, FormRadioGroup, FormCheckbox, FormDropdown } from './DynamicElements';

const API_BASE = 'http://localhost:3000';

// ======================================================
// CAMPOS DE TEXTO SIMPLES (#69)
// ======================================================

const FieldWrapper = ({ label, required, children }) => (
  <div className="flex flex-col mb-6 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const FormTextField = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(field.id, e.target.value)}
      placeholder={field.placeholder || 'Escreva aqui...'}
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
    />
  </FieldWrapper>
);

const FormTextareaField = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(field.id, e.target.value)}
      placeholder={field.placeholder || 'Escreva aqui...'}
      rows={4}
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
    />
  </FieldWrapper>
);

const FormNumberField = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(field.id, e.target.value)}
      placeholder="0"
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
    />
  </FieldWrapper>
);

const FormEmailField = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <input
      type="email"
      value={value || ''}
      onChange={(e) => onChange(field.id, e.target.value)}
      placeholder="exemplo@email.com"
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
    />
  </FieldWrapper>
);

const FormDateField = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(field.id, e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
    />
  </FieldWrapper>
);

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

const PreviewModal = ({ isOpen, onClose, schema, formTemplateId }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({});
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const lidarComMudancaInput = (fieldId, valor) => {
    setFormData((prev) => ({ ...prev, [fieldId]: valor }));
  };

  // Validação de campos obrigatórios (#69)
  const validar = () => {
    for (const field of schema) {
      if (field.required && field.type !== 'label') {
        const val = formData[field.id];
        if (val === undefined || val === null || val === '' || val === false) {
          return `O campo "${field.label}" é obrigatório.`;
        }
      }
    }
    return null;
  };

  const lidarComSubmissao = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    const erroValidacao = validar();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    const idParaSubmeter = formTemplateId || null;

    const payload = {
      form_template_id: idParaSubmeter,
      data: formData,
      submitted_by: null,
    };

    try {
      const resposta = await fetch(`${API_BASE}/form-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resultado = await resposta.json();

      if (resposta.status === 201) {
        setSucesso('Formulário submetido com sucesso!');
        setFormData({});
      } else {
        setErro(resultado.error || 'Erro ao submeter o formulário.');
      }
    } catch (err) {
      console.error('Erro na ligação ao servidor:', err);
      setErro('Não foi possível conectar ao servidor backend.');
    }
  };

  // ======================================================
  // RENDERIZAR CAMPO — inclui tipos avançados (#69)
  // ======================================================
  const renderField = (field) => {
    const valorAtual = formData[field.id] ?? '';

    switch (field.type) {
      // Tipos existentes
      case 'label':
        return <FormLabel value={field.label} />;
      case 'radio':
        return (
          <FormRadioGroup
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={false}
            value={valorAtual}
            onChange={(valor) => lidarComMudancaInput(field.id, valor)}
          />
        );
      case 'checkbox':
        return (
          <FormCheckbox
            label={field.label}
            description={field.label}
            required={field.required}
            isPreview={false}
            checked={!!valorAtual}
            onChange={(e) => lidarComMudancaInput(field.id, e.target.checked)}
          />
        );
      case 'dropdown':
        return (
          <FormDropdown
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={false}
            value={valorAtual}
            onChange={(e) => lidarComMudancaInput(field.id, e.target.value)}
          />
        );

      // Novos tipos (#69)
      case 'text':
        return (
          <FormTextField
            field={field}
            value={valorAtual}
            onChange={lidarComMudancaInput}
          />
        );
      case 'textarea':
        return (
          <FormTextareaField
            field={field}
            value={valorAtual}
            onChange={lidarComMudancaInput}
          />
        );
      case 'number':
        return (
          <FormNumberField
            field={field}
            value={valorAtual}
            onChange={lidarComMudancaInput}
          />
        );
      case 'email':
        return (
          <FormEmailField
            field={field}
            value={valorAtual}
            onChange={lidarComMudancaInput}
          />
        );
      case 'date':
        return (
          <FormDateField
            field={field}
            value={valorAtual}
            onChange={lidarComMudancaInput}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Modo de Pré-visualização</h2>
            <p className="text-sm text-gray-500 mt-1">Visão do utilizador final.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        </div>

        <form onSubmit={lidarComSubmissao} className="flex flex-col flex-grow overflow-hidden">
          <div className="p-8 bg-gray-50 overflow-y-auto flex-grow">
            <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">

              {sucesso && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium text-center shadow-sm">
                  ✨ {sucesso}
                </div>
              )}
              {erro && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium text-center shadow-sm">
                  ⚠️ {erro}
                </div>
              )}

              {schema.length === 0 ? (
                <p className="text-center text-gray-400">Nenhum campo para mostrar.</p>
              ) : (
                schema.map((field) => (
                  <div key={field.id} className="mb-6">
                    {renderField(field)}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Voltar à Edição
            </button>

            {schema.length > 0 && (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md transition-colors"
              >
                Submeter Formulário
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreviewModal;
