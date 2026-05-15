import React from "react";

const Sidebar = ({ addField, FIELD_TYPES }) => {

  return (

    <div className="w-72 bg-white border-r border-gray-200 p-5 shadow-sm min-h-screen">

      {/* ========================= */}
      {/* TÍTULO */}
      {/* ========================= */}
      <div className="mb-8">

        <h2 className="text-xl font-bold text-gray-800">
        
        </h2>

        <p className="text-sm text-gray-500 mt-1">
        
        </p>

      </div>


      {/* ========================= */}
      {/* BOTÕES */}
      {/* ========================= */}
      <div className="space-y-3">

        {/* LABEL */}
        <button
          onClick={() => addField(FIELD_TYPES.LABEL)}
          className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-semibold p-4 rounded-xl transition-all text-left"
        >
          📝 Label
        </button>


        {/* RADIO */}
        <button
          onClick={() => addField(FIELD_TYPES.RADIO)}
          className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-semibold p-4 rounded-xl transition-all text-left"
        >
          🔘 Radio Group
        </button>


        {/* CHECKBOX */}
        <button
          onClick={() => addField(FIELD_TYPES.CHECKBOX)}
          className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold p-4 rounded-xl transition-all text-left"
        >
          ☑️ Checkbox
        </button>

      </div>


      {/* ========================= */}
      {/* INFO */}
      {/* ========================= */}
      <div className="mt-10 p-4 bg-gray-50 rounded-xl border border-gray-200">

        <h3 className="font-semibold text-gray-700 mb-2">
        
        </h3>

        <p className="text-sm text-gray-500">
         
        </p>

      </div>

    </div>

  );

};

export default Sidebar;