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
const FormEditor = ({ formId, onGoHome }) => {

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
  // REORDENAR POR DRAG & DROP (HISTÓRIA #17) - ADICIONADO ADITIVAMENTE
  // ======================================================
  const reordenarCamposArrastados = async (draggedIndex, targetIndex) => {
    if (draggedIndex === targetIndex) return;

    const novosCampos = [...fields];
    // Remove o componente da posição antiga
    const [campoMovido] = novosCampos.splice(draggedIndex, 1);
    // Insere o componente na nova posição de destino
    novosCampos.splice(targetIndex, 0, campoMovido);

    // Reatribui o valor correto de 'order' baseado na nova sequência consecutiva do array
    const camposMapeados = novosCampos.map((campo, idx) => ({
      ...campo,
      order: idx + 1,
    }));

    // Atualiza o estado local para renderização imediata na tela
    setFields(camposMapeados);

    // Se o formulário já existir na BD, sincroniza a nova ordem automaticamente por PATCH
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
        console.error('Erro ao sincronizar ordenação por arrastamento com o servidor:', error);
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
    setEditData({ ...field });
  };


  // ======================================================
  // GUARDAR ALTERAÇÕES
  // ======================================================
  const saveField = (id) => {
    setFields(prevFields =>
      prevFields.map(field =>
        field.id === id ? editData : field
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
        i === index ? value : opt
      )
    }));
  };


  // ======================================================
  // RENDERIZAR CAMPO
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

  // ======================================================
  // ADICIONAR NOVO CAMPO
  // ======================================================
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

      // Se é novo, guardar o ID retornado
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
  // APAGAR FORMULÁRIO
  // ======================================================
  const handleDeleteForm = async () => {
    if (currentFormId) {
      if (window.confirm('Apagar este formulário permanentemente?')) {
        try {
          const response = await fetch(`http://localhost:3000/form-templates/${currentFormId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`Erro ao apagar formulário: ${response.statusText}`);
          }

          setCurrentFormId(null);
          setFormName('Meu Formulário');
          setFormDescription('');
          setFields([]);

          if (onGoHome) {
            onGoHome();
          }
        } catch (error) {
          console.error('Erro ao apagar formulário:', error);
          alert(`Erro ao apagar formulário: ${error.message}`);
        }
      }
    }
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
      <div className="flex-1 flex flex-col min-h-screen">

        {/* CABEÇALHO GLOBAL FIXO */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center">

          {/* Lado esquerdo — voltar + título */}
          <div className="flex items-center gap-4">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="text-gray-400 hover:text-gray-700 transition"
                title="Voltar à página inicial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-800 leading-tight">
                {formName || 'Novo Formulário'}
              </h1>
              <p className="text-xs text-gray-400">
                {currentFormId ? 'A editar rascunho' : 'Novo formulário'}
              </p>
            </div>
          </div>

          {/* Lado direito — ações globais */}
          <div className="flex gap-3 items-center">

            {/* Apagar */}
            {currentFormId && (
              <button
                onClick={handleDeleteForm}
                className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition"
              >
                Apagar
              </button>
            )}

            {/* Ver Preview */}
            <button
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              {isPreviewOpen ? 'Fechar Preview' : 'Ver Preview'}
            </button>

            {/* Guardar Rascunho */}
            <button
              onClick={handleSaveDraft}
              className="bg-gray-100 text-gray-800 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Guardar Rascunho
            </button>

            {/* Submeter / Publicar */}
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
            >
              Publicar
            </button>

          </div>

        </header>

        {/* ÁREA DE EDIÇÃO */}
        <div className="flex-1 p-10">

          {/* CAMPO NOME DO FORMULÁRIO */}
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Nome do formulário"
            className="mb-4 px-4 py-2 w-full border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* CAMPO DESCRIÇÃO */}
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Descrição do formulário (opcional)"
            className="mb-6 px-4 py-2 w-full border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="2"
          />

          {/* TOOLBAR — apenas inserção rápida de campos */}
          <Toolbar
            addField={addField}
            FIELD_TYPES={FIELD_TYPES}
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
                    reordenarCamposArrastados={reordenarCamposArrastados} // Prop injetada estritamente aqui

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
            formTemplateId={currentFormId}
          />

        </div>

      </div>

    </div>

  );
};

export default FormEditor;