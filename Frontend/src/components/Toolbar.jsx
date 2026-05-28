import React from "react";

const Toolbar = ({ addField, FIELD_TYPES }) => {
  return (
    <div className="flex flex-wrap gap-3 mb-8">

      {/* Label */}
      <button
        onClick={() => addField(FIELD_TYPES.LABEL)}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        + Label
      </button>

      {/* Radio */}
      <button
        onClick={() => addField(FIELD_TYPES.RADIO)}
        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        + Radio
      </button>

      {/* Checkbox */}
      <button
        onClick={() => addField(FIELD_TYPES.CHECKBOX)}
        className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
      >
        + Checkbox
      </button>

      {/* Dropdown */}
      <button
        onClick={() => addField(FIELD_TYPES.DROPDOWN)}
        className="bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-semibold px-4 py-2 rounded-lg transition-all"
      >
        + Dropdown
      </button>

    </div>
  );
};

export default Toolbar;