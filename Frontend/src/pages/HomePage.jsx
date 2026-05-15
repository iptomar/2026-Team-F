import React from 'react';
import '../App.css'; // Importa o CSS aqui

const HomePage = ({ onCreateNew }) => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1 style={{ fontSize: '3rem', color: '#007bff' }}>Editor de Formulários</h1>
      <p style={{ color: '#65676b' }}>Cria formulários incríveis em segundos.</p>
      
      <button className="btn-blue" onClick={onCreateNew}>
        + Criar Novo Formulário
      </button>
    </div>
  );
};

export default HomePage;