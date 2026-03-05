import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Star, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: any;
}

export default function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'reviews', id), { status });
    } catch (error) {
      console.error("Error updating review status:", error);
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta reseña?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  if (loading) return <div className="text-center py-12">Cargando reseñas...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-900">Gestión de Reseñas</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1 text-emerald-600">
            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
            <span>{reviews.filter(r => r.status === 'approved').length} Aprobadas</span>
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            <span>{reviews.filter(r => r.status === 'pending').length} Pendientes</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-stone-200">
        <table className="min-w-full divide-y divide-stone-200">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Reseña</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-stone-900">{review.name}</div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-stone-600 max-w-md line-clamp-2">{review.text}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                    review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                    review.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {review.status === 'approved' ? <CheckCircle size={10} /> : 
                     review.status === 'pending' ? <Clock size={10} /> : 
                     <XCircle size={10} />}
                    {review.status === 'approved' ? 'Aprobada' : 
                     review.status === 'pending' ? 'Pendiente' : 
                     'Rechazada'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {review.status !== 'approved' && (
                    <button 
                      onClick={() => updateStatus(review.id, 'approved')}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Aprobar"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button 
                      onClick={() => updateStatus(review.id, 'rejected')}
                      className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                      title="Rechazar"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteReview(review.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}