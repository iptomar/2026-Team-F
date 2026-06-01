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

const PreviewModal = ({ isOpen, onClose, schema = [] }) => {
  // Estado local apenas para demonstrar interatividade visual na preview
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Modo de Pré-visualização
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Visão do utilizador final. Interaja para testar o comportamento visual.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-2xl"
            type="button"
          >
            &times;
          </button>
        </div>

        {/* Corpo — campos renderizados */}
        <div className="flex-grow overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
            {schema.length === 0 ? (
              <p className="text-center text-gray-400">
                Nenhum campo para mostrar.
              </p>
            ) : (
              schema.map((field) => (
                <div key={field.id} className="mb-6">
                  {renderField(field)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rodapé — apenas botão de fechar */}
        <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

export default PreviewModal;