import React, { useState, useEffect } from 'react';
import '../App.css';

// ======================================================
// MODELOS PRÉ-DEFINIDOS (PRESETS)
// ======================================================
const MODELOS_PREDEFINIDOS = [
  {
    name: 'Formulário de Contacto',
    description: 'Modelo pré-configurado ideal para recolha de dados de contacto e triagem inicial de assuntos.',
    fields: [
      { type: 'label', label: 'Nome Completo', required: true, options: [], order: 1 },
      { type: 'label', label: 'E-mail para Contacto', required: true, options: [], order: 2 },
      { type: 'dropdown', label: 'Assunto Principal', required: false, options: ['Suporte Técnico', 'Sugestão', 'Comercial'], order: 3 }
    ]
  },
  {
    name: 'Inquérito de Satisfação',
    description: 'Avalie a experiência do utilizador e obtenha feedback direto sobre os seus serviços ou produtos.',
    fields: [
      { type: 'radio', label: 'Como classifica a qualidade do nosso atendimento?', required: true, options: ['Excelente', 'Bom', 'Satisfatório', 'Fraco'], order: 1 },
      { type: 'checkbox', label: 'Recomendaria a nossa plataforma a outras pessoas?', required: false, options: [], order: 2 }
    ]
  }
];

const HomePage = ({ onCreateNew, onSelectDraft, authUser }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:3000/form-templates');

        if (!response.ok) {
          throw new Error(`Erro ao buscar templates: ${response.statusText}`);
        }

        const allTemplates = await response.json();

        const draftTemplates = allTemplates.filter(
          (template) => template.status === 'draft'
        );

        setDrafts(draftTemplates);
      } catch (err) {
        console.error('Erro ao buscar rascunhos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  // ======================================================
  // LÓGICA DE CRIAÇÃO A PARTIR DE UM MODELO BASE
  // ======================================================
  const handleCriarAPartirDeModelo = async (modelo) => {
    try {
      setLoading(true);
      
      // Mapeia os campos pré-definidos gerando IDs únicos para evitar colisões no editor
      const camposComIdsNovos = modelo.fields.map(field => ({
        ...field,
        id: crypto.randomUUID()
      }));

      const payload = {
        name: modelo.name,
        description: modelo.description,
        fields: camposComIdsNovos,
        status: 'draft' // Salva instantaneamente como rascunho na base de dados
      };

      const response = await fetch('http://localhost:3000/form-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro ao clonar o modelo base: ${response.statusText}`);
      }

      const novoFormulario = await response.json();
      
      // Redireciona para o editor usando a prop existente e carregando o ID clonado
      onSelectDraft(novoFormulario.id);

    } catch (err) {
      console.error('Erro ao criar a partir de modelo:', err);
      alert(`Não foi possível criar o formulário a partir do modelo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tens a certeza que queres apagar este rascunho?')) {
      try {
        const response = await fetch(`http://localhost:3000/form-templates/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`Erro ao apagar template: ${response.statusText}`);
        }

        setDrafts((prev) => prev.filter((draft) => draft.id !== id));
      } catch (err) {
        console.error('Erro ao apagar rascunho:', err);
        alert(`Erro ao apagar rascunho: ${err.message}`);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col gap-2">
          <p className="text-sm text-indigo-600 font-semibold">
            Área autenticada
          </p>

          <h2 className="text-2xl font-bold text-gray-800">
            Olá{authUser?.name ? `, ${authUser.name}` : ''}.
          </h2>

          <p className="text-gray-500">
            A partir desta página pode criar novos formulários ou continuar
            rascunhos guardados anteriormente.
          </p>
        </div>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-3">
          Editor de Formulários
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Cria formulários profissionais em segundos
        </p>

        <button
          onClick={onCreateNew}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg font-semibold"
        >
          + Criar Novo Formulário
        </button>
      </div>

      {/* ====================================================== */}
      {/* GRID DE MODELOS BASE */}
      {/* ====================================================== */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Modelos Pré-definidos
          </h2>
          <p className="text-gray-600 text-sm">
            Selecione um modelo pronto para criar um FormTemplate editável imediatamente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODELOS_PREDEFINIDOS.map((modelo, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-indigo-300 transition-all"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-bold text-sm">📋</span>
                  <h3 className="font-bold text-gray-800 text-lg">{modelo.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{modelo.description}</p>
                <div className="text-xs text-gray-400 mb-5">
                  Elementos incluídos: <span className="font-semibold text-gray-500">{modelo.fields.map(f => f.type).join(', ')}</span>
                </div>
              </div>
              <button
                onClick={() => handleCriarAPartirDeModelo(modelo)}
                disabled={loading}
                className="w-full py-2 bg-white border border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all text-sm text-center"
              >
                + Usar este Modelo
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Os Meus Rascunhos
          </h2>
          <p className="text-gray-600 text-sm">
            Formulários salvos que pode continuar a editar
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
            <p className="text-gray-600 mt-4">A carregar rascunhos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {!loading && !error && drafts.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>

            <p className="text-gray-500">Nenhum rascunho pendente</p>
            <p className="text-gray-400 text-sm mt-1">
              Comece criando um novo formulário
            </p>
          </div>
        )}

        {!loading && !error && drafts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 truncate text-lg">
                    {draft.name}
                  </h3>
                </div>

                <div className="flex-1 px-6 py-4">
                  {draft.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {draft.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Campos:</span>
                      <span className="font-semibold text-gray-700">
                        {draft.fields?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Criado:</span>
                      <span className="font-semibold text-gray-700">
                        {formatDate(draft.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => onSelectDraft(draft.id)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm text-center"
                  >
                    Continuar Edição
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-semibold text-sm"
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;