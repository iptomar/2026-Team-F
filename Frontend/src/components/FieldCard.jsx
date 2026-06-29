// ======================================================
// FRONTEND/src/components/FieldCard.jsx
// Card de campo — posicionamento absoluto, drag e resize
// com snap à grelha (#119 + #128)
// ======================================================

import React, { useRef, useState } from "react";
import {
  AlignJustify,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  CirclePlus,
  Edit3,
  GripVertical,
  Hash,
  Mail,
  MoveDown,
  MoveUp,
  MoreHorizontal,
  Save,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";

// ======================================================
// CONSTANTES
// ======================================================
const GRID_SIZE = 10;
const MIN_FIELD_WIDTH = 100;
const MIN_FIELD_HEIGHT = 60;
const DEFAULT_FIELD_WIDTH = 320;

const snapToGrid = (value, gridSize = GRID_SIZE) =>
  Math.round(value / gridSize) * gridSize;

// ======================================================
// COMPONENTE
// ======================================================
const FieldCard = ({
  field,
  index,
  totalFields,
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
  isSelected,
  onSelect,
  onPositionChange,
  onSizeChange,
  zoomScale,
}) => {
  const cardRef = useRef(null);

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [openEditorSection, setOpenEditorSection] = useState("content");

  // ======================================================
  // METADADOS VISUAIS POR TIPO
  // ======================================================
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
    [FIELD_TYPES.TEXTAREA]: {
      icon: AlignJustify,
      label: "Texto Longo",
      badge: "bg-slate-50 text-slate-700 border-slate-200",
      iconBox: "bg-slate-50 text-slate-700 border-slate-100",
    },
    [FIELD_TYPES.EMAIL]: {
      icon: Mail,
      label: "Email",
      badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
      iconBox: "bg-cyan-50 text-cyan-700 border-cyan-100",
    },
    [FIELD_TYPES.NUMBER]: {
      icon: Hash,
      label: "Número",
      badge: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      iconBox: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    },
    [FIELD_TYPES.DATE]: {
      icon: Calendar,
      label: "Data",
      badge: "bg-sky-50 text-sky-700 border-sky-200",
      iconBox: "bg-sky-50 text-sky-700 border-sky-100",
    },
    [FIELD_TYPES.SECTION]: {
      icon: AlignJustify,
      label: "Secção",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      iconBox: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
  };

  const meta = fieldMeta[field.type] || {
    icon: CirclePlus,
    label: field.type,
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    iconBox: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const Icon = meta.icon;
  const isEditing = editingId === field.id;
  const isInteracting = isDragging || isResizing;

  // ======================================================
  // POSICIONAMENTO
  // ======================================================
  const fieldLeft = typeof field.x === "number" ? field.x : 0;
  const fieldTop = typeof field.y === "number" ? field.y : index * 110;

  const fieldWidth =
    typeof field.width === "number" ? field.width : DEFAULT_FIELD_WIDTH;

  const fieldHeight =
    typeof field.height === "number" ? field.height : undefined;

  // ======================================================
  // HELPERS
  // ======================================================
  const handleWrapperPointerDown = (event) => {
    event.stopPropagation();
    onSelect?.(field.id);
  };

  const handleStartEditing = () => {
    setIsActionsOpen(false);
    setOpenEditorSection("content");
    onSelect?.(field.id);
    startEditing(field);
  };

  const handleToggleEditorSection = (section) => {
    setOpenEditorSection((currentSection) =>
      currentSection === section ? null : section
    );
  };

  const renderEditorSection = (sectionId, title, subtitle, children) => {
    const isOpen = openEditorSection === sectionId;

    return (
      <section className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => handleToggleEditorSection(sectionId)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition"
        >
          <span>
            <span className="block text-sm font-black text-slate-800">
              {title}
            </span>

            {subtitle && (
              <span className="block text-[11px] text-slate-500 mt-0.5">
                {subtitle}
              </span>
            )}
          </span>

          <ChevronDown
            size={16}
            className={`text-slate-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100">
            {children}
          </div>
        )}
      </section>
    );
  };

  // ======================================================
  // DRAG
  // ======================================================
 // ======================================================
  // DRAG (AGORA COM LIMITES DA PÁGINA)
  // ======================================================
  const handleDragHandlePointerDown = (event) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    onSelect?.(field.id);

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;
    const startX = typeof field.x === "number" ? field.x : 0;
    const startY = typeof field.y === "number" ? field.y : index * 110;
    const scale = zoomScale || 1;

    // 1. Descobrir os limites reais da folha branca atual
    const pageElement = cardRef.current?.closest('[data-page-number]');
    const pageWidth = pageElement ? pageElement.offsetWidth : 794;
    const pageHeight = pageElement ? pageElement.offsetHeight : 1123;

    // 2. Descobrir o tamanho do próprio componente
    const currentWidth = typeof field.width === "number" ? field.width : DEFAULT_FIELD_WIDTH;
    const currentHeight = typeof field.height === "number" ? field.height : cardRef.current?.offsetHeight ?? 100;

    setIsDragging(true);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    const onPointerMove = (moveEvent) => {
      // 3. A Matemática Mágica: Impede de ser menor que 0 E impede de ultrapassar a página
      const rawX = Math.max(
        0,
        Math.min(pageWidth - currentWidth, startX + (moveEvent.clientX - startMouseX) / scale)
      );

      const rawY = Math.max(
        0,
        Math.min(pageHeight - currentHeight, startY + (moveEvent.clientY - startMouseY) / scale)
      );

      onPositionChange?.(
        field.id,
        {
          x: snapToGrid(rawX),
          y: snapToGrid(rawY),
        },
        false
      );
    };

    const onPointerUp = (upEvent) => {
      const rawX = Math.max(
        0,
        Math.min(pageWidth - currentWidth, startX + (upEvent.clientX - startMouseX) / scale)
      );

      const rawY = Math.max(
        0,
        Math.min(pageHeight - currentHeight, startY + (upEvent.clientY - startMouseY) / scale)
      );

      onPositionChange?.(
        field.id,
        {
          x: snapToGrid(rawX),
          y: snapToGrid(rawY),
        },
        true
      );

      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };
  // ======================================================
  // RESIZE
  // ======================================================
  const handleResizePointerDown = (event) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    const startMouseX = event.clientX;
    const startMouseY = event.clientY;

    const startWidth = typeof field.width === "number" ? field.width : cardRef.current?.offsetWidth ?? DEFAULT_FIELD_WIDTH;
    const startHeight = typeof field.height === "number" ? field.height : cardRef.current?.offsetHeight ?? 100;

    const scale = zoomScale || 1;

    // 1. Descobrir os limites reais da folha branca atual
    const pageElement = cardRef.current?.closest('[data-page-number]');
    const pageWidth = pageElement ? pageElement.offsetWidth : 794;
    const pageHeight = pageElement ? pageElement.offsetHeight : 1123;

    setIsResizing(true);
    document.body.style.cursor = "se-resize";
    document.body.style.userSelect = "none";

    const onPointerMove = (moveEvent) => {
      // 2. Impede que a caixa seja esticada para lá da largura/altura da página
      const rawWidth = Math.max(
        MIN_FIELD_WIDTH,
        Math.min(pageWidth - fieldLeft, startWidth + (moveEvent.clientX - startMouseX) / scale)
      );

      const rawHeight = Math.max(
        MIN_FIELD_HEIGHT,
        Math.min(pageHeight - fieldTop, startHeight + (moveEvent.clientY - startMouseY) / scale)
      );

      onSizeChange?.(
        field.id,
        {
          width: snapToGrid(rawWidth),
          height: snapToGrid(rawHeight),
        },
        false
      );
    };

    const onPointerUp = (upEvent) => {
      const rawWidth = Math.max(
        MIN_FIELD_WIDTH,
        Math.min(pageWidth - fieldLeft, startWidth + (upEvent.clientX - startMouseX) / scale)
      );

      const rawHeight = Math.max(
        MIN_FIELD_HEIGHT,
        Math.min(pageHeight - fieldTop, startHeight + (upEvent.clientY - startMouseY) / scale)
      );

      onSizeChange?.(
        field.id,
        {
          width: snapToGrid(rawWidth),
          height: snapToGrid(rawHeight),
        },
        true
      );

      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div
      ref={cardRef}
      onPointerDown={handleWrapperPointerDown}
      style={{
        position: "absolute",
        left: `${fieldLeft}px`,
        top: `${fieldTop}px`,
        width: `${fieldWidth}px`,

        ...(fieldHeight !== undefined && !isEditing
          ? { height: `${fieldHeight}px`, overflow: "hidden" }
          : { overflow: "visible" }),

        zIndex: isEditing ? 120 : isSelected ? 50 : 1,

        opacity: isInteracting ? 0.82 : 1,

        transition: isInteracting
          ? "none"
          : "box-shadow 0.15s ease, opacity 0.12s ease",

        borderRadius: "1.5rem",

        ...(isSelected
          ? {
              outline: "2.5px solid #6366f1",
              boxShadow:
                "0 0 0 4px rgba(99,102,241,0.18), 0 8px 32px 0 rgba(99,102,241,0.14)",
            }
          : {}),
      }}
      className={`group bg-white border shadow-sm ${
        isSelected
          ? "border-indigo-400"
          : "border-slate-200 hover:border-indigo-200 hover:shadow-md"
      }`}
    >
      {/* ==================================================
          MODO VISUAL
          ================================================== */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          <div
            onPointerDown={handleDragHandlePointerDown}
            className="h-9 w-7 flex items-center justify-center shrink-0 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition select-none"
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
            title="Arrastar para mover"
          >
            <GripVertical size={17} />
          </div>

          <button
            type="button"
            onClick={() => setIsActionsOpen((previous) => !previous)}
            className={`h-10 w-10 rounded-2xl border flex items-center justify-center shrink-0 hover:scale-105 transition ${meta.iconBox}`}
            title={`Opções de ${meta.label}`}
          >
            <Icon size={20} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-black ${meta.badge}`}
              >
                <Icon size={11} />
                <span>{meta.label}</span>
              </span>

              <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-xs font-bold">
                #{field.order || index + 1}
              </span>

              {field.required && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 text-xs font-bold">
                  <span>*</span>
                  <span>Obrigatório</span>
                </span>
              )}

              {isSelected && (
                <span className="inline-flex items-center rounded-full bg-indigo-600 text-white px-2 py-0.5 text-xs font-bold">
                  Selecionado
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {field.label || "Campo sem nome"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsActionsOpen((previous) => !previous)}
            className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 inline-flex items-center justify-center transition shrink-0"
            title="Mais opções"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {isActionsOpen && (
          <div className="mx-3 mb-2 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => moverCampo(index, "cima")}
                disabled={index === 0}
                title="Diminuir ordem"
                className="h-8 w-8 inline-flex items-center justify-center bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-white transition text-sm"
              >
                <MoveUp size={15} />
              </button>

              <button
                type="button"
                onClick={() => moverCampo(index, "baixo")}
                disabled={index === totalFields - 1}
                title="Aumentar ordem"
                className="h-8 w-8 inline-flex items-center justify-center bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-white transition text-sm"
              >
                <MoveDown size={15} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={handleStartEditing}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1.5 rounded-xl hover:bg-blue-100 transition text-xs font-bold"
              >
                <Edit3 size={13} />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={() => deleteField(field.id)}
                className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 px-2.5 py-1.5 rounded-xl hover:bg-red-100 transition text-xs font-bold"
              >
                <Trash2 size={13} />
                <span>Remover</span>
              </button>
            </div>
          </div>
        )}

        <div className="mx-3 mb-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
          {renderField(field)}
        </div>
      </div>

      {/* ==================================================
          MENU CONTEXTUAL DE EDIÇÃO
          ================================================== */}
      {isEditing && (
        <div
          className="absolute left-full top-0 ml-3 w-[320px] max-h-[68vh] overflow-y-auto bg-white border border-indigo-200 rounded-2xl shadow-2xl z-[160]"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 rounded-t-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.iconBox}`}
                >
                  <Icon size={17} />
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
                    Editar componente
                  </p>
                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {meta.label}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={cancelEditing}
                className="h-8 w-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 inline-flex items-center justify-center transition"
                title="Fechar edição"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="p-3 space-y-3">
            {renderEditorSection(
              "content",
              "Conteúdo",
              "Texto principal e descrição",
              <>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                    {field.type === FIELD_TYPES.LABEL
                      ? "Texto da label"
                      : "Nome do campo"}
                  </label>

                  <input
                    type="text"
                    value={editData.label || ""}
                    maxLength={field.type === FIELD_TYPES.LABEL ? 100 : undefined}
                    onChange={(event) =>
                      setEditData({
                        ...editData,
                        label: event.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder={
                      field.type === FIELD_TYPES.LABEL
                        ? "Texto apresentado na label"
                        : "Nome do campo"
                    }
                  />
                  {field.type === FIELD_TYPES.LABEL && (
                    <p className="mt-1 text-xs text-slate-400">
                      {(editData.label || '').length}/100 caracteres
                    </p>
                  )}
                </div>

                {field.type === FIELD_TYPES.LABEL && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                        Tamanho
                      </label>

                      <select
                        value={editData.fontSize || 20}
                        onChange={(event) =>
                          setEditData({
                            ...editData,
                            fontSize: Number(event.target.value),
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                      >
                        <option value={16}>Pequeno</option>
                        <option value={20}>Normal</option>
                        <option value={28}>Grande</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                        Alinhamento
                      </label>

                      <select
                        value={editData.textAlign || 'left'}
                        onChange={(event) =>
                          setEditData({
                            ...editData,
                            textAlign: event.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </select>
                    </div>
                  </div>
                )}

                {field.type === FIELD_TYPES.LABEL && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                      Descrição auxiliar
                    </label>

                    <textarea
                      value={editData.description || ""}
                      onChange={(event) =>
                        setEditData({
                          ...editData,
                          description: event.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows="3"
                      placeholder="Texto auxiliar por baixo da label"
                    />
                  </div>
                )}

                {field.type !== FIELD_TYPES.LABEL && (
                  <label className="flex items-start gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={editData.required || false}
                      onChange={(event) =>
                        setEditData({
                          ...editData,
                          required: event.target.checked,
                        })
                      }
                      className="mt-0.5 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />

                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        Campo obrigatório
                      </span>

                      <span className="block text-xs text-slate-500 leading-relaxed">
                        Exige preenchimento antes da submissão.
                      </span>
                    </span>
                  </label>
                )}
              </>
            )}

            {field.type === FIELD_TYPES.LABEL &&
              renderEditorSection(
                "style",
                "Estilo",
                "Tamanho, peso e alinhamento",
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                        Tamanho
                      </label>

                      <input
                        type="number"
                        min="12"
                        max="48"
                        value={editData.fontSize || 20}
                        onChange={(event) =>
                          setEditData({
                            ...editData,
                            fontSize: Number(event.target.value),
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                        Peso
                      </label>

                      <select
                        value={editData.fontWeight || "bold"}
                        onChange={(event) =>
                          setEditData({
                            ...editData,
                            fontWeight: event.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="normal">Normal</option>
                        <option value="500">Médio</option>
                        <option value="600">Semi-bold</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                      Alinhamento
                    </label>

                    <select
                      value={editData.textAlign || "left"}
                      onChange={(event) =>
                        setEditData({
                          ...editData,
                          textAlign: event.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centro</option>
                      <option value="right">Direita</option>
                      <option value="justify">Justificado</option>
                    </select>
                  </div>
                </>
              )}

           {/* ==================================================
                NOVA SECÇÃO: VALIDAÇÕES AVANÇADAS (APENAS PARA TEXTO)
                ================================================== */}
            {editData.type === FIELD_TYPES.TEXT &&
              renderEditorSection(
                "validations",
                "Validações",
                "Limites e formato do texto",
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                        Mín. Caracteres
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editData.minLength || ""}
                        onChange={(event) =>
                          setEditData({
                            ...editData,
                            minLength: event.target.value ? Number(event.target.value) : null,
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="Ex: 5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                        Máx. Caracteres
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editData.maxLength || ""}
                        onChange={(event) =>
                          setEditData({
                            ...editData,
                            maxLength: event.target.value ? Number(event.target.value) : null,
                          })
                        }
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="Ex: 255"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-1.5">
                      Expressão Regular (Regex)
                    </label>
                    <input
                      type="text"
                      value={editData.pattern || ""}
                      onChange={(event) =>
                        setEditData({
                          ...editData,
                          pattern: event.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                      placeholder="Ex: ^[a-zA-Z]+$"
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                      Útil para validar NIF, Email, Código Postal, etc. Deixe em branco se não aplicável.
                    </p>
                  </div>
                </>
              )}

            {/* ==================================================
                SECÇÃO DE OPÇÕES (RADIOS, DROPDOWNS, CHECKBOXES)
                ================================================== */}
            {(editData.type === FIELD_TYPES.RADIO ||
              editData.type === FIELD_TYPES.DROPDOWN ||
              editData.type === FIELD_TYPES.CHECKBOX) &&
              renderEditorSection(
                "options",
                "Opções",
                "Adicionar, editar ou remover",
                <>
                {(editData.type === FIELD_TYPES.RADIO || editData.type === FIELD_TYPES.DROPDOWN) && (
                  <div className="space-y-2">
                    {(editData.options || []).map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(event) =>
                            updateOption(optionIndex, event.target.value)
                          }
                          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                          placeholder={`Opção ${optionIndex + 1}`}
                        />

                        <button
                          type="button"
                          onClick={() => removeOption(optionIndex)}
                          className="bg-red-50 border border-red-200 text-red-700 px-3 rounded-xl hover:bg-red-100 transition font-bold"
                          title="Remover opção"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {(editData.type === FIELD_TYPES.RADIO ||
                  editData.type === FIELD_TYPES.DROPDOWN) && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition font-bold text-sm"
                  >
                    <CirclePlus size={15} />
                    <span>Adicionar opção</span>
                  </button>
                )}
                </>
              )}
          </div>
        
          <div className="sticky bottom-0 bg-white border-t border-slate-100 p-3 rounded-b-2xl flex gap-2">
            <button
              type="button"
              onClick={() => saveField(field.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 font-bold transition text-sm"
            >
              <Save size={15} />
              <span>Guardar</span>
            </button>

            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-200 font-bold transition text-sm"
            >
              <Undo2 size={15} />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          PEGA DE REDIMENSIONAMENTO
          ==================================================== */}
      {isSelected && !isEditing && (
        <div
          onPointerDown={handleResizePointerDown}
          title="Redimensionar campo"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: "18px",
            height: "18px",
            cursor: "se-resize",
            zIndex: 60,
            background:
              "linear-gradient(135deg, transparent 50%, #6366f1 50%)",
            borderRadius: "0 0 1.5rem 0",
            touchAction: "none",
          }}
        />
      )}

      {/* ====================================================
          INDICADOR DE POSIÇÃO
          ==================================================== */}
      {isInteracting && (
        <div
          style={{
            position: "absolute",
            top: "-28px",
            left: "0",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
          className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow"
        >
          {isDragging
            ? `x: ${Math.round(fieldLeft)} · y: ${Math.round(fieldTop)}`
            : `${Math.round(fieldWidth)} × ${Math.round(
                fieldHeight ?? cardRef.current?.offsetHeight ?? 0
              )} px`}
        </div>
      )}
    </div>
  );
};

export default FieldCard;