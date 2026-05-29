import React, { useState } from 'react';
import {
  FormLabel,
  FormRadioGroup,
  FormCheckbox,
  FormDropdown,
} from './DynamicElements';

const PreviewModal = ({ isOpen, onClose, schema = [], formTemplateId }) => {
  const [formData, setFormData] = useState({});
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const lidarComMudancaInput = (fieldId, valor) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: valor,
    }));

    setErro('');
    setSucesso('');
  };

  const validarCamposObrigatorios = () => {
    const camposObrigatorios = schema.filter((field) => field.required);

    for (const field of camposObrigatorios) {
      if (field.type === 'label') {
        continue;
      }

      const valor = formData[field.id];

      if (
        valor === undefined ||
        valor === null ||
        valor === '' ||
        valor === false
      ) {
        return `O campo "${field.label}" é obrigatório.`;
      }
    }

    return null;
  };

  const lidarComSubmissao = async (event) => {
    event.preventDefault();

    setErro('');
    setSucesso('');

    if (!formTemplateId) {
      setErro(
        'Antes de submeter, guarde ou publique o formulário para que exista um ID válido na base de dados.'
      );
      return;
    }

    const erroValidacao = validarCamposObrigatorios();

    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    const payload = {
      form_template_id: formTemplateId,
      data: formData,
      submitted_by: 'Utilizador Teste',
    };

    try {
      setIsSubmitting(true);

      const resposta = await fetch('http://localhost:3000/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resultado = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        setErro(
          resultado?.error ||
            'Erro ao submeter o formulário. Confirme se o backend está ativo.'
        );
        return;
      }

      setSucesso('O formulário foi submetido com sucesso.');
      setFormData({});
    } catch (err) {
      console.error('Erro na ligação ao servidor:', err);
      setErro('Não foi possível conectar ao servidor backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field) => {
    const valorAtual = formData[field.id] ?? '';

    switch (field.type) {
      case 'label':
        return <FormLabel value={field.label} />;

      case 'radio':
        return (
          <FormRadioGroup
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(valor) => lidarComMudancaInput(field.id, valor)}
          />
        );

      case 'checkbox':
        return (
          <FormCheckbox
            label={field.label}
            description={field.label}
            required={field.required}
            isPreview={true}
            checked={Boolean(valorAtual)}
            onChange={(event) =>
              lidarComMudancaInput(field.id, event.target.checked)
            }
          />
        );

      case 'dropdown':
        return (
          <FormDropdown
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={true}
            value={valorAtual}
            onChange={(event) =>
              lidarComMudancaInput(field.id, event.target.value)
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Modo de Pré-visualização
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Visão do utilizador final.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-2xl"
            type="button"
          >
            &times;
          </button>
        </div>

        <form
          onSubmit={lidarComSubmissao}
          className="flex flex-col flex-grow overflow-hidden"
        >
          <div className="p-8 bg-gray-50 overflow-y-auto flex-grow">
            <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
              {sucesso && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium text-center shadow-sm">
                  {sucesso}
                </div>
              )}

              {erro && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium text-center shadow-sm">
                  {erro}
                </div>
              )}

              {schema.length === 0 ? (
                <p className="text-center text-gray-400">
                  Nenhum campo para mostrar.
                </p>
              ) : (
                schema.map((field) => (
                  <div key={field.id} className="mb-6">
                    {renderField(field)}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Voltar à Edição
            </button>

            {schema.length > 0 && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'A submeter...' : 'Submeter Formulário'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreviewModal;