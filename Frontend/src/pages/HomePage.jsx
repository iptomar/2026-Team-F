import React, { useState, useEffect } from 'react';
import '../App.css';

// ======================================================
// MODELOS PRÉ-DEFINIDOS CATEGORIZADOS (PRESETS)
// ======================================================
const MODELOS_PREDEFINIDOS = [
  {
    name: 'Formulário de Contacto',
    description: 'Modelo básico ideal para recolha de dados de contacto e triagem inicial de assuntos gerais.',
    categoria: 'Geral',
    complexidade: 'Simples',
    fields: [
      { type: 'label', label: 'Nome Completo', required: true, options: [], order: 1 },
      { type: 'label', label: 'E-mail para Contacto', required: true, options: [], order: 2 },
      { type: 'dropdown', label: 'Assunto Principal', required: false, options: ['Suporte Técnico', 'Sugestão', 'Comercial'], order: 3 }
    ]
  },
  {
    name: 'Inquérito de Satisfação',
    description: 'Avalie a experiência do utilizador e obtenha feedback direto sobre os seus serviços ou produtos.',
    categoria: 'Geral',
    complexidade: 'Simples',
    fields: [
      { type: 'radio', label: 'Como classifica a qualidade do nosso atendimento?', required: true, options: ['Excelente', 'Bom', 'Satisfatório', 'Fraco'], order: 1 },
      { type: 'checkbox', label: 'Recomendaria a nossa plataforma a outras pessoas?', required: false, options: [], order: 2 }
    ]
  },
  {
    name: 'Inscrição de Aluno e Matrícula',
    description: 'Formulário extenso para recolha de dados biográficos, encarregados de educação e opções curriculares.',
    categoria: 'Educação',
    complexidade: 'Extenso',
    fields: [
      { type: 'label', label: 'Nome Completo do Aluno', required: true, options: [], order: 1 },
      { type: 'label', label: 'Data de Nascimento', required: true, options: [], order: 2 },
      { type: 'dropdown', label: 'Ano de Escolaridade a Matricular', required: true, options: ['1º Ano', '2º Ano', '3º Ano', '4º Ano'], order: 3 },
      { type: 'label', label: 'Nome do Encarregado de Educação', required: true, options: [], order: 4 },
      { type: 'checkbox', label: 'Necessita de Transporte Escolar Municipal?', required: false, options: [], order: 5 }
    ]
  },
  {
    name: 'Ficha de Triagem Clínica',
    description: 'Recolha inicial de sintomas, antecedentes médicos e sinais vitais para triagem em ambiente de saúde.',
    categoria: 'Saúde',
    complexidade: 'Extenso',
    fields: [
      { type: 'label', label: 'Número de Utente do SNS', required: true, options: [], order: 1 },
      { type: 'dropdown', label: 'Sintoma Principal Apresentado', required: true, options: ['Dor de Cabeça Forte', 'Sintomas Respiratórios', 'Dor Abdominal', 'Traumatismo / Queda'], order: 2 },
      { type: 'radio', label: 'Apresenta febre medida superior a 38°C?', required: true, options: ['Sim', 'Não'], order: 3 },
      { type: 'checkbox', label: 'Possui alergias conhecidas a medicamentos?', required: false, options: [], order: 4 }
    ]
  },
  {
    name: 'Admissão e Registo de Utente',
    description: 'Processo completo de registo de novos residentes, contactos de emergência e rotinas diárias de apoio.',
    categoria: 'Lares',
    complexidade: 'Extenso',
    fields: [
      { type: 'label', label: 'Nome do Residente Utente', required: true, options: [], order: 1 },
      { type: 'label', label: 'Contacto Direto de Emergência Familiar', required: true, options: [], order: 2 },
      { type: 'dropdown', label: 'Grau de Autonomia Estimado', required: true, options: ['Totalmente Autónomo', 'Dependência Ligeira', 'Dependência Reduzida / Cadeira de Rodas', 'Dependência Total Bedridden'], order: 3 },
      { type: 'checkbox', label: 'Requer Acompanhamento na Toma de Medicação Diária?', required: false, options: [], order: 4 }
    ]
  },
  {
    name: 'Participação Geral de Ocorrência',
    description: 'Registo formal de incidentes, identificação de testemunhas e detalhe cronológico para forças de segurança.',
    categoria: 'Polícia',
    complexidade: 'Extenso',
    fields: [
      { type: 'label', label: 'Data e Hora Exata do Incidente', required: true, options: [], order: 1 },
      { type: 'label', label: 'Localização ou Morada da Ocorrência', required: true, options: [], order: 2 },
      { type: 'dropdown', label: 'Tipologia de Incidente', required: true, options: ['Furto / Roubo', 'Danos Materiais', 'Poluição / Ruído', 'Outros'], order: 3 },
      { type: 'checkbox', label: 'Existem testemunhas identificadas no local?', required: false, options: [], order: 4 }
    ]
  },
  {
    name: 'Relatório de Socorro e Emergência',
    description: 'Ficha rápida de controlo operacional para saída de viaturas e registo sumário de intervenções.',
    categoria: 'Bombeiros',
    complexidade: 'Simples',
    fields: [
      { type: 'label', label: 'Número de Matrícula Operacional (Viatura)', required: true, options: [], order: 1 },
      { type: 'dropdown', label: 'Natureza da Saída de Emergência', required: true, options: ['Incêndio Urbano', 'Incêndio Florestal', 'Acidente Rodoviário', 'Inundação / Intempérie'], order: 2 },
      { type: 'radio', label: 'Foi necessário o transporte de vítimas para unidade hospitalar?', required: true, options: ['Sim', 'Não'], order: 3 }
    ]
  },
  {
    name: 'Avaliação Trimestral de Desempenho',
    description: 'Métrica corporativa para autoavaliação de equipas, cumprimento de objetivos e definição de metas futuras.',
    categoria: 'Empresas',
    complexidade: 'Extenso',
    fields: [
      { type: 'dropdown', label: 'Departamento / Setor de Trabalho', required: true, options: ['Desenvolvimento', 'Marketing', 'Vendas', 'Recursos Humanos'], order: 1 },
      { type: 'radio', label: 'Nível de cumprimento dos objetivos traçados para este trimestre', required: true, options: ['Superou as metas', 'Cumpriu a 100%', 'Cumpriu parcialmente', 'Não atingiu'], order: 2 },
      { type: 'checkbox', label: 'Identifica necessidade de formação técnica específica para o próximo trimestre?', required: false, options: [], order: 3 }
    ]
  }
];

