import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Calendar, Users, DollarSign, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface TourCreationData {
  name: string;
  price: number;
  capacity: number;
  date: string;
  description: string;
}

export default function TourCreationForm() {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TourCreationData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      setImages(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TourCreationData) => {
    setIsSubmitting(true);
    // Simulación de envío
    try {
      console.log('Datos del tour:', data);
      console.log('Imágenes:', images);
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('¡Tour creado con éxito!');
      reset();
      setImages([]);
      setPreviews([]);
    } catch (error) {
      alert('Error al crear el tour');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold text-stone-900 mb-1">Crear Nuevo Tour</h2>
        <p className="text-stone-500 text-sm">Completa los detalles para tu próxima aventura.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nombre del Tour */}
        <div className="space-y-1.5">
          <label className="flex items-center text-xs font-bold text-forest uppercase tracking-wider ml-1">
            <MapPin size={14} className="mr-1.5" />
            Nombre del Tour
          </label>
          <input
            {...register('name', { required: 'El nombre es obligatorio', minLength: { value: 5, message: 'Mínimo 5 caracteres' } })}
            placeholder="Ej: Volcán Arenal & Termales"
            className={`w-full px-4 py-3 rounded-2xl bg-stone-50 border transition-all outline-none focus:ring-2 focus:ring-forest/20 ${
              errors.name ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-forest'
            }`}
          />
          {errors.name && (
            <span className="flex items-center text-[10px] font-bold text-red-500 mt-1 ml-1">
              <AlertCircle size={12} className="mr-1" /> {errors.name.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Precio */}
          <div className="space-y-1.5">
            <label className="flex items-center text-xs font-bold text-forest uppercase tracking-wider ml-1">
              <DollarSign size={14} className="mr-1.5" />
              Precio
            </label>
            <input
              type="number"
              {...register('price', { required: 'Requerido', min: { value: 1, message: 'Min 1' } })}
              placeholder="0.00"
              className={`w-full px-4 py-3 rounded-2xl bg-stone-50 border transition-all outline-none focus:ring-2 focus:ring-forest/20 ${
                errors.price ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-forest'
              }`}
            />
          </div>

          {/* Capacidad */}
          <div className="space-y-1.5">
            <label className="flex items-center text-xs font-bold text-forest uppercase tracking-wider ml-1">
              <Users size={14} className="mr-1.5" />
              Pasajeros
            </label>
            <input
              type="number"
              {...register('capacity', { required: 'Requerido', min: { value: 1, message: 'Min 1' } })}
              placeholder="Max"
              className={`w-full px-4 py-3 rounded-2xl bg-stone-50 border transition-all outline-none focus:ring-2 focus:ring-forest/20 ${
                errors.capacity ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-forest'
              }`}
            />
          </div>
        </div>

        {/* Fecha */}
        <div className="space-y-1.5">
          <label className="flex items-center text-xs font-bold text-forest uppercase tracking-wider ml-1">
            <Calendar size={14} className="mr-1.5" />
            Fecha del Tour
          </label>
          <input
            type="date"
            {...register('date', { required: 'La fecha es obligatoria' })}
            className={`w-full px-4 py-3 rounded-2xl bg-stone-50 border transition-all outline-none focus:ring-2 focus:ring-forest/20 ${
              errors.date ? 'border-red-300 focus:border-red-500' : 'border-stone-200 focus:border-forest'
            }`}
          />
        </div>

        {/* Carga de Fotos */}
        <div className="space-y-2">
          <label className="flex items-center text-xs font-bold text-forest uppercase tracking-wider ml-1">
            <Camera size={14} className="mr-1.5" />
            Fotos del Tour
          </label>
          
          <div className="grid grid-cols-3 gap-3">
            {previews.map((src, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-100 group">
                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <CheckCircle2 size={14} className="rotate-45" />
                </button>
              </div>
            ))}
            
            <label className="aspect-square rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:border-forest hover:bg-forest/5 transition-all group">
              <Camera size={24} className="text-stone-300 group-hover:text-forest mb-1" />
              <span className="text-[10px] font-bold text-stone-400 group-hover:text-forest">Añadir</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-sunset hover:bg-[#e85a2a] disabled:bg-stone-300 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-sunset/20 transition-all transform active:scale-[0.98] flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            'Crear Tour Ahora'
          )}
        </button>
      </form>
    </div>
  );
}
