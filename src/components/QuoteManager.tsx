import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  User, 
  Users,
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  ChevronRight, 
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Quote {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  totalPrice: number;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  createdAt: any;
  selectedDestinations: string[];
  selectedTours: string[];
  vehicleId: string;
}

export default function QuoteManager() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const quotesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Quote[];
      setQuotes(quotesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (quoteId: string, newStatus: string) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "quotes", quoteId), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!db || !window.confirm("¿Estás seguro de eliminar esta cotización?")) return;
    try {
      await deleteDoc(doc(db, "quotes", quoteId));
      if (selectedQuote?.id === quoteId) setSelectedQuote(null);
    } catch (error) {
      console.error("Error deleting quote:", error);
    }
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         q.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'contacted': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-stone-900">Cotizaciones Recibidas</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          <Clock size={14} className="animate-pulse" />
          Tiempo Real Activo
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {['all', 'pending', 'contacted', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${statusFilter === status ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                >
                  {status === 'all' ? 'Todos' : status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredQuotes.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-xl border border-dashed border-stone-300 text-stone-400 text-sm">
                No se encontraron cotizaciones.
              </div>
            ) : (
              filteredQuotes.map(quote => (
                <button
                  key={quote.id}
                  onClick={() => setSelectedQuote(quote)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedQuote?.id === quote.id ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-stone-200 bg-white hover:border-emerald-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {quote.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-stone-900 text-sm mb-1 truncate">{quote.customerName}</h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Users size={12} />
                    <span>{quote.peopleCount} personas</span>
                    <span className="text-emerald-600 font-black ml-auto">₡{quote.totalPrice.toLocaleString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail Section */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedQuote ? (
              <motion.div
                key={selectedQuote.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
              >
                <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 text-white p-3 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">Detalle de Cotización</h3>
                      <p className="text-xs text-stone-500">ID: {selectedQuote.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => deleteQuote(selectedQuote.id)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Información del Cliente</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <User className="text-emerald-600" size={16} />
                          <span className="font-bold text-stone-900">{selectedQuote.customerName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="text-emerald-600" size={16} />
                          <a href={`mailto:${selectedQuote.customerEmail}`} className="text-stone-600 hover:text-emerald-600 underline">{selectedQuote.customerEmail}</a>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="text-emerald-600" size={16} />
                          <a href={`tel:${selectedQuote.customerPhone}`} className="text-stone-600 hover:text-emerald-600 underline">{selectedQuote.customerPhone}</a>
                        </div>
                      </div>
                    </div>

                    {/* Trip Info */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Detalles del Viaje</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="text-emerald-600" size={16} />
                          <span className="text-stone-600">{selectedQuote.startDate} al {selectedQuote.endDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Users className="text-emerald-600" size={16} />
                          <span className="text-stone-600">{selectedQuote.peopleCount} personas</span>
                        </div>
                        <div className="pt-2">
                          <span className="text-2xl font-black text-emerald-700">₡{selectedQuote.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Destinations & Tours */}
                  <div className="space-y-4 pt-4 border-t border-stone-100">
                    <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Itinerario Seleccionado</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-stone-50 p-4 rounded-xl">
                        <p className="text-[10px] font-black text-stone-400 uppercase mb-2">Destinos / Parques</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedQuote.selectedDestinations?.map(dest => (
                            <span key={dest} className="px-2 py-1 bg-white border border-stone-200 rounded text-[10px] font-bold text-stone-700">
                              {dest}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-stone-50 p-4 rounded-xl">
                        <p className="text-[10px] font-black text-stone-400 uppercase mb-2">Tours Adicionales</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedQuote.selectedTours?.map(tour => (
                            <span key={tour} className="px-2 py-1 bg-emerald-100 border border-emerald-200 rounded text-[10px] font-bold text-emerald-700">
                              {tour}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-stone-100 flex flex-wrap gap-4">
                    <div className="flex-grow">
                      <label className="block text-[10px] font-black text-stone-400 uppercase mb-2">Cambiar Estado</label>
                      <div className="flex gap-2">
                        {['pending', 'contacted', 'completed', 'cancelled'].map(status => (
                          <button
                            key={status}
                            onClick={() => updateStatus(selectedQuote.id, status)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${selectedQuote.status === status ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-end">
                      <a 
                        href={`https://wa.me/${selectedQuote.customerPhone.replace(/\D/g, '')}?text=Hola ${selectedQuote.customerName}, te contacto de Una Aventura Más sobre tu cotización de viaje...`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
                      >
                        Contactar por WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="font-bold">Selecciona una cotización para ver los detalles</p>
                <p className="text-xs">Aquí aparecerán los datos de contacto y el itinerario solicitado.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
