import React, { useState } from "react";

const FieldCard = ({
  field,
  index,
  totalFields,
  reordenarCamposArrastados,
  moverCampo,
  editingId,
  editData,
  setEditData,
  saveField,
  cancelEditing,
  startEditing,
  deleteField,
  FIELD_TYPES,
  updateOption,
  removeOption,
  addOption,
  renderField
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const fieldMeta = {
    [FIELD_TYPES.LABEL]: {
      icon: "📝",
      label: "Label",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
    },
    [FIELD_TYPES.RADIO]: {
      icon: "🔘",
      label: "Radio",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    [FIELD_TYPES.CHECKBOX]: {
      icon: "☑️",
      label: "Checkbox",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
    },
    [FIELD_TYPES.DROPDOWN]: {
      icon: "🔽",
      label: "Dropdown",
      badge: "bg-orange-50 text-orange-700 border-orange-200",
    },
  };

  const meta = fieldMeta[field.type] || {
    icon: "🧩",
    label: field.type,
    badge: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", index);
    e.currentTarget.style.opacity = "0.55";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (editingId !== field.id) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const draggedIndex = Number(e.dataTransfer.getData("text/plain"));

    if (Number.isNaN(draggedIndex)) {
      return;
    }

    reordenarCamposArrastados(draggedIndex, index);
  };

  return (
    <div
      draggable={editingId !== field.id}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white border rounded-3xl shadow-sm p-5 transition-all ${
        editingId !== field.id ? "cursor-grab active:cursor-grabbing" : ""
      } ${
        isDragOver
          ? "border-indigo-400 ring-4 ring-indigo-100 scale-[1.01]"
          : "border-slate-200 hover:border-indigo-200 hover:shadow-md"
      }`}
    >
      {editingId === field.id ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                ✏️
              </span>

              <div>
                <h3 className="font-black text-slate-900">
                  Editar campo
                </h3>
                <p className="text-xs text-slate-500">
                  Ajuste a identificação e opções do componente.
                </p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${meta.badge}`}>
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </span>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">
              Nome do Campo
            </label>
            <input
              type="text"
              value={editData.label || ""}
              onChange={(e) => setEditData({ ...editData, label: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="Nome do campo"
            />
          </div>

          <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl cursor-pointer hover:bg-slate-100 transition">
            <input
              type="checkbox"
              checked={editData.required || false}
              onChange={(e) => setEditData({ ...editData, required: e.target.checked })}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span>
              <span className="block text-sm font-bold text-slate-800">
                Campo obrigatório
              </span>
              <span className="block text-xs text-slate-500">
                O utilizador terá de preencher este campo antes de submeter.
              </span>
            </span>
          </label>

          {(editData.type === FIELD_TYPES.RADIO || editData.type === FIELD_TYPES.DROPDOWN) && (
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Opções
              </label>

              <div className="space-y-2">
                {(editData.options || []).map((opt, indexOpt) => (
                  <div key={indexOpt} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(indexOpt, e.target.value)}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder={`Opção ${indexOpt + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() => removeOption(indexOpt)}
                      className="bg-red-50 border border-red-200 text-red-700 px-3 rounded-xl hover:bg-red-100 transition font-bold"
                      title="Remover opção"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addOption}
                className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition font-bold text-sm"
              >
                <span>➕</span>
                <span>Adicionar Opção</span>
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => saveField(field.id)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-bold transition"
            >
              <span>💾</span>
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-200 font-bold transition"
            >
              <span>↩️</span>
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between mb-4">
            <div className="flex items-start gap-3">
              <span
                className="mt-1 h-10 w-10 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center select-none cursor-grab"
                title="Arraste para reordenar"
              >
                ⋮⋮
              </span>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-black ${meta.badge}`}>
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </span>

                  <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2.5 py-1 text-xs font-bold">
                    Ordem #{field.order || index + 1}
                  </span>

                  {field.required && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-100 px-2.5 py-1 text-xs font-bold">
                      <span>*</span>
                      <span>Obrigatório</span>
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-500">
                  Arraste o cartão ou use os controlos para ajustar a ordem.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={() => moverCampo(index, 'cima')}
                disabled={index === 0}
                title="Mover para cima"
                className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-indigo-50 font-black transition-all text-sm"
              >
                ↑
              </button>

              <button
                type="button"
                onClick={() => moverCampo(index, 'baixo')}
                disabled={index === totalFields - 1}
                title="Mover para baixo"
                className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-indigo-50 font-black transition-all text-sm"
              >
                ↓
              </button>

              <div className="w-[1px] bg-slate-200 h-6 mx-1"></div>

              <button
                type="button"
                onClick={() => startEditing(field)}
                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all text-sm font-bold"
              >
                <span>✏️</span>
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={() => deleteField(field.id)}
                className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded-xl hover:bg-red-100 transition-all text-sm font-bold"
              >
                <span>🗑️</span>
                <span>Remover</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            {renderField(field)}
          </div>
        </>
      )}
    </div>
  );
};

export default FieldCard;