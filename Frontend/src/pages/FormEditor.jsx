// ======================================================
// FRONTEND/src/pages/FormEditor.jsx
// Página principal do editor de formulários
// ======================================================

import React, { useState } from 'react';

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
const FormEditor = () => {

  // ======================================================
  // ESTADOS
  // ======================================================

  // Lista de campos do formulário
  const [fields, setFields] = useState([]);

  // Campo atualmente em edição
  const [editingId, setEditingId] = useState(null);

  // Dados temporários da edição
  const [editData, setEditData] = useState({});

  // Estado da janela Preview
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ======================================================
  // REMOVER CAMPO
  // ======================================================
  const deleteField = (id) => {

    setFields(prevFields =>
      prevFields.filter(field => field.id !== id)
    );

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
 // Dentro do FormEditor, atualiza o renderField:
  const renderField = (field) => {
    switch (field.type) {
      case FIELD_TYPES.LABEL:
        return <FormLabel value={field.label} />;
      case FIELD_TYPES.RADIO:
        return <FormRadioGroup label={field.label} options={field.options} required={field.required} />;
      case FIELD_TYPES.CHECKBOX:
        return <FormCheckbox label={field.label} description={field.label} required={field.required} />;
      case FIELD_TYPES.DROPDOWN: // <-- Novo
        return <FormDropdown label={field.label} options={field.options} required={field.required} />;
      default:
        return null;
    }
  };

  // Atualiza o addField para suportar opções no dropdown:
  const addField = (type) => {
    const newField = {
      id: crypto.randomUUID(), 
      type: type,
      label: `Novo campo de ${type}`,
      required: false, 
      options: (type === FIELD_TYPES.RADIO || type === FIELD_TYPES.DROPDOWN) ? ['Opção 1'] : [], // <-- Atualizado
      order: fields.length + 1, 
    };
    setFields(prevFields => [...prevFields, newField]);
  };


  // ======================================================
  // RENDER PRINCIPAL
  // ======================================================
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
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Editor de Formulário
      </h1>

      {/* TOOLBAR */}
      <Toolbar
        addField={addField}
        FIELD_TYPES={FIELD_TYPES}
        mockMode={isPreviewOpen}
        setMockMode={setIsPreviewOpen}
        handleSubmit={() => console.log("Submeter")}
      />

      {/* CANVAS */}
      <div className="border-2 border-dashed border-gray-300 bg-white rounded-2xl p-6 min-h-[400px] shadow-sm">

        {fields.length === 0 ? (

          <p className="text-gray-400 text-center mt-10">
            Adicione componentes usando a Sidebar.
          </p>

        ) : (

          <div className="space-y-4">

            {fields.map((field) => (

              <FieldCard
                key={field.id}
                field={field}

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