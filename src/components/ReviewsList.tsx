import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  createdAt: any;
}

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    }, (error) => {
      console.error("Error fetching reviews:", error);
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
            "{review.text}"
          </p>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
              {review.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-stone-900">{review.name}</p>
              <p className="text-xs text-stone-400">Viajero Verificado</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}