import React from 'react';

// Componente de Etiqueta (Label)
export const FormLabel = ({ value }) => (
  <div className="py-2">
    <p className="text-lg font-semibold text-gray-800">{value || "Texto da Etiqueta"}</p>
  </div>
);

// Componente Radio Button (Visual apenas)
export const FormRadio = ({ label }) => (
  <div className="flex items-center space-x-3 p-2 border border-transparent">
    <input type="radio" disabled className="h-4 w-4 text-blue-600" />
    <span className="text-gray-700">{label || "Opção de escolha"}</span>
  </div>
);

// Componente Checkbox (Visual apenas)
export const FormCheckbox = ({ label }) => (
  <div className="flex items-center space-x-3 p-2">
    <input type="checkbox" disabled className="h-4 w-4 text-blue-600 rounded" />
    <span className="text-gray-700">{label || "Opção de seleção"}</span>
  </div>
);