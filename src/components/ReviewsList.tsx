import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, User } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Review {
  id: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: any;
  adminResponse?: string;
}

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;
    
    const q = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(6)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Error fetching reviews:", err);
      setError("Error al cargar las reseñas. Es posible que falte un índice en la base de datos.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 bg-red-50 rounded-2xl border border-red-100 max-w-2xl mx-auto">
        <p className="font-bold mb-2">¡Ups! Algo salió mal.</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-stone-500 italic">
        Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow relative group"
        >
          <div className="absolute top-6 right-8 text-emerald-100 group-hover:text-emerald-200 transition-colors">
            <Quote size={48} />
          </div>
          
          <div className="flex text-amber-400 mb-4 relative z-10">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={18} 
                fill={i < review.rating ? "currentColor" : "none"} 
                className={i < review.rating ? "" : "text-stone-200"}
              />
            ))}
          </div>
          
          <p className="text-stone-600 italic mb-6 leading-relaxed relative z-10">
            "{review.comment}"
          </p>

          {review.adminResponse && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                  <User size={10} />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Respuesta de la Agencia</span>
              </div>
              <p className="text-xs text-emerald-600 italic leading-relaxed">
                "{review.adminResponse}"
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
              {review.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-stone-900">{review.userName}</p>
              <p className="text-xs text-stone-400">Viajero Verificado</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
