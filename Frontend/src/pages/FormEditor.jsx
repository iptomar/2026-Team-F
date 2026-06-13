// ======================================================
// FRONTEND/src/pages/FormEditor.jsx
// Página principal do editor de formulários
// ======================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Grid3X3,
  Loader2,
  Minus,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Rocket,
  Save,
  Settings2,
  Trash2,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

// ======================================================
// COMPONENTES DINÂMICOS
// ======================================================
import {
  FormLabel,
  FormRadioGroup,
  FormCheckbox,
  FormDropdown,
  FormTextInput
} from '../components/DynamicElements';

// ======================================================
// COMPONENTES DO SISTEMA
// ======================================================
import PreviewModal from '../components/PreviewModal';
import FieldCard from '../components/FieldCard';
import Sidebar from '../components/Sidebar';

// ======================================================
// TIPOS DE CAMPOS DISPONÍVEIS
// ======================================================
const FIELD_TYPES = {
  LABEL: 'label',
  RADIO: 'radio',
  CHECKBOX: 'checkbox',
  DROPDOWN: 'dropdown',
  TEXT: 'text',
};

// ======================================================
// CONSTANTES DE GRELHA — SNAP TO GRID (#119)
// ======================================================
const GRID_SIZE = 10;
const MAJOR_GRID_SIZE = GRID_SIZE * 5;
const PAGE_GAP = 56;
const MIN_FIELD_WIDTH = 100;
const MIN_FIELD_HEIGHT = 60;
const DEFAULT_PAGE_NUMBER = 1;

const PAGE_SIZES = {
  A4: {
    label: 'A4',
    width: 794,
    height: 1123,
  },
  A3: {
    label: 'A3',
    width: 1123,
    height: 1588,
  },
  Letter: {
    label: 'Letter',
    width: 816,
    height: 1056,
  },
};

const ORIENTATIONS = {
  portrait: 'Vertical',
  landscape: 'Horizontal',
};

const getFieldPage = (field) => {
  if (
    field &&
    typeof field.page === 'number' &&
    Number.isInteger(field.page) &&
    field.page >= 1
  ) {
    return field.page;
  }

  return DEFAULT_PAGE_NUMBER;
};

const getMaxPageFromFields = (fieldsToCheck) => {
  if (!Array.isArray(fieldsToCheck) || fieldsToCheck.length === 0) {
    return DEFAULT_PAGE_NUMBER;
  }

  return Math.max(
    DEFAULT_PAGE_NUMBER,
    ...fieldsToCheck.map((field) => getFieldPage(field))
  );
};

const LOCAL_DRAFT_PREFIX = 'form-editor-autosave';
const LOCAL_DRAFT_SCHEMA_VERSION = 1;

const clampZoom = (value) => Math.min(200, Math.max(0, value));

const getLocalDraftKey = (formIdentifier) => {
  return `${LOCAL_DRAFT_PREFIX}:${formIdentifier || 'new'}`;
};

const safeParseLocalDraft = (rawValue) => {
  try {
    const parsed = JSON.parse(rawValue);

    if (!parsed || parsed.schemaVersion !== LOCAL_DRAFT_SCHEMA_VERSION) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Erro ao ler rascunho local:', error);
    return null;
  }
};

const readLocalDraft = (formIdentifier) => {
  const rawDraft = localStorage.getItem(getLocalDraftKey(formIdentifier));
  return rawDraft ? safeParseLocalDraft(rawDraft) : null;
};

const removeLocalDraft = (formIdentifier) => {
  localStorage.removeItem(getLocalDraftKey(formIdentifier));
};

const isMeaningfulLocalDraft = (draft) => {
  if (!draft) {
    return false;
  }

  if (draft.currentFormId) {
    return true;
  }

  if (Array.isArray(draft.fields) && draft.fields.length > 0) {
    return true;
  }

  if (
    typeof draft.formName === 'string' &&
    draft.formName.trim().length > 0 &&
    draft.formName.trim() !== 'Meu Formulário'
  ) {
    return true;
  }

  if (
    typeof draft.formDescription === 'string' &&
    draft.formDescription.trim().length > 0
  ) {
    return true;
  }

  return false;
};

const formatAutosaveDate = (isoDate) => {
  if (!isoDate) {
    return 'data desconhecida';
  }

  try {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoDate));
  } catch {
    return 'data desconhecida';
  }
};

const fieldTypeUsesOptions = (type) => {
  return type === FIELD_TYPES.RADIO || type === FIELD_TYPES.DROPDOWN;
};

const normalizeFieldForDatabase = (field, index) => {
  const normalizedField = {
    ...field,
    id: typeof field.id === 'string' && field.id.trim().length > 0
      ? field.id
      : crypto.randomUUID(),
    label: typeof field.label === 'string' && field.label.trim().length > 0
      ? field.label
      : `Novo campo de ${field.type || 'campo'}`,
    required: Boolean(field.required),
    order: typeof field.order === 'number' ? field.order : index + 1,
    page: getFieldPage(field),
  };

  if (fieldTypeUsesOptions(normalizedField.type)) {
    normalizedField.options = Array.isArray(field.options)
      ? field.options
          .filter((option) => option !== undefined && option !== null)
          .map((option) => String(option).trim())
          .filter((option) => option.length > 0)
      : [];
  } else {
    delete normalizedField.options;
  }

  if (Array.isArray(field.fields)) {
    normalizedField.fields = field.fields.map((childField, childIndex) =>
      normalizeFieldForDatabase(childField, childIndex)
    );
  }

  return normalizedField;
};

