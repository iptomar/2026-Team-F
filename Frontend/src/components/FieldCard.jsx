import React from "react";

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

  // ======================================================
  // MANIPULADORES DE DRAG & DROP (ARRUSTADOR)
  // ======================================================
  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", index);
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedIndex = Number(e.dataTransfer.getData("text/plain"));
    reordenarCamposArrastados(draggedIndex, index);
  };

  return (
    <div 
      draggable={editingId !== field.id}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all ${
        editingId !== field.id ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >

      {/* ========================= */}
      {/* MODO EDIÇÃO */}
      {/* ========================= */}
      {editingId === field.id ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Campo</label>
            <input
              type="text"
              value={editData.label}
              onChange={(e) => setEditData({ ...editData, label: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
            <input
              type="checkbox"
              checked={editData.required || false}
              onChange={(e) => setEditData({ ...editData, required: e.target.checked })}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-gray-700">Campo obrigatório</span>
          </div>

          {(editData.type === FIELD_TYPES.RADIO || editData.type === FIELD_TYPES.DROPDOWN) && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Opções</label>
              <div className="space-y-2">
                {editData.options?.map((opt, indexOpt) => (
                  <div key={indexOpt} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(indexOpt, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <button
                      onClick={() => removeOption(indexOpt)}
                      className="bg-red-500 text-white px-4 rounded-lg hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addOption}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                + Adicionar Opção
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button onClick={() => saveField(field.id)} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Guardar</button>
            <button onClick={cancelEditing} className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500">Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-lg select-none cursor-grab">☰</span>
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">
                  {field.type} #{field.order || index + 1}
                </p>
                {field.required && <span className="text-red-500 text-sm font-semibold">Obrigatório</span>}
              </div>
            </div>

            <div className="flex gap-1.5 items-center">
              {/* BOTÕES DE SETA ESTILIZADOS COM A COR DO SITE (ÍNDIGO) */}
              <button
                onClick={() => moverCampo(index, 'cima')}
                disabled={index === 0}
                title="Mover para cima"
                className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-indigo-50 font-bold transition-all text-xs"
              >
                ▲
              </button>
              
              <button
                onClick={() => moverCampo(index, 'baixo')}
                disabled={index === totalFields - 1}
                title="Mover para baixo"
                className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-indigo-50 font-bold transition-all text-xs"
              >
                ▼
              </button>

              {/* LINHA DE SEPARAÇÃO VISUAL */}
              <div className="w-[1px] bg-gray-200 h-5 mx-1.5"></div>

              {/* BOTÕES DE AÇÃO PADRÃO */}
              <button
                onClick={() => startEditing(field)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium"
              >
                Editar
              </button>

              <button
                onClick={() => deleteField(field.id)}
                className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-all text-sm font-medium"
              >
                Remover
              </button>
            </div>
          </div>

          {/* RENDER DO CAMPO DINÂMICO */}
          <div>{renderField(field)}</div>
        </>
      )}
    </div>
  );
};

export default FieldCard;