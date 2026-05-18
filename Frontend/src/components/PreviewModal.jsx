import React, { useState } from 'react';
import { FormLabel, FormRadioGroup, FormCheckbox, FormDropdown } from './DynamicElements';

// 1. O modal DEVE receber o id real do formulário através das propriedades (props)
const PreviewModal = ({ isOpen, onClose, schema, formTemplateId }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({});
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const lidarComMudancaInput = (fieldId, valor) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: valor,
    }));
  };

  const lidarComSubmissao = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // Garante que se não vier nenhum ID nas props, usamos um fallback, 
    // mas idealmente deves passar um ID válido da BD no ecrã anterior!
    const idParaSubmeter = formTemplateId || "coloca-aqui-um-uuid-valido-da-tua-bd";

    const payload = {
      form_template_id: idParaSubmeter, // Mapeia exatamente para o teu Controller
      data: formData,                   // Envia o objeto (pode ser vazio {})
      submitted_by: 'Utilizador Teste'
    };

    try {
      const resposta = await fetch('http://localhost:3000/api/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // CORREÇÃO AQUI: Mudado de response.json() para resposta.json()
      const resultado = await resposta.json(); 

      if (resposta.status === 201) {
        // O teu controller responde com status 201 quando cria com sucesso!
        setSucesso('O formulário foi submetido bem-sucedido!');
        setFormData({}); 
      } else {
        // Se o backend der 404 ou 400, a mensagem de erro da BD vai aparecer aqui
        setErro(resultado.error || 'Erro ao submeter o formulário.');
      }
    } catch (err) {
      console.error('Erro na ligação ao servidor:', err);
      setErro('Não foi possível conectar ao servidor backend.');
    }
  };

  // ... (o resto do teu código renderField e return permanece igual)

  const renderField = (field) => {
    // Captura o valor atual no estado ou define um valor por defeito vazio
    const valorAtual = formData[field.id] || '';

    switch (field.type) {
      case 'label':
        return <FormLabel value={field.label} />;
      case 'radio':
        return (
          <FormRadioGroup 
            label={field.label} 
            options={field.options} 
            required={field.required} 
            isPreview={false} // Mudámos para false para o input reagir a cliques
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
            isPreview={false} // Mudámos para false para o input reagir a cliques
            checked={!!valorAtual}
            onChange={(e) => lidarComMudancaInput(field.id, e.target.checked)}
          />
        );
      case 'dropdown':
        return (
          <FormDropdown 
            label={field.label} 
            options={field.options} 
            required={field.required} 
            isPreview={false} // Mudámos para false para o input reagir a cliques
            value={valorAtual}
            onChange={(e) => lidarComMudancaInput(field.id, e.target.value)}
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
            <h2 className="text-2xl font-bold text-gray-800">Modo de Pré-visualização</h2>
            <p className="text-sm text-gray-500 mt-1">Visão do utilizador final.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
        </div>

        {/* Formulário que envolve os campos gerados */}
        <form onSubmit={lidarComSubmissao} className="flex flex-col flex-grow overflow-hidden">
          
          <div className="p-8 bg-gray-50 overflow-y-auto flex-grow">
            <div className="max-w-2xl mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
              
              {/* Critério 2: Notificações visuais de Sucesso ou Erro dentro do formulário */}
              {sucesso && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium text-center shadow-sm">
                  ✨ {sucesso}
                </div>
              )}
              {erro && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg font-medium text-center shadow-sm">
                  ⚠️ {erro}
                </div>
              )}

              {schema.length === 0 ? (
                <p className="text-center text-gray-400">Nenhum campo para mostrar.</p>
              ) : (
                schema.map(field => (
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
            
            {/* Botão de envio adicionado para concluir o processo de submissão */}
            {schema.length > 0 && (
              <button 
                type="submit" 
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md transition-colors"
              >
                Submeter Formulário
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default PreviewModal;