const normalizeFieldsForDatabase = (fieldsToNormalize) => {
  if (!Array.isArray(fieldsToNormalize)) {
    return [];
  }

  return fieldsToNormalize.map((field, index) =>
    normalizeFieldForDatabase(field, index)
  );
};

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================
const FormEditor = ({ formId, onGoHome }) => {
  const canvasViewportRef = useRef(null);

  const [currentFormId, setCurrentFormId] = useState(formId || null);
  const [formName, setFormName] = useState('Meu Formulário');
  const [formDescription, setFormDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ======================================================
  // SELEÇÃO NO CANVAS ABSOLUTO (#128)
  // ======================================================
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Melhorias visuais/UX sem alteração de schema/backend
  const [showGrid, setShowGrid] = useState(false);
  const [toast, setToast] = useState(null);
  const [pageFormat, setPageFormat] = useState('A4');
  const [pageOrientation, setPageOrientation] = useState('portrait');
  const [zoom, setZoom] = useState(100);
  const [pageCount, setPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCanvasDragOver, setIsCanvasDragOver] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isConfigPanelCollapsed, setIsConfigPanelCollapsed] = useState(false);

  // Autosave local
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(false);
  const [hasUserEdited, setHasUserEdited] = useState(false);
  const [availableLocalDraft, setAvailableLocalDraft] = useState(null);
  const [lastAutosavedAt, setLastAutosavedAt] = useState(null);
  const [isClearFormConfirmOpen, setIsClearFormConfirmOpen] = useState(false);

  // Menus embebidos no controlo inferior da página
  const [isPageFormatMenuOpen, setIsPageFormatMenuOpen] = useState(false);
  const [isOrientationMenuOpen, setIsOrientationMenuOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const markUserEdited = () => {
    setHasUserEdited(true);
  };

  const buildLocalDraftPayload = () => {
    return {
      schemaVersion: LOCAL_DRAFT_SCHEMA_VERSION,
      currentFormId,
      formName,
      formDescription,
      fields,
      pageFormat,
      pageOrientation,
      pageCount,
      currentPage,
      zoom,
      showGrid,
      updatedAt: new Date().toISOString(),
    };
  };

  const saveLocalDraftNow = () => {
    const payload = buildLocalDraftPayload();

    if (!hasUserEdited || !isMeaningfulLocalDraft(payload)) {
      return;
    }

    const autosaveKeyId = currentFormId || formId || null;
    localStorage.setItem(getLocalDraftKey(autosaveKeyId), JSON.stringify(payload));
    setLastAutosavedAt(payload.updatedAt);
  };

  const handleFormNameChange = (value) => {
    markUserEdited();
    setFormName(value);
  };

  const handleFormDescriptionChange = (value) => {
    markUserEdited();
    setFormDescription(value);
  };

  const handleZoomChange = (value) => {
    markUserEdited();
    setZoom(clampZoom(value));
  };

  const handlePageFormatChange = (value) => {
    markUserEdited();
    setPageFormat(value);
  };

  const handlePageOrientationChange = (value) => {
    markUserEdited();
    setPageOrientation(value);
  };

  const handleShowGridChange = () => {
    markUserEdited();
    setShowGrid((previous) => !previous);
  };

  const handleSelectPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedFieldId(null);
    setEditingId(null);
    setEditData({});
  };

  const handleAddPage = () => {
    markUserEdited();

    setPageCount((previousPageCount) => {
      const nextPageCount = previousPageCount + 1;
      setCurrentPage(nextPageCount);
      return nextPageCount;
    });

    setSelectedFieldId(null);
    setEditingId(null);
    setEditData({});
    showToast('Nova página adicionada ao formulário.', 'success');
  };

  const handleRemoveCurrentPage = () => {
    const hasFieldsOnCurrentPage = fields.some(
      (field) => getFieldPage(field) === currentPage
    );

    if (pageCount <= 1) {
      showToast('O formulário deve ter pelo menos uma página.', 'error');
      return;
    }

    if (hasFieldsOnCurrentPage) {
      showToast('Só é possível remover páginas vazias.', 'error');
      return;
    }

    markUserEdited();

    setFields((previousFields) =>
      previousFields.map((field) => {
        const fieldPage = getFieldPage(field);

        if (fieldPage > currentPage) {
          return {
            ...field,
            page: fieldPage - 1,
          };
        }

        return field;
      })
    );

    setPageCount((previousPageCount) => Math.max(1, previousPageCount - 1));
    setCurrentPage((previousCurrentPage) =>
      Math.max(1, Math.min(previousCurrentPage, pageCount - 1))
    );

    setSelectedFieldId(null);
    setEditingId(null);
    setEditData({});
    showToast('Página removida com sucesso.', 'info');
  };

  const handleGoHomeWithAutosave = () => {
    saveLocalDraftNow();

    if (onGoHome) {
      onGoHome();
    }
  };

  const applyLocalDraft = (draft) => {
    if (!draft) {
      return;
    }

    setCurrentFormId(draft.currentFormId || formId || null);
    setFormName(draft.formName || 'Meu Formulário');
    setFormDescription(draft.formDescription || '');
    setPageFormat(draft.pageFormat || 'A4');
    setPageOrientation(draft.pageOrientation || 'portrait');
    const draftFields = Array.isArray(draft.fields) ? draft.fields : [];
    setFields(draftFields);
    const draftPageCount = Math.max(
      1,
      typeof draft.pageCount === 'number' ? draft.pageCount : 1,
      getMaxPageFromFields(draftFields)
    );

    setPageCount(draftPageCount);
    setCurrentPage(
      typeof draft.currentPage === 'number'
        ? Math.min(Math.max(1, draft.currentPage), draftPageCount)
        : 1
    );
    setZoom(typeof draft.zoom === 'number' ? clampZoom(draft.zoom) : 100);
    setShowGrid(Boolean(draft.showGrid));
    setAvailableLocalDraft(null);
    setHasUserEdited(true);
    setIsAutosaveEnabled(true);
    setLastAutosavedAt(draft.updatedAt || null);

    showToast('Rascunho local recuperado com sucesso.', 'success');
  };

  const discardLocalDraft = () => {
    const localDraftId = availableLocalDraft?.currentFormId || formId || null;

    removeLocalDraft(localDraftId);

    if (!localDraftId) {
      removeLocalDraft(null);
    }

    setAvailableLocalDraft(null);
    setHasUserEdited(false);
    setIsAutosaveEnabled(true);
    showToast('Rascunho local descartado.', 'info');
  };

  // ======================================================
  // CTRL + SCROLL APENAS NO PAINEL DA PÁGINA
  // ======================================================
  useEffect(() => {
    const canvasViewport = canvasViewportRef.current;

    if (!canvasViewport) {
      return undefined;
    }

    const handleNativeWheel = (event) => {
      if (!event.ctrlKey) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const direction = event.deltaY < 0 ? 5 : -5;

      setHasUserEdited(true);
      setZoom((previous) => clampZoom(previous + direction));
    };

    canvasViewport.addEventListener('wheel', handleNativeWheel, {
      passive: false,
    });

    return () => {
      canvasViewport.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  // ======================================================
  // CARREGAR FORMULÁRIO EXISTENTE OU RASCUNHO LOCAL
  // ======================================================
  useEffect(() => {
    const prepareNewForm = () => {
      setCurrentFormId(null);
      setFormName('Meu Formulário');
      setFormDescription('');
      setFields([]);
      setPageFormat('A4');
      setPageOrientation('portrait');
      setZoom(100);
      setShowGrid(false);
      setPageCount(1);
      setCurrentPage(1);
      setHasUserEdited(false);

      const localDraft = readLocalDraft(null);

      if (isMeaningfulLocalDraft(localDraft)) {
        setAvailableLocalDraft(localDraft);
        setIsAutosaveEnabled(false);
      } else {
        setIsAutosaveEnabled(true);
      }
    };

    const loadFormData = async () => {
      try {
        setIsLoading(true);
        setIsAutosaveEnabled(false);

        const response = await fetch(`http://localhost:3000/form-templates/${formId}`);

        if (!response.ok) {
          throw new Error(`Erro ao carregar formulário: ${response.statusText}`);
        }

        const formData = await response.json();
        setCurrentFormId(formData.id);
        setFormName(formData.name);
        setFormDescription(formData.description || '');

        const camposOrdenados = formData.fields || [];
        camposOrdenados.sort((a, b) => (a.order || 0) - (b.order || 0));
        setFields(camposOrdenados);

        const detectedPageCount = getMaxPageFromFields(camposOrdenados);
        setPageCount(detectedPageCount);
        setCurrentPage(1);

        setPageFormat('A4');
        setPageOrientation('portrait');
        setZoom(100);
        setShowGrid(false);
        setHasUserEdited(false);

        const localDraft = readLocalDraft(formData.id);

        if (isMeaningfulLocalDraft(localDraft)) {
          setAvailableLocalDraft(localDraft);
          setIsAutosaveEnabled(false);
        } else {
          setIsAutosaveEnabled(true);
        }
      } catch (error) {
        console.error('Erro ao carregar formulário:', error);
        showToast(`Erro ao carregar rascunho: ${error.message}`, 'error');
        setIsAutosaveEnabled(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (formId) {
      loadFormData();
    } else {
      prepareNewForm();
    }
  }, [formId]);

  // ======================================================
  // AUTOSAVE LOCAL COM DEBOUNCE
  // ======================================================
  useEffect(() => {
    if (!isAutosaveEnabled || !hasUserEdited) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      const payload = buildLocalDraftPayload();

      if (!isMeaningfulLocalDraft(payload)) {
        return;
      }

      const autosaveKeyId = currentFormId || formId || null;
      localStorage.setItem(getLocalDraftKey(autosaveKeyId), JSON.stringify(payload));
      setLastAutosavedAt(payload.updatedAt);
    }, 700);

    return () => clearTimeout(timeoutId);
  }, [
    isAutosaveEnabled,
    hasUserEdited,
    currentFormId,
    formId,
    formName,
    formDescription,
    fields,
    pageFormat,
    pageCount,
    currentPage,
    pageOrientation,
    zoom,
    showGrid,
  ]);

  // ======================================================
  // GUARDA ANTES DE REFRESH/FECHAR SE EXISTIREM ALTERAÇÕES
  // ======================================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveLocalDraftNow();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    hasUserEdited,
    currentFormId,
    formId,
    formName,
    formDescription,
    fields,
    pageFormat,
    pageOrientation,
    pageCount,
    currentPage,
    zoom,
    showGrid,
  ]);

  // ======================================================
  // REORDENAR CAMPO
  // ======================================================
  const moverCampo = async (index, direcao) => {
    const novosCampos = [...fields];
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1;

    if (novoIndex < 0 || novoIndex >= novosCampos.length) return;

    const temp = novosCampos[index];
    novosCampos[index] = novosCampos[novoIndex];
    novosCampos[novoIndex] = temp;

    const camposMapeados = novosCampos.map((campo, idx) => ({
      ...campo,
      order: idx + 1,
    }));

    markUserEdited();
    setFields(camposMapeados);

    if (currentFormId) {
      try {
        const payload = {
          name: formName,
          description: formDescription,
          fields: camposMapeados,
        };

        await fetch(`http://localhost:3000/form-templates/${currentFormId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('Erro ao sincronizar ordenação com o servidor:', error);
      }
    }
  };

  // ======================================================
  // REORDENAR POR DRAG & DROP
  // ======================================================
  const reordenarCamposArrastados = async (draggedIndex, targetIndex) => {
    if (draggedIndex === targetIndex) return;
    if (Number.isNaN(draggedIndex) || Number.isNaN(targetIndex)) return;

    const novosCampos = [...fields];
    const [campoMovido] = novosCampos.splice(draggedIndex, 1);
    novosCampos.splice(targetIndex, 0, campoMovido);

    const camposMapeados = novosCampos.map((campo, idx) => ({
      ...campo,
      order: idx + 1,
    }));

    markUserEdited();
    setFields(camposMapeados);

    if (currentFormId) {
      try {
        const payload = {
          name: formName,
          description: formDescription,
          fields: camposMapeados,
        };

        await fetch(`http://localhost:3000/form-templates/${currentFormId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('Erro ao sincronizar ordenação por arrastamento com o servidor:', error);
      }
    }
  };

  // ======================================================
  // REMOVER CAMPO
  // ======================================================
  const deleteField = (id) => {
    markUserEdited();

    setFields((prevFields) => {
      const filtrados = prevFields.filter((field) => field.id !== id);
      return filtrados.map((field, idx) => ({ ...field, order: idx + 1 }));
    });

    showToast('Campo removido do formulário.', 'info');
  };

  // ======================================================
  // INICIAR EDIÇÃO
  // ======================================================
  const startEditing = (field) => {
    setEditingId(field.id);
    setEditData({ ...field });
  };

  // ======================================================
  // GUARDAR ALTERAÇÕES
  // ======================================================
  const saveField = (id) => {
    markUserEdited();

    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? editData : field
      )
    );

    setEditingId(null);
    showToast('Campo atualizado com sucesso.');
  };

  // ======================================================
  // CANCELAR EDIÇÃO
  // ======================================================
  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  // ======================================================
  // POSIÇÃO E DIMENSÕES — DRAG & RESIZE (#119)
  // ======================================================
  const handleFieldPositionChange = (id, { x, y }, isCommit = false) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, x, y } : f))
    );
    if (isCommit) markUserEdited();
  };

  const handleFieldSizeChange = (id, { width, height }, isCommit = false) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, width, height } : f))
    );
    if (isCommit) markUserEdited();
  };

  // ======================================================
  // OPÇÕES
  // ======================================================
  const addOption = () => {
    setEditData((prev) => ({
      ...prev,
      options: [
        ...(prev.options || []),
        `Opção ${(prev.options?.length || 0) + 1}`,
      ],
    }));
  };

  const removeOption = (index) => {
    setEditData((prev) => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index, value) => {
    setEditData((prev) => ({
      ...prev,
      options: (prev.options || []).map((opt, i) =>
        i === index ? value : opt
      ),
    }));
  };

  // ======================================================
  // RENDERIZAR CAMPO
  // ======================================================
  const renderField = (field) => {
    switch (field.type) {
      case FIELD_TYPES.LABEL:
        return (
          <FormLabel
            value={field.label}
            description={field.description}
            fontSize={field.fontSize}
            fontWeight={field.fontWeight}
            textAlign={field.textAlign}
          />
        );
      case FIELD_TYPES.RADIO:
        return (
          <FormRadioGroup
            label={field.label}
            options={field.options}
            required={field.required}
          />
        );
      case FIELD_TYPES.CHECKBOX:
        return (
          <FormCheckbox
            label={field.label}
            description={field.label}
            required={field.required}
          />
        );
      case FIELD_TYPES.DROPDOWN:
        return (
          <FormDropdown
            label={field.label}
            options={field.options}
            required={field.required}
          />
        );
      case FIELD_TYPES.TEXT:
        return <FormTextInput label={field.label} required={field.required} />;
      default:
        return null;
    }
  };

  // ======================================================
  // ADICIONAR NOVO CAMPO
  // ======================================================
  const addField = (type, targetPage = currentPage) => {
    const normalizedTargetPage = Math.max(1, Math.min(targetPage, pageCount));

    const fieldsOnCurrentPage = fields.filter(
      (field) => getFieldPage(field) === normalizedTargetPage
    );

    const newIndex = fields.length;
    const pageIndex = fieldsOnCurrentPage.length;

    const newField = {
      id: crypto.randomUUID(),
      type,
      label: `Novo campo de ${type}`,
      description: '',
      required: false,
      options: (type === FIELD_TYPES.RADIO || type === FIELD_TYPES.DROPDOWN)
        ? ['Opção 1']
        : [],
      order: newIndex + 1,
      page: normalizedTargetPage,

      ...(type === FIELD_TYPES.LABEL
        ? {
            fontSize: 20,
            fontWeight: 'bold',
            textAlign: 'left',
          }
        : {}),

      x: 40,
      y: pageIndex * 110 + 40,
      width: 320,
    };

    markUserEdited();
    setCurrentPage(normalizedTargetPage);
    setFields((prevFields) => [...prevFields, newField]);
    setSelectedFieldId(newField.id);
    setEditingId(null);
    setEditData({});
    showToast(`Campo adicionado à página ${normalizedTargetPage}.`, 'success');
  };

  const handleCanvasDragOver = (event) => {
    event.preventDefault();

    if (Array.from(event.dataTransfer.types).includes('application/x-field-type')) {
      setIsCanvasDragOver(true);
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleCanvasDragLeave = (event) => {
    const nextTarget = event.relatedTarget;

    if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
      setIsCanvasDragOver(false);
    }
  };

  const handleCanvasDrop = (event) => {
    event.preventDefault();
    setIsCanvasDragOver(false);

    const droppedFieldType = event.dataTransfer.getData('application/x-field-type');

    if (!droppedFieldType) {
      return;
    }

    const pageElement = event.target.closest('[data-page-number]');
    const droppedPage = Number(pageElement?.dataset?.pageNumber) || currentPage;

    addField(droppedFieldType, droppedPage);
  };

  // ======================================================
  // SALVAR FORMULÁRIO NO BANCO DE DADOS
  // ======================================================
  const saveFormToDatabase = async (status) => {
    try {
      const normalizedFields = normalizeFieldsForDatabase(fields);

      const payload = {
        name: formName,
        description: formDescription,
        fields: normalizedFields,
        status,
      };

      let method = 'POST';
      let endpoint = 'http://localhost:3000/form-templates';

      if (currentFormId) {
        method = 'PATCH';
        endpoint = `http://localhost:3000/form-templates/${currentFormId}`;
      }

      console.log('Payload enviado para guardar formulário:', payload);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = `Erro ao salvar: ${response.statusText}`;

        try {
          const errorData = await response.json();

          if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch {
          const errorText = await response.text().catch(() => '');

          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      setFields(normalizedFields);

      if (!currentFormId) {
        setCurrentFormId(data.id);
        removeLocalDraft(null);
      }

      removeLocalDraft(currentFormId || data.id || null);
      setHasUserEdited(false);
      setLastAutosavedAt(null);

      showToast(
        `Formulário ${status === 'draft' ? 'guardado como rascunho' : 'publicado'} com sucesso!`,
        'success'
      );

      console.log('Resposta do servidor:', data);
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      showToast(`Erro ao salvar: ${error.message}`, 'error');
    }
  };

  const handleSaveDraft = () => {
    saveFormToDatabase('draft');
  };

  const handlePublish = () => {
    saveFormToDatabase('published');
  };

  const handleClearFormRequest = () => {
    setIsClearFormConfirmOpen(true);
  };

  const handleCancelClearForm = () => {
    setIsClearFormConfirmOpen(false);
  };

  const handleConfirmClearForm = () => {
    markUserEdited();

    setFormName('Meu Formulário');
    setFormDescription('');
    setFields([]);
    setEditingId(null);
    setEditData({});
    setPageFormat('A4');
    setPageOrientation('portrait');
    setZoom(100);
    setShowGrid(false);
    setPageCount(1);
    setCurrentPage(1);
    setIsPageFormatMenuOpen(false);
    setIsOrientationMenuOpen(false);
    setIsClearFormConfirmOpen(false);

    removeLocalDraft(currentFormId || formId || null);
    removeLocalDraft(null);

    showToast('Formulário limpo com sucesso.', 'info');
  };

  const handlePreviewToggle = () => {
    setIsSidebarCollapsed(true);
    setIsPreviewOpen((previous) => !previous);
  };

  // ======================================================
  // APAGAR FORMULÁRIO
  // ======================================================
  const handleDeleteForm = async () => {
    if (currentFormId) {
      if (window.confirm('Apagar este formulário permanentemente?')) {
        try {
          const response = await fetch(`http://localhost:3000/form-templates/${currentFormId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`Erro ao apagar formulário: ${response.statusText}`);
          }

          removeLocalDraft(currentFormId);
          removeLocalDraft(null);

          setCurrentFormId(null);
          setFormName('Meu Formulário');
          setFormDescription('');
          setFields([]);
          setHasUserEdited(false);
          setLastAutosavedAt(null);

          if (onGoHome) {
            onGoHome();
          }
        } catch (error) {
          console.error('Erro ao apagar formulário:', error);
          showToast(`Erro ao apagar formulário: ${error.message}`, 'error');
        }
      }
    }
  };

  const pageConfig = PAGE_SIZES[pageFormat] || PAGE_SIZES.A4;
  const pageWidth = pageOrientation === 'landscape' ? pageConfig.height : pageConfig.width;
  const pageHeight = pageOrientation === 'landscape' ? pageConfig.width : pageConfig.height;

  // A indicação pode ir a 0%, mas a escala técnica mínima fica em 1% para a folha não desaparecer.
  const effectiveZoomScale = Math.max(zoom, 1) / 100;

  const pageGridStyle = showGrid
  ? {
      backgroundColor: '#ffffff',
      backgroundImage:
        'radial-gradient(circle, rgba(148, 163, 184, 0.42) 0.8px, transparent 0.8px), radial-gradient(circle, rgba(71, 85, 105, 0.55) 1.4px, transparent 1.4px)',
      backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px, ${MAJOR_GRID_SIZE}px ${MAJOR_GRID_SIZE}px`,
      backgroundPosition: '0 0, 0 0',
    }
  : {
      backgroundColor: '#ffffff',
    };

    const safePageCount = Math.max(pageCount, getMaxPageFromFields(fields), 1);

    const pages = Array.from({ length: safePageCount }, (_, index) => index + 1);

    const getFieldsByPage = (pageNumber) => {
      return fields
        .map((field, originalIndex) => ({
          field,
          originalIndex,
        }))
        .filter(({ field }) => getFieldPage(field) === pageNumber)
        .sort((a, b) => (a.field.order || 0) - (b.field.order || 0));
    };

    const totalCanvasHeight =
      safePageCount * pageHeight + (safePageCount - 1) * PAGE_GAP;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-92px)] bg-slate-100">
        <div className="text-center bg-white border border-slate-200 rounded-2xl shadow-sm px-10 py-8">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
          <p className="text-slate-600 mt-4 font-medium">A carregar formulário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-100 h-[calc(100vh-92px)] overflow-hidden relative">
      {toast && (
        <div
          className={`fixed top-24 right-6 z-[100] max-w-sm rounded-2xl border px-5 py-4 shadow-xl backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-red-50/95 border-red-200 text-red-800'
              : toast.type === 'info'
                ? 'bg-slate-50/95 border-slate-200 text-slate-800'
                : 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 h-5 w-5 rounded-full bg-white/80 flex items-center justify-center text-xs font-black">
              {toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓'}
            </span>
            <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

      {availableLocalDraft && (
        <div className="fixed inset-0 z-[120] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-slate-50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Clock3 size={23} />
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-indigo-600 mb-1">
                    Rascunho local encontrado
                  </p>

                  <h2 className="text-xl font-black text-slate-900">
                    Deseja continuar a edição anterior?
                  </h2>

                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Foi encontrado um rascunho guardado automaticamente neste browser em{' '}
                    <strong>{formatAutosaveDate(availableLocalDraft.updatedAt)}</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={discardLocalDraft}
                className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition flex items-center justify-center"
                title="Descartar rascunho local"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-5">
                <p className="text-sm text-slate-600">
                  <strong>Nome:</strong>{' '}
                  {availableLocalDraft.formName || 'Formulário sem nome'}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  <strong>Campos:</strong>{' '}
                  {Array.isArray(availableLocalDraft.fields)
                    ? availableLocalDraft.fields.length
                    : 0}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  <strong>Página:</strong>{' '}
                  {availableLocalDraft.pageFormat || 'A4'} ·{' '}
                  {ORIENTATIONS[availableLocalDraft.pageOrientation] || 'Vertical'} ·{' '}
                  {typeof availableLocalDraft.zoom === 'number'
                    ? `${availableLocalDraft.zoom}%`
                    : '100%'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={discardLocalDraft}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold transition"
                >
                  Descartar
                </button>

                <button
                  type="button"
                  onClick={() => applyLocalDraft(availableLocalDraft)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-sm transition"
                >
                  Continuar edição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isClearFormConfirmOpen && (
        <div className="fixed inset-0 z-[130] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-red-50 via-white to-slate-50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="h-12 w-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-sm">
                  <AlertTriangle size={23} />
                </span>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-red-600 mb-1">
                    Confirmar limpeza
                  </p>

                  <h2 className="text-xl font-black text-slate-900">
                    Deseja limpar este formulário?
                  </h2>

                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Todos os campos atuais serão removidos e as opções visuais da página
                    voltarão ao estado inicial.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelClearForm}
                className="h-10 w-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition flex items-center justify-center"
                title="Cancelar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl bg-red-50 border border-red-100 p-4 mb-5">
                <p className="text-sm text-red-700 leading-relaxed">
                  Esta ação apenas limpa o estado atual no editor. Para gravar esta alteração
                  no sistema, será necessário clicar em <strong>Guardar Rascunho</strong> ou{' '}
                  <strong>Publicar</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancelClearForm}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmClearForm}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold shadow-sm transition"
                >
                  <RotateCcw size={17} />
                  <span>Sim, limpar formulário</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        addField={addField}
        FIELD_TYPES={FIELD_TYPES}
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((previous) => !previous)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              {onGoHome && (
                <button
                  onClick={handleGoHomeWithAutosave}
                  className="h-11 w-11 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition flex items-center justify-center"
                  title="Voltar à página inicial"
                  type="button"
                >
                  <ArrowLeft size={20} />
                </button>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 leading-tight">
                    {formName || 'Novo Formulário'}
                  </h1>

                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 text-xs font-bold">
                    <FileText size={13} />
                    {currentFormId ? 'A editar' : 'Novo'}
                  </span>
                </div>

                <p className="text-sm text-slate-500">
                  Construa, organize e pré-visualize a estrutura do formulário.
                </p>

                {lastAutosavedAt && hasUserEdited && (
                  <p className="text-xs text-slate-400 mt-1">
                    Guardado localmente às {formatAutosaveDate(lastAutosavedAt)}.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                onClick={handlePreviewToggle}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                type="button"
              >
                <Eye size={17} />
                <span>{isPreviewOpen ? 'Fechar Preview' : 'Ver Preview'}</span>
              </button>

              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                type="button"
              >
                <Save size={17} />
                <span>Guardar Rascunho</span>
              </button>

              <button
                onClick={handlePublish}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
                type="button"
              >
                <Rocket size={17} />
                <span>Publicar</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex overflow-hidden relative">
          {!isConfigPanelCollapsed && (
            <aside className="w-[360px] order-2 shrink-0 border-l border-slate-200 bg-white h-full overflow-y-auto shadow-sm z-30">
              <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-indigo-600">
                      Configuração
                    </p>
                    <h2 className="text-lg font-black text-slate-900">
                      Propriedades do formulário
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsConfigPanelCollapsed(true)}
                    className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 inline-flex items-center justify-center transition"
                    title="Ocultar painel de configuração"
                  >
                    <PanelRightClose size={18} />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <section className="bg-white border border-slate-200 rounded-2xl p-4">
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" />
                    <span>Identificação</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Nome do formulário
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(event) => handleFormNameChange(event.target.value)}
                        placeholder="Nome do formulário"
                        className="px-4 py-3 w-full border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={formDescription}
                        onChange={(event) => handleFormDescriptionChange(event.target.value)}
                        placeholder="Descrição do formulário (opcional)"
                        className="px-4 py-3 w-full border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition"
                        rows="4"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <FileText size={16} className="text-indigo-600" />
                        <span>Páginas do formulário</span>
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Selecione a página onde pretende adicionar ou editar campos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPage}
                      className="h-9 w-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 inline-flex items-center justify-center transition"
                      title="Adicionar página"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {pages.map((pageNumber) => {
                      const fieldsCount = fields.filter(
                        (field) => getFieldPage(field) === pageNumber
                      ).length;

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => handleSelectPage(pageNumber)}
                          className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                            currentPage === pageNumber
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>
                            <span className="block text-sm font-black">
                              Página {pageNumber}
                            </span>

                            <span className="block text-xs text-slate-500 mt-0.5">
                              {fieldsCount} componente{fieldsCount === 1 ? '' : 's'}
                            </span>
                          </span>

                          {currentPage === pageNumber && (
                            <span className="text-[10px] font-black uppercase tracking-wide bg-indigo-600 text-white rounded-full px-2 py-1">
                              Atual
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCurrentPage}
                    disabled={
                      pageCount <= 1 ||
                      fields.some((field) => getFieldPage(field) === currentPage)
                    }
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-50 transition"
                    title="Só é possível remover páginas vazias"
                  >
                    <Trash2 size={15} />
                    <span>Remover página atual</span>
                  </button>
                </section>

                <section className="bg-white border border-slate-200 rounded-2xl p-4">
                  <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Settings2 size={16} className="text-indigo-600" />
                    <span>Página</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-2">
                        Tamanho
                      </label>

                      <select
                        value={pageFormat}
                        onChange={(event) => handlePageFormatChange(event.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {Object.keys(PAGE_SIZES).map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wide text-slate-500 mb-2">
                        Orientação
                      </label>

                      <select
                        value={pageOrientation}
                        onChange={(event) => handlePageOrientationChange(event.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="portrait">Vertical</option>
                        <option value="landscape">Horizontal</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-2">
                    <RotateCcw size={16} className="text-slate-600" />
                    <span>Limpar formulário</span>
                  </h3>

                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    Remove todos os campos e repõe as opções visuais do editor. Esta ação não
                    apaga automaticamente o formulário da base de dados enquanto não guardar ou publicar.
                  </p>

                  <button
                    type="button"
                    onClick={handleClearFormRequest}
                    className="w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  >
                    <RotateCcw size={16} />
                    <span>Limpar formulário</span>
                  </button>
                </section>

                {currentFormId && (
                  <section className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <h3 className="text-sm font-black text-red-800 mb-2">
                      Zona de perigo
                    </h3>

                    <p className="text-xs text-red-600 mb-3 leading-relaxed">
                      Esta ação remove permanentemente o formulário atual.
                    </p>

                    <button
                      onClick={handleDeleteForm}
                      className="w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                      type="button"
                    >
                      <Trash2 size={16} />
                      <span>Apagar formulário</span>
                    </button>
                  </section>
                )}
              </div>
            </aside>
          )}

          {isConfigPanelCollapsed && (
            <div className="absolute right-0 top-0 h-full w-8 z-50 group">
              <button
                type="button"
                onClick={() => setIsConfigPanelCollapsed(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-14 w-11 rounded-2xl bg-white border border-slate-200 shadow-lg text-slate-600 hover:text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                title="Mostrar painel de configuração"
              >
                <PanelRightOpen size={20} />
              </button>
            </div>
          )}

          <main className="flex-1 order-1 min-w-0 overflow-hidden p-5 lg:p-6 relative">
            <div
              ref={canvasViewportRef}
              className={`relative h-full overflow-auto rounded-3xl border border-slate-200 bg-slate-200/70 shadow-inner ${
                isCanvasDragOver ? 'ring-4 ring-indigo-200' : ''
              }`}
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
            >
              {isCanvasDragOver && (
                <div className="pointer-events-none absolute inset-6 z-30 rounded-3xl border-2 border-dashed border-indigo-400 bg-indigo-50/70 flex items-center justify-center">
                  <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 px-6 py-4 text-indigo-700 font-black">
                    Largue aqui para adicionar o componente
                  </div>
                </div>
              )}

              <div
                className="relative mx-auto my-10 origin-top-left transition-transform"
                style={{
                  width: `${pageWidth * effectiveZoomScale}px`,
                  minHeight: `${totalCanvasHeight * effectiveZoomScale}px`,
                }}
              >
                <div
                  style={{
                    width: `${pageWidth}px`,
                    transform: `scale(${effectiveZoomScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {pages.map((pageNumber) => {
                    const pageFields = getFieldsByPage(pageNumber);
                    const isCurrentVisualPage = currentPage === pageNumber;

                    return (
                      <div
                        key={pageNumber}
                        className="relative"
                        style={{
                          width: `${pageWidth}px`,
                          minHeight: `${pageHeight}px`,
                          marginBottom: pageNumber === safePageCount ? 0 : `${PAGE_GAP}px`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                              Página {pageNumber}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              {pageFields.length} componente{pageFields.length === 1 ? '' : 's'}
                            </p>
                          </div>

                          {isCurrentVisualPage && (
                            <span className="inline-flex items-center rounded-full bg-indigo-600 text-white px-3 py-1 text-[11px] font-black">
                              Página atual
                            </span>
                          )}
                        </div>

                        <div
                          data-page-number={pageNumber}
                          className={`relative border shadow-2xl rounded-sm overflow-hidden transition ${
                            isCurrentVisualPage
                              ? 'border-indigo-400 ring-4 ring-indigo-100'
                              : 'border-slate-300'
                          }`}
                          style={{
                            width: `${pageWidth}px`,
                            minHeight: `${pageHeight}px`,
                            ...pageGridStyle,
                          }}
                          onPointerDown={() => {
                            handleSelectPage(pageNumber);
                            setIsPageFormatMenuOpen(false);
                            setIsOrientationMenuOpen(false);
                          }}
                        >
                          {pageFields.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="text-center max-w-md bg-white/90 border border-slate-200 rounded-3xl px-10 py-12 shadow-sm">
                                <div className="mx-auto mb-5 h-16 w-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                  <FileText size={32} />
                                </div>

                                <h2 className="text-xl font-black text-slate-800 mb-2">
                                  Página vazia
                                </h2>

                                <p className="text-sm text-slate-500 leading-relaxed">
                                  Selecione esta página e clique ou arraste componentes
                                  da sidebar para começar.
                                </p>
                              </div>
                            </div>
                          )}

                          {pageFields.map(({ field, originalIndex }) => (
                            <FieldCard
                              key={field.id}
                              field={field}
                              index={originalIndex}
                              totalFields={fields.length}
                              moverCampo={moverCampo}
                              reordenarCamposArrastados={reordenarCamposArrastados}
                              editingId={editingId}
                              editData={editData}
                              setEditData={setEditData}
                              saveField={saveField}
                              cancelEditing={cancelEditing}
                              startEditing={startEditing}
                              deleteField={deleteField}
                              FIELD_TYPES={FIELD_TYPES}
                              updateOption={updateOption}
                              removeOption={removeOption}
                              addOption={addOption}
                              renderField={renderField}
                              isSelected={selectedFieldId === field.id}
                              onSelect={setSelectedFieldId}
                              zoomScale={effectiveZoomScale}
                              onPositionChange={handleFieldPositionChange}
                              onSizeChange={handleFieldSizeChange}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 right-10 z-50">
              <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white border border-slate-200 shadow-xl px-4 py-3 text-xs font-black text-slate-700">
                <button
                  type="button"
                  onClick={handleShowGridChange}
                  className={`h-9 w-9 rounded-xl border inline-flex items-center justify-center transition ${
                    showGrid
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={showGrid ? 'Ocultar grelha' : 'Mostrar grelha'}
                >
                  <Grid3X3 size={15} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoom - 5)}
                    className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center justify-center transition"
                    title="Reduzir zoom"
                  >
                    <Minus size={15} />
                  </button>

                  <div className="relative w-40 h-8 flex items-center">
                    <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-slate-300 rounded-full" />
                    <div className="absolute left-1/2 top-1/2 h-5 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-slate-500 rounded-full" />

                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={zoom}
                      onChange={(event) => handleZoomChange(Number(event.target.value))}
                      className="relative z-10 w-full accent-indigo-600 bg-transparent"
                      title={`Zoom: ${zoom}%`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleZoomChange(zoom + 5)}
                    className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center justify-center transition"
                    title="Aumentar zoom"
                  >
                    <Plus size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleZoomChange(100)}
                    className="min-w-[54px] h-8 rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100 inline-flex items-center justify-center text-xs font-black transition"
                    title="Repor zoom"
                  >
                    {zoom}%
                  </button>
                </div>

                <span className="text-slate-300">·</span>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPageFormatMenuOpen((previous) => !previous);
                      setIsOrientationMenuOpen(false);
                    }}
                    className="h-9 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-3 text-xs font-black"
                    title="Alterar tamanho da página"
                  >
                    <span>{pageFormat}</span>
                    <ChevronDown size={13} />
                  </button>

                  {isPageFormatMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-32 rounded-2xl border border-slate-200 bg-white shadow-xl p-1">
                      {Object.keys(PAGE_SIZES).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            handlePageFormatChange(size);
                            setIsPageFormatMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black transition ${
                            pageFormat === size
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-slate-300">·</span>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOrientationMenuOpen((previous) => !previous);
                      setIsPageFormatMenuOpen(false);
                    }}
                    className="h-9 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-3 text-xs font-black"
                    title="Alterar orientação da página"
                  >
                    <span>{ORIENTATIONS[pageOrientation]}</span>
                    <ChevronDown size={13} />
                  </button>

                  {isOrientationMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-40 rounded-2xl border border-slate-200 bg-white shadow-xl p-1">
                      {Object.entries(ORIENTATIONS).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            handlePageOrientationChange(value);
                            setIsOrientationMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-black transition ${
                            pageOrientation === value
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>

        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          schema={fields}
          formName={formName}
          formDescription={formDescription}
          pageFormat={pageFormat}
          pageOrientation={pageOrientation}
          pageCount={safePageCount}
        />
      </div>
    </div>
  );
};

export default FormEditor;