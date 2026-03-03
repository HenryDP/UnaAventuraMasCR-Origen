import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Phone, Mail, MapPin, Menu, X, Edit2 } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ConfigModal from './ConfigModal';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

export default function Layout({ children }: any) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(doc(db, "config", "site"), (snapshot) => {
      if (snapshot.exists()) {
        setSiteConfig(snapshot.data());
      }
    });
    return () => unsubscribe();
  }, []);

  let whatsappLink = "https://wa.me/50687751442";
  if (siteConfig && siteConfig.whatsappNumber) {
    whatsappLink = "https://wa.me/" + siteConfig.whatsappNumber;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-900">
      {isAdmin && (
        <div className="bg-emerald-900 text-white px-4 py-2 flex justify-between items-center text-xs font-bold sticky top-0 z-[60] shadow-xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>MODO ADMINISTRADOR ACTIVO</span>
          </div>
          <button 
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all cursor-pointer"
          >
            <Edit2 size={12} className="mr-1.5" />
            EDITAR CONFIGURACIÓN GLOBAL
          </button>
        </div>
      )}

      <nav className={bg-white/80 backdrop-blur-md sticky ${isAdmin ? 'top-[36px]' : 'top-0'} z-50 border-b border-stone-100}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xl">A</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter leading-none uppercase">{siteConfig?.headerTitle || "UNA AVENTURA MÁS"}</span>
                  <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">{siteConfig?.headerSubtitle || "Costa Rica"}</span>
                </div>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className={text-sm font-bold transition-colors ${location.pathname === '/' ? 'text-emerald-600' : 'text-stone-600 hover:text-emerald-600'}}>Inicio</Link>
              <Link to="/tours" className={text-sm font-bold transition-colors ${location.pathname === '/tours' ? 'text-emerald-600' : 'text-stone-600 hover:text-emerald-600'}}>Tours</Link>
              <Link to="/admin" className="text-sm font-bold text-stone-400 hover:text-stone-600 transition-colors">Admin</Link>
              <a 
                href={whatsappLink}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Reservar Ahora
              </a>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stone-600 hover:text-emerald-600 p-2"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-stone-100 animate-in slide-in-from-top duration-300">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/" className="block px-4 py-3 text-base font-bold text-stone-900 hover:bg-stone-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>Inicio</Link>
              <Link to="/tours" className="block px-4 py-3 text-base font-bold text-stone-900 hover:bg-stone-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>Tours</Link>
              <Link to="/admin" className="block px-4 py-3 text-base font-bold text-stone-400 hover:bg-stone-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>Admin</Link>
              <div className="pt-4">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-emerald-600 text-white px-6 py-4 rounded-xl text-base font-bold shadow-lg" onClick={() => setIsMenuOpen(false)}>
                  Reservar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children || <Outlet />}
      </main>

      <footer className="bg-stone-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-xl">A</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tighter leading-none text-white">{siteConfig?.headerTitle || "UNA AVENTURA MÁS"}</span>
                  <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">{siteConfig?.headerSubtitle || "Costa Rica"}</span>
                </div>
              </Link>
              <p className="text-stone-400 max-w-md mb-8 leading-relaxed">
                {siteConfig?.companyDescription || "Somos tu puerta de entrada a las mejores aventuras en Costa Rica y el mundo. Experiencias auténticas, seguras y diseñadas para crear recuerdos inolvidables."}
              </p>
              <div className="flex space-x-4">
                <a href={siteConfig?.facebookUrl || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Facebook size={20} />
                </a>
                <a href={siteConfig?.instagramUrl || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Instagram size={20} />
                </a>
                <a href={siteConfig?.tiktokUrl || "https://tiktok.com"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <TikTokIcon />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Contacto</h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-stone-400">
                  <Phone size={18} className="text-emerald-500 mt-1 shrink-0" />
                  <span>+{siteConfig?.whatsappNumber || "506 8775-1442"}</span>
                </li>
                <li className="flex items-start space-x-3 text-stone-400">
                  <Mail size={18} className="text-emerald-500 mt-1 shrink-0" />
                  <span>{siteConfig?.contactEmail || "info@unaaventuramas.cr"}</span>
                </li>
                <li className="flex items-start space-x-3 text-stone-400">
                  <MapPin size={18} className="text-emerald-500 mt-1 shrink-0" />
                  <span>San José, Costa Rica</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Enlaces Rápidos</h4>
              <ul className="space-y-4">
                <li><Link to="/" className="text-stone-400 hover:text-emerald-400 transition-colors">Inicio</Link></li>
                <li><Link to="/tours" className="text-stone-400 hover:text-emerald-400 transition-colors">Tours Nacionales</Link></li>
                <li><Link to="/tours" className="text-stone-400 hover:text-emerald-400 transition-colors">Tours Internacionales</Link></li>
                <li><Link to="/admin" className="text-stone-400 hover:text-emerald-400 transition-colors">Administración</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-stone-500 text-sm">
              © {new Date().getFullYear()} {siteConfig?.footerCopyright || "Una Aventura Más Costa Rica. Todos los derechos reservados."}
            </p>
            <div className="flex space-x-6 text-stone-500 text-sm">
              <a href="#" className="hover:text-emerald-400">Privacidad</a>
              <a href="#" className="hover:text-emerald-400">Términos</a>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppButton />

      <ConfigModal 
        config={siteConfig || {}} 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)} 
      />
    </div>
  );
}