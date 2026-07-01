import { AppDataSource } from "../config/database";
import { PresetTemplate } from "../models/PresetTemplate";

const PRESETS = [
  {
    name: "Formulário de Contacto",
    description: "Modelo básico ideal para recolha de dados de contacto e triagem inicial de assuntos gerais.",
    categoria: "Geral",
    complexidade: "Simples",
    fields: [
      { type: "label", label: "Nome Completo", required: true, options: [], order: 1 },
      { type: "label", label: "E-mail para Contacto", required: true, options: [], order: 2 },
      { type: "dropdown", label: "Assunto Principal", required: false, options: ["Suporte Técnico", "Sugestão", "Comercial"], order: 3 }
    ]
  },
  {
    name: "Inquérito de Satisfação",
    description: "Avalie a experiência do utilizador e obtenha feedback direto sobre os seus serviços ou produtos.",
    categoria: "Geral",
    complexidade: "Simples",
    fields: [
      { type: "radio", label: "Como classifica a qualidade do nosso atendimento?", required: true, options: ["Excelente", "Bom", "Satisfatório", "Fraco"], order: 1 },
      { type: "checkbox", label: "Recomendaria a nossa plataforma a outras pessoas?", required: false, options: [], order: 2 }
    ]
  },
  {
    name: "Inscrição de Aluno e Matrícula",
    description: "Formulário extenso para recolha de dados biográficos, encarregados de educação e opções curriculares.",
    categoria: "Educação",
    complexidade: "Extenso",
    fields: [
      { type: "label", label: "Nome Completo do Aluno", required: true, options: [], order: 1 },
      { type: "label", label: "Data de Nascimento", required: true, options: [], order: 2 },
      { type: "dropdown", label: "Ano de Escolaridade a Matricular", required: true, options: ["1º Ano", "2º Ano", "3º Ano", "4º Ano"], order: 3 },
      { type: "label", label: "Nome do Encarregado de Educação", required: true, options: [], order: 4 },
      { type: "checkbox", label: "Necessita de Transporte Escolar Municipal?", required: false, options: [], order: 5 }
    ]
  },
  {
    name: "Ficha de Triagem Clínica",
    description: "Recolha inicial de sintomas, antecedentes médicos e sinais vitais para triagem em ambiente de saúde.",
    categoria: "Saúde",
    complexidade: "Extenso",
    fields: [
      { type: "label", label: "Número de Utente do SNS", required: true, options: [], order: 1 },
      { type: "dropdown", label: "Sintoma Principal Apresentado", required: true, options: ["Dor de Cabeça Forte", "Sintomas Respiratórios", "Dor Abdominal", "Traumatismo / Queda"], order: 2 },
      { type: "radio", label: "Apresenta febre medida superior a 38°C?", required: true, options: ["Sim", "Não"], order: 3 },
      { type: "checkbox", label: "Possui alergias conhecidas a medicamentos?", required: false, options: [], order: 4 }
    ]
  },
  {
    name: "Admissão e Registo de Utente",
    description: "Processo completo de registo de novos residentes, contactos de emergência e rotinas diárias de apoio.",
    categoria: "Lares",
    complexidade: "Extenso",
    fields: [
      { type: "label", label: "Nome do Residente Utente", required: true, options: [], order: 1 },
      { type: "label", label: "Contacto Direto de Emergência Familiar", required: true, options: [], order: 2 },
      { type: "dropdown", label: "Grau de Autonomia Estimado", required: true, options: ["Totalmente Autónomo", "Dependência Ligeira", "Dependência Reduzida / Cadeira de Rodas", "Dependência Total Bedridden"], order: 3 },
      { type: "checkbox", label: "Requer Acompanhamento na Toma de Medicação Diária?", required: false, options: [], order: 4 }
    ]
  },
  {
    name: "Participação Geral de Ocorrência",
    description: "Registo formal de incidentes, identificação de testemunhas e detalhe cronológico para forças de segurança.",
    categoria: "Polícia",
    complexidade: "Extenso",
    fields: [
      { type: "label", label: "Data e Hora Exata do Incidente", required: true, options: [], order: 1 },
      { type: "label", label: "Localização ou Morada da Ocorrência", required: true, options: [], order: 2 },
      { type: "dropdown", label: "Tipologia de Incidente", required: true, options: ["Furto / Roubo", "Danos Materiais", "Poluição / Ruído", "Outros"], order: 3 },
      { type: "checkbox", label: "Existem testemunhas identificadas no local?", required: false, options: [], order: 4 }
    ]
  },
  {
    name: "Relatório de Socorro e Emergência",
    description: "Ficha rápida de controlo operacional para saída de viaturas e registo sumário de intervenções.",
    categoria: "Bombeiros",
    complexidade: "Simples",
    fields: [
      { type: "label", label: "Número de Matrícula Operacional (Viatura)", required: true, options: [], order: 1 },
      { type: "dropdown", label: "Natureza da Saída de Emergência", required: true, options: ["Incêndio Urbano", "Incêndio Florestal", "Acidente Rodoviário", "Inundação / Intempérie"], order: 2 },
      { type: "radio", label: "Foi necessário o transporte de vítimas para unidade hospitalar?", required: true, options: ["Sim", "Não"], order: 3 }
    ]
  },
  {
    name: "Avaliação Trimestral de Desempenho",
    description: "Métrica corporativa para autoavaliação de equipas, cumprimento de objetivos e definição de metas futuras.",
    categoria: "Empresas",
    complexidade: "Extenso",
    fields: [
      { type: "dropdown", label: "Departamento / Setor de Trabalho", required: true, options: ["Desenvolvimento", "Marketing", "Vendas", "Recursos Humanos"], order: 1 },
      { type: "radio", label: "Nível de cumprimento dos objetivos traçados para este trimestre", required: true, options: ["Superou as metas", "Cumpriu a 100%", "Cumpriu parcialmente", "Não atingiu"], order: 2 },
      { type: "checkbox", label: "Identifica necessidade de formação técnica específica para o próximo trimestre?", required: false, options: [], order: 3 }
    ]
  }
];

export async function seedPresets() {
  const repo = AppDataSource.getRepository(PresetTemplate);
  for (const preset of PRESETS) {
    const exists = await repo.findOne({ where: { name: preset.name } });
    if (!exists) {
      await repo.save(repo.create(preset));
      console.log(`✅ Preset criado: ${preset.name}`);
    }
  }
  console.log("✅ Seed de presets concluído.");
}
