import React from "react";

const Sidebar = ({ addField, FIELD_TYPES }) => {
  const campos = [
    { type: FIELD_TYPES.LABEL,    emoji: '📝', label: 'Label',     cls: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700' },
    { type: FIELD_TYPES.RADIO,    emoji: '🔘', label: 'Radio',     cls: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' },
    { type: FIELD_TYPES.CHECKBOX, emoji: '☑️', label: 'Checkbox',  cls: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700' },
    { type: FIELD_TYPES.DROPDOWN, emoji: '🔽', label: 'Dropdown',  cls: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700' },
    { type: FIELD_TYPES.TEXT,     emoji: '✏️', label: 'Texto',     cls: 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700' },
    { type: FIELD_TYPES.TEXTAREA, emoji: '📄', label: 'Texto Longo', cls: 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700' },
    { type: FIELD_TYPES.NUMBER,   emoji: '🔢', label: 'Número',    cls: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700' },
    { type: FIELD_TYPES.EMAIL,    emoji: '📧', label: 'Email',     cls: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700' },
    { type: FIELD_TYPES.DATE,     emoji: '📅', label: 'Data',      cls: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700' },
  ];

  return (
    <div className="w-72 bg-white border-r border-gray-200 p-5 shadow-sm min-h-screen">
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-800">Campos</h2>
        <p className="text-xs text-gray-400 mt-1">Clica para adicionar ao formulário</p>
      </div>

      <div className="space-y-2">
        {campos.map(({ type, emoji, label, cls }) => (
          <button
            key={type}
            onClick={() => addField(type)}
            className={`w-full border font-semibold p-3 rounded-xl transition-all text-left text-sm ${cls}`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
