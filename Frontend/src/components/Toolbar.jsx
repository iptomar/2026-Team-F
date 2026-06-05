import React from "react";
import {
  CheckSquare,
  ChevronDown,
  CircleDot,
  Plus,
  TextCursor,
  Type,
} from "lucide-react";

const Toolbar = ({ addField, FIELD_TYPES }) => {
  const actions = [
    {
      type: FIELD_TYPES.LABEL,
      icon: Type,
      label: "Label",
      className: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
    },
    {
      type: FIELD_TYPES.RADIO,
      icon: CircleDot,
      label: "Radio",
      className: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
    },
    {
      type: FIELD_TYPES.CHECKBOX,
      icon: CheckSquare,
      label: "Checkbox",
      className: "bg-purple-600 hover:bg-purple-700 text-white border-purple-600",
    },
    {
      type: FIELD_TYPES.DROPDOWN,
      icon: ChevronDown,
      label: "Dropdown",
      className: "bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200",
    },
    {
      type: FIELD_TYPES.TEXT,
      icon: TextCursor,
      label: "Campo de Texto",
      className: "bg-amber-600 hover:bg-amber-700 text-white border-amber-600",
    },
  ];

  return (
    <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800">
            Inserção rápida
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Adicione campos comuns ou arraste componentes da barra lateral.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.type}
                type="button"
                onClick={() => addField(action.type)}
                title={`Adicionar ${action.label}`}
                className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all font-bold text-sm hover:-translate-y-0.5 hover:shadow-sm ${action.className}`}
              >
                <Plus size={15} />
                <Icon size={16} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;