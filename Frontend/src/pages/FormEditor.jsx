import React, { useState } from 'react';

// Constante para garantir consistência nos tipos de dados
const FIELD_TYPES = {
  LABEL: 'label',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
};

const FormEditor = () => {
  // O estado 'fields' será a nossa "Single Source of Truth" para o formulário
  const [fields, setFields] = useState([]);

  // Log para monitorização do estado (útil durante o desenvolvimento)
  console.log("Campos atuais no formulário:", fields);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editor de Formulário Dinâmico</h1>
      
      {/* Zona de renderização (vazia por enquanto) */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 mb-8 min-h-[100px]">
        {fields.length === 0 && (
          <p className="text-gray-400 text-center">Selecione um componente para começar.</p>
        )}
      </div>
    </div>
  );
};

export default FormEditor;