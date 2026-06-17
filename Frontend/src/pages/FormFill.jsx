// ======================================================
// FRONTEND/src/pages/FormFill.jsx
// Página de preenchimento de formulário publicado (#90, #91, #69)
// ======================================================

import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:3000';

// ======================================================
// WRAPPER COMUM
// ======================================================
const FieldWrapper = ({ label, required, children }) => (
  <div className="flex flex-col mb-6">
    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

// ======================================================
// CAMPOS — tipos base
// ======================================================
const FillLabel = ({ field }) => (
  <div className="mb-6 p-3 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
    <h3 className="text-lg font-bold text-indigo-900">{field.label || field.value || 'Secção'}</h3>
    {field.description && <p className="text-sm text-indigo-700 mt-1">{field.description}</p>}
  </div>
);

const FillRadio = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <div className="space-y-2">
      {(field.options || []).map((opt, i) => (
        <label key={i} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition">
          <input type="radio" name={field.id} value={opt} checked={value === opt} onChange={() => onChange(field.id, opt)} className="h-4 w-4 text-indigo-600 border-gray-300" />
          <span className="ml-3 text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  </FieldWrapper>
);

const FillCheckbox = ({ field, value, onChange }) => (
  <div className="mb-6">
    <label className="flex items-start p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition">
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(field.id, e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded mt-0.5" />
      <div className="ml-3">
        <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </span>
        {field.description && <p className="text-sm text-gray-500 mt-1">{field.description}</p>}
      </div>
    </label>
  </div>
);

const FillDropdown = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <select value={value || ''} onChange={(e) => onChange(field.id, e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition">
      <option value="">Selecione uma opção...</option>
      {(field.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
    </select>
  </FieldWrapper>
);

// ======================================================
// CAMPOS — tipos avançados (#69)
// ======================================================
const FillText = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <input type="text" value={value || ''} onChange={(e) => onChange(field.id, e.target.value)} placeholder={field.placeholder || 'Escreva aqui...'} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
  </FieldWrapper>
);

const FillTextarea = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <textarea value={value || ''} onChange={(e) => onChange(field.id, e.target.value)} placeholder={field.placeholder || 'Escreva aqui...'} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none" />
  </FieldWrapper>
);

const FillNumber = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <input type="number" value={value || ''} onChange={(e) => onChange(field.id, e.target.value)} placeholder="0" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
  </FieldWrapper>
);

const FillEmail = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <input type="email" value={value || ''} onChange={(e) => onChange(field.id, e.target.value)} placeholder="exemplo@email.com" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
  </FieldWrapper>
);

const FillDate = ({ field, value, onChange }) => (
  <FieldWrapper label={field.label} required={field.required}>
    <input type="date" value={value || ''} onChange={(e) => onChange(field.id, e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
  </FieldWrapper>
);

// ======================================================
// DISPATCHER
// ======================================================
const renderField = (field, formData, handleChange) => {
  const value = formData[field.id];
  switch (field.type) {
    case 'label':    return <FillLabel key={field.id} field={field} />;
    case 'radio':    return <FillRadio key={field.id} field={field} value={value} onChange={handleChange} />;
    case 'checkbox': return <FillCheckbox key={field.id} field={field} value={value} onChange={handleChange} />;
    case 'dropdown': return <FillDropdown key={field.id} field={field} value={value} onChange={handleChange} />;
    case 'text':     return <FillText key={field.id} field={field} value={value} onChange={handleChange} />;
    case 'textarea': return <FillTextarea key={field.id} field={field} value={value} onChange={handleChange} />;
    case 'number':   return <FillNumber key={field.id} field={field} value={value} onChange={handleChange} />;
    case 'email':    return <FillEmail key={field.id} field={field} value={value} onChange={handleChange} />;
    case 'date':     return <FillDate key={field.id} field={field} value={value} onChange={handleChange} />;
    default:         return null;
  }
};

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================
const FormFill = ({ formId, authUser, authToken, onGoHome }) => {
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/form-templates/${formId}`);
        if (!response.ok) throw new Error('Formulário não encontrado.');
        const data = await response.json();
        if (data.status !== 'published') throw new Error('Este formulário não está disponível para preenchimento.');
        setTemplate(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (formId) loadTemplate();
  }, [formId]);

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const validate = () => {
    if (!template?.fields) return null;
    for (const field of template.fields) {
      if (field.required && field.type !== 'label') {
        const val = formData[field.id];
        if (val === undefined || val === null || val === '' || val === false) {
          return `O campo "${field.label}" é obrigatório.`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const validationError = validate();
    if (validationError) { setSubmitError(validationError); return; }

    try {
      setIsSubmitting(true);
      const payload = {
        form_template_id: formId,
        data: formData,
        submitted_by: authUser?.id ?? null,
      };
      const response = await fetch(`${API_BASE}/form-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(payload),
      });
      if (response.status === 201) {
        setSubmitted(true);
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao submeter o formulário.');
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600 mt-4">A carregar formulário...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-md w-full shadow-sm">
        <div className="text-red-500 text-4xl mb-4">✕</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={onGoHome} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">Voltar à Home</button>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl border border-green-200 p-8 text-center max-w-md w-full shadow-sm">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Formulário submetido!</h2>
        <p className="text-gray-600 mb-2">A tua resposta foi registada com sucesso.</p>
        {authUser?.name && <p className="text-sm text-gray-500 mb-6">Submetido por <span className="font-semibold">{authUser.name}</span></p>}
        <button onClick={onGoHome} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">Voltar à Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-6 mb-6">
          <p className="text-sm text-indigo-600 font-semibold mb-1">Formulário publicado</p>
          <h1 className="text-2xl font-bold text-gray-800">{template?.name}</h1>
          {template?.description && <p className="text-gray-500 mt-2">{template.description}</p>}
          {authUser?.name && <p className="text-xs text-gray-400 mt-3">A preencher como <span className="font-semibold text-gray-600">{authUser.name}</span></p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-6 mb-4">
            {(!template?.fields || template.fields.length === 0) ? (
              <p className="text-gray-400 text-center py-8">Este formulário não tem campos configurados.</p>
            ) : (
              template.fields.map((field) => renderField(field, formData, handleChange))
            )}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">{submitError}</div>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onGoHome} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-semibold">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting ? 'A submeter...' : 'Submeter Formulário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormFill;
