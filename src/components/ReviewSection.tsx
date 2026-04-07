import React, { useState, useEffect } from 'react';
import { Star, User, MessageSquare } from 'lucide-react';
import { tourService, Review } from '../services/tourService';
import { motion } from 'motion/react';
import ReviewForm from './ReviewForm';

interface ReviewSectionProps {
  tourId: string;
}

export default function ReviewSection({ tourId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = tourService.subscribeToTourReviews(
      tourId, 
      (reviewsData) => {
        setReviews(reviewsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching reviews:", err);
        setError("Error al cargar las reseñas. Es posible que falte un índice en la base de datos.");
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [tourId]);

  return (
    <div className="space-y-8 mt-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-900 flex items-center">
          <MessageSquare className="mr-2 text-emerald-600" size={24} />
          Reseñas de Aventureros
        </h2>
      </div>

      <ReviewForm tourId={tourId} />

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto">
          <p className="font-bold mb-2">¡Ups! Algo salió mal.</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
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
              
              {review.adminResponse && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                      <User size={12} />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 uppercase">Respuesta de Una Aventura Más</span>
                  </div>
                  <p className="text-sm text-emerald-600 italic leading-relaxed">
                    "{review.adminResponse}"
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : !loading && !error && (
        <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-stone-200">
          <p className="text-stone-400">Aún no hay reseñas para este tour. ¡Sé el primero en compartir tu experiencia!</p>
        </div>
      )}
    </div>
  );
}
