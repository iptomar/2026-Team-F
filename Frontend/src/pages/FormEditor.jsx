// Frontend/src/pages/FormEditor.jsx
import React, { useState } from 'react';
import { FormLabel, FormRadioGroup, FormCheckbox } from '../components/DynamicElements';
import PreviewModal from '../components/PreviewModal';

// NOTA: Se o teu colega criou o FormEditorHeader e o quiseres usar, 
// podes descomentar a linha abaixo e usá-lo dentro do return!
// import FormEditorHeader from '../components/FormEditorHeader';

const FIELD_TYPES = {
  LABEL: 'label',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
};

const FormEditor = () => {
  const [fields, setFields] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    setFields(prevFields => prevFields.map(field => field.id === id ? editData : field));
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
    setEditData(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
  };

  const updateOption = (index, value) => {
    setEditData(prev => ({ ...prev, options: prev.options.map((opt, i) => i === index ? value : opt) }));
  };

  const addField = (type) => {
    const newField = {
      id: crypto.randomUUID(), 
      type: type,
      label: `Novo campo de ${type}`,
      required: false, 
      options: type === FIELD_TYPES.RADIO ? ['Opção 1'] : [],
      order: fields.length + 1, 
    };
    setFields(prevFields => [...prevFields, newField]);
  };
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      
      {/* Cabeçalho e Botão de Preview */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editor de Formulário Dinâmico</h1>
        <button 
          onClick={() => setIsPreviewOpen(true)}
          className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          👁️ Pré-visualizar
        </button>
      </div>
      
      {/* Botões de Adicionar */}
      <div className="mb-8 flex gap-3 flex-wrap">
        <button onClick={() => addField(FIELD_TYPES.LABEL)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold">+ Label</button>
        <button onClick={() => addField(FIELD_TYPES.RADIO)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold">+ Radio</button>
        <button onClick={() => addField(FIELD_TYPES.CHECKBOX)} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold">+ Checkbox</button>
      </div>
      
      {/* Zona de Renderização Única (Sem código repetido!) */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 mb-8 min-h-[100px]">
        {fields.length === 0 ? (
          <p className="text-gray-400 text-center">Selecione um componente para começar.</p>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="p-4 bg-white border border-gray-300 rounded-lg">
                {editingId === field.id ? (
                  // --- MODO DE EDIÇÃO ---
                  <div className="space-y-4">
                    <input type="text" value={editData.label} onChange={(e) => setEditData({ ...editData, label: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input type="checkbox" checked={editData.required || false} onChange={(e) => setEditData({ ...editData, required: e.target.checked })} className="w-5 h-5 cursor-pointer" />
                      <label className="text-sm font-semibold text-gray-700">Obrigatório</label>
                    </div>

                    {editData.type === FIELD_TYPES.RADIO && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Opções:</label>
                        <div className="space-y-2 mb-3">
                          {editData.options?.map((opt, index) => (
                            <div key={index} className="flex gap-2">
                              <input type="text" value={opt} onChange={(e) => updateOption(index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                              <button onClick={() => removeOption(index)} className="px-3 py-2 bg-red-500 text-white rounded-lg">Remover</button>
                            </div>
                          ))}
                        </div>
                        <button onClick={addOption} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">+ Adicionar Opção</button>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button onClick={() => saveField(field.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Guardar</button>
                      <button onClick={cancelEditing} className="px-4 py-2 bg-gray-400 text-white rounded-lg font-semibold">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  // --- MODO DE VISUALIZAÇÃO ---
                  <>
                    <div className="mb-3 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase">{field.type} {field.required && <span className="text-red-500 text-lg">*</span>}</span>
                      <div className="flex gap-2">
                        <button onClick={() => startEditing(field)} className="text-blue-600 text-sm font-semibold">Editar</button>
                        <button onClick={() => deleteField(field.id)} className="text-red-600 text-sm font-semibold">Remover</button>
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

      {/* Janela de Preview Oculta no final */}
      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} schema={fields} />
      
    </div>
  );
};

export default FormEditor;