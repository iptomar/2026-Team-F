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
  const [currentFormId, setCurrentFormId] = useState(formId || null);
  const [formName, setFormName] = useState('Meu Formulário');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Melhorias visuais sem alteração de schema/backend
  const [showGrid, setShowGrid] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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

          const camposOrdenados = formData.fields || [];
          camposOrdenados.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFields(camposOrdenados);
        } catch (error) {
          console.error('Erro ao carregar formulário:', error);
          showToast(`Erro ao carregar rascunho: ${error.message}`, 'error');
        } finally {
          setIsLoading(false);
        }
      };

      loadFormData();
    }
  }, [formId]);

  // ======================================================
  // REORDENAR CAMPO
  // ======================================================
  const moverCampo = async (index, direcao) => {
    const novosCampos = [...fields];
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1;

    if (novoIndex < 0 || novoIndex >= novosCampos.length) return;

    const temp = novosCampos[index];
    novosCampos[index] = novosCampos[novoIndex];
    novosCampos[novoIndex] = temp;

    const camposMapeados = novosCampos.map((campo, idx) => ({
      ...campo,
      order: idx + 1,
    }));

    setFields(camposMapeados);

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
  // REORDENAR POR DRAG & DROP
  // ======================================================
  const reordenarCamposArrastados = async (draggedIndex, targetIndex) => {
    if (draggedIndex === targetIndex) return;
    if (Number.isNaN(draggedIndex) || Number.isNaN(targetIndex)) return;

    const novosCampos = [...fields];
    const [campoMovido] = novosCampos.splice(draggedIndex, 1);
    novosCampos.splice(targetIndex, 0, campoMovido);

    const camposMapeados = novosCampos.map((campo, idx) => ({
      ...campo,
      order: idx + 1,
    }));

    setFields(camposMapeados);

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
      return filtrados.map((field, idx) => ({ ...field, order: idx + 1 }));
    });

    showToast('Campo removido do formulário.', 'info');
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
    showToast('Campo atualizado com sucesso.');
  };

  // ======================================================
  // CANCELAR EDIÇÃO
  // ======================================================
  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  // ======================================================
  // OPÇÕES
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

  const removeOption = (index) => {
    setEditData(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index, value) => {
    setEditData(prev => ({
      ...prev,
      options: (prev.options || []).map((opt, i) =>
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
        return (
          <FormRadioGroup
            label={field.label}
            options={field.options}
            required={field.required}
          />
        );
      case FIELD_TYPES.CHECKBOX:
        return (
          <FormCheckbox
            label={field.label}
            description={field.label}
            required={field.required}
          />
        );
      case FIELD_TYPES.DROPDOWN:
        return (
          <FormDropdown
            label={field.label}
            options={field.options}
            required={field.required}
          />
        );
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
    showToast('Campo adicionado ao formulário.', 'success');
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

      let method = 'POST';
      let endpoint = 'http://localhost:3000/form-templates';

      if (currentFormId) {
        method = 'PATCH';
        endpoint = `http://localhost:3000/form-templates/${currentFormId}`;
      }

      const response = await fetch(endpoint, {
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

      showToast(
        `Formulário ${status === 'draft' ? 'guardado como rascunho' : 'publicado'} com sucesso!`,
        'success'
      );

      console.log('Resposta do servidor:', data);
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      showToast(`Erro ao salvar: ${error.message}`, 'error');
    }
  };

  const handleSaveDraft = () => {
    saveFormToDatabase('draft');
  };

  const handlePublish = () => {
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
          showToast(`Erro ao apagar formulário: ${error.message}`, 'error');
        }
      }
    }
  };

  const canvasGridStyle = showGrid
    ? {
        backgroundImage:
          'linear-gradient(to right, rgba(99, 102, 241, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }
    : {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center bg-white border border-slate-200 rounded-2xl shadow-sm px-10 py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-600 mt-4 font-medium">A carregar formulário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-100 min-h-screen relative">
      {toast && (
        <div
          className={`fixed top-24 right-6 z-[70] max-w-sm rounded-2xl border px-5 py-4 shadow-xl backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-red-50/95 border-red-200 text-red-800'
              : toast.type === 'info'
                ? 'bg-slate-50/95 border-slate-200 text-slate-800'
                : 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">
              {toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅'}
            </span>
            <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

      <Sidebar
        addField={addField}
        FIELD_TYPES={FIELD_TYPES}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              {onGoHome && (
                <button
                  onClick={onGoHome}
                  className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition flex items-center justify-center"
                  title="Voltar à página inicial"
                  type="button"
                >
                  ←
                </button>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 leading-tight">
                    {formName || 'Novo Formulário'}
                  </h1>

                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 text-xs font-bold">
                    {currentFormId ? '📝 A editar' : '✨ Novo'}
                  </span>
                </div>

                <p className="text-sm text-slate-500">
                  Construa, organize e pré-visualize a estrutura do formulário.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={() => setShowGrid((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  showGrid
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Ativar ou desativar grelha visual"
              >
                <span>▦</span>
                <span>{showGrid ? 'Grelha ativa' : 'Mostrar grelha'}</span>
              </button>

              {currentFormId && (
                <button
                  onClick={handleDeleteForm}
                  className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  type="button"
                >
                  <span>🗑️</span>
                  <span>Apagar</span>
                </button>
              )}

              <button
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                type="button"
              >
                <span>👁️</span>
                <span>{isPreviewOpen ? 'Fechar Preview' : 'Ver Preview'}</span>
              </button>

              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                type="button"
              >
                <span>💾</span>
                <span>Guardar Rascunho</span>
              </button>

              <button
                onClick={handlePublish}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
                type="button"
              >
                <span>🚀</span>
                <span>Publicar</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10">
          <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Nome do formulário
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nome do formulário"
                  className="px-4 py-3 w-full border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Descrição do formulário (opcional)"
                  className="px-4 py-3 w-full border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition"
                  rows="2"
                />
              </div>
            </div>
          </div>

          <Toolbar
            addField={addField}
            FIELD_TYPES={FIELD_TYPES}
          />

          <div
            className={`border-2 border-dashed rounded-3xl p-6 min-h-[460px] shadow-sm transition-all ${
              showGrid
                ? 'border-indigo-200 bg-white'
                : 'border-slate-300 bg-white'
            }`}
            style={canvasGridStyle}
          >
            {fields.length === 0 ? (
              <div className="min-h-[360px] flex items-center justify-center">
                <div className="text-center max-w-md bg-white/90 border border-slate-200 rounded-3xl px-10 py-12 shadow-sm">
                  <div className="mx-auto mb-5 h-16 w-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl">
                    🧩
                  </div>

                  <h2 className="text-xl font-black text-slate-800 mb-2">
                    O formulário ainda está vazio
                  </h2>

                  <p className="text-sm text-slate-500 leading-relaxed">
                    Use a sidebar ou a inserção rápida para adicionar o primeiro
                    componente. Depois pode reordenar os campos por arrastamento.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    index={index}
                    totalFields={fields.length}
                    moverCampo={moverCampo}
                    reordenarCamposArrastados={reordenarCamposArrastados}
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

          <PreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            schema={fields}
            formName={formName}
            formDescription={formDescription}
          />
        </div>
      </div>
    </div>
  );
};

export default FormEditor;