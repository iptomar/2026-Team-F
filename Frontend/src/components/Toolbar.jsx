import React from "react";

//Toolbar responsavel
//TOOLBAR DO EDITOR
//Responsável por:
// Adicionar novos campos
// Ativar preview
// Submeter formulário
//Este componente recebe funções por props.

const Toolbar = ({ 
     addField,
  FIELD_TYPES,
  mockMode,
  setMockMode,
  handleSubmit
    }) => {
         return (

    <div className="bg-white shadow-md rounded-xl p-4 mb-6">

      {/* TÍTULO */}
      <h2 className="text-xl font-bold mb-4">
        Ferramentas do Formulário
      </h2>

      {/* BOTÕES */}
      <div className="flex flex-wrap gap-3">

        {/* BOTÃO LABEL */}
        <button
          onClick={() => addField(FIELD_TYPES.LABEL)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          + Label
        </button>

        {/* BOTÃO RADIO */}
        <button
          onClick={() => addField(FIELD_TYPES.RADIO)}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          + Radio
        </button>

        {/* BOTÃO CHECKBOX */}
        <button
          onClick={() => addField(FIELD_TYPES.CHECKBOX)}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
        >
          + Checkbox
        </button>

        {/* PREVIEW */}
        <button
          onClick={() => setMockMode(!mockMode)}
          className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
        >
          {mockMode ? "Sair Preview" : "Ver Preview"}
        </button>

        {/* SUBMETER */}
        <button
          onClick={handleSubmit}
          className="px-5 py-2 bg-gray-800 hover:bg-black text-white rounded-lg"
        >
          Submeter
        </button>

      </div>

    </div>

  );
};