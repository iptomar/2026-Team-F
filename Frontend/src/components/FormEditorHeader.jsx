import React from 'react';

/**
 * FormEditorHeader
 *
 * Componente de apresentação responsável pelos campos de cabeçalho do editor:
 * nome e descrição do formulário.
 *
 * Props:
 *  - name        {string}   Valor atual do nome (controlled)
 *  - description {string}   Valor atual da descrição (controlled)
 *  - onNameChange        {function} Handler chamado ao alterar o nome
 *  - onDescriptionChange {function} Handler chamado ao alterar a descrição
 *  - nameError   {string|null} Mensagem de erro de validação para o nome
 *
 * Preparado para futura integração com o endpoint PATCH /form-templates/:id:
 * basta passar um prop onSave e ligar ao botão de guardar.
 */
const FormEditorHeader = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  nameError,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Cabeçalho do Formulário
      </h2>

      {/* Campo Nome */}
      <div className="mb-4">
        <label
          htmlFor="form-name"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          id="form-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nome do formulário"
          maxLength={255}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
            nameError
              ? 'border-red-400 focus:ring-red-300'
              : 'border-gray-300 focus:ring-blue-400'
          }`}
        />
        {nameError && (
          <p className="mt-1 text-sm text-red-500">{nameError}</p>
        )}
      </div>

      {/* Campo Descrição */}
      <div>
        <label
          htmlFor="form-description"
          className="block text-sm font-semibold text-gray-700 mb-1"
        >
          Descrição <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="form-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descrição do formulário"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition"
        />
      </div>
    </div>
  );
};

export default FormEditorHeader;
