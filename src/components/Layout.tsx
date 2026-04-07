import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook, Phone, Mail, MapPin, Menu, X, Compass, User as UserIcon, LogOut } from 'lucide-react';
import WhatsAppButton from './WhatsAppButton';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteConfig } from './TourCard';
import { useAuth } from '../context/AuthContext';
import ConfigModal from './ConfigModal';
import AuthModal from './AuthModal';
import { Edit2 } from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

export default function Layout({ children }: { children?: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const location = useLocation();
  const isImmersivePage = location.pathname === '/arma-tu-viaje';

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(doc(db, "config", "site"), (snapshot) => {
      if (snapshot.exists()) {
        const config = snapshot.data() as SiteConfig;
        setSiteConfig(config);
        
        // Update Favicon
        if (config.logoUrl) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          const appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
          if (link) link.href = config.logoUrl;
          if (appleLink) appleLink.href = config.logoUrl;
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const whatsappLink = siteConfig?.whatsappNumber 
    ? `https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, '')}` 
    : "https://wa.me/50687751442";

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-900">
      {/* Admin Bar */}
      {isAdmin && (
        <div className="bg-emerald-900 text-white px-4 py-2 flex justify-between items-center text-xs font-bold sticky top-0 z-[60] shadow-xl">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span>MODO ADMINISTRADOR ACTIVO</span>
          </div>
          <button 
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all"
          >
            <Edit2 size={12} className="mr-1.5" />
            EDITAR CONFIGURACIÓN GLOBAL
          </button>
        </div>
      )}

      {/* Navigation */}
      {!isImmersivePage && (
        <nav className={`bg-white/80 backdrop-blur-md sticky ${isAdmin ? 'top-[36px]' : 'top-0'} ${isMenuOpen ? 'z-[1000]' : 'z-50'} border-b border-stone-100`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex items-center">
                <div onDoubleClick={() => window.location.href = '/admin'} className="flex items-center cursor-pointer">
                  <Link to="/" className="flex items-center space-x-2">
                    {siteConfig?.logoUrl ? (
                      <img 
                        src={siteConfig.logoUrl} 
                        alt="Logo" 
                        className="w-12 h-12 object-contain drop-shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50 transform transition-transform group-hover:rotate-12">
                        <Compass className="text-white w-7 h-7" />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xl font-black tracking-tighter leading-none uppercase bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600">
                        {siteConfig?.headerTitle || "UNA AVENTURA MÁS"}
                      </span>
                      <span className="text-[11px] font-black text-emerald-600 tracking-[0.2em] uppercase mt-0.5">
                        {siteConfig?.headerSubtitle || "Costa Rica"}
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className={`text-sm font-bold transition-colors ${location.pathname === '/' ? 'text-emerald-600' : 'text-stone-600 hover:text-emerald-600'}`}>Inicio</Link>
                <Link to="/tours" className={`text-sm font-bold transition-colors ${location.pathname === '/tours' ? 'text-emerald-600' : 'text-stone-600 hover:text-emerald-600'}`}>Tours</Link>
                <Link to="/arma-tu-viaje" className={`text-sm font-bold transition-colors ${location.pathname === '/arma-tu-viaje' ? 'text-emerald-600' : 'text-stone-600 hover:text-emerald-600'}`}>Arma tu Viaje</Link>
                
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                          <UserIcon size={14} />
                        </div>
                      )}
                      <span className="text-xs font-bold text-stone-700 truncate max-w-[100px]">{user.displayName?.split(' ')[0]}</span>
                    </div>
                    <button 
                      onClick={logout}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                      title="Cerrar Sesión"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center space-x-2 text-stone-600 hover:text-emerald-600 transition-colors font-bold text-sm"
                  >
                    <UserIcon size={18} />
                    <span>Ingresar</span>
                  </button>
                )}

                <a 
                  href={whatsappLink}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-emerald-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Reservar Ahora
                </a>
              </div>

              {/* Mobile menu button - Hidden in favor of Floating Menu */}
              <div className="md:hidden flex items-center">
                {/* We'll use the Floating Menu instead */}
              </div>
            </div>
          </div>

          {/* Mobile Menu - Removed traditional version */}
        </nav>
      )}

      {/* Floating Menu for Mobile */}
      <div className="md:hidden">
        <AnimatePresence>
          {isFloatingMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFloatingMenuOpen(false)}
                className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-[5000]"
              />
              
              {/* Compact Floating Menu Content */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20, x: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20, x: 20 }}
                className="fixed bottom-24 right-6 w-64 bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[5001] overflow-hidden border border-white/20"
              >
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                    <span className="text-[10px] font-black text-emerald-600 tracking-[0.2em] uppercase">Explorar</span>
                    <button onClick={() => setIsFloatingMenuOpen(false)} className="text-stone-400">
                      <X size={16} />
                    </button>
                  </div>

                  {user && (
                    <div className="flex items-center space-x-3 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-white shadow-sm" />
                      ) : (
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {user.displayName?.charAt(0) || <UserIcon size={14} />}
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-stone-900 truncate text-xs">{user.displayName?.split(' ')[0]}</span>
                        <button onClick={logout} className="text-[9px] font-black text-red-500 uppercase text-left">Salir</button>
                      </div>
                    </div>
                  )}

                  {!user && (
                    <button 
                      onClick={() => {
                        setIsFloatingMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-100"
                    >
                      <UserIcon size={14} />
                      INGRESAR
                    </button>
                  )}

                  <div className="flex flex-col gap-1">
                    {[
                      { to: "/", label: "Inicio" },
                      { to: "/tours", label: "Tours" },
                      { to: "/arma-tu-viaje", label: "Arma tu Viaje" }
                    ].map((item) => (
                      <Link 
                        key={item.to}
                        to={item.to} 
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${location.pathname === item.to ? 'bg-emerald-50 text-emerald-600' : 'text-stone-600 hover:bg-stone-50'}`}
                        onClick={() => setIsFloatingMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="pt-1">
                    <a 
                      href={whatsappLink}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-stone-900 text-white py-3 rounded-xl text-xs font-black active:scale-95 transition-transform"
                    >
                      <Phone size={14} />
                      WHATSAPP
                    </a>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Draggable Floating Button */}
        <motion.div
          drag
          dragMomentum={false}
          dragConstraints={{ 
            left: -window.innerWidth + 80, 
            right: 0, 
            top: -window.innerHeight + 100, 
            bottom: 0 
          }}
          className="fixed bottom-6 right-6 z-[6000]"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
            className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.4)] flex items-center justify-center border-4 border-white active:bg-emerald-700 transition-colors"
          >
            {isFloatingMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </motion.div>
      </div>

      <main className="flex-grow relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {children || <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      {!isImmersivePage && (
        <footer className="bg-stone-900 text-white pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <Link to="/" className="flex items-center space-x-3 mb-8 group">
                  {siteConfig?.logoUrl ? (
                    <img 
                      src={siteConfig.logoUrl} 
                      alt="Logo" 
                      className="w-12 h-12 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 group-hover:rotate-12 transition-transform">
                      <Compass className="text-white w-7 h-7" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tighter leading-none text-white uppercase">
                      {siteConfig?.headerTitle || "UNA AVENTURA MÁS"}
                    </span>
                    <span className="text-[11px] font-black text-emerald-400 tracking-[0.2em] uppercase mt-1">
                      {siteConfig?.headerSubtitle || "Costa Rica"}
                    </span>
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
                    <span>+{siteConfig?.whatsappNumber || "506 8888-8888"}</span>
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
                  <li><Link to="/arma-tu-viaje" className="text-stone-400 hover:text-emerald-400 transition-colors">Arma tu Viaje</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-stone-500 text-sm">
                © {new Date().getFullYear()} {siteConfig?.footerCopyright || "Una Aventura Más Costa Rica. Todos los derechos reservados."}
              </p>
              <div className="flex space-x-6 text-stone-500 text-sm">
                <Link to="/privacidad" className="hover:text-emerald-400">Privacidad</Link>
                <Link to="/terminos" className="hover:text-emerald-400">Términos</Link>
              </div>
            </div>
          </div>
        </footer>
      )}

      <WhatsAppButton />
      
      {siteConfig && (
        <ConfigModal 
          config={siteConfig} 
          isOpen={isConfigModalOpen} 
          onClose={() => setIsConfigModalOpen(false)} 
        />
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
