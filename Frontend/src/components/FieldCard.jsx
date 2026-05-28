import React from "react";

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
  renderField
}) => {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition-all">

      {/* ========================= */}
      {/* MODO EDIÇÃO */}
      {/* ========================= */}
      {editingId === field.id ? (

        <div className="space-y-4">

          {/* INPUT LABEL */}
          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome do Campo
            </label>

            <input
              type="text"
              value={editData.label}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  label: e.target.value
                })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />

          </div>

          {/* OBRIGATÓRIO */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">

            <input
              type="checkbox"
              checked={editData.required || false}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  required: e.target.checked
                })
              }
              className="w-5 h-5"
            />

            <span className="text-sm font-medium text-gray-700">
              Campo obrigatório
            </span>

          </div>

          {/* OPÇÕES RADIO */}
          {(editData.type === FIELD_TYPES.RADIO || editData.type === FIELD_TYPES.DROPDOWN) && (
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Opções
              </label>

              <div className="space-y-2">

                {editData.options?.map((opt, indexOpt) => (

                  <div
                    key={indexOpt}
                    className="flex gap-2"
                  >

                    <input
                      type="text"
                      value={opt}
                      onChange={(e) =>
                        updateOption(indexOpt, e.target.value)
                      }
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

          {/* BOTÕES */}
          <div className="flex gap-3 pt-3">

            <button
              onClick={() => saveField(field.id)}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>

            <button
              onClick={cancelEditing}
              className="bg-gray-400 text-white px-5 py-2 rounded-lg hover:bg-gray-500"
            >
              Cancelar
            </button>

          </div>

        </div>

      ) : (

        <>
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">

            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">
                  {field.type} (Posição: {field.order || index + 1})
                </p>

                {field.required && (
                  <span className="text-red-500 text-sm font-semibold">
                    Obrigatório
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {/* BOTÕES DE REORDENAÇÃO (HISTÓRIA #10) */}
              <button
                onClick={() => moverCampo(index, 'cima')}
                disabled={index === 0}
                title="Mover para cima"
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 transition-all"
              >
                🔼
              </button>
              
              <button
                onClick={() => moverCampo(index, 'baixo')}
                disabled={index === totalFields - 1}
                title="Mover para baixo"
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 transition-all"
              >
                🔽
              </button>
              {/* LINHA DE SEPARAÇÃO VISUAL */}
              <div className="w-[1px] bg-gray-200 mx-1"></div>

              {/* BOTÕES QUE JÁ TINHAS */}
              <button
                onClick={() => startEditing(field)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-all"
              >
                Editar
              </button>

              <button
                onClick={() => deleteField(field.id)}
                className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-all"
              >
                Remover
              </button>

            </div>

          </div>

          {/* CAMPO */}
          <div>
            {renderField(field)}
          </div>

        </>

      )}

    </div>

  );
};

export default FieldCard;