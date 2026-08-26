import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Camera, Sparkles, Image as ImageIcon, Eye, EyeOff, ChevronDown } from 'lucide-react';
import TourList from '../components/TourList';
import ReviewsList from '../components/ReviewsList';
import ReviewForm from '../components/ReviewForm';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteConfig } from '../components/TourCard';
import { useAuth } from '../context/AuthContext';
import HeroImageModal from '../components/HeroImageModal';
import { tourService } from '../services/tourService';

export default function Home() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isTogglingText, setIsTogglingText] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(doc(db, "config", "site"), (snapshot) => {
      if (snapshot.exists()) {
        setSiteConfig(snapshot.data() as SiteConfig);
      }
    });
    return () => unsubscribe();
  }, []);

  const heroImage = siteConfig?.heroImageUrl || "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&q=80&w=1920";
  const isHeroTextHidden = siteConfig?.hideHeroText ?? false;

  const handleQuickToggleHeroText = async () => {
    setIsTogglingText(true);
    try {
      await tourService.updateSiteConfig({
        hideHeroText: !isHeroTextHidden
      });
    } catch (err) {
      console.error("Error toggling hero text:", err);
      alert("Error al actualizar la visibilidad del texto");
    } finally {
      setIsTogglingText(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Costa Rica Landscape" 
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient overlay when text is hidden, stronger overlay when text is shown */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${
            isHeroTextHidden 
              ? 'bg-linear-to-t from-black/40 via-transparent to-black/20' 
              : 'bg-linear-to-b from-black/50 via-black/40 to-black/70'
          }`}></div>
        </div>

        {/* Admin Quick Action Controls */}
        {isAdmin && (
          <div className="absolute top-6 right-6 z-30 flex items-center gap-2 animate-in fade-in flex-wrap justify-end">
            <button
              onClick={handleQuickToggleHeroText}
              disabled={isTogglingText}
              className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/30 hover:border-emerald-400 px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-xl hover:scale-105"
              title={isHeroTextHidden ? "Mostrar letras sobre la imagen" : "Ocultar letras y dejar solo la foto"}
            >
              {isHeroTextHidden ? (
                <>
                  <Eye size={14} className="text-emerald-400" />
                  <span>Mostrar Letras</span>
                </>
              ) : (
                <>
                  <EyeOff size={14} className="text-amber-400" />
                  <span>Ocultar Letras (Solo Foto)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsHeroModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 backdrop-blur-md text-white border border-white/30 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xl hover:scale-105 group/btn"
              title="Cambiar imagen o ajustar textos"
            >
              <Camera size={14} className="group-hover/btn:rotate-12 transition-transform" />
              <span>Ajustar Portada</span>
            </button>
          </div>
        )}
        
        {/* Hero Content (Only shown if hideHeroText is false) */}
        {!isHeroTextHidden ? (
          <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
            >
              {siteConfig?.heroTitle || "Una Aventura Más"} <br />
              <span className="text-emerald-400">Costa Rica</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-stone-200 mb-10 max-w-2xl mx-auto font-light"
            >
              {siteConfig?.heroSubtitle || "Explora los rincones más mágicos de nuestra tierra y descubre destinos internacionales inolvidables."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link 
                to="/tours" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                Explorar Tours
              </Link>
              <a 
                href="#nacional"
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 px-8 py-4 rounded-full text-lg font-bold transition-all"
              >
                Ver Nacionales
              </a>
            </motion.div>
          </div>
        ) : (
          /* When hero text is hidden, show a clean, elegant floating explore badge at the bottom */
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-center animate-bounce">
            <a 
              href="#nacional"
              className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white/90 hover:text-white backdrop-blur-md border border-white/20 hover:border-white/40 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all shadow-xl"
            >
              <span>Explorar Aventuras</span>
              <ChevronDown size={16} />
            </a>
          </div>
        )}
      </section>

      {/* Hero Image Modal */}
      <HeroImageModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        currentImageUrl={heroImage}
        siteConfig={siteConfig}
      />

      {/* Modules Section */}
      <section id="nacional" className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Aventuras Nacionales</h2>
              <p className="text-stone-600 max-w-2xl">
                Descubre la magia de Costa Rica. Tours de un día y expediciones locales con los mejores guías.
              </p>
            </div>
            <Link to="/tours" className="flex items-center text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
              Ver todos <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>

          <TourList category="nacional" limit={3} />
        </div>
      </section>

      {/* International Module */}
      <section className="py-20 bg-emerald-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-white">
            <path d="M45.7,-77.2C58.9,-71.1,69.1,-58.5,76.4,-44.7C83.7,-30.9,88.1,-15.5,88.3,0.1C88.5,15.7,84.5,31.4,76.4,45.2C68.3,59,56.1,70.9,41.9,77.7C27.7,84.5,11.5,86.2,-4,93.1C-19.5,100,-34.3,112.1,-46.9,109.2C-59.5,106.3,-69.9,88.4,-77.3,72.6C-84.7,56.8,-89.1,43.1,-91.7,29.1C-94.3,15.1,-95.1,0.8,-92.4,-12.8C-89.7,-26.4,-83.5,-39.3,-74.1,-50.1C-64.7,-60.9,-52.1,-69.6,-38.9,-75.7C-25.7,-81.8,-12.8,-85.3,1.5,-87.9C15.8,-90.5,32.5,-83.3,45.7,-77.2Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Destinos Internacionales</h2>
              <p className="text-emerald-100 max-w-2xl">
                Cruza fronteras con nosotros. Paquetes completos a Suramérica, Europa y más.
              </p>
            </div>
            <Link to="/tours" className="bg-white text-emerald-900 px-6 py-3 rounded-full font-bold hover:bg-emerald-50 transition-colors">
              Ver Destinos
            </Link>
          </div>

          <TourList category="internacional" limit={3} />
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">Lo que dicen nuestros aventureros</h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              La satisfacción de nuestros clientes es nuestra mayor recompensa. Lee sus experiencias reales.
            </p>
          </div>
          
          <ReviewsList />
          
          <ReviewForm />
        </div>
      </section>
    </div>
  );
}
