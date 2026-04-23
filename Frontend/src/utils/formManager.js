export const generateUniqueId = () => {

  return `field_${crypto.randomUUID().split('-')[0]}`; 
};

export const createFieldTemplate = (type) => {
  const labelsDefault = {
    text: "Pergunta de Texto Curto",
    checkbox: "Opção de Seleção",
    dropdown: "Selecione uma opção"
  };

  return {
    id: generateUniqueId(),
    type: type,
    label: labelsDefault[type] || "Novo Campo",
    required: false,
    placeholder: "Escreva aqui...",
    options: (type === 'dropdown') ? ["Opção 1", "Opção 2"] : []
  };
};