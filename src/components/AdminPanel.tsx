import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LogOut } from 'lucide-react';
import { Tour } from './TourCard';
import { tourService } from '../services/tourService';
import TourModal from './TourModal';

interface AdminPanelProps {
  onLogout: () => void;
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Escuchar todos los tours en tiempo real
  useEffect(() => {
    const unsubscribe = tourService.subscribeToAllTours((fetchedTours) => {
      setTours(fetchedTours);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Funciones para abrir el nuevo TourModal
  const startEdit = (tour: Tour) => {
    setEditingTour(tour);
    setIsTourModalOpen(true);
  };

  const startAdd = () => {
    setEditingTour(null);
    setIsTourModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este tour? Esta acción no se puede deshacer.')) {
      try {
        await tourService.deleteTour(id);
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Hubo un error al eliminar el tour.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-stone-900">Panel de Administración</h1>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              onClick={startAdd}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              <span>Nuevo Tour</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl font-bold hover:bg-stone-300 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-stone-500 font-medium animate-pulse">
            Cargando tus aventuras...
          </div>
        ) : tours.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-stone-100 flex flex-col items-center">
            <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-emerald-500">
              <Plus size={32} />
            </div>
            <p className="text-stone-500 mb-4 text-lg">Tu lista de tours está vacía.</p>
            <button onClick={startAdd} className="text-emerald-600 font-bold hover:underline text-lg">
              ¡Crea la primera aventura ahora!
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100 text-stone-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold">Tour</th>
                    <th className="p-4 font-bold hidden sm:table-cell">Categoría</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {tours.map((tour) => (
                    <tr key={tour.id} className="hover:bg-stone-50 transition-colors group">
                      <td className="p-4">
                        <p className="font-bold text-stone-900">{tour.title}</p>
                        <p className="text-sm text-stone-500 flex items-center gap-1">
                          {tour.location}
                        </p>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="capitalize text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md font-bold">
                          {tour.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={text-xs font-bold px-2.5 py-1 rounded-full ${tour.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}}>
                          {tour.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEdit(tour)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar Tour"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(tour.id!)}
                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            title="Eliminar Tour"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Aquí es donde llamamos a nuestro súper modal con IA y fotos */}
        <TourModal
          isOpen={isTourModalOpen}
          onClose={() => setIsTourModalOpen(false)}
          tour={editingTour || undefined}
        />
      </div>
    </div>
  );
}