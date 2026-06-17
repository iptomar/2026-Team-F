import { useEffect, useState } from 'react';
import { Plus, Trash2, Workflow } from 'lucide-react';

const API_URL = 'http://localhost:3000';

function createStateId(name, index) {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || `estado_${index + 1}`;
}

function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [states, setStates] = useState([
    { name: 'Submetida', is_initial: true, is_final: false },
    { name: 'Em Progresso', is_initial: false, is_final: false },
    { name: 'Concluída', is_initial: false, is_final: true },
  ]);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadWorkflows = async () => {
    try {
      const response = await fetch(`${API_URL}/workflows`);
      const data = await response.json();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: `Erro ao carregar workflows: ${error.message}`,
      });
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const updateStateName = (index, value) => {
    setStates((previous) =>
      previous.map((state, stateIndex) =>
        stateIndex === index ? { ...state, name: value } : state
      )
    );
  };

  const addState = () => {
    setStates((previous) => [
      ...previous,
      { name: `Estado ${previous.length + 1}`, is_initial: false, is_final: false },
    ]);
  };

  const removeState = (index) => {
    if (states.length <= 1) {
      setFeedback({
        type: 'error',
        message: 'O workflow deve ter pelo menos um estado.',
      });
      return;
    }

    setStates((previous) => previous.filter((_, stateIndex) => stateIndex !== index));
  };

  const setInitialState = (index) => {
    setStates((previous) =>
      previous.map((state, stateIndex) => ({
        ...state,
        is_initial: stateIndex === index,
      }))
    );
  };

  const toggleFinalState = (index) => {
    setStates((previous) =>
      previous.map((state, stateIndex) =>
        stateIndex === index
          ? { ...state, is_final: !state.is_final }
          : state
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setFeedback({
        type: 'error',
        message: 'Indica o nome do workflow.',
      });
      return;
    }

    const normalizedStates = states.map((state, index) => ({
      id: createStateId(state.name, index),
      name: state.name.trim(),
      order: index + 1,
      is_initial: state.is_initial,
      is_final: state.is_final,
    }));

    if (normalizedStates.some((state) => !state.name)) {
      setFeedback({
        type: 'error',
        message: 'Todos os estados devem ter nome.',
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);

      const response = await fetch(`${API_URL}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          states: normalizedStates,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao criar workflow.');
      }

      setFeedback({
        type: 'success',
        message: 'Workflow criado com sucesso.',
      });

      setName('');
      setDescription('');
      setStates([
        { name: 'Submetida', is_initial: true, is_final: false },
        { name: 'Em Progresso', is_initial: false, is_final: false },
        { name: 'Concluída', is_initial: false, is_final: true },
      ]);

      await loadWorkflows();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
        <p className="text-sm font-bold text-indigo-600 mb-1">Workflows</p>
        <h1 className="text-3xl font-black text-slate-900">
          Gestão de Workflows
        </h1>
        <p className="text-slate-500 mt-2">
          Crie workflows parametrizáveis com nome, descrição e estados ordenados.
        </p>
      </div>

      {feedback && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-black text-slate-900 mb-5">
            Criar workflow
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nome do workflow
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Workflow de Aprovação"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows="3"
                placeholder="Descrição opcional"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <label className="block text-sm font-bold text-slate-700">
                  Estados do workflow
                </label>

                <button
                  type="button"
                  onClick={addState}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-sm font-bold hover:bg-indigo-100"
                >
                  <Plus size={15} />
                  Estado
                </button>
              </div>

              <div className="space-y-3">
                {states.map((state, index) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl p-3 bg-slate-50"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={state.name}
                        onChange={(event) =>
                          updateStateName(index, event.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        placeholder={`Estado ${index + 1}`}
                      />

                      <button
                        type="button"
                        onClick={() => removeState(index)}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        title="Remover estado"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="initialState"
                          checked={state.is_initial}
                          onChange={() => setInitialState(index)}
                        />
                        Inicial
                      </label>

                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={state.is_final}
                          onChange={() => toggleFinalState(index)}
                        />
                        Final
                      </label>

                      <span className="text-slate-400">
                        Ordem: {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'A criar...' : 'Criar Workflow'}
            </button>
          </form>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-black text-slate-900 mb-5">
            Workflows existentes
          </h2>

          {workflows.length === 0 ? (
            <p className="text-sm text-slate-500">
              Ainda não existem workflows criados.
            </p>
          ) : (
            <div className="space-y-3">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                >
                  <div className="flex items-start gap-3">
                    <span className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                      <Workflow size={19} />
                    </span>

                    <div className="flex-1">
                      <h3 className="font-black text-slate-900">
                        {workflow.name}
                      </h3>

                      {workflow.description && (
                        <p className="text-sm text-slate-500 mt-1">
                          {workflow.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {(workflow.states || []).map((state) => (
                          <span
                            key={state.id}
                            className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600"
                          >
                            {state.order}. {state.name}
                            {state.is_initial ? ' · Inicial' : ''}
                            {state.is_final ? ' · Final' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default WorkflowsPage;