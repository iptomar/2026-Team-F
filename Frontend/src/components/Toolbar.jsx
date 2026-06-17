import React from "react";

const Toolbar = ({ addField, FIELD_TYPES }) => {
  const campos = [
    { type: FIELD_TYPES.LABEL,    label: '+ Label',      cls: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { type: FIELD_TYPES.RADIO,    label: '+ Radio',      cls: 'bg-green-600 hover:bg-green-700 text-white' },
    { type: FIELD_TYPES.CHECKBOX, label: '+ Checkbox',   cls: 'bg-purple-600 hover:bg-purple-700 text-white' },
    { type: FIELD_TYPES.DROPDOWN, label: '+ Dropdown',   cls: 'bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700' },
    { type: FIELD_TYPES.TEXT,     label: '+ Texto',      cls: 'bg-sky-600 hover:bg-sky-700 text-white' },
    { type: FIELD_TYPES.TEXTAREA, label: '+ Texto Longo',cls: 'bg-teal-600 hover:bg-teal-700 text-white' },
    { type: FIELD_TYPES.NUMBER,   label: '+ Número',     cls: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    { type: FIELD_TYPES.EMAIL,    label: '+ Email',      cls: 'bg-pink-600 hover:bg-pink-700 text-white' },
    { type: FIELD_TYPES.DATE,     label: '+ Data',       cls: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {campos.map(({ type, label, cls }) => (
        <button
          key={type}
          onClick={() => addField(type)}
          className={`px-4 py-2 rounded-lg transition text-sm font-semibold ${cls}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
