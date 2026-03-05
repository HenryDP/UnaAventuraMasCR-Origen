import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tourService } from '../services/tourService';
import { Tour, SiteConfig } from '../components/TourCard';
import { MapPin, Clock, Calendar, ArrowLeft, CheckCircle, AlertCircle, Bus, CreditCard, ChevronLeft, ChevronRight, Edit2, Share2 } from 'lucide-react';
import { useWhatsApp } from '../context/WhatsAppContext';
import { useAuth } from '../context/AuthContext';
import TourModal from '../components/TourModal';
import ShareModal from '../components/ShareModal';
import ReviewSection from '../components/ReviewSection';

export default function TourDetail() {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { setMessage, resetMessage } = useWhatsApp();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch Site Config & Tour in parallel for performance
        const [config, tourData] = await Promise.all([
          tourService.getSiteConfig(),
          tourService.getTourById(id)
        ]);

        if (config) setSiteConfig(config);
        
        if (tourData) {
          setTour(tourData);
          setMessage(`¡Hola! Me interesa comprar el tour a ${tourData.title}. ¿Me podrían dar más información?`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      resetMessage();
    };
  }, [id, setMessage, resetMessage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Tour no encontrado</h2>
        <Link to="/tours" className="text-emerald-600 hover:underline">Volver a los tours</Link>
      </div>
    );
  }

  const nextImage = () => {
    if (tour.images && tour.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % tour.images.length);
    }
  };

  const prevImage = () => {
    if (tour.images && tour.images.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + tour.images.length) % tour.images.length);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-20">
      {/* Image Gallery / Hero */}
      <div className="relative h-[60vh] w-full bg-stone-900 overflow-hidden">
        {tour.images && tour.images.length > 0 ? (
          <>
            <img 
              src={tour.images[activeImageIndex]} 
              alt={`${tour.title} - ${activeImageIndex + 1}`} 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            {tour.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                >
                  <ChevronRight size={24} />
                </button>
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                  {tour.images.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-emerald-500 w-6' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-500">
            No hay imágenes disponibles
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-12">
            <div className="flex justify-between items-start mb-4">
              <Link to="/tours" className="text-white/80 hover:text-white flex items-center transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Volver
              </Link>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-xl backdrop-blur-md flex items-center font-bold text-sm transition-all"
                >
                  <Share2 size={16} className="mr-2" />
                  COMPARTIR
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-xl backdrop-blur-md flex items-center font-bold text-sm transition-all"
                  >
                    <Edit2 size={16} className="mr-2" />
                    EDITAR TOUR
                  </button>
                )}
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{tour.title}</h1>
            <div className="flex flex-wrap items-center text-white/90 gap-6">
              <span className="flex items-center"><MapPin size={18} className="mr-2 text-emerald-400" /> {tour.location}</span>
              <span className="flex items-center"><Clock size={18} className="mr-2 text-emerald-400" /> {tour.duration}</span>
              {tour.distance && (
                <span className="flex items-center">
                  <span className="w-5 h-5 flex items-center justify-center mr-2 bg-emerald-400/20 rounded text-[10px] font-bold text-emerald-400 border border-emerald-400/30">KM</span>
                  {tour.distance}
                </span>
              )}
              {tour.difficulty && (
                <span className="flex items-center">
                  <AlertCircle size={18} className="mr-2 text-emerald-400" />
                  <span className="capitalize">{tour.difficulty}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-stone-900 mb-4">Descripción</h2>
              <p className="text-stone-600 leading-relaxed text-lg whitespace-pre-line">
                {tour.description}
              </p>
            </div>

            {tour.images && tour.images.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-stone-900 mb-6">Galería de Fotos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {tour.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${idx === activeImageIndex ? 'border-emerald-500 scale-95' : 'border-transparent hover:border-emerald-200'}`}
                    >
                      <img 
                        src={img} 
                        alt={`${tour.title} gallery ${idx}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center">
                  <CheckCircle className="mr-2 text-emerald-600" size={20} />
                  ¿Qué incluye?
                </h3>
                <ul className="space-y-2 text-stone-600">
                  {tour.included?.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-emerald-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center">
                  <AlertCircle className="mr-2 text-amber-500" size={20} />
                  Recomendaciones
                </h3>
                <ul className="space-y-2 text-stone-600">
                  {tour.recommendations?.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-amber-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center">
                <Bus className="mr-2 text-blue-500" size={20} />
                Puntos de Salida / Pickup
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                {tour.pickupLocations?.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Reviews Section */}
            <ReviewSection tourId={tour.id} />
          </div>

          {/* Sidebar Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-stone-100 sticky top-24">
              <h3 className="text-xl font-bold text-stone-900 mb-6">Precios</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                  <span className="text-stone-600 font-medium">Nacionales</span>
                  <div className="text-xl font-bold text-emerald-700">
                    ₡{tour.price?.crc?.toLocaleString() || 0}
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                  <span className="text-stone-600 font-medium">Extranjeros</span>
                  <div className="text-xl font-bold text-emerald-700">
                    ${tour.price?.usd?.toLocaleString() || 0}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {tour.paymentLink && (
                  <a 
                    href={tour.paymentLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
                  >
                    <CreditCard className="mr-2" size={20} />
                    Comprar Tour (Pago Completo)
                  </a>
                )}
                
                {tour.reserveLink && (
                  <a 
                    href={tour.reserveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold py-4 px-4 rounded-xl transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 duration-200"
                  >
                    <Calendar className="mr-2" size={20} />
                    Reservar Espacio (Pago Parcial)
                  </a>
                )}

                {!tour.paymentLink && !tour.reserveLink && (
                  <button 
                    onClick={() => window.open(`https://wa.me/${siteConfig?.whatsappNumber || '50688888888'}?text=Hola! Me interesa el tour ${tour.title}`, '_blank')}
                    className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Consultar por WhatsApp
                  </button>
                )}
                
                <p className="text-xs text-center text-stone-500 mt-4 leading-relaxed">
                  Serás redirigido a nuestra plataforma de pago segura. Una vez realizado el pago, recibirás la confirmación en tu correo.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <TourModal 
        tour={tour} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
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
}