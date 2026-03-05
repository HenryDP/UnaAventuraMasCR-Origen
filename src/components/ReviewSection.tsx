import React, { useState, useEffect } from 'react';
import { Star, Send, User, MessageSquare } from 'lucide-react';
import { tourService, Review } from '../services/tourService';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewSectionProps {
  tourId: string;
}

export default function ReviewSection({ tourId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    const unsubscribe = tourService.subscribeToTourReviews(tourId, setReviews);
    return () => unsubscribe();
  }, [tourId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName || !formData.comment) {
      alert('Por favor completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await tourService.addReview({
        tourId,
        ...formData
      });
      setFormData({ userName: '', rating: 5, comment: '' });
      setShowForm(false);
      alert('¡Gracias por tu reseña!');
    } catch (error) {
      console.error("Error adding review:", error);
      alert('Error al enviar la reseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 mt-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-900 flex items-center">
          <MessageSquare className="mr-2 text-emerald-600" size={24} />
          Reseñas de Aventureros
        </h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors text-sm"
        >
          {showForm ? 'Cancelar' : 'Escribir una reseña'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Tu Nombre</label>
                  <input 
                    type="text" 
                    value={formData.userName}
                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                    className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Calificación</label>
                  <div className="flex gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({...formData, rating: star})}
                        className={`transition-colors ${formData.rating >= star ? 'text-amber-400' : 'text-stone-300'}`}
                      >
                        <Star size={24} fill={formData.rating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Tu Comentario</label>
                <textarea 
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Cuéntanos tu experiencia..."
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      <Send size={18} className="mr-2" />
                      Publicar Reseña
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">{review.userName}</div>
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                      {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                    </div>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? 'text-amber-400' : 'text-stone-200'} />
                  ))}
                </div>
              </div>
              <p className="text-stone-600 italic leading-relaxed">"{review.comment}"</p>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-stone-200">
            <p className="text-stone-400">Aún no hay reseñas para este tour. ¡Sé el primero en compartir tu experiencia!</p>
          </div>
        )}
      </div>
    </div>
  );
}