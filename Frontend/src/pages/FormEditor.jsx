import React, { useState } from 'react';
import { FormLabel, FormRadioGroup, FormCheckbox } from '../components/DynamicElements';

// Constante para garantir consistência nos tipos de dados
const FIELD_TYPES = {
  LABEL: 'label',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
};

const FormEditor = () => {
  // O estado 'fields' será a nossa "Single Source of Truth" para o formulário
  const [fields, setFields] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // Função para renderizar o componente correto
  const renderField = (field) => {
    switch (field.type) {
      case FIELD_TYPES.LABEL:
        return <FormLabel value={field.label} />;
      case FIELD_TYPES.RADIO:
        return <FormRadioGroup label={field.label} options={field.options} required={field.required} />;
      case FIELD_TYPES.CHECKBOX:
        return <FormCheckbox label={field.label} description={field.label} required={field.required} />;
      default:
        return null;
    }
  };

  const deleteField = (id) => {
    setFields(prevFields => prevFields.filter(field => field.id !== id));
  };

  const startEditing = (field) => {
    setEditingId(field.id);
    setEditData({ ...field });
  };

  const saveField = (id) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === id ? editData : field
      )
    );
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  const addOption = () => {
    setEditData(prev => ({
      ...prev,
      options: [...(prev.options || []), `Opção ${(prev.options?.length || 0) + 1}`]
    }));
  };

  const removeOption = (index) => {
    setEditData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index, value) => {
    setEditData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };


  // Função para adicionar um novo campo com estrutura robusta
  const addField = (type) => {
    const newField = {
      // Usamos crypto.randomUUID() para IDs únicos e seguros (padrão moderno)
      id: crypto.randomUUID(), 
      type: type,
      label: `Novo campo de ${type}`,
      required: false, // UC15: Preparado para a tarefa de obrigatoriedade
      options: type === FIELD_TYPES.RADIO ? ['Opção 1'] : [], // Lógica específica para Radios
      order: fields.length + 1, // UC03: Mantém a ordem de inserção
    };

    // Atualização de estado imutável (best practice em React)
    setFields(prevFields => [...prevFields, newField]);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editor de Formulário Dinâmico</h1>
      
      {/* Botões para adicionar componentes */}
      <div className="mb-8 flex gap-3 flex-wrap">
        <button
          onClick={() => addField(FIELD_TYPES.LABEL)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          + Adicionar Label
        </button>
        <button
          onClick={() => addField(FIELD_TYPES.RADIO)}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
        >
          + Adicionar Radio
        </button>
        <button
          onClick={() => addField(FIELD_TYPES.CHECKBOX)}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
        >
          + Adicionar Checkbox
        </button>
      </div>
      
      {/* Zona de renderização (vazia por enquanto) */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 mb-8 min-h-[100px]">
        {fields.length === 0 && (
          <p className="text-gray-400 text-center">Selecione um componente para começar.</p>
        )}
        {fields.length > 0 && (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="p-4 bg-white border border-gray-300 rounded-lg">
                {editingId === field.id ? (
                  // Modo de edição
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Label:</label>
                      <input
                        type="text"
                        value={editData.label}
                        onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Toggle Obrigatório */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={editData.required || false}
                        onChange={(e) => setEditData({ ...editData, required: e.target.checked })}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor={`required-${field.id}`} className="text-sm font-semibold text-gray-700 cursor-pointer">
                        Marcar como obrigatório
                      </label>
                      {editData.required && <span className="ml-auto text-red-600 font-bold text-lg">*</span>}
                    </div>

                    {editData.type === FIELD_TYPES.RADIO && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Opções:</label>
                        <div className="space-y-2 mb-3">
                          {editData.options?.map((opt, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                              <button
                                onClick={() => removeOption(index)}
                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                              >
                                Remover
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={addOption}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
                        >
                          + Adicionar Opção
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => saveField(field.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                      >
                        ✓ Guardar
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-semibold"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo de visualização
                  <>
                    <div className="mb-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase">Tipo: {field.type}</span>
                        {field.required && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
                            <span className="text-lg">*</span> Obrigatório
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(field)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                          ✎ Editar
                        </button>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold"
                        >
                          ✕ Remover
                        </button>
                      </div>
                    </div>
                    {renderField(field)}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormEditor;