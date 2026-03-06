import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Edit2, Share2, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TourModal from './TourModal';
import ShareModal from './ShareModal';

export interface Tour {
  id: string;
  title: string;
  description: string;
  price: {
    crc: number;
    usd: number;
  };
  images: string[];
  included: string[];
  recommendations: string[];
  pickupLocations: string[];
  active: boolean;
  createdAt: any;
  duration: string;
  location: string;
  date?: string;
  price_national?: number;
  price_foreigner?: number;
  currency_foreigner?: 'USD' | 'CRC';
  distance?: string;
  difficulty?: 'principiante' | 'intermedio' | 'avanzado';
  category: 'nacional' | 'internacional';
  paymentLink: string;
  reserveLink?: string;
}

export interface SiteConfig {
  headerTitle: string;
  headerSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  logoUrl?: string;
  companyDescription: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  footerCopyright: string;
}

interface TourCardProps {
  tour: Tour;
}

const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const { isAdmin } = useAuth();
  const isSoldOut = !tour.active;
  const mainImage = tour.images?.[0] || 'https://picsum.photos/seed/tour/800/600';

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-stone-100 flex flex-col h-full relative ${isSoldOut ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      {isAdmin && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute top-4 left-4 z-30 bg-white/90 backdrop-blur-sm text-emerald-600 p-2 rounded-full shadow-lg hover:bg-emerald-600 hover:text-white transition-all"
          title="Editar Tour"
        >
          <Edit2 size={16} />
        </button>
      )}
      
      {isSoldOut && (
        <div className="absolute top-4 right-4 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg animate-pulse">
          No Disponible
        </div>
      )}
      <div className="relative aspect-[4/3] w-full shrink-0 bg-stone-100 overflow-hidden">
        <img 
          src={mainImage} 
          alt={tour.title} 
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-stone-900 mb-2">{tour.title}</h3>
        <p className="text-stone-500 text-sm mb-4 line-clamp-2 flex-grow">{tour.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-stone-500">
            <MapPin size={14} className="mr-1.5 text-emerald-600" />
            {tour.location}
          </div>
          <div className="flex items-center text-xs text-stone-500">
            <Clock size={14} className="mr-1.5 text-emerald-600" />
            {tour.duration}
          </div>
          {tour.date && (
            <div className="flex items-center text-xs text-stone-500">
              <Calendar size={14} className="mr-1.5 text-emerald-600" />
              {tour.date}
            </div>
          )}
          {(tour.distance || tour.difficulty) && (
            <div className="flex items-center gap-3 pt-1">
              {tour.distance && (
                <div className="flex items-center text-[10px] font-bold text-stone-400 uppercase">
                  <span className="bg-stone-100 px-1.5 py-0.5 rounded mr-1">KM</span>
                  {tour.distance}
                </div>
              )}
              {tour.difficulty && (
                <div className="flex items-center text-[10px] font-bold text-emerald-600 uppercase">
                  <AlertCircle size={12} className="mr-1" />
                  {tour.difficulty}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-stone-500">Desde</span>
            <div className="flex items-center text-emerald-700 font-bold">
              {tour.price_national ? (
                <>
                  <span className="text-sm font-bold mr-1">₡</span>
                  {tour.price_national.toLocaleString()}
                </>
              ) : tour.price_foreigner ? (
                <>
                  <span className="text-sm font-bold mr-1">$</span>
                  {tour.price_foreigner.toLocaleString()}
                </>
              ) : (
                <>
                  <span className="text-sm font-bold mr-1">₡</span>
                  {tour.price?.crc?.toLocaleString() || 0}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 text-stone-400 hover:text-emerald-600 transition-colors"
              title="Compartir"
            >
              <Share2 size={18} />
            </button>
            <Link 
              to={`/tours/${tour.id}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Ver Detalles
            </Link>
          </div>
        </div>
      </div>
      
      <TourModal 
        tour={tour} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={`${window.location.origin}/tours/${tour.id}`}
        title={tour.title}
        description={tour.description}
      />
    </div>
  );
};

export default TourCard;
