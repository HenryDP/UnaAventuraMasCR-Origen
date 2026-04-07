import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Send, X, CheckCircle } from 'lucide-react';
import { tourService } from '../services/tourService';

interface ReviewFormProps {
  tourId?: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ tourId, onSuccess }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [userName, setUserName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      alert('Por favor completa todos los campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await tourService.addReview({
        tourId,
        userName,
        comment,
        rating
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
        setUserName('');
        setComment('');
        setRating(5);
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (error: any) {
      console.error("Error adding review:", error);
      alert("Error: " + (error.message || "Hubo un error al enviar tu reseña."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 text-center">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg transform hover:scale-105"
        >
          Escribir una Reseña
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-2xl border border-stone-100 text-left relative"
        >
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
          >
            <X size={24} />
          </button>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-12 text-center"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">¡Gracias por tu reseña!</h3>
                <p className="text-stone-600">Tu opinión nos ayuda a seguir mejorando nuestras aventuras.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-stone-900">Cuéntanos tu experiencia</h3>
                
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Calificación</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="text-amber-400 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          fill={(hover || rating) >= star ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-stone-700 mb-2">Tu Nombre</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ej. María Rodríguez"
                  />
                </div>

                <div>
                  <label htmlFor="text" className="block text-sm font-bold text-stone-700 mb-2">Tu Reseña</label>
                  <textarea
                    id="text"
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="¿Qué fue lo que más te gustó del tour?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={20} />
                      Enviar Reseña
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
