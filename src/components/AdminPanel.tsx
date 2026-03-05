import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { signOut, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Tour, SiteConfig } from './TourCard';
import { tourService } from '../services/tourService';
import TourModal from './TourModal';
import { 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  Save, 
  X, 
  Bell, 
  ShoppingBag, 
  Package, 
  Settings, 
  Layout as LayoutIcon, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Globe, 
  DollarSign,
  Star,
  CreditCard,
  PlusCircle,
  Map,
  Palette
} from 'lucide-react';
import { doc, onSnapshot, updateDoc, setDoc, collection } from 'firebase/firestore';

interface TourFormData {
  title: string;
  description: string;
  priceCRC: number;
  priceUSD: number;
  duration: string;
  location: string;
  category: 'nacional' | 'internacional';
  active: boolean;
  images: string; // Newline separated
  included: string; // Newline separated
  recommendations: string; // Newline separated
  pickupLocations: string; // Newline separated
  paymentLink: string;
  reserveLink: string;
}

interface ConfigFormData {
  headerTitle: string;
  headerSubtitle: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  footerCopyright: string;
  companyDescription: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
}

type AdminTab = 'dashboard' | 'tours' | 'sales' | 'appearance' | 'settings';

export default function AdminPanel({ user }: { user: User }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [tourSubTab, setTourSubTab] = useState<'nacional' | 'internacional'>('nacional');

  // Config Form
  const { register: registerConfig, handleSubmit: handleSubmitConfig, setValue: setConfigValue } = useForm<ConfigFormData>();

  useEffect(() => {
    if (!db) return;

    const unsubscribeTours = tourService.subscribeToAllTours(setTours);

    const unsubscribeConfig = onSnapshot(doc(db, "config", "site"), (snapshot) => {
      if (snapshot.exists()) {
        const configData = snapshot.data() as SiteConfig;
        setSiteConfig(configData);
        Object.entries(configData).forEach(([key, value]) => {
          setConfigValue(key as keyof ConfigFormData, value);
        });
      }
    });

    return () => {
      unsubscribeTours();
      unsubscribeConfig();
    };
  }, [setConfigValue]);

  const onLogout = async () => {
    await signOut(auth);
  };

  const onSubmitConfig = async (data: ConfigFormData) => {
    if (!db) return;
    try {
      await setDoc(doc(db, "config", "site"), data, { merge: true });
      alert("Configuración actualizada.");
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Error al guardar la configuración.");
    }
  };

  const startEdit = (tour: Tour) => {
    setEditingTour(tour);
    setIsTourModalOpen(true);
  };

  const startAdd = () => {
    setEditingTour(null);
    setIsTourModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-stone-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center">
              <span className="font-black text-white">A</span>
            </div>
            <span className="font-bold tracking-tight uppercase">Aventura Admin</span>
          </div>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('tours')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'tours' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}
          >
            <Package size={20} />
            <span className="font-medium">Tours</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'appearance' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}
          >
            <LayoutIcon size={20} />
            <span className="font-medium">Apariencia</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}
          >
            <Settings size={20} />
            <span className="font-medium">Ajustes</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-stone-800">
          <div className="mb-4 px-4 text-xs text-stone-500 truncate">
            {user.email}
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-stone-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-stone-900">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <div className="text-3xl font-bold text-stone-900">{tours.length}</div>
                <div className="text-sm text-stone-500">Tours Registrados</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <div className="text-3xl font-bold text-stone-900">{tours.filter(t => t.active).length}</div>
                <div className="text-sm text-stone-500">Tours Activos</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-stone-900">Gestión de Tours</h2>
              <button 
                onClick={startAdd}
                className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Nuevo Tour
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex space-x-4 border-b border-stone-200">
              <button 
                onClick={() => setTourSubTab('nacional')}
                className={`pb-2 px-4 text-sm font-bold transition-colors relative ${tourSubTab === 'nacional' ? 'text-emerald-600' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Nacionales
                {tourSubTab === 'nacional' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
              </button>
              <button 
                onClick={() => setTourSubTab('internacional')}
                className={`pb-2 px-4 text-sm font-bold transition-colors relative ${tourSubTab === 'internacional' ? 'text-emerald-600' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Internacionales
                {tourSubTab === 'internacional' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-stone-200">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Tour</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-stone-500 uppercase">Precio</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-stone-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {tours.filter(t => t.category === tourSubTab).map((tour) => (
                    <tr key={tour.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img className="h-10 w-10 rounded-lg object-cover mr-3" src={tour.images?.[0] || ''} alt="" />
                          <div>
                            <div className="text-sm font-bold text-stone-900">{tour.title}</div>
                            <div className="text-xs text-stone-500">{tour.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${tour.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {tour.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-stone-700">₡{tour.price?.crc?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => startEdit(tour)} className="text-stone-400 hover:text-emerald-600"><Edit size={18} /></button>
                        <button onClick={() => tourService.deleteTour(tour.id)} className="text-stone-400 hover:text-red-600"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-900">Apariencia</h2>
            <form onSubmit={handleSubmitConfig(onSubmitConfig)} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-stone-100 pb-6">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4">Encabezado (Header)</h3>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase">Título Principal</label>
                  <input {...registerConfig("headerTitle")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase">Subtítulo / Ciudad</label>
                  <input {...registerConfig("headerSubtitle")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-stone-100 pb-6">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4">Sección Principal (Hero)</h3>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase">Título Hero</label>
                  <input {...registerConfig("heroTitle")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase">Subtítulo Hero</label>
                  <input {...registerConfig("heroSubtitle")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase">URL Imagen Hero</label>
                  <input {...registerConfig("heroImageUrl")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4">Pie de Página (Footer)</h3>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase">Copyright / Texto Final</label>
                  <input {...registerConfig("footerCopyright")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="bg-emerald-600 text-white px-8 py-2 rounded-lg font-bold">Guardar Apariencia</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-900">Configuración</h2>
            <form onSubmit={handleSubmitConfig(onSubmitConfig)} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase">WhatsApp</label>
                  <input {...registerConfig("whatsappNumber")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase">Email Contacto</label>
                  <input {...registerConfig("contactEmail")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase">Descripción de Empresa</label>
                  <textarea {...registerConfig("companyDescription")} rows={3} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase">Facebook URL</label>
                  <input {...registerConfig("facebookUrl")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase">Instagram URL</label>
                  <input {...registerConfig("instagramUrl")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase">TikTok URL</label>
                  <input {...registerConfig("tiktokUrl")} className="mt-1 block w-full rounded-md border-stone-300 border p-2" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-emerald-600 text-white px-8 py-2 rounded-lg font-bold">Guardar Configuración</button>
              </div>
            </form>
          </div>
        )}
      </main>

      <TourModal 
        isOpen={isTourModalOpen}
        tour={editingTour || undefined}
        onClose={() => {
          setIsTourModalOpen(false);
          setEditingTour(null);
        }}
      />
    </div>
  );
}