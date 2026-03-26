import React, { useState, useRef, useEffect } from 'react';
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

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<any>({
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

  useEffect(() => {
    if (isOpen) {
      reset(tour ? {
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
      });
    }
  }, [tour, isOpen, reset]);

  const imagesValue = watch('images') || '';
  const currentImages = typeof imagesValue === 'string' 
    ? imagesValue.split('\n').filter(i => i.trim()) 
    : (Array.isArray(imagesValue) ? imagesValue : []);
  
  const location = watch('location');
  const title = watch('title');

  if (!isOpen) return null;

  // --- FUNCIÓN PARA REDIMENSIONAR IMÁGENES (1920px) ---
  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1920;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            }
          }, 'image/jpeg', 0.85); // 85% de calidad es el punto dulce entre peso y nitidez
        };
      };
    });
  };

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

    if (files.length === 1) {
      setPendingImage(files[0]);
      return;
    }

    await processAndUploadImages(Array.from(files));
  };

  const processAndUploadImages = async (fileArray: File[]) => {
    setIsUploadingImage(true);
    setUploadProgress({ current: 0, total: fileArray.length });
    try {
      const urls: string[] = [];
      
      for (let i = 0; i < fileArray.length; i++) {
        setUploadProgress({ current: i + 1, total: fileArray.length });
        
        // --- AQUÍ APLICAMOS EL REDIMENSIONAMIENTO AUTOMÁTICO ---
        const optimizedFile = await resizeImage(fileArray[i]);
        const url = await tourService.uploadTourImage(optimizedFile);
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
      // Usamos el redimensionado a 1024 para la IA (específicamente para que la IA trabaje rápido)
      const reader = new FileReader();
      const compressedBase64 = await new Promise<string>((resolve, reject) => {
        reader.readAsDataURL(pendingImage);
        reader.onload = (e) => {
          const img = new Image();
          img.src = e.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_AI = 1024;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_AI) { height *= MAX_AI / width; width = MAX_AI; }
            } else {
              if (height > MAX_AI) { width *= MAX_AI / height; height = MAX_AI; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = reject;
        };
      });

      const editedBase64 = await aiService.editImageWithAI(compressedBase64, 'image/jpeg', aiImagePrompt);
      const res = await fetch(editedBase64);
      const blob = await res.blob();
      const editedFile = new File([blob], `ai_${pendingImage.name.split('.')[0]}.jpg`, { type: 'image/jpeg' });

      await processAndUploadImages([editedFile]);
      setPendingImage(null);
    } catch (error: any) {
      console.error('Error editing image with AI:', error);
      alert(error.message?.includes('429') ? 'Límite de IA alcanzado. Intenta en un minuto.' : 'Error al editar con IA.');
    } finally {
      setIsEditingImageAI(false);
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
        price_national: data.price_national ? Number(data.price_national) : null,
        price_foreigner: data.price_foreigner ? Number(data.price_foreigner) : null,
        images: typeof data.images === 'string' ? data.images.split('\n').map((i:any) => i.trim()).filter(Boolean) : (Array.isArray(data.images) ? data.images : []),
        included: typeof data.included === 'string' ? data.included.split('\n').map((i:any) => i.trim()).filter(Boolean) : (Array.isArray(data.included) ? data.included : []),
        recommendations: typeof data.recommendations === 'string' ? data.recommendations.split('\n').map((i:any) => i.trim()).filter(Boolean) : (Array.isArray(data.recommendations) ? data.recommendations : []),
        pickupLocations: typeof data.pickupLocations === 'string' ? data.pickupLocations.split('\n').map((i:any) => i.trim()).filter(Boolean) : (Array.isArray(data.pickupLocations) ? data.pickupLocations : []),
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
    if (confirm('¿Estás seguro de que deseas eliminar este tour?')) {
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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-xl font-bold text-stone-900">
            {tour ? `Editar: ${tour.title}` : 'Añadir Nuevo Tour'}
          </h2>
          <div className="flex items-center gap-4">
            {tour && (
              <button onClick={handleDelete} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20} /></button>
            )}
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={24} /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grow overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* --- SECCIÓN IZQUIERDA --- */}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Duración</label>
                  <input {...register('duration', { required: true })} className="w-full p-3 rounded-xl border border-stone-200 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Kilometraje (km)</label>
                  <input {...register('distance')} className="w-full p-3 rounded-xl border border-stone-200 outline-none" placeholder="Ej: 5km" />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-stone-500 uppercase">Descripción</label>
                  <button type="button" onClick={handleGenerateAI} disabled={isGeneratingAI} className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                    {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generar IA
                  </button>
                </div>
                <textarea {...register('description', { required: true })} rows={6} className="w-full p-3 rounded-xl border border-stone-200 outline-none text-sm" />
              </div>
            </div>

            {/* --- SECCIÓN DERECHA --- */}
            <div className="space-y-6">
              <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider border-b border-emerald-100 pb-2">Precios y Categoría</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Categoría</label>
                  <select {...register('category')} className="w-full p-3 rounded-xl border border-stone-200 bg-white">
                    <option value="nacional">Nacional</option>
                    <option value="internacional">Internacional</option>
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" {...register('active')} className="w-5 h-5 rounded text-emerald-600" />
                    <span className="text-sm font-bold text-stone-700">Tour Activo</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Nacional (₡)</label>
                  <input type="number" {...register('price_national')} className="w-full p-3 rounded-xl border border-stone-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Precio Extranjero ($)</label>
                  <input type="number" {...register('price_foreigner')} className="w-full p-3 rounded-xl border border-stone-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Link de Pago (Completo)</label>
                <input {...register('paymentLink')} className="w-full p-3 rounded-xl border border-stone-200" />
              </div>
            </div>
          </div>

          {/* --- MULTIMEDIA --- */}
          <div className="space-y-4">
            <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider border-b border-emerald-100 pb-2">Imágenes (Auto-Optimización a 1920px)</h3>
            <div className="flex items-center gap-4">
               <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
               <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold">
                 {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                 {isUploadingImage ? 'Procesando y Subiendo...' : 'Subir Fotos'}
               </button>
            </div>

            {pendingImage && (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col gap-3">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Procesar con IA: {pendingImage.name}</span>
                <input type="text" value={aiImagePrompt} onChange={(e)=>setAiImagePrompt(e.target.value)} className="p-2 text-xs rounded-lg border border-emerald-200" />
                <div className="flex gap-2">
                  <button type="button" onClick={handleAIImageEdit} disabled={isEditingImageAI} className="flex-1 bg-emerald-600 text-white text-[10px] font-bold py-2 rounded-lg">
                    {isEditingImageAI ? 'PROCESANDO...' : 'MEJORAR CON IA'}
                  </button>
                  <button type="button" onClick={() => { processAndUploadImages([pendingImage]); setPendingImage(null); }} className="flex-1 bg-white border border-emerald-200 text-emerald-600 text-[10px] font-bold py-2 rounded-lg">
                    SUBIR ORIGINAL OPTIMIZADA
                  </button>
                </div>
              </div>
            )}

            <textarea {...register('images')} rows={4} className="w-full p-3 rounded-xl border border-stone-200 font-mono text-[10px] bg-stone-50" placeholder="URLs de imágenes (una por línea)" />
            
            {currentImages.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {currentImages.map((url: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-stone-200 relative group">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => {
                        const newImgs = currentImages.filter((_, i) => i !== idx);
                        setValue('images', newImgs.join('\n'));
                    }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="p-6 border-t border-stone-100 bg-stone-50 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-stone-200 font-bold">Cancelar</button>
          <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-emerald-600 text-white px-10 py-2.5 rounded-xl font-bold shadow-lg disabled:opacity-50">
            {isSubmitting ? 'Guardando...' : 'Guardar Tour'}
          </button>
        </div>
      </div>
    </div>
  );
}