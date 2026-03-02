import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function ConfigModal({ config, isOpen, onClose }: any) {
  const [formData, setFormData] = useState({
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    whatsappNumber: '',
    footerCopyright: ''
  });

  // Cargar los datos actuales cuando se abre el modal
  useEffect(() => {
    if (config) {
      setFormData({
        facebookUrl: config.facebookUrl || '',
        instagramUrl: config.instagramUrl || '',
        tiktokUrl: config.tiktokUrl || '',
        whatsappNumber: config.whatsappNumber || '',
        footerCopyright: config.footerCopyright || ''
      });
    }
  }, [config]);

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      // Guarda los datos en Firebase al instante
      await setDoc(doc(db, "config", "site"), formData, { merge: true });
      onClose(); // Cierra el modal automáticamente al terminar
    } catch (error) {
      console.error("Error guardando", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <h2 className="text-xl font-black text-stone-900">Editar Configuración Global</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">WhatsApp (Número con código de país, sin el +)</label>
              <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="Ej: 50687751442" className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Facebook URL</label>
              <input name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/..." className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">Instagram URL</label>
              <input name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..." className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">TikTok URL</label>
              <input name="tiktokUrl" value={formData.tiktokUrl} onChange={handleChange} placeholder="https://tiktok.com/..." className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:border-emerald-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1">Texto del Pie de Página (Copyright)</label>
            <input name="footerCopyright" value={formData.footerCopyright} onChange={handleChange} placeholder="Ej: Una Aventura Más Costa Rica. Todos los derechos reservados." className="w-full border border-stone-300 rounded-lg p-3 text-stone-900 focus:border-emerald-500 outline-none" />
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-stone-500 font-bold hover:bg-stone-100 rounded-lg mr-2 transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
}