// ======================================================
// FRONTEND/src/components/PreviewModal.jsx
// Modal de pré-visualização — apenas visual, sem submissão
// ======================================================

import React, { useState } from 'react';
import {
  FormLabel,
  FormRadioGroup,
  FormCheckbox,
  FormDropdown,
} from './DynamicElements';

const PreviewModal = ({
  isOpen,
  onClose,
  schema = [],
  formName = 'Pré-visualização do Formulário',
  formDescription = '',
}) => {
  const [previewData, setPreviewData] = useState({});

  if (!isOpen) {
    return null;
  }

  const handlePreviewChange = (fieldId, valor) => {
    setPreviewData((prev) => ({
      ...prev,
      [fieldId]: valor,
    }));
  };

  const clearPreview = () => {
    setPreviewData({});
  };

  const renderField = (field) => {
    const valorAtual = previewData[field.id] ?? '';

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
            onChange={(valor) => handlePreviewChange(field.id, valor)}
          />
        );

      case 'checkbox':
        return (
          <FormCheckbox
            label={field.label}
            description={field.label}
            required={field.required}
            isPreview={true}
            checked={Boolean(valorAtual)}
            onChange={(event) =>
              handlePreviewChange(field.id, event.target.checked)
            }
          />
        );

      case 'dropdown':
        return (
          <FormDropdown
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(event) =>
              handlePreviewChange(field.id, event.target.value)
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-slate-50">
          <div className="flex items-start gap-4">
            <span className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm text-xl">
              👁️
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-indigo-600 mb-1">
                Modo de Pré-visualização
              </p>

              <h2 className="text-2xl font-black text-slate-900">
                {formName || 'Formulário sem nome'}
              </h2>

              <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {formDescription ||
                  'Visão aproximada do utilizador final. Pode interagir com os campos para testar o comportamento visual.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition flex items-center justify-center text-xl font-black"
            type="button"
            title="Fechar preview"
          >
            ×
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 lg:p-8 bg-slate-100">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 lg:p-8 border border-slate-200 rounded-3xl shadow-sm">
              {schema.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto mb-5 h-16 w-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl">
                    🧩
                  </div>

                  <h3 className="text-xl font-black text-slate-800 mb-2">
                    Nenhum campo para mostrar
                  </h3>

                  <p className="text-sm text-slate-500">
                    Adicione componentes no editor para visualizar o formulário.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {schema.map((field) => (
                    <div key={field.id}>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 bg-white flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Esta pré-visualização é apenas visual e não submete dados.
          </p>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={clearPreview}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              <span>🧹</span>
              <span>Limpar simulação</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <span>Fechar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;