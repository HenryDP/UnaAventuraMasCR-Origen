import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Save } from 'lucide-react';
import { SiteConfig } from './TourCard';
import { tourService } from '../services/tourService';

interface ConfigModalProps {
  config: SiteConfig;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigModal({ config, isOpen, onClose }: ConfigModalProps) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<SiteConfig>({
    defaultValues: config
  });

  if (!isOpen) return null;

  const onSubmit = async (data: SiteConfig) => {
    try {
      await tourService.updateSiteConfig(data);
      alert('Configuración actualizada correctamente');
      onClose();
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Error al actualizar la configuración');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-xl font-bold text-stone-900">Editar Configuración Global</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider">Encabezado (Header)</h3>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Título Principal</label>
                <input {...register('headerTitle')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Subtítulo / Ciudad</label>
                <input {...register('headerSubtitle')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider">Pie de Página (Footer)</h3>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Copyright / Texto Final</label>
                <input {...register('footerCopyright')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider">Hero Section</h3>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Título Hero</label>
                <input {...register('heroTitle')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Subtítulo Hero</label>
                <textarea {...register('heroSubtitle')} rows={2} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">URL Imagen Hero</label>
                <input {...register('heroImageUrl')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider">Contacto</h3>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">WhatsApp (Ej: 50688888888)</label>
                <input {...register('whatsappNumber')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Email de Contacto</label>
                <input {...register('contactEmail')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Descripción de Empresa</label>
                <textarea {...register('companyDescription')} rows={3} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-emerald-600 text-sm uppercase tracking-wider">Redes Sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Facebook URL</label>
                <input {...register('facebookUrl')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Instagram URL</label>
                <input {...register('instagramUrl')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">TikTok URL</label>
                <input {...register('tiktokUrl')} className="w-full p-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
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
            className="flex items-center bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50"
          >
            <Save size={20} className="mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