const HomePage = ({ onCreateNew, onSelectDraft, onFillForm, authUser }) => {
  const [drafts, setDrafts] = useState([]);
  const [publishedForms, setPublishedForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados adicionados de forma aditiva para os controlos de filtros de abas e complexidade
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [complexidadeAtiva, setComplexidadeAtiva] = useState('Todos');

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

        const published = allTemplates.filter(
          (template) => template.status === 'published'
        );

        setDrafts(draftTemplates);
        setPublishedForms(published);
      } catch (err) {
        console.error('Erro ao buscar rascunhos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, []);

  const handleCriarAPartirDeModelo = async (modelo) => {
    try {
      setLoading(true);
      
      const camposComIdsNovos = modelo.fields.map(field => ({
        ...field,
        id: crypto.randomUUID()
      }));

      const payload = {
        name: modelo.name,
        description: modelo.description,
        fields: camposComIdsNovos,
        status: 'draft'
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

  // Filtragem dinâmica dos presets baseada nos botões e abas clicados
  const modelosFiltrados = MODELOS_PREDEFINIDOS.filter(modelo => {
    const bateCategoria = categoriaAtiva === 'Todos' || modelo.categoria === categoriaAtiva;
    const bateComplexidade = complexidadeAtiva === 'Todos' || modelo.complexidade === complexidadeAtiva;
    return bateCategoria && bateComplexidade;
  });

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

      <section id="editor" className="scroll-mt-24 text-center mb-12">
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
      </section>

      {/* ====================================================== */}
      {/* GRID DE MODELOS BASE COM FILTROS AVANÇADOS */}
      {/* ====================================================== */}
      <section id="templates" className="scroll-mt-24 max-w-7xl mx-auto mb-12">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Modelos Pré-definidos
            </h2>
            <p className="text-gray-600 text-sm">
              Selecione um modelo pronto para criar um FormTemplate editável imediatamente
            </p>
          </div>
          
          {/* FILTRO DE COMPLEXIDADE (SIMPLES / EXTENSO) */}
          <div className="flex bg-gray-200 p-1 rounded-xl items-center self-start md:self-auto">
            {['Todos', 'Simples', 'Extenso'].map((comp) => (
              <button
                key={comp}
                onClick={() => setComplexidadeAtiva(comp)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  complexidadeAtiva === comp 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>

        {/* NAVEGAÇÃO POR ABAS PARA AS ÁREAS CONTEXTUAIS SOLICITADAS */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {['Todos', 'Geral', 'Educação', 'Saúde', 'Lares', 'Polícia', 'Bombeiros', 'Empresas'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                categoriaAtiva === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* LISTAGEM DINÂMICA FILTRADA */}
        {modelosFiltrados.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm shadow-sm">
            Nenhum modelo disponível para os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modelosFiltrados.map((modelo, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-indigo-300 transition-all relative overflow-hidden"
              >
                {/* Badges superiores indicadores de Categoria e Complexidade */}
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-md">
                    {modelo.complexidade}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md">
                    {modelo.categoria}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-bold text-sm">📋</span>
                    <h3 className="font-bold text-gray-800 text-lg pr-20 truncate">{modelo.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{modelo.description}</p>
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
        )}
      </section>

      {/* ====================================================== */}
      {/* SECÇÃO DOS RASCUNHOS ATUAIS */}
      {/* ====================================================== */}
      <section id="drafts" className="scroll-mt-24 max-w-7xl mx-auto">
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
      </section>

      {/* ====================================================== */}
      {/* GRID DE FORMULÁRIOS PUBLICADOS (MANTIDO INTACTO) */}
      {/* ====================================================== */}
      <section id="published" className="scroll-mt-24 max-w-7xl mx-auto mt-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Formulários Publicados
          </h2>
          <p className="text-gray-600 text-sm">
            Formulários prontos para preenchimento
          </p>
        </div>

        {!loading && !error && publishedForms.length === 0 && (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-500">Nenhum formulário publicado</p>
            <p className="text-gray-400 text-sm mt-1">
              Publique um formulário no editor para que apareça aqui
            </p>
          </div>
        )}

        {!loading && !error && publishedForms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden flex flex-col"
              >
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 truncate text-lg">
                      {form.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Publicado
                    </span>
                  </div>
                </div>

                <div className="flex-1 px-6 py-4">
                  {form.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {form.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Campos:</span>
                      <span className="font-semibold text-gray-700">
                        {form.fields?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Publicado em:</span>
                      <span className="font-semibold text-gray-700">
                        {formatDate(form.updated_at || form.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => onFillForm(form.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm text-center"
                  >
                    Preencher
                  </button>
                  <button
                    onClick={() => onSelectDraft(form.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition font-semibold text-sm"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;