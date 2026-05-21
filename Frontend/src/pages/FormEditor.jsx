// ======================================================
// FRONTEND/src/pages/FormEditor.jsx
// Página principal do editor de formulários
// ======================================================

import React, { useState, useEffect } from 'react';

// ======================================================
// COMPONENTES DINÂMICOS
// ======================================================
import {
  FormLabel,
  FormRadioGroup,
  FormCheckbox,
  FormDropdown
} from '../components/DynamicElements';

// ======================================================
// COMPONENTES DO SISTEMA
// ======================================================
import PreviewModal from '../components/PreviewModal';
import Toolbar from "../components/Toolbar";
import FieldCard from "../components/FieldCard";
import Sidebar from "../components/Sidebar";


// ======================================================
// TIPOS DE CAMPOS DISPONÍVEIS
// ======================================================
const FIELD_TYPES = {
  LABEL: 'label',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  DROPDOWN: 'dropdown', 
};

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================
const FormEditor = ({ formId }) => {

  // ======================================================
  // ESTADOS
  // ======================================================

  // ID do formulário sendo editado (pode ser null para novo)
  const [currentFormId, setCurrentFormId] = useState(formId || null);

  // Nome do formulário
  const [formName, setFormName] = useState('Meu Formulário');

  // Descrição do formulário
  const [formDescription, setFormDescription] = useState('');

  // Lista de campos do formulário
  const [fields, setFields] = useState([]);

  // Campo atualmente em edição
  const [editingId, setEditingId] = useState(null);

  // Dados temporários da edição
  const [editData, setEditData] = useState({});

  // Estado da janela Preview
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Estado de carregamento
  const [isLoading, setIsLoading] = useState(false);

  // ======================================================
  // CARREGAR FORMULÁRIO EXISTENTE
  // ======================================================
  useEffect(() => {
    if (formId) {
      const loadFormData = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`http://localhost:3000/form-templates/${formId}`);

          if (!response.ok) {
            throw new Error(`Erro ao carregar formulário: ${response.statusText}`);
          }

          const formData = await response.json();
          setCurrentFormId(formData.id);
          setFormName(formData.name);
          setFormDescription(formData.description || '');
          
          // Garante que os campos vindos do banco respeitam a ordenação guardada
          const camposOrdenados = formData.fields || [];
          camposOrdenados.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFields(camposOrdenados);
        } catch (error) {
          console.error('Erro ao carregar formulário:', error);
          alert(`Erro ao carregar rascunho: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };

      loadFormData();
    }
  }, [formId]);

  // ======================================================
  // REORDENAR CAMPO (HISTÓRIA #10)
  // ======================================================
  const moverCampo = async (index, direcao) => {
    const novosCampos = [...fields];
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1;

    // Impede movimentos fora do limite do array
    if (novoIndex < 0 || novoIndex >= novosCampos.length) return;

    // Troca os elementos de posição
    const temp = novosCampos[index];
    novosCampos[index] = novosCampos[novoIndex];
    novosCampos[novoIndex] = temp;

    // Reatribui o valor correto de 'order' baseado na nova sequência do array
    const camposMapeados = novosCampos.map((campo, idx) => ({
      ...campo,
      order: idx + 1,
    }));

    // Atualiza o estado na Interface imediatamente
    setFields(camposMapeados);

    // Se o formulário já existir na BD, sincroniza a nova ordem automaticamente
    if (currentFormId) {
      try {
        const payload = {
          name: formName,
          description: formDescription,
          fields: camposMapeados
        };

        await fetch(`http://localhost:3000/form-templates/${currentFormId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error('Erro ao sincronizar ordenação com o servidor:', error);
      }
    }
  };

  // ======================================================
  // REMOVER CAMPO
  // ======================================================
  const deleteField = (id) => {
    setFields(prevFields => {
      const filtrados = prevFields.filter(field => field.id !== id);
      // Reajusta a ordem consecutiva após a remoção
      return filtrados.map((field, idx) => ({ ...field, order: idx + 1 }));
    });
  };


  // ======================================================
  // INICIAR EDIÇÃO
  // ======================================================
  const startEditing = (field) => {

    setEditingId(field.id);

    setEditData({
      ...field
    });

  };


  // ======================================================
  // GUARDAR ALTERAÇÕES
  // ======================================================
  const saveField = (id) => {

    setFields(prevFields =>

      prevFields.map(field =>

        field.id === id
          ? editData
          : field

      )

    );

    setEditingId(null);

  };


  // ======================================================
  // CANCELAR EDIÇÃO
  // ======================================================
  const cancelEditing = () => {

    setEditingId(null);

    setEditData({});

  };


  // ======================================================
  // ADICIONAR OPÇÃO RADIO
  // ======================================================
  const addOption = () => {

    setEditData(prev => ({

      ...prev,

      options: [

        ...(prev.options || []),

        `Opção ${(prev.options?.length || 0) + 1}`

      ]

    }));

  };


  // ======================================================
  // REMOVER OPÇÃO RADIO
  // ======================================================
  const removeOption = (index) => {

    setEditData(prev => ({

      ...prev,

      options: prev.options.filter((_, i) => i !== index)

    }));

  };


  // ======================================================
  // ATUALIZAR OPÇÃO RADIO
  // ======================================================
  const updateOption = (index, value) => {

    setEditData(prev => ({

      ...prev,

      options: prev.options.map((opt, i) =>

        i === index
          ? value
          : opt

      )

    }));

  };


  // ======================================================
  // ADICIONAR NOVO CAMPO
  // ======================================================
  const renderField = (field) => {
    switch (field.type) {
      case FIELD_TYPES.LABEL:
        return <FormLabel value={field.label} />;
      case FIELD_TYPES.RADIO:
        return <FormRadioGroup label={field.label} options={field.options} required={field.required} />;
      case FIELD_TYPES.CHECKBOX:
        return <FormCheckbox label={field.label} description={field.label} required={field.required} />;
      case FIELD_TYPES.DROPDOWN: 
        return <FormDropdown label={field.label} options={field.options} required={field.required} />;
      default:
        return null;
    }
  };

  const addField = (type) => {
    const newField = {
      id: crypto.randomUUID(), 
      type: type,
      label: `Novo campo de ${type}`,
      required: false, 
      options: (type === FIELD_TYPES.RADIO || type === FIELD_TYPES.DROPDOWN) ? ['Opção 1'] : [], 
      order: fields.length + 1, 
    };
    setFields(prevFields => [...prevFields, newField]);
  };


  // ======================================================
  // SALVAR FORMULÁRIO NO BANCO DE DADOS
  // ======================================================
  const saveFormToDatabase = async (status) => {
    try {
      const payload = {
        name: formName,
        description: formDescription,
        fields: fields,
        status: status
      };

      let response;
      let method = 'POST';
      let endpoint = 'http://localhost:3000/form-templates';

      if (currentFormId) {
        method = 'PATCH';
        endpoint = `http://localhost:3000/form-templates/${currentFormId}`;
      }

      response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!currentFormId) {
        setCurrentFormId(data.id);
      }

      alert(`Formulário ${status === 'draft' ? 'salvo como rascunho' : 'publicado'} com sucesso!`);
      console.log('Resposta do servidor:', data);
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      alert(`Erro ao salvar: ${error.message}`);
    }
  };


  // ======================================================
  // GUARDAR RASCUNHO
  // ======================================================
  const handleSaveDraft = () => {
    saveFormToDatabase('draft');
  };


  // ======================================================
  // SUBMETER FORMULÁRIO
  // ======================================================
  const handleSubmit = () => {
    saveFormToDatabase('published');
  };


  // ======================================================
  // RENDER PRINCIPAL
  // ======================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600 mt-4">A carregar formulário...</p>
        </div>
      </div>
    );
  }

  return (

  <div className="flex bg-gray-100 min-h-screen">

    {/* SIDEBAR */}
    <Sidebar
      addField={addField}
      FIELD_TYPES={FIELD_TYPES}
    />

    {/* CONTEÚDO */}
    <div className="flex-1 p-10">

      {/* TÍTULO */}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Editor de Formulário
      </h1>

      {/* CAMPO NOME DO FORMULÁRIO */}
      <input
        type="text"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        placeholder="Nome do formulário"
        className="mb-4 px-4 py-2 w-full max-w-2xl border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* CAMPO DESCRIÇÃO */}
      <textarea
        value={formDescription}
        onChange={(e) => setFormDescription(e.target.value)}
        placeholder="Descrição do formulário (opcional)"
        className="mb-6 px-4 py-2 w-full max-w-2xl border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        rows="2"
      />

      {/* TOOLBAR */}
      <Toolbar
        addField={addField}
        FIELD_TYPES={FIELD_TYPES}
        mockMode={isPreviewOpen}
        setMockMode={setIsPreviewOpen}
        handleSubmit={handleSubmit}
        handleSaveDraft={handleSaveDraft}
      />

      {/* CANVAS */}
      <div className="border-2 border-dashed border-gray-300 bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">

        {fields.length === 0 ? (

          <p className="text-gray-400 text-center mt-10">
            Adicione componentes usando a Sidebar.
          </p>

        ) : (

          <div className="space-y-4">

            {fields.map((field, index) => (

              <FieldCard
                key={field.id}
                field={field}
                index={index}
                totalFields={fields.length}
                moverCampo={moverCampo}

                editingId={editingId}
                editData={editData}
                setEditData={setEditData}

                saveField={saveField}
                cancelEditing={cancelEditing}

                startEditing={startEditing}
                deleteField={deleteField}

                FIELD_TYPES={FIELD_TYPES}

                updateOption={updateOption}
                removeOption={removeOption}
                addOption={addOption}

                renderField={renderField}
              />

            ))}

          </div>

        )}

      </div>

      {/* PREVIEW */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        schema={fields}
      />

    </div>

  </div>

);
};

export default FormEditor;