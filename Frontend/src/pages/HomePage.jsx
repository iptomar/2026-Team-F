import React from 'react';

const HomePage = ({ onCreateNew }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      
      {/* Cabeçalho */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Editor de Formulários
        </h1>
        <p className="text-lg text-gray-500">
          Cria e gere os teus formulários dinâmicos de forma simples.
        </p>
      </div>

      {/* Botão principal */}
      <button
        onClick={onCreateNew}
        className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-10 py-4 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
      >
        + Criar Novo Formulário
      </button>

    </div>
  );
};

export default HomePage;