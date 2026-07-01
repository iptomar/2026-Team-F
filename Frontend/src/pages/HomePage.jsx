import React, { useState, useEffect } from 'react';
import '../App.css';

const HomePage = ({ onCreateNew, onSelectDraft, onFillForm, authUser }) => {
  const [drafts, setDrafts] = useState([]);
  const [publishedForms, setPublishedForms] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [complexidadeAtiva, setComplexidadeAtiva] = useState('Todos');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [templatesRes, presetsRes] = await Promise.all([
          fetch('http://localhost:3000/form-templates'),
          fetch('http://localhost:3000/presets'),
        ]);

        if (!templatesRes.ok) throw new Error(`Erro ao buscar templates: ${templatesRes.statusText}`);
        if (!presetsRes.ok) throw new Error(`Erro ao buscar presets: ${presetsRes.statusText}`);

        const allTemplates = await templatesRes.json();
        const allPresets = await presetsRes.json();

        setDrafts(allTemplates.filter(t => t.status === 'draft'));
        setPublishedForms(allTemplates.filter(t => t.status === 'published'));
        setPresets(allPresets);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCriarAPartirDeModelo = async (preset) => {
    try {
      setLoading(true);

      // Incrementar contador no backend
      await fetch(`http://localhost:3000/presets/${preset.id}/use`, { method: 'POST' });

      // Atualizar contador localmente
      setPresets(prev =>
        prev.map(p => p.id === preset.id ? { ...p, use_count: p.use_count + 1 } : p)
      );

      // Criar novo FormTemplate a partir do preset
      const camposComIds = preset.fields.map(field => ({
        ...field,
        id: crypto.randomUUID()
      }));

      const payload = {
        name: preset.name,
        description: preset.description,
        fields: camposComIds,
        status: 'draft'
      };

      const response = await fetch('http://localhost:3000/form-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Erro ao clonar o modelo: ${response.statusText}`);

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
        const response = await fetch(`http://localhost:3000/form-templates/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Erro ao apagar template: ${response.statusText}`);
        setDrafts(prev => prev.filter(d => d.id !== id));
      } catch (err) {
        alert(`Erro ao apagar rascunho: ${err.message}`);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateString));
  };

  const categorias = ['Todos', ...new Set(presets.map(p => p.categoria))];

  const presetsFiltrados = presets.filter(p => {
    const bateCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
    const bateComplexidade = complexidadeAtiva === 'Todos' || p.complexidade === complexidadeAtiva;
    return bateCategoria && bateComplexidade;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex flex-col gap-2">
          <p className="text-sm text-indigo-600 font-semibold">Área autenticada</p>
          <h2 className="text-2xl font-bold text-gray-800">
            Olá{authUser?.name ? `, ${authUser.name}` : ''}.
          </h2>
          <p className="text-gray-500">
            A partir desta página pode criar novos formulários ou continuar rascunhos guardados anteriormente.
          </p>
        </div>
      </div>

      <section id="editor" className="scroll-mt-24 text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-3">Editor de Formulários</h1>
        <p className="text-lg text-gray-600 mb-8">Cria formulários profissionais em segundos</p>
        <button
          onClick={onCreateNew}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg font-semibold"
        >
          + Criar Novo Formulário
        </button>
      </section>

      {/* MODELOS PRÉ-DEFINIDOS */}
      <section id="templates" className="scroll-mt-24 max-w-7xl mx-auto mb-12">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Modelos Pré-definidos</h2>
            <p className="text-gray-600 text-sm">
              Selecione um modelo pronto para criar um FormTemplate editável imediatamente
            </p>
          </div>
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

        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
          {categorias.map((cat) => (
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

        {presetsFiltrados.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm shadow-sm">
            Nenhum modelo disponível para os filtros selecionados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {presetsFiltrados.map((preset) => (
              <div
                key={preset.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:border-indigo-300 transition-all relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 flex gap-1.5">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-md">
                    {preset.complexidade}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md">
                    {preset.categoria}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600 font-bold text-sm">📋</span>
                    <h3 className="font-bold text-gray-800 text-lg pr-20 truncate">{preset.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{preset.description}</p>
                  <div className="text-xs text-gray-400 mb-3">
                    Elementos incluídos:{' '}
                    <span className="font-semibold text-gray-500">
                      {preset.fields.map(f => f.type).join(', ')}
                    </span>
                  </div>

                  {/* CONTADOR DE UTILIZAÇÕES */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="text-xs text-gray-400">Utilizado</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      preset.use_count > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {preset.use_count} {preset.use_count === 1 ? 'vez' : 'vezes'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleCriarAPartirDeModelo(preset)}
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

      {/* RASCUNHOS */}
      <section id="drafts" className="scroll-mt-24 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Os Meus Rascunhos</h2>
          <p className="text-gray-600 text-sm">Formulários salvos que pode continuar a editar</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 inline-block"></div>
            <p className="text-gray-600 mt-4">A carregar...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {!loading && !error && drafts.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-500">Nenhum rascunho pendente</p>
            <p className="text-gray-400 text-sm mt-1">Comece criando um novo formulário</p>
          </div>
        )}

        {!loading && !error && drafts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 truncate text-lg">{draft.name}</h3>
                </div>
                <div className="flex-1 px-6 py-4">
                  {draft.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{draft.description}</p>
                  )}
                  <div className="flex flex-col gap-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Campos:</span>
                      <span className="font-semibold text-gray-700">{draft.fields?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Criado:</span>
                      <span className="font-semibold text-gray-700">{formatDate(draft.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => onSelectDraft(draft.id)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-sm"
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

      {/* FORMULÁRIOS PUBLICADOS */}
      <section id="published" className="scroll-mt-24 max-w-7xl mx-auto mt-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Formulários Publicados</h2>
          <p className="text-gray-600 text-sm">Formulários prontos para preenchimento</p>
        </div>

        {!loading && !error && publishedForms.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <p className="text-gray-500">Nenhum formulário publicado</p>
            <p className="text-gray-400 text-sm mt-1">Publique um formulário no editor para que apareça aqui</p>
          </div>
        )}

        {!loading && !error && publishedForms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedForms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200 overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 truncate text-lg">{form.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Publicado
                    </span>
                  </div>
                </div>
                <div className="flex-1 px-6 py-4">
                  {form.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{form.description}</p>
                  )}
                  <div className="flex flex-col gap-2 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Campos:</span>
                      <span className="font-semibold text-gray-700">{form.fields?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Publicado em:</span>
                      <span className="font-semibold text-gray-700">{formatDate(form.updated_at || form.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => onFillForm(form.id)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
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
