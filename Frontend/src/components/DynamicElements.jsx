import React from 'react';

// Wrapper para dar consistência a todos os campos do formulário
const FieldWrapper = ({ label, required, children, error }) => (
  <div className="flex flex-col mb-6 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
    <div className="flex items-center mb-2">
      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
    {children}
    {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

// 1. Bloco de Texto (Label)
export const FormLabel = ({ value, description }) => (
  <div className="mb-6 p-2 border-l-4 border-blue-500 bg-blue-50">
    <h3 className="text-xl font-bold text-blue-900">{value || "Título da Secção"}</h3>
    {description && <p className="text-sm text-blue-700 mt-1">{description}</p>}
  </div>
);

// 2. Componente de Grupo de Radio Buttons (Radio Group)
export const FormRadioGroup = ({ label, options = [], required, error }) => (
  <FieldWrapper label={label} required={required} error={error}>
    <div className="space-y-2">
      {options.length > 0 ? (
        options.map((opt, index) => (
          <label key={index} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition">
            <input 
              type="radio" 
              name={label} 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
              disabled 
            />
            <span className="ml-3 text-gray-700">{opt}</span>
          </label>
        ))
      ) : (
        <p className="text-xs italic text-gray-400">Nenhuma opção configurada.</p>
      )}
    </div>
  </FieldWrapper>
);

// 3. Componente de Checkbox Individual ou Grupo
export const FormCheckbox = ({ label, description, required, error }) => (
  <FieldWrapper label={label} required={required} error={error}>
    <div className="flex items-start p-3 border rounded-md hover:bg-gray-50 transition cursor-pointer">
      <div className="flex items-center h-5">
        <input 
          type="checkbox" 
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
          disabled 
        />
      </div>
      <div className="ml-3 text-sm">
        <label className="font-medium text-gray-700">{description || "Confirmar seleção"}</label>
      </div>
    </div>
  </FieldWrapper>
);

// 4. Componente de Dropdown (Select)
export const FormDropdown = ({ label, options = [], required, error }) => (
  <FieldWrapper label={label} required={required} error={error}>
    <select
      className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      disabled
    >
      <option value="">Selecione uma opção...</option>
      {options.length > 0 ? (
        options.map((opt, index) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))
      ) : (
        <option value="" disabled>Nenhuma opção configurada</option>
      )}
    </select>
  </FieldWrapper>
);