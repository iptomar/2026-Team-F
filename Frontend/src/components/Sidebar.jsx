import React from "react";
import {
  CheckSquare,
  ChevronDown,
  CircleDot,
  Info,
  MousePointer2,
  PanelLeftClose,
  PanelLeftOpen,
  TextCursor,
  Type,
} from "lucide-react";

const Sidebar = ({ addField, FIELD_TYPES, collapsed = false, onToggle }) => {
  const components = [
    {
      type: FIELD_TYPES.LABEL,
      icon: Type,
      title: "Label",
      description: "Texto, título ou indicação visual",
      color: "blue",
    },
    {
      type: FIELD_TYPES.RADIO,
      icon: CircleDot,
      title: "Radio Group",
      description: "Escolha única entre várias opções",
      color: "green",
    },
    {
      type: FIELD_TYPES.CHECKBOX,
      icon: CheckSquare,
      title: "Checkbox",
      description: "Confirmação ou seleção simples",
      color: "purple",
    },
    {
      type: FIELD_TYPES.DROPDOWN,
      icon: ChevronDown,
      title: "Dropdown",
      description: "Lista compacta de opções",
      color: "orange",
    },
    {
      type: FIELD_TYPES.TEXT,
      icon: TextCursor,
      title: "Campo de Texto",
      description: "Caixa de escrita para respostas livres",
      color: "yellow",
    },
  ];

  const colorClasses = {
    blue: {
      card: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800",
      icon: "bg-white text-blue-700",
      dock: "text-blue-700 hover:bg-blue-50 hover:border-blue-200",
    },
    green: {
      card: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800",
      icon: "bg-white text-emerald-700",
      dock: "text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200",
    },
    purple: {
      card: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800",
      icon: "bg-white text-purple-700",
      dock: "text-purple-700 hover:bg-purple-50 hover:border-purple-200",
    },
    orange: {
      card: "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-800",
      icon: "bg-white text-orange-700",
      dock: "text-orange-700 hover:bg-orange-50 hover:border-orange-200",
    },
    yellow: {
      card: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800",
      icon: "bg-white text-amber-700",
      dock: "text-amber-700 hover:bg-amber-50 hover:border-amber-200",
    },
  };

  const handleDragStart = (event, type) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-field-type", type);
  };

  if (collapsed) {
    return (
      <aside className="relative z-[80] w-20 bg-white border-r border-slate-200 shadow-sm h-full flex flex-col items-center py-4 gap-3 overflow-visible">
        <button
          type="button"
          onClick={onToggle}
          className="group relative h-11 w-11 rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-110 transition-all flex items-center justify-center"
          title="Mostrar painel de componentes"
        >
          <PanelLeftOpen size={20} />

          <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-4 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-white opacity-0 shadow-2xl transition group-hover:opacity-100 z-[9999]">
            Mostrar componentes
          </span>
        </button>

        <div className="w-10 border-t border-slate-200 my-1"></div>

        <div className="flex flex-col items-center gap-3 overflow-visible">
          {components.map((component) => {
            const Icon = component.icon;
            const colors = colorClasses[component.color];

            return (
              <button
                key={component.type}
                type="button"
                draggable
                onDragStart={(event) => handleDragStart(event, component.type)}
                onClick={() => addField(component.type)}
                className={`group relative h-12 w-12 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-125 hover:shadow-md overflow-visible ${colors.dock}`}
                title={component.title}
              >
                <Icon size={22} />

                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-4 w-max max-w-[240px] rounded-xl bg-slate-950 px-3 py-2 text-left text-xs font-semibold text-white opacity-0 shadow-2xl transition group-hover:opacity-100 z-[9999]">
                  <span className="block font-black">{component.title}</span>
                  <span className="block text-slate-300 font-medium mt-0.5">
                    {component.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="relative z-[80] w-72 bg-white border-r border-slate-200 shadow-sm h-full overflow-visible">
      <div className="h-full overflow-y-auto overflow-x-visible">
        <div className="sticky top-0 bg-white p-5">
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                <MousePointer2 size={14} />
                <span>Editor</span>
              </div>

              <button
                type="button"
                onClick={onToggle}
                className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition inline-flex items-center justify-center"
                title="Ocultar painel de componentes"
              >
                <PanelLeftClose size={17} />
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-900">
              Componentes
            </h2>

            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Clique para adicionar ou arraste um componente para a página.
            </p>
          </div>

          <div className="space-y-3 overflow-visible">
            {components.map((component) => {
              const Icon = component.icon;
              const colors = colorClasses[component.color];

              return (
                <button
                  key={component.type}
                  type="button"
                  draggable
                  onDragStart={(event) => handleDragStart(event, component.type)}
                  onClick={() => addField(component.type)}
                  className={`group relative w-full border font-semibold p-4 rounded-2xl transition-all text-left hover:shadow-sm hover:-translate-y-0.5 active:scale-[0.99] cursor-grab active:cursor-grabbing overflow-visible ${colors.card}`}
                  title={`${component.title}: ${component.description}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition ${colors.icon}`}>
                      <Icon size={20} />
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
              );
            })}
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
              <Info size={16} className="text-indigo-600" />
              <span>Dica rápida</span>
            </h3>

            <p className="text-sm text-slate-500 leading-relaxed">
              Arraste os componentes para a página para os adicionar ao formulário.
              O posicionamento livre com X/Y e redimensionamento fica para uma
              funcionalidade futura.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;