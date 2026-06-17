// ======================================================
// FRONTEND/src/components/PreviewModal.jsx
// Modal de pré-visualização — apenas visual, sem submissão
// ======================================================

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Eye,
  Grid3X3,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  X,
} from 'lucide-react';

import {
  FormLabel,
  FormRadioGroup,
  FormCheckbox,
  FormDropdown,
  FormTextInput,
} from './DynamicElements';

const GRID_SIZE = 10;
const MAJOR_GRID_SIZE = GRID_SIZE * 5;

const PAGE_SIZES = {
  A4: {
    width: 794,
    height: 1123,
  },
  A3: {
    width: 1123,
    height: 1588,
  },
  Letter: {
    width: 816,
    height: 1056,
  },
};

const ORIENTATIONS = {
  portrait: 'Vertical',
  landscape: 'Horizontal',
};

const clampZoom = (value) => Math.min(200, Math.max(0, value));

const PreviewModal = ({
  isOpen,
  onClose,
  schema = [],
  formName = 'Pré-visualização do Formulário',
  formDescription = '',
  pageFormat = 'A4',
  pageOrientation = 'portrait',
  pageCount = 1,
}) => {
  const previewViewportRef = useRef(null);

  const [previewData, setPreviewData] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen) setCurrentPage(1);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previewViewport = previewViewportRef.current;

    if (!previewViewport) {
      return undefined;
    }

    const handleNativeWheel = (event) => {
      if (!event.ctrlKey) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const direction = event.deltaY < 0 ? 5 : -5;
      setPreviewZoom((previous) => clampZoom(previous + direction));
    };

    previewViewport.addEventListener('wheel', handleNativeWheel, {
      passive: false,
    });

    return () => {
      previewViewport.removeEventListener('wheel', handleNativeWheel);
    };
  }, [isOpen, isFullscreen]);

  if (!isOpen) {
    return null;
  }

  const handlePreviewChange = (fieldId, value) => {
    setPreviewData((previous) => ({
      ...previous,
      [fieldId]: value,
    }));
  };
 
  const handleClose = () => {
    setIsFullscreen(false);
    onClose();
  };

  const currentFields = schema.filter((field) => (field.page || 1) === currentPage);

  const validateCurrentPage = () => {
    const requiredFields = currentFields.filter((f) => f.required);
    for (const field of requiredFields) {
      const value = previewData[field.id];
      if (
        value === undefined || 
        value === null || 
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
      ) {
        alert(`⚠️ Por favor, preencha o campo obrigatório: "${field.label}" antes de avançar.`);
        return false;
      }
    }
    return true;
  };

  const handleNextPage = () => {
    if (validateCurrentPage() && currentPage < pageCount) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const renderField = (field) => {
    const currentValue = previewData[field.id] ?? '';

    switch (field.type) {
      case 'label':
        return (
          <FormLabel
            value={field.label}
            description={field.description}
            fontSize={field.fontSize}
            fontWeight={field.fontWeight}
            textAlign={field.textAlign}
          />
        );

      case 'radio':
        return (
          <FormRadioGroup
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={true}
            value={currentValue}
            onChange={(value) => handlePreviewChange(field.id, value)}
          />
        );

      case 'checkbox':
        return (
          <FormCheckbox
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={true}
            value={currentValue}
            onChange={(newArray) => handlePreviewChange(field.id, newArray)}
          />
        );

      case 'dropdown':
        return (
          <FormDropdown
            label={field.label}
            options={field.options}
            required={field.required}
            isPreview={true}
            value={currentValue}
            onChange={(event) =>
              handlePreviewChange(field.id, event.target.value)
            }
          />
        );

      case 'text':
        return (
          <FormTextInput
            label={field.label}
            required={field.required}
            isPreview={true}
            value={currentValue}
            onChange={(value) => handlePreviewChange(field.id, value)}
          />
        );

      default:
        return null;
    }
  };

  const pageConfig = PAGE_SIZES[pageFormat] || PAGE_SIZES.A4;

  const pageWidth =
    pageOrientation === 'landscape' ? pageConfig.height : pageConfig.width;

  const pageHeight =
    pageOrientation === 'landscape' ? pageConfig.width : pageConfig.height;

  const effectiveZoomScale = Math.max(previewZoom, 1) / 100;

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
  const zoomControl = (
    <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white border border-slate-200 shadow-xl px-4 py-3 text-xs font-black text-slate-700">
      <button
        type="button"
        onClick={() => setShowGrid((previous) => !previous)}
        className={`h-9 w-9 rounded-xl border inline-flex items-center justify-center transition ${showGrid
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
          onClick={() => setPreviewZoom((previous) => clampZoom(previous - 5))}
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
            value={previewZoom}
            onChange={(event) =>
              setPreviewZoom(clampZoom(Number(event.target.value)))
            }
            className="relative z-10 w-full accent-indigo-600 bg-transparent"
            title={`Zoom: ${previewZoom}%`}
          />
        </div>

        <button
          type="button"
          onClick={() => setPreviewZoom((previous) => clampZoom(previous + 5))}
          className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center justify-center transition"
          title="Aumentar zoom"
        >
          <Plus size={15} />
        </button>

        <button
          type="button"
          onClick={() => setPreviewZoom(100)}
          className="min-w-[54px] h-8 rounded-lg bg-slate-50 text-slate-800 hover:bg-slate-100 inline-flex items-center justify-center text-xs font-black transition"
          title="Repor zoom"
        >
          {previewZoom}%
        </button>
      </div>
    </div>
  );

  const previewPage = (
    <div
      className="relative mx-auto my-10 origin-top-left transition-transform"
      style={{
        width: `${pageWidth * effectiveZoomScale}px`,
        height: `${pageHeight * effectiveZoomScale}px`,
      }}
    >
      <div
        className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white"
        style={{
          width: `${pageWidth}px`,
          minHeight: `${pageHeight}px`,
          transform: `scale(${effectiveZoomScale})`,
          transformOrigin: 'top left',
          ...pageGridStyle,
        }}
      >
        <div className="p-6 lg:p-8 min-h-full flex flex-col relative">
          {schema.length === 0 ? (
            <div className="h-full min-h-[420px] text-center flex items-center justify-center flex-grow">
              <div>
                <div className="mx-auto mb-5 h-16 w-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Eye size={30} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  Nenhum campo para mostrar
                </h3>
                <p className="text-sm text-slate-500">
                  Adicione componentes no editor para visualizar o formulário.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ZONA DOS CAMPOS - AGORA COM SUPORTE A ABSOLUTO E RELATIVO */}
              <div className="flex-grow w-full relative" style={{ minHeight: '600px' }}>
                {currentFields.map((field) => {
                  // Verifica se é um campo do layout novo (com coordenadas)
                  const isAbsolute = field.x !== undefined && field.y !== undefined;

                  return (
                    <div
                      key={field.id}
                      style={
                        isAbsolute
                          ? {
                              position: 'absolute',
                              left: `${field.x}px`,
                              top: `${field.y}px`,
                              width: field.width ? `${field.width}px` : 'auto',
                              height: field.height ? `${field.height}px` : 'auto',
                            }
                          : {
                              position: 'relative',
                              marginBottom: '1.5rem',
                              width: '100%',
                            }
                      }
                    >
                      {renderField(field)}
                    </div>
                  );
                })}
                
                {currentFields.length === 0 && (
                  <p className="text-center text-slate-400 italic py-10 w-full absolute top-0">
                    Esta página está vazia.
                  </p>
                )}
              </div>

              {pageCount > 1 && (
                <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between relative z-50 bg-white">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
                  >
                    Anterior
                  </button>
                  <span className="text-sm font-bold text-slate-400">
                    Página {currentPage} de {pageCount}
                  </span>
                  {currentPage < pageCount ? (
                    <button
                      type="button"
                      onClick={handleNextPage}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-sm transition"
                    >
                      Próximo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => alert('Modo Preview: Submissão simulada com sucesso!')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-sm transition"
                    >
                      Submeter
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
  const normalModal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white shadow-2xl flex flex-col overflow-hidden border border-slate-200 w-full max-w-6xl max-h-[90vh] rounded-3xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 via-white to-slate-50">
          <div className="flex items-start gap-4">
            <span className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Eye size={23} />
            </span>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-indigo-600 mb-1">
                Modo de Pré-visualização
              </p>

              <h2 className="text-2xl font-black text-slate-900">
                {formName || 'Formulário sem nome'}
              </h2>

              <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {formDescription ||
                  'Visão aproximada do utilizador final. Pode interagir com os campos para testar o comportamento visual.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="h-10 w-10 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 transition flex items-center justify-center"
              type="button"
              title="Ver em ecrã inteiro"
            >
              <Maximize2 size={20} />
            </button>

            <button
              onClick={handleClose}
              className="h-10 w-10 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition flex items-center justify-center"
              type="button"
              title="Fechar preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div
          ref={previewViewportRef}
          className="flex-grow overflow-auto p-6 lg:p-8 bg-slate-100"
        >
          {previewPage}
        </div>

        <div className="p-5 border-t border-slate-200 bg-white flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <p className="text-xs text-slate-500">
            Página visual: {pageFormat} ·{' '}
            {ORIENTATIONS[pageOrientation] || 'Vertical'}.
          </p>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
            {zoomControl}

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <span>Fechar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const fullscreenModal = (
    <div className="fixed inset-0 z-[9999] bg-slate-100">
      <div
        ref={previewViewportRef}
        className="h-screen w-screen overflow-auto bg-slate-100"
      >
        {previewPage}
      </div>

      <div className="fixed top-5 right-5 z-[10000] flex items-center gap-2">
        <button
          onClick={() => setIsFullscreen(false)}
          className="h-11 w-11 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 transition flex items-center justify-center shadow-xl"
          type="button"
          title="Sair de ecrã inteiro"
        >
          <Minimize2 size={20} />
        </button>

        <button
          onClick={handleClose}
          className="h-11 w-11 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition flex items-center justify-center shadow-xl"
          type="button"
          title="Fechar preview"
        >
          <X size={20} />
        </button>
      </div>

      <div className="fixed bottom-6 right-6 z-[10000]">
        {zoomControl}
      </div>
    </div>
  );

  return createPortal(
    isFullscreen ? fullscreenModal : normalModal,
    document.body
  );
};

export default PreviewModal;