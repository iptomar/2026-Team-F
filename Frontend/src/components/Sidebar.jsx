import React from "react";

const Sidebar = ({ addField, FIELD_TYPES }) => {
  const components = [
    {
      type: FIELD_TYPES.LABEL,
      icon: "📝",
      title: "Label",
      description: "Texto, título ou indicação visual",
      color: "blue",
    },
    {
      type: FIELD_TYPES.RADIO,
      icon: "🔘",
      title: "Radio Group",
      description: "Escolha única entre várias opções",
      color: "green",
    },
    {
      type: FIELD_TYPES.CHECKBOX,
      icon: "☑️",
      title: "Checkbox",
      description: "Confirmação ou seleção simples",
      color: "purple",
    },
    {
      type: FIELD_TYPES.DROPDOWN,
      icon: "🔽",
      title: "Dropdown",
      description: "Lista compacta de opções",
      color: "orange",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800",
    green: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800",
    purple: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800",
    orange: "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800",
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 p-5 shadow-sm min-h-screen">
      <div className="sticky top-24">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 mb-3">
            🧰 Editor
          </div>

          <h2 className="text-xl font-black text-slate-900">
            Componentes
          </h2>

          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Clique num componente para o adicionar ao formulário.
          </p>
        </div>

        <div className="space-y-3">
          {components.map((component) => (
            <button
              key={component.type}
              type="button"
              onClick={() => addField(component.type)}
              className={`group w-full border font-semibold p-4 rounded-2xl transition-all text-left hover:shadow-sm hover:-translate-y-0.5 ${colorClasses[component.color]}`}
            >
              <div className="flex items-start gap-3">
                <span className="h-10 w-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                  {component.icon}
                </span>

                <span className="flex-1">
                  <span className="block text-sm font-black">
                    {component.title}
                  </span>
                  <span className="block text-xs opacity-75 mt-0.5 leading-snug">
                    {component.description}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
            <span>💡</span>
            <span>Dica rápida</span>
          </h3>

          <p className="text-sm text-slate-500 leading-relaxed">
            Pode reordenar os campos arrastando os cartões no editor ou usando
            os botões de mover para cima/baixo.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;