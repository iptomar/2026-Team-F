import React from 'react';
import { AlertCircle } from 'lucide-react';

const FieldWrapper = ({ label, required, children, error }) => (
  <div className="flex flex-col p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-200 hover:shadow-sm transition-all">
    <div className="flex items-center justify-between gap-3 mb-3">
      <label className="text-sm font-black text-slate-700 tracking-wide">
        {label || 'Campo sem nome'}{' '}
        {required && <span className="text-red-500">*</span>}
      </label>

      {required && (
        <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 text-[11px] font-bold">
          Obrigatório
        </span>
      )}
    </div>

    {children}

    {error && (
      <p className="mt-2 text-xs text-red-500 font-semibold inline-flex items-center gap-1.5">
        <AlertCircle size={14} />
        <span>{error}</span>
      </p>
    )}
  </div>
);

export const FormLabel = ({ value, description }) => (
  <div className="p-5 border border-blue-100 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white rounded-2xl">
    <h3 className="text-xl font-black text-blue-950">
      {value || 'Título da Secção'}
    </h3>

    {description && (
      <p className="text-sm text-blue-700 mt-1 leading-relaxed">
        {description}
      </p>
    )}
  </div>
);

export const FormRadioGroup = ({
  label,
  options = [],
  required,
  error,
  isPreview = false,
  value = '',
  onChange,
}) => (
  <FieldWrapper label={label} required={required} error={error}>
    <div className="space-y-2">
      {options.length > 0 ? (
        options.map((opt, index) => {
          const checked = value === opt;

          return (
            <label
              key={index}
              className={`flex items-center p-3 border rounded-xl transition-all ${isPreview
                  ? 'cursor-pointer hover:bg-indigo-50 hover:border-indigo-200'
                  : 'cursor-not-allowed opacity-80'
                } ${checked
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'bg-white border-slate-200'
                }`}
            >
              <input
                type="radio"
                name={label}
                value={opt}
                checked={checked}
                onChange={() => onChange?.(opt)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                disabled={!isPreview}
              />
              <span className="ml-3 text-sm font-medium text-slate-700">
                {opt}
              </span>
            </label>
          );
        })
      ) : (
        <p className="text-xs italic text-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-3">
          Nenhuma opção configurada.
        </p>
      )}
    </div>
  </FieldWrapper>
);

export const FormCheckbox = ({
  label,
  options = [],
  required,
  error,
  isPreview = false,
  value,
  onChange,
}) => {
  const currentValue = Array.isArray(value) ? value : [];

  const handleToggle = (opt) => {
    if (!onChange) return;

    const copy = [...currentValue];
    const index = copy.indexOf(opt);

    if (index !== -1) {
      copy.splice(index, 1);
    } else {
      copy.push(opt);
    }

    onChange(copy);
  };

  return (
    <FieldWrapper label={label} required={required} error={error}>
      <div className="space-y-2">
        {options.length > 0 ? (
          options.map((opt, index) => {
            const checked = currentValue.includes(opt);

            return (
              <label
                key={index}
                className={`flex items-center p-3 border rounded-xl transition-all ${isPreview
                    ? 'cursor-pointer hover:bg-emerald-50 hover:border-emerald-200'
                    : 'cursor-not-allowed opacity-80'
                  } ${checked
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-white border-slate-200'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggle(opt)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  disabled={!isPreview}
                />
                <span className="ml-3 text-sm font-medium text-slate-700">
                  {opt}
                </span>
              </label>
            );
          })
        ) : (
          <p className="text-xs italic text-slate-400 bg-slate-50 border border-slate-200 rounded-xl p-3">
            Nenhuma opção configurada.
          </p>
        )}
      </div>
    </FieldWrapper>
  );
};

export const FormDropdown = ({
  label,
  options = [],
  required,
  error,
  isPreview = false,
  value = '',
  onChange,
}) => (
  <FieldWrapper label={label} required={required} error={error}>
    <select
      value={value || ''}
      onChange={onChange}
      className={`w-full p-3 border rounded-xl bg-white text-sm font-medium text-slate-700 transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
        isPreview ? 'cursor-pointer hover:border-slate-300' : 'cursor-not-allowed opacity-80'
      }`}
      disabled={!isPreview}
    >
      <option value="">Selecione uma opção...</option>
      {options.length > 0 ? (
        options.map((opt, index) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))
      ) : (
        <option value="" disabled>
          Nenhuma opção configurada
        </option>
      )}
    </select>
  </FieldWrapper>
);

// ======================================================
// 5. CAMPO DE TEXTO PERSONALIZADO (CAIXA DE ESCRITA)
// ======================================================
export const FormTextInput = ({
  label,
  required,
  error,
  isPreview = false,
  value = '',
  onChange,
  placeholder = 'Digite aqui a sua resposta...'
}) => (
  <FieldWrapper label={label} required={required} error={error}>
    <input
      type="text"
      value={value || ''}
      // Correção aplicada de forma cirúrgica para extrair o valor da string digitada
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full p-3 border rounded-xl bg-white text-sm font-medium text-slate-700 transition-all outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
        isPreview ? 'hover:border-slate-300' : 'cursor-not-allowed opacity-80'
      }`}
      disabled={!isPreview}
    />
  </FieldWrapper>
);