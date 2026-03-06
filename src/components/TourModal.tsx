import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Trash2, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditingImageAI, setIsEditingImageAI] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [aiImagePrompt, setAiImagePrompt] = useState('Mejora esta imagen para un tour turístico, hazla vibrante y profesional.');
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<any>({
    defaultValues: tour ? {
      ...tour,
      images: Array.isArray(tour.images) ? tour.images.join('\n') : tour.images,
      included: Array.isArray(tour.included) ? tour.included.join('\n') : tour.included,
      recommendations: Array.isArray(tour.recommendations) ? tour.recommendations.join('\n') : tour.recommendations,
      pickupLocations: Array.isArray(tour.pickupLocations) ? tour.pickupLocations.join('\n') : tour.pickupLocations,
    } : {
      active: true,
      category: 'nacional',
      images: '',
      included: '',
      recommendations: '',
      pickupLocations: ''
    }
  });

  const imagesValue = watch('images') || '';
  const currentImages = typeof imagesValue === 'string' 
    ? imagesValue.split('\n').filter(i => i.trim()) 
    : (Array.isArray(imagesValue) ? imagesValue : []);
  
  const location = watch('location');
  const title = watch('title');

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    if (!location || !title) {
      alert('Por favor ingresa el título y la ubicación para generar la descripción.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const description = await aiService.generateTourDescription(location, title);
      setValue('description', description);
    } catch (error: any) {
      console.error('Error generating AI description:', error);
      alert(`Error al generar la descripción con IA: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // If only one image is selected, offer AI editing
    if (files.length === 1) {
      setPendingImage(files[0]);
      return;
    }

    // Otherwise, upload all as usual
    await processAndUploadImages(Array.from(files));
  };

  const processAndUploadImages = async (fileArray: File[]) => {
    setIsUploadingImage(true);
    setUploadProgress({ current: 0, total: fileArray.length });
    try {
      const urls: string[] = [];
      
      for (let i = 0; i < fileArray.length; i++) {
        setUploadProgress({ current: i + 1, total: fileArray.length });
        const url = await tourService.uploadTourImage(fileArray[i]);
        urls.push(url);
      }
      
      const currentImagesStr = watch('images') || '';
      const newImagesStr = currentImagesStr 
        ? `${currentImagesStr}\n${urls.join('\n')}`
        : urls.join('\n');
      
      setValue('images', newImagesStr);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      alert('Error al subir las imágenes.');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAIImageEdit = async () => {
    if (!pendingImage) return;

    setIsEditingImageAI(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(pendingImage);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      const editedBase64 = await aiService.editImageWithAI(base64, pendingImage.type, aiImagePrompt);
      
      // Convert base64 back to File
      const res = await fetch(editedBase64);
      const blob = await res.blob();
      const editedFile = new File([blob], `ai_${pendingImage.name}`, { type: pendingImage.type });

      await processAndUploadImages([editedFile]);
      setPendingImage(null);
    } catch (error: any) {
      console.error('Error editing image with AI:', error);
      alert(`Error al editar la imagen con IA: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsEditingImageAI(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Process arrays from strings (from textarea)
      const formattedData = {
        ...data,
        price: {
          crc: Number(data.price?.crc || 0),
          usd: Number(data.price?.usd || 0)
        },
        images: typeof data.images === 'string' ? data.images.split('\n').map(i => i.trim()).filter(Boolean) : data.images,
        included: typeof data.included === 'string' ? data.included.split('\n').map(i => i.trim()).filter(Boolean) : data.included,
        recommendations: typeof data.recommendations === 'string' ? data.recommendations.split('\n').map(i => i.trim()).filter(Boolean) : data.recommendations,
        pickupLocations: typeof data.pickupLocations === 'string' ? data.pickupLocations.split('\n').map(i => i.trim()).filter(Boolean) : data.pickupLocations,
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
            {tour ? `Editar: ${tour.title}` : 'Añadir Nuevo Tour'}
          </h2>
          <div className="flex items-center gap-4">
            {tour && (
              <button 
                onClick={handleDelete}
                className="text-red-400 hover:text-red-600 transition-colors p-2"
                title="Eliminar Tour"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
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
                <input {...register('title', { required: true })} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Ubicación</label>
                <input {...register('location', { required: true })} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Duración</label>
                <input {...register('duration', { required: true })} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Fecha del Tour</label>
                <input {...register('date')} type="text" placeholder="Ej: 15 de Octubre, 2023" className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Kilometraje (km)</label>
                  <input {...register('distance')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: 5km" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nivel de Caminata</label>
                  <select {...register('difficulty')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                    <option value="">No aplica</option>
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-stone-500 uppercase">Descripción</label>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-wider disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    Generar con IA
                  </button>
                </div>
                <textarea {...register('description', { required: true })} rows={6} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm leading-relaxed" />
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
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Nacional (₡)</label>
                  <input type="number" {...register('price_national')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: 15000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Extranjero ($)</label>
                  <input type="number" {...register('price_foreigner')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej: 45" />
                </div>
              </div>
              <div className="hidden">
                <input type="hidden" {...register('currency_foreigner')} defaultValue="USD" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Colones (₡) - Legacy</label>
                  <input type="number" {...register('price.crc')} className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Dólares ($) - Legacy</label>
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-stone-500 uppercase">Imágenes del Tour</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage || isEditingImageAI}
                    className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-[10px]">
                          {uploadProgress ? `Subiendo ${uploadProgress.current}/${uploadProgress.total}...` : 'Comprimiendo...'}
                        </span>
                      </div>
                    ) : (
                      <ImageIcon size={14} />
                    )}
                    {isUploadingImage ? '' : 'Subir desde Galería'}
                  </button>
                </div>
              </div>

              {pendingImage && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Imagen Seleccionada: {pendingImage.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setPendingImage(null)}
                      className="text-stone-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-emerald-600 uppercase">Instrucciones para la IA (Opcional)</label>
                    <input 
                      type="text" 
                      value={aiImagePrompt}
                      onChange={(e) => setAiImagePrompt(e.target.value)}
                      className="w-full p-2 text-xs rounded-lg border border-emerald-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                      placeholder="Ej: Mejora la iluminación y haz los colores más vivos"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAIImageEdit}
                      disabled={isEditingImageAI}
                      className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isEditingImageAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      EDITAR CON IA Y SUBIR
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        processAndUploadImages([pendingImage]);
                        setPendingImage(null);
                      }}
                      disabled={isEditingImageAI}
                      className="flex-1 bg-white border border-emerald-200 text-emerald-600 text-[10px] font-bold py-2 rounded-lg hover:bg-emerald-50 transition-all disabled:opacity-50"
                    >
                      SUBIR ORIGINAL
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <textarea 
                  {...register('images')} 
                  rows={4} 
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-[10px] bg-stone-50" 
                  placeholder="URLs de imágenes (una por línea)"
                />
                
                {/* Image Preview Grid */}
                {currentImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                    {currentImages.map((url: string, idx: number) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-stone-200 bg-stone-100 group relative">
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = currentImages.filter((_: any, i: number) => i !== idx);
                            setValue('images', newImages.join('\n'));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">¿Qué incluye? (Línea)</label>
                <textarea 
                  {...register('included')} 
                  rows={4} 
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Recomendaciones (Línea)</label>
                <textarea 
                  {...register('recommendations')} 
                  rows={4} 
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Puntos de Salida / Bus o Microbús (Línea)</label>
                <textarea 
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
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
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
