import React, { useEffect, useState } from 'react';
import { Star, Trash2, CheckCircle, XCircle, Clock, User, Edit2, Save, X, MessageSquare } from 'lucide-react';
import { tourService, Review } from '../services/tourService';

export default function ReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ userName: '', comment: '', rating: 5 });
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    const unsubscribe = tourService.subscribeToAllReviews((reviewsData) => {
      setReviews(reviewsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await tourService.updateReviewStatus(id, status);
    } catch (error) {
      console.error("Error updating review status:", error);
    }
  };

  const saveResponse = async (id: string) => {
    try {
      await tourService.updateReviewResponse(id, responseText);
      setRespondingId(null);
      setResponseText('');
    } catch (error) {
      console.error("Error saving response:", error);
      alert("Error al guardar la respuesta.");
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta reseña?")) return;
    try {
      await tourService.deleteReview(id);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditData({
      userName: review.userName,
      comment: review.comment,
      rating: review.rating
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await tourService.updateReview(editingId, editData);
      setEditingId(null);
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Error al actualizar la reseña.");
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
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                    {editingId === review.id ? (
                      <div className="space-y-2">
                        <input 
                          type="text"
                          value={editData.userName}
                          onChange={(e) => setEditData({...editData, userName: e.target.value})}
                          className="text-sm font-bold text-stone-900 border rounded px-2 py-1 w-full"
                        />
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setEditData({...editData, rating: star})}
                              className={`text-amber-400 ${editData.rating >= star ? 'opacity-100' : 'opacity-30'}`}
                            >
                              <Star size={12} fill={editData.rating >= star ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-bold text-stone-900">{review.userName}</div>
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === review.id ? (
                      <textarea 
                        value={editData.comment}
                        onChange={(e) => setEditData({...editData, comment: e.target.value})}
                        className="text-sm text-stone-600 border rounded px-2 py-1 w-full"
                        rows={2}
                      />
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-stone-600 max-w-md line-clamp-2">{review.comment}</p>
                        {review.adminResponse && (
                          <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Tu Respuesta:</p>
                            <p className="text-xs text-emerald-600 italic">"{review.adminResponse}"</p>
                          </div>
                        )}
                        {respondingId === review.id && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                            <label className="block text-[10px] font-bold text-blue-700 uppercase">Tu Respuesta:</label>
                            <textarea 
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              className="text-xs text-stone-600 border border-blue-200 rounded-lg px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Escribe tu respuesta aquí..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => saveResponse(review.id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
                              >
                                Publicar Respuesta
                              </button>
                              <button 
                                onClick={() => {setRespondingId(null); setResponseText('');}}
                                className="bg-white text-stone-500 border border-stone-200 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-stone-50 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                    {editingId === review.id ? (
                      <>
                        <button 
                          onClick={saveEdit}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Guardar"
                        >
                          <Save size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="p-1 text-stone-400 hover:bg-stone-50 rounded"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setRespondingId(review.id);
                            setResponseText(review.adminResponse || '');
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Responder"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button 
                          onClick={() => startEdit(review)}
                          className="p-1 text-stone-600 hover:bg-stone-50 rounded"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
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
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-stone-100">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  {editingId === review.id ? (
                    <input 
                      type="text"
                      value={editData.userName}
                      onChange={(e) => setEditData({...editData, userName: e.target.value})}
                      className="text-sm font-bold text-stone-900 border rounded px-2 py-1 w-full mb-1"
                    />
                  ) : (
                    <div className="text-sm font-bold text-stone-900">{review.userName}</div>
                  )}
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        fill={i < (editingId === review.id ? editData.rating : review.rating) ? "currentColor" : "none"} 
                        onClick={() => editingId === review.id && setEditData({...editData, rating: i + 1})}
                        className={editingId === review.id ? 'cursor-pointer' : ''}
                      />
                    ))}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                  review.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                  review.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {review.status === 'approved' ? 'Aprobada' : 
                   review.status === 'pending' ? 'Pendiente' : 
                   'Rechazada'}
                </span>
              </div>
              
              <div>
                {editingId === review.id ? (
                  <textarea 
                    value={editData.comment}
                    onChange={(e) => setEditData({...editData, comment: e.target.value})}
                    className="text-sm text-stone-600 border rounded px-2 py-1 w-full"
                    rows={3}
                  />
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-stone-600">{review.comment}</p>
                    {review.adminResponse && (
                      <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase">Tu Respuesta:</p>
                        <p className="text-xs text-emerald-600 italic">"{review.adminResponse}"</p>
                      </div>
                    )}
                    {respondingId === review.id && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
                        <textarea 
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          className="text-xs text-stone-600 border border-blue-200 rounded-lg px-2 py-1 w-full"
                          placeholder="Escribe tu respuesta..."
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveResponse(review.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold">
                            Responder
                          </button>
                          <button onClick={() => {setRespondingId(null); setResponseText('');}} className="bg-white text-stone-500 border border-stone-200 px-2 py-1 rounded text-[10px] font-bold">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingId === review.id ? (
                  <>
                    <button onClick={saveEdit} className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded text-xs font-bold">
                      <Save size={14} /> Guardar
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1 bg-stone-100 text-stone-600 px-3 py-1.5 rounded text-xs font-bold">
                      <X size={14} /> Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setRespondingId(review.id);
                        setResponseText(review.adminResponse || '');
                      }} 
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                      title="Responder"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button onClick={() => startEdit(review)} className="p-2 text-stone-600 bg-stone-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    {review.status !== 'approved' && (
                      <button onClick={() => updateStatus(review.id, 'approved')} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg">
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button onClick={() => updateStatus(review.id, 'rejected')} className="p-2 text-amber-600 bg-amber-50 rounded-lg">
                        <XCircle size={16} />
                      </button>
                    )}
                    <button onClick={() => deleteReview(review.id)} className="p-2 text-red-600 bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
