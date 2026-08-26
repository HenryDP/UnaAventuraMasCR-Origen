import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Sparkles, 
  Check, 
  Loader2, 
  Camera, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { tourService } from '../services/tourService';
import { compressImage } from '../utils/imageUtils';

interface HeroImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string;
  onImageUpdated?: (newUrl: string) => void;
}

// Curated high quality Costa Rica landscape presets
const PRESET_IMAGES = [
  {
    name: 'Volcán Arenal & Laguna',
    location: 'La Fortuna, San Carlos',
    url: 'https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&q=80&w=1920',
  },
  {
    name: 'Playa Manuel Antonio',
    location: 'Quepos, Puntarenas',
    url: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&q=80&w=1920',
  },
  {
    name: 'Catarata La Fortuna',
    location: 'San Carlos, Alajuela',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1920',
  },
  {
    name: 'Río Celeste & Cascada',
    location: 'Parque Nacional Tenorio',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=1920',
  },
  {
    name: 'Bosque Nuboso Monteverde',
    location: 'Puntarenas',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&q=80&w=1920',
  },
  {
    name: 'Costa Pacífica & Selva',
    location: 'Uvita / Bahía Ballena',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1920',
  },
  {
    name: 'Cataratas Nauyaca',
    location: 'Dominical, Costa Rica',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&q=80&w=1920',
  },
  {
    name: 'Playa Conchal',
    location: 'Guanacaste',
    url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1920',
  }
];

export default function HeroImageModal({
  isOpen,
  onClose,
  currentImageUrl,
  onImageUpdated
}: HeroImageModalProps) {
  const [selectedUrl, setSelectedUrl] = useState(currentImageUrl || PRESET_IMAGES[0].url);
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    setStatusMessage('Optimizando y subiendo imagen...');

    try {
      let finalUrl = '';
      try {
        // Try uploading to Firebase Storage first
        finalUrl = await tourService.uploadTourImage(file);
      } catch (storageError) {
        console.warn('Firebase Storage no disponible, usando compresión base64 optimizada:', storageError);
        // Fallback to high-quality compressed WebP data URL
        const compressed = await compressImage(file);
        finalUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(compressed instanceof Blob ? compressed : file);
        });
      }

      setSelectedUrl(finalUrl);
      setStatusMessage('¡Imagen cargada lista para guardar!');
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('Hubo un inconveniente al cargar la foto. Puedes intentar con otra o usar un enlace URL.');
      setStatusMessage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    setSelectedUrl(urlInput.trim());
    setStatusMessage('Enlace aplicado. Revisa la vista previa y guarda.');
  };

  const handleSave = async () => {
    if (!selectedUrl) return;
    setIsSaving(true);
    try {
      await tourService.updateSiteConfig({
        heroImageUrl: selectedUrl
      });
      if (onImageUpdated) {
        onImageUpdated(selectedUrl);
      }
      alert('¡Foto de portada actualizada con éxito!');
      onClose();
    } catch (error) {
      console.error('Error saving hero image:', error);
      alert('Error al guardar la foto de portada. Verifica tus permisos de administrador.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-stone-100 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 leading-tight">
                Cambiar Foto Principal (Hero)
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Personaliza la imagen de bienvenida que ven todos los visitantes
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-200/70 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-stone-100 bg-stone-50 px-6 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Upload size={14} />
            <span>Subir desde mi Dispositivo</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles size={14} />
            <span>Galería de Costa Rica</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition-all ${
              activeTab === 'url'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <LinkIcon size={14} />
            <span>Enlace URL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="grow overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileProcess(file);
                }}
              />

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  dragOver
                    ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                    : 'border-stone-300 hover:border-emerald-500 hover:bg-stone-50/80 bg-stone-50/40'
                }`}
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-inner">
                  {isUploading ? (
                    <Loader2 size={30} className="animate-spin text-emerald-600" />
                  ) : (
                    <Upload size={28} />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-bold text-stone-800">
                    {isUploading ? 'Procesando y optimizando imagen...' : 'Toca aquí para seleccionar una foto'}
                  </p>
                  <p className="text-xs text-stone-500">
                    Puedes tomar una foto con tu celular o elegirla desde tu galería / computadora
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-200 rounded-full text-[11px] font-bold text-stone-600 shadow-sm mt-1">
                  <span>Formatos: JPG, PNG, WEBP</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRESET GALLERY */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                Selecciona una foto profesional de alta resolución de Costa Rica con 1 solo toque:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_IMAGES.map((preset, index) => {
                  const isSelected = selectedUrl === preset.url;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedUrl(preset.url);
                        setStatusMessage(`Seleccionado: ${preset.name}`);
                      }}
                      className={`group relative rounded-2xl overflow-hidden aspect-4/3 border-2 transition-all text-left ${
                        isSelected
                          ? 'border-emerald-600 ring-4 ring-emerald-100 shadow-md scale-[1.02]'
                          : 'border-transparent hover:border-stone-300'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[11px] font-black text-white leading-tight drop-shadow">
                          {preset.name}
                        </span>
                        <span className="text-[9px] text-emerald-300 font-bold drop-shadow">
                          {preset.location}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: URL INPUT */}
          {activeTab === 'url' && (
            <div className="space-y-4 bg-stone-50 p-5 rounded-2xl border border-stone-200">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Dirección URL de la Imagen
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/mi-foto-de-portada.jpg"
                    className="grow p-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs sm:text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleUrlApply}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    <span>Aplicar</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Puedes copiar y pegar enlaces de fotos de Unsplash, Pexels o tu propio servidor web.
                </p>
              </div>
            </div>
          )}

          {/* LIVE PREVIEW SECTION */}
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} className="text-emerald-600" />
                Vista Previa del Hero
              </span>
              {statusMessage && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full animate-pulse">
                  {statusMessage}
                </span>
              )}
            </div>

            <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-md bg-stone-900 group">
              <img
                src={selectedUrl}
                alt="Vista previa del Hero"
                className="w-full h-full object-cover transition-all"
                referrerPolicy="no-referrer"
              />
              {/* Overlay simulation */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                  Una Aventura Más
                </span>
                <span className="text-xs sm:text-sm text-emerald-300 font-bold uppercase tracking-widest drop-shadow">
                  Costa Rica
                </span>
                <span className="text-[10px] text-stone-300 mt-1 max-w-sm drop-shadow">
                  Explora los rincones más mágicos de nuestra tierra
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-stone-300 font-bold text-xs sm:text-sm text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isUploading || !selectedUrl}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Guardar como Foto de Portada</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
