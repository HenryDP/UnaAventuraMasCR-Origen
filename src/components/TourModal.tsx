[18:09, 4/3/2026] Una aventura más: import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Trash2 } from 'lucide-react';
import { Tour } from './TourCard';
import { tourService } from '../services/tourService';

interface TourModalProps {
  tour?: Tour;
  isOpen: boolean;
  onClose: () => void;
}

export default function TourModal({ tour, isOpen, onClose }: TourModalProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Partial<Tour>>({
    defaultValues: tour || {
      active: true,
      category: 'nacional',
      images: [],
      included: [],
      recommendations: [],
      pickupLocations: []
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      // Process arrays if they are stri…
[18:13, 4/3/2026] Una aventura más: import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Trash2, Wand2, UploadCloud } from 'lucide-react';
import { Tour } from './TourCard';
import { tourService } from '../services/tourService';
import { aiService } from '../services/aiService';

interface TourModalProps {
  tour?: Tour;
  isOpen: boolean;
  onClose: () => void;
}

export default function TourModal({ tour, isOpen, onClose }: TourModalProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, setValue, getValues, formState: { isSubmitting } } = useForm<Partial<Tour>>({
    defaultValues: tour || {
      active: true, // ¡Por defecto ahora estará activo!
      category: 'nacional',
      images: [],
      included: [],
      recommendations: [],
      pickupLocations: []
    }
  });

  if (!isOpen) return null;

  // Función mágica para la IA
  const handleGenerateAI = async () => {
    const title = getValues('title');
    const location = getValues('location');

    if (!title || !location) {
      alert('Por favor, escribe un Título y una Ubicación primero para que la IA sepa sobre qué escribir.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const description = await aiService.generateTourDescription(location, title);
      setValue('description', description, { shouldValidate: true, shouldDirty: true });
    } catch (error) {
      console.error(error);
      alert('Hubo un error al generar la descripción. Revisa tu API Key de Gemini.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Función para subir imágenes a Firebase
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const currentImagesVal = getValues('images') as any;
      let currentArray: string[] = [];
      
      if (typeof currentImagesVal === 'string') {
        currentArray = currentImagesVal.split('\n').filter(i => i.trim());
      } else if (Array.isArray(currentImagesVal)) {
        currentArray = currentImagesVal;
      }

      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await tourService.uploadTourImage(files[i]);
        newUrls.push(url);
      }

      const finalImagesString = [...currentArray, ...newUrls].join('\n');
      setValue('images', finalImagesString as any, { shouldDirty: true });
    } catch (error) {
      console.error(error);
      alert('Error al subir las imágenes. Asegúrate de estar conectado a internet.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        price: {
          crc: Number(data.price?.crc || 0),
          usd: Number(data.price?.usd || 0)
        },
        images: typeof data.images === 'string' ? data.images.split('\n').filter((i: string) => i.trim()) : data.images,
        included: typeof data.included === 'string' ? data.included.split('\n').filter((i: string) => i.trim()) : data.included,
        recommendations: typeof data.recommendations === 'string' ? data.recommendations.split('\n').filter((i: string) => i.trim()) : data.recommendations,
        pickupLocations: typeof data.pickupLocations === 'string' ? data.pickupLocations.split('\n').filter((i: string) => i.trim()) : data.pickupLocations,
      };

      if (tour?.id) {
        await tourService.updateTour(tour.id, formattedData);
      } else {
        await tourService.createTour(formattedData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Error al guardar el tour');
    }
  };

  const handleDelete = async () => {
    if (!tour?.id) return;
    if (confirm('¿Estás seguro de que deseas eliminar este tour? Esta acción no se puede deshacer.')) {
      try {
        await tourService.deleteTour(tour.id);
        onClose();
      } catch (error) {
        console.error('Error deleting tour:', error);
        alert('Error al eliminar el tour');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-xl font-bold text-stone-900">
            {tour ? Editar: ${tour.title} : 'Añadir Nuevo Tour'}
          </h2>
          <div className="flex items-center gap-4">
            {tour && (
              <button 
                type="button"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-600 transition-colors p-2"
                title="Eliminar Tour"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider border-b border-emerald-100 pb-2">Información Básica</h3>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Título del Tour</label>
                <input {...register('title', { required: true })} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. Catarata Zafiro" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Ubicación</label>
                <input {...register('location', { required: true })} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. Bajos del Toro" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Duración</label>
                <input {...register('duration', { required: true })} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. 1 Día" />
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-xs font-bold text-stone-500 uppercase">Descripción</label>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors disabled:opacity-50 font-bold"
                  >
                    <Wand2 size={14} />
                    {isGeneratingAI ? 'Generando...' : 'Generar con IA'}
                  </button>
                </div>
                <textarea {...register('description', { required: true })} rows={6} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" placeholder="Escribe la descripción o usa el botón de IA..." />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider border-b border-emerald-100 pb-2">Configuración y Precios</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Categoría</label>
                  <select {...register('category')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                    <option value="nacional">Nacional</option>
                    <option value="internacional">Internacional</option>
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" {...register('active')} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300" />
                    <span className="text-sm font-bold text-stone-700">Tour Activo</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Colones (₡)</label>
                  <input type="number" {...register('price.crc')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Dólares ($)</label>
                  <input type="number" {...register('price.usd')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Link de Pago (Completo)</label>
                <input {...register('paymentLink')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Link de Reserva (Parcial)</label>
                <input {...register('reserveLink')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider border-b border-emerald-100 pb-2">Multimedia y Detalles</h3>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-bold text-stone-500 uppercase">URLs de Imágenes (Una por línea)</label>
                <label className="text-xs flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded cursor-pointer hover:bg-emerald-200 transition-colors disabled:opacity-50 font-bold">
                  <UploadCloud size={14} />
                  {isUploading ? 'Subiendo...' : 'Subir desde Galería'}
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    disabled={isUploading} 
                  />
                </label>
              </div>
              <textarea 
                defaultValue={tour?.images?.join('\n')}
                {...register('images')} 
                rows={4} 
                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-xs bg-stone-50" 
                placeholder="Las fotos que subas aparecerán aquí automáticamente en forma de enlaces..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">¿Qué incluye? (Una por línea)</label>
                <textarea 
                  defaultValue={tour?.included?.join('\n')}
                  {...register('included')} 
                  rows={4} 
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Recomendaciones (Una por línea)</label>
                <textarea 
                  defaultValue={tour?.recommendations?.join('\n')}
                  {...register('recommendations')} 
                  rows={4} 
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Puntos de Salida (Una por línea)</label>
                <textarea 
                  defaultValue={tour?.pickupLocations?.join('\n')}
                  {...register('pickupLocations')} 
                  rows={4} 
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || isUploading || isGeneratingAI}
            className="flex items-center bg-emerald-600 text-white px-10 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Tour'}
          </button>
        </div>
      </div>
    </div>
  );
}