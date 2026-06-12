// ======================================================
// FRONTEND/src/components/FieldCard.jsx
// Card de campo — posicionamento absoluto, drag e resize
// com snap à grelha (#119 + #128)
// ======================================================

import React, { useRef, useState } from "react";
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

// ======================================================
// CONSTANTES
// ======================================================
const GRID_SIZE = 20;
const MIN_FIELD_WIDTH = 100;
const MIN_FIELD_HEIGHT = 60;
const DEFAULT_FIELD_WIDTH = 320;

/**
 * Arredonda `value` ao múltiplo de `gridSize` mais próximo.
 * Usado em drag e resize para aplicar snap à grelha.
 */
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
  // Props de seleção (#128)
  isSelected,
  onSelect,
  // Props de drag & resize (#119)
  onPositionChange,
  onSizeChange,
  zoomScale,
}) => {
  const cardRef = useRef(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

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
  };

  const meta = fieldMeta[field.type] || {
    icon: CirclePlus,
    label: field.type,
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    iconBox: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const Icon = meta.icon;

  // ======================================================
  // SELEÇÃO — wrapper captura pointer sem propagar ao canvas
  // ======================================================
  const handleWrapperPointerDown = (e) => {
    // Só propaga a seleção; o drag handle tem o seu próprio handler
    e.stopPropagation();
    onSelect?.(field.id);
  };

  // ======================================================
  // DRAG — arrastar o campo pela folha (#119)
  // ======================================================
  const handleDragHandlePointerDown = (e) => {
    // Só botão principal do rato
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    onSelect?.(field.id);

    // Posição inicial do campo e do rato no momento do clique
    const startMX = e.clientX;
    const startMY = e.clientY;
    const startX = typeof field.x === "number" ? field.x : 0;
    const startY = typeof field.y === "number" ? field.y : index * 110;

    // A escala do canvas afeta a relação px-écran ↔ px-canvas
    const scale = zoomScale || 1;

    setIsDragging(true);
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    // ── Movimento live (sem snap — suave ao rato) ───────────────
    const onPointerMove = (me) => {
      const rawX = Math.max(0, startX + (me.clientX - startMX) / scale);
      const rawY = Math.max(0, startY + (me.clientY - startMY) / scale);
      onPositionChange?.(field.id, { x: rawX, y: rawY }, false);
    };

    // ── Largou: aplica snap e confirma ──────────────────────────
    const onPointerUp = (ue) => {
      const rawX = Math.max(0, startX + (ue.clientX - startMX) / scale);
      const rawY = Math.max(0, startY + (ue.clientY - startMY) / scale);

      onPositionChange?.(
        field.id,
        {
          x: snapToGrid(rawX),
          y: snapToGrid(rawY),
        },
        true, // isCommit → markUserEdited()
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
  // RESIZE — pega no canto inferior-direito (#119)
  // ======================================================
  const handleResizePointerDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const startMX = e.clientX;
    const startMY = e.clientY;

    // Dimensão inicial: usa o valor do campo ou mede o DOM
    const startW =
      typeof field.width === "number"
        ? field.width
        : cardRef.current?.offsetWidth ?? DEFAULT_FIELD_WIDTH;

    const startH =
      typeof field.height === "number"
        ? field.height
        : cardRef.current?.offsetHeight ?? 100;

    const scale = zoomScale || 1;

    setIsResizing(true);
    document.body.style.cursor = "se-resize";
    document.body.style.userSelect = "none";

    // ── Movimento live ────────────────────────────────────────────
    const onPointerMove = (me) => {
      const rawW = Math.max(
        MIN_FIELD_WIDTH,
        startW + (me.clientX - startMX) / scale,
      );
      const rawH = Math.max(
        MIN_FIELD_HEIGHT,
        startH + (me.clientY - startMY) / scale,
      );
      onSizeChange?.(field.id, { width: rawW, height: rawH }, false);
    };

    // ── Largou: aplica snap e confirma ──────────────────────────
    const onPointerUp = (ue) => {
      const rawW = Math.max(
        MIN_FIELD_WIDTH,
        startW + (ue.clientX - startMX) / scale,
      );
      const rawH = Math.max(
        MIN_FIELD_HEIGHT,
        startH + (ue.clientY - startMY) / scale,
      );

      onSizeChange?.(
        field.id,
        {
          width: snapToGrid(rawW),
          height: snapToGrid(rawH),
        },
        true, // isCommit
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

  const handleStartEditing = () => {
    setIsActionsOpen(false);
    startEditing(field);
  };

  // ======================================================
  // ESTILOS DE POSICIONAMENTO ABSOLUTO (#128)
  // ======================================================
  const fieldLeft = typeof field.x === "number" ? field.x : 0;
  const fieldTop = typeof field.y === "number" ? field.y : index * 110;
  const fieldWidth =
    typeof field.width === "number" ? field.width : DEFAULT_FIELD_WIDTH;
  const fieldHeight =
    typeof field.height === "number" ? field.height : undefined;

  const isInteracting = isDragging || isResizing;

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div
      ref={cardRef}
      onPointerDown={handleWrapperPointerDown}
      style={{
        // — Posicionamento absoluto no canvas —
        position: "absolute",
        left: `${fieldLeft}px`,
        top: `${fieldTop}px`,
        width: `${fieldWidth}px`,
        // Height explícito apenas quando foi redimensionado
        ...(fieldHeight !== undefined
          ? { height: `${fieldHeight}px`, overflow: "hidden" }
          : {}),
        // — Camada Z —
        zIndex: isSelected ? 50 : 1,
        // — Feedback visual de drag/resize —
        opacity: isInteracting ? 0.82 : 1,
        // Desativa transições durante interação para resposta imediata
        transition: isInteracting
          ? "none"
          : "box-shadow 0.15s ease, opacity 0.12s ease",
        borderRadius: "1.5rem",
        // — Anel de seleção (#128) —
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
          MODO EDIÇÃO
          ================================================== */}
      {editingId === field.id ? (
        <div className="p-5 space-y-5">
          {/* Cabeçalho da edição */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${meta.iconBox}`}
              >
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

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              onPointerDown={(e) => e.stopPropagation()}
              value={editData.description || ""}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tamanho da fonte */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tamanho da Fonte
            </label>
            <input
              type="number"
              onPointerDown={(e) => e.stopPropagation()}
              value={editData.fontSize || 20}
              onChange={(e) =>
                setEditData({ ...editData, fontSize: Number(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Peso da fonte */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Peso da Fonte
            </label>
            <select
              onPointerDown={(e) => e.stopPropagation()}
              value={editData.fontWeight || "bold"}
              onChange={(e) =>
                setEditData({ ...editData, fontWeight: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          {/* Alinhamento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alinhamento
            </label>
            <select
              onPointerDown={(e) => e.stopPropagation()}
              value={editData.textAlign || "left"}
              onChange={(e) =>
                setEditData({ ...editData, textAlign: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </div>

          {/* Nome / Texto da label */}
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">
              {field.type === FIELD_TYPES.LABEL
                ? "Texto da label"
                : "Nome do campo"}
            </label>
            <input
              type="text"
              onPointerDown={(e) => e.stopPropagation()}
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

          {/* Campo obrigatório */}
          {field.type !== FIELD_TYPES.LABEL && (
            <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-2xl cursor-pointer hover:bg-slate-100 transition">
              <input
                type="checkbox"
                onPointerDown={(e) => e.stopPropagation()}
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

          {/* Opções (radio, dropdown, checkbox) */}
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
                      onPointerDown={(e) => e.stopPropagation()}
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

          {/* Ações de guardar / cancelar */}
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
        /* ==================================================
           MODO VISUALIZAÇÃO + DRAG HANDLE
           ================================================== */
        <div className="flex flex-col">
          {/* ── Barra superior: drag handle + info + actions ── */}
          <div className="flex items-center gap-2 px-3 pt-3 pb-2">
            {/* ─────────────────────────────────────────────────
                DRAG HANDLE (#119)
                Área dedicada para arrastar o campo.
                stopPropagation evita conflito com seleção.
                ───────────────────────────────────────────── */}
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

            {/* Ícone do tipo (abre menu de ações) */}
            <button
              type="button"
              onClick={() => setIsActionsOpen((p) => !p)}
              className={`h-10 w-10 rounded-2xl border flex items-center justify-center shrink-0 hover:scale-105 transition ${meta.iconBox}`}
              title={`Opções de ${meta.label}`}
            >
              <Icon size={20} />
            </button>

            {/* Info: tipo, ordem, obrigatório, selecionado */}
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

                {/* Indicador de seleção ativo */}
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

            {/* Botão de opções (···) */}
            <button
              type="button"
              onClick={() => setIsActionsOpen((p) => !p)}
              className="h-8 w-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 inline-flex items-center justify-center transition shrink-0"
              title="Mais opções"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* ── Menu de ações (expandível) ── */}
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

          {/* ── Pré-visualização do campo ── */}
          <div className="mx-3 mb-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
            {renderField(field)}
          </div>
        </div>
      )}

      {/* ====================================================
          PEGA DE REDIMENSIONAMENTO — canto inferior-direito (#119)
          Visível apenas quando o campo está selecionado e
          não está em modo de edição.
          ==================================================== */}
      {isSelected && editingId !== field.id && (
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
            // Forma de triângulo no canto: visual clean
            background:
              "linear-gradient(135deg, transparent 50%, #6366f1 50%)",
            borderRadius: "0 0 1.5rem 0",
            touchAction: "none",
          }}
        />
      )}

      {/* ====================================================
          INDICADOR DE POSIÇÃO (#119)
          Mostra coords enquanto arrasta ou redimensiona.
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
            : `${Math.round(fieldWidth)} × ${Math.round(fieldHeight ?? (cardRef.current?.offsetHeight ?? 0))} px`}
        </div>
      )}
    </div>
  );
};

export default FieldCard;