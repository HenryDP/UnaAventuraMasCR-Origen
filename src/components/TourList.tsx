import React, { useEffect, useState } from 'react';
import TourCard, { Tour } from './TourCard';
import { tourService } from '../services/tourService';
import { useAuth } from '../context/AuthContext';
import TourModal from './TourModal';
import { Plus } from 'lucide-react';

interface TourListProps {
  category?: 'nacional' | 'internacional';
  limit?: number;
  searchQuery?: string;
}

const TourList: React.FC<TourListProps> = ({ category, limit, searchQuery = '' }) => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const unsubscribe = tourService.subscribeToActiveTours((allTours) => {
      let filtered = allTours;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = allTours.filter(t => 
          t.title.toLowerCase().includes(query) || 
          t.description.toLowerCase().includes(query) ||
          t.location.toLowerCase().includes(query)
        );
      }

      setTours(filtered);
      setLoading(false);
    }, { category, limit });

    return () => unsubscribe();
  }, [category, limit, searchQuery]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-80 bg-stone-200 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
        <p className="text-stone-500">No hay tours disponibles en esta categoría por el momento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isAdmin && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-full min-h-[400px] border-4 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
          >
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
              <Plus size={32} />
            </div>
            <span className="font-bold uppercase tracking-widest text-sm">Añadir Nuevo Tour</span>
          </button>
        )}
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
      
      <TourModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </>
  );
};

export default TourList;
