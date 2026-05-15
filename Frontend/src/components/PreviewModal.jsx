import React from 'react';
// Adicionar o FormDropdown no import
import { FormLabel, FormRadioGroup, FormCheckbox, FormDropdown } from './DynamicElements';

const PreviewModal = ({ isOpen, onClose, schema }) => {
  if (!isOpen) return null;

  const renderField = (field) => {
    switch (field.type) {
      case 'label':
        return <FormLabel value={field.label} />;
      case 'radio':
        return <FormRadioGroup label={field.label} options={field.options} required={field.required} />;
      case 'checkbox':
        return <FormCheckbox label={field.label} description={field.label} required={field.required} />;
      case 'dropdown':
        return <FormDropdown label={field.label} options={field.options} required={field.required} />;
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

        <div className="p-8 bg-gray-50 overflow-y-auto flex-grow">
          <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
            {schema.length === 0 ? (
              <p className="text-center text-gray-400">Nenhum campo para mostrar.</p>
            ) : (
              schema.map(field => <div key={field.id} className="mb-4">{renderField(field)}</div>)
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-white flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
            Voltar à Edição
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;