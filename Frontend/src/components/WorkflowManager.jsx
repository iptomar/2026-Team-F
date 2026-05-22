import React, { useState } from 'react';

export default function WorkflowManager() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [states, setStates] = useState([
    { id: 'submetido', name: 'Submetido', order: 1, is_initial: true, is_final: false },
  ]);
  const [newStateName, setNewStateName] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const adicionarEstado = () => {
    if (!newStateName.trim()) return;
    
    const idGerado = newStateName.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (states.some(s => s.id === idGerado)) {
      setErro('Já existe um estado com um nome semelhante.');
      return;
    }

    setStates([
      ...states,
      {
        id: idGerado,
        name: newStateName.trim(),
        order: states.length + 1,
        is_initial: false,
        is_final: false
      }
    ]);
    setNewStateName('');
    setErro('');
  };

  const removerEstado = (idParaRemover) => {
    const filtrados = states.filter(s => s.id !== idParaRemover);
    const reordenados = filtrados.map((s, index) => ({ ...s, order: index + 1 }));
    setStates(reordenados);
  };

  const alternarPropriedade = (id, propriedade) => {
    setStates(states.map(s => {
      if (s.id === id) {
        return { ...s, [propriedade]: !s[propriedade] };
      }
      if (propriedade === 'is_initial') {
        return { ...s, is_initial: false };
      }
      return s;
    }));
  };

  const guardarWorkflow = async (e) => {
    e.preventDefault();
    setSucesso('');
    setErro('');

    try {
      // ROTA CORRIGIDA DE ACORDO COM O TEU INDEX.TS (Sem /api)
      const resposta = await fetch('http://localhost:3000/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, states })
      });

      const resultado = await resposta.json();

      if (resposta.status === 201) {
        setSucesso(`Workflow "${resultado.name}" criado com sucesso!`);
        setName('');
        setDescription('');
        setStates([{ id: 'submetido', name: 'Submetido', order: 1, is_initial: true, is_final: false }]);
      } else {
        setErro(resultado.error || 'Erro ao guardar o workflow.');
      }
    } catch (err) {
      setErro('Não foi possível conectar ao servidor backend.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm mt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-2">⚙️ Configurar Workflow Customizado</h2>
      <p className="text-sm text-gray-500 mb-6">Tarefa #13: Definição de estados parametrizáveis para controlo do fluxo.</p>

      {sucesso && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">{sucesso}</div>}
      {erro && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">{erro}</div>}

      <form onSubmit={guardarWorkflow} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Nome do Workflow</label>
            <input 
              type="text" required className="w-full p-2 border border-gray-300 rounded bg-white text-black text-sm shadow-sm"
              placeholder="Ex: Validação de Despesas de Viagem" value={name} onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Descrição</label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded bg-white text-black text-sm h-20 shadow-sm"
              placeholder="Indica para que serve este fluxo..." value={description} onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Adicionar Novo Estado</label>
          <div className="flex gap-2">
            <input 
              type="text" className="flex-grow p-2 border border-gray-300 rounded bg-white text-black text-sm shadow-sm"
              placeholder="Ex: Em Revisão Financeira" value={newStateName} onChange={e => setNewStateName(e.target.value)}
            />
            <button 
              type="button" onClick={adicionarEstado}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors shadow-sm"
            >
              + Adicionar Etapa
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Estados Parametrizados ({states.length})</label>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 bg-gray-50 overflow-hidden">
            {states.map((state) => (
              <div key={state.id} className="flex items-center justify-between p-3 bg-white text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full font-mono text-xs font-bold text-gray-600">
                    {state.order}
                  </span>
                  <span className="font-medium text-gray-800">{state.name}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={state.is_initial || false} onChange={() => alternarPropriedade(state.id, 'is_initial')} />
                    Inicial
                  </label>
                  <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={state.is_final || false} onChange={() => alternarPropriedade(state.id, 'is_final')} />
                    Final
                  </label>
                  <button 
                    type="button" onClick={() => removerEstado(state.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium pl-2"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button 
            type="submit"
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm shadow-md transition-colors"
          >
            Guardar Configuração de Workflow
          </button>
        </div>
      </form>
    </div>
  );
}