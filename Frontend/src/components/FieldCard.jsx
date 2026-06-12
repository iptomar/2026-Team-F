import React, { useState } from "react";
import {
  CheckSquare,
  ChevronDown,
  CircleDot,
  CirclePlus,
  Edit3,
  GripVertical,
  MoveDown,
  MoveUp,
  MoreHorizontal,
  Save,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";

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
  renderField,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const fieldMeta = {
    [FIELD_TYPES.LABEL]: {
      icon: Type,
      label: "Label",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      iconBox: "bg-blue-50 text-blue-700 border-blue-100",
    },
    [FIELD_TYPES.RADIO]: {
      icon: CircleDot,
      label: "Radio",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBox: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    [FIELD_TYPES.CHECKBOX]: {
      icon: CheckSquare,
      label: "Checkbox",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      iconBox: "bg-purple-50 text-purple-700 border-purple-100",
    },
    [FIELD_TYPES.DROPDOWN]: {
      icon: ChevronDown,
      label: "Dropdown",
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      iconBox: "bg-orange-50 text-orange-700 border-orange-100",
    },
  };

  const meta = fieldMeta[field.type] || {
    icon: CirclePlus,
    label: field.type,
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    iconBox: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const Icon = meta.icon;

  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/plain", index);
    event.dataTransfer.effectAllowed = "move";
    event.currentTarget.style.opacity = "0.55";
  };

  const handleDragEnd = (event) => {
    event.currentTarget.style.opacity = "1";
    setIsDragOver(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (editingId !== field.id) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const draggedIndex = Number(event.dataTransfer.getData("text/plain"));

    if (Number.isNaN(draggedIndex)) {
      return;
    }

    reordenarCamposArrastados(draggedIndex, index);
  };

  const handleStartEditing = () => {
    setIsActionsOpen(false);
    startEditing(field);
  };

  return (
    <div
      draggable={editingId !== field.id}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group bg-white border rounded-3xl shadow-sm transition-all ${
        editingId !== field.id ? "cursor-grab active:cursor-grabbing" : ""
      } ${
        isDragOver
          ? "border-indigo-400 ring-4 ring-indigo-100 scale-[1.01]"
          : "border-slate-200 hover:border-indigo-200 hover:shadow-md"
      }`}
    >
      {editingId === field.id ? (
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${meta.iconBox}`}>
                <Icon size={20} />
              </span>

              <div>
                <h3 className="font-black text-slate-900">
                  Editar {meta.label}
                </h3>
                <p className="text-xs text-slate-500">
                  Ajuste apenas as propriedades aplicáveis a este componente.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={cancelEditing}
              className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 inline-flex items-center justify-center transition"
              title="Fechar edição"
            >
              <X size={17} />
            </button>
          </div>

          

   {/* INPUT LABEL */}

<div>

  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Descrição
  </label>

  <textarea
    value={editData.description || ""}
    onChange={(e) =>
      setEditData({
        ...editData,
        description: e.target.value
      })
    }
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  />

</div>


<div>

  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Tamanho da Fonte
  </label>

  <input
    type="number"
    value={editData.fontSize || 20}
    onChange={(e) =>
      setEditData({
        ...editData,
        fontSize: Number(e.target.value)
      })
    }
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  />

</div>


<div>

  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Peso da Fonte
  </label>

  <select
    value={editData.fontWeight || "bold"}
    onChange={(e) =>
      setEditData({
        ...editData,
        fontWeight: e.target.value
      })
    }
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  >
    <option value="normal">Normal</option>
    <option value="bold">Bold</option>
  </select>

</div>


<div>

  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Alinhamento
  </label>

  <select
    value={editData.textAlign || "left"}
    onChange={(e) =>
      setEditData({
        ...editData,
        textAlign: e.target.value
      })
    }
    className="w-full border border-gray-300 rounded-lg px-4 py-2"
  >
    <option value="left">Esquerda</option>
    <option value="center">Centro</option>
    <option value="right">Direita</option>
  </select>

</div>

{/* INPUT LABEL */}



          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">
              {field.type === FIELD_TYPES.LABEL ? "Texto da label" : "Nome do campo"}
            </label>

            <input
              type="text"
              value={editData.label || ""}
              onChange={(event) =>
                setEditData({ ...editData, label: event.target.value })
              }
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder={
                field.type === FIELD_TYPES.LABEL
                  ? "Texto apresentado na label"
                  : "Nome do campo"
              }
            />
          </div>

          {field.type !== FIELD_TYPES.LABEL && (
            <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                checked={editData.required || false}
                onChange={(event) =>
                  setEditData({ ...editData, required: event.target.checked })
                }
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
          )}

          {(editData.type === FIELD_TYPES.RADIO ||
            editData.type === FIELD_TYPES.DROPDOWN ||
            editData.type === FIELD_TYPES.CHECKBOX) && (
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
                      onChange={(event) =>
                        updateOption(indexOpt, event.target.value)
                      }
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder={`Opção ${indexOpt + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() => removeOption(indexOpt)}
                      className="bg-red-50 border border-red-200 text-red-700 px-3 rounded-xl hover:bg-red-100 transition font-bold"
                      title="Remover opção"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addOption}
                className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition font-bold text-sm"
              >
                <CirclePlus size={16} />
                <span>Adicionar opção</span>
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => saveField(field.id)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 font-bold transition"
            >
              <Save size={17} />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-200 font-bold transition"
            >
              <Undo2 size={17} />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsActionsOpen((previous) => !previous)}
                className={`h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 hover:scale-105 transition ${meta.iconBox}`}
                title={`Opções de ${meta.label}`}
              >
                <Icon size={21} />
              </button>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-black ${meta.badge}`}>
                    <Icon size={13} />
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

                <p className="text-xs text-slate-500 mt-1 truncate">
                  {field.label || "Campo sem nome"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center select-none"
                title="Arraste para reordenar"
              >
                <GripVertical size={18} />
              </span>

              <button
                type="button"
                onClick={() => setIsActionsOpen((previous) => !previous)}
                className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 inline-flex items-center justify-center transition"
                title="Mostrar opções"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          {isActionsOpen && (
            <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moverCampo(index, "cima")}
                  disabled={index === 0}
                  title="Mover para cima"
                  className="h-9 w-9 inline-flex items-center justify-center bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-white font-black transition-all text-sm"
                >
                  <MoveUp size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => moverCampo(index, "baixo")}
                  disabled={index === totalFields - 1}
                  title="Mover para baixo"
                  className="h-9 w-9 inline-flex items-center justify-center bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-white font-black transition-all text-sm"
                >
                  <MoveDown size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all text-sm font-bold"
                >
                  <Edit3 size={15} />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteField(field.id)}
                  className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 px-3 py-2 rounded-xl hover:bg-red-100 transition-all text-sm font-bold"
                >
                  <Trash2 size={15} />
                  <span>Remover</span>
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            {renderField(field)}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldCard;