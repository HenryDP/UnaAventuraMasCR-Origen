import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Users, 
  Car, 
  MapPin, 
  Utensils, 
  Hotel, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  CheckCircle2,
  AlertCircle,
  Info,
  Camera,
  Trees,
  User,
  Mail,
  Phone,
  Home as HomeIcon,
  Save,
  Loader2,
  Compass
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ITINERARY_CONFIG, ItineraryConfig } from '../constants/itineraryConfig';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { Tour } from '../components/TourCard';
import { Link } from 'react-router-dom';

// Types
interface ItineraryData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  vehicleId: string;
  selectedDestinations: string[];
  selectedTours: string[];
  selectedExperiences: string[];
  includeHospedaje: boolean;
  includeAlimentacion: string[]; // ['desayuno', 'almuerzo', 'cena']
  includeGuia: boolean;
}

const STEPS = [
  { id: 'contact', title: 'Contacto', icon: <User size={20} /> },
  { id: 'logistics', title: 'Logística', icon: <Car size={20} /> },
  { id: 'destinations', title: 'Destinos', icon: <MapPin size={20} /> },
  { id: 'services', title: 'Servicios', icon: <Hotel size={20} /> },
  { id: 'summary', title: 'Resumen', icon: <CheckCircle2 size={20} /> }
];

export default function ItineraryBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [availableTours, setAvailableTours] = useState<Tour[]>([]);
  const [config, setConfig] = useState<ItineraryConfig>(ITINERARY_CONFIG);
  const [data, setData] = useState<ItineraryData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    startDate: '',
    endDate: '',
    peopleCount: 2,
    vehicleId: ITINERARY_CONFIG.vehiculos[0].id,
    selectedDestinations: [],
    selectedTours: [],
    selectedExperiences: [],
    includeHospedaje: true,
    includeAlimentacion: ['desayuno', 'almuerzo'],
    includeGuia: true
  });

  // Fetch Config
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(doc(db, "config", "itinerary"), (snapshot) => {
      if (snapshot.exists()) {
        const newConfig = snapshot.data() as ItineraryConfig;
        setConfig(newConfig);
        // Ensure vehicleId is valid if config changes
        setData(prev => ({
          ...prev,
          vehicleId: newConfig.vehiculos.find(v => v.id === prev.vehicleId) ? prev.vehicleId : newConfig.vehiculos[0].id
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Tours
  useEffect(() => {
    const fetchTours = async () => {
      if (!db) return;
      try {
        const q = query(collection(db, "tours"), where("active", "==", true));
        const snapshot = await getDocs(q);
        const tours = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
        setAvailableTours(tours);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };
    fetchTours();
  }, []);

  // Calculations
  const calculations = useMemo(() => {
    const days = data.startDate && data.endDate 
      ? Math.max(1, Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 1;
    const nights = Math.max(0, days - 1);

    // 1. Transporte
    const vehicle = config.vehiculos.find(v => v.id === data.vehicleId) || config.vehiculos[0];
    const totalKm = data.selectedDestinations.reduce((acc, destId) => {
      const dest = config.destinos.find(d => d.id === destId);
      return acc + (dest?.distanciaEstimadaKm || 0);
    }, 0);
    const extraPassengers = Math.max(0, data.peopleCount - 1);
    const transportCost = (vehicle.tarifaBase + (totalKm * vehicle.precioKm)) + (extraPassengers * vehicle.cargoExtraPasajero);

    // 2. Hospedaje
    const roomsNeeded = Math.ceil(data.peopleCount / config.hospedaje.maxPersonasPorHabitacion);
    const hospedajeCost = data.includeHospedaje 
      ? (nights * roomsNeeded * config.hospedaje.costoNetoNocheHabitacion)
      : 0;

    // 3. Actividades (SINAC + Tours + Experiencias)
    const sinacCost = data.selectedDestinations.reduce((acc, destId) => {
      const dest = config.destinos.find(d => d.id === destId);
      return acc + ((dest?.costoEntradaNeto || 0) * data.peopleCount);
    }, 0);

    const toursCost = data.selectedTours.reduce((acc, tourId) => {
      const tour = availableTours.find(t => t.id === tourId);
      const price = tour?.price_national || tour?.price?.crc || 0;
      return acc + (price * data.peopleCount);
    }, 0);

    const experiencesCost = data.selectedExperiences.reduce((acc, expId) => {
      const exp = config.experiencias.find(e => e.id === expId);
      return acc + ((exp?.costoOperativo || 0) * data.peopleCount);
    }, 0);
    const totalActivitiesCost = sinacCost + toursCost + experiencesCost;

    // 4. Alimentación
    const mealCostPerDay = data.includeAlimentacion.reduce((acc, mealId) => {
      const meal = config.alimentacion.find(m => m.id === mealId);
      return acc + (meal?.costoNetoPlato || 0);
    }, 0);
    const totalAlimentacionCost = mealCostPerDay * data.peopleCount * days;

    // 5. Guía
    const guiaCost = data.includeGuia ? (config.guia.tarifaDiaria * days) : 0;

    // TOTALS
    const totalNetCost = transportCost + hospedajeCost + totalActivitiesCost + totalAlimentacionCost + guiaCost;
    const markupAmount = totalNetCost * config.margenGananciaAgencia;
    const finalPrice = totalNetCost + markupAmount;

    return {
      days,
      nights,
      transportCost,
      hospedajeCost,
      totalActivitiesCost,
      totalAlimentacionCost,
      guiaCost,
      totalNetCost,
      markupAmount,
      finalPrice,
      vehicleName: vehicle.nombre,
      roomsNeeded
    };
  }, [data]);

  const handleNext = () => {
    if (currentStep === 0) {
      if (!data.customerName || !data.customerEmail || !data.customerPhone) {
        alert("Por favor completa tu información de contacto.");
        return;
      }
    }
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
  };

  const saveQuoteToFirebase = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, "quotes"), {
        ...data,
        totalPrice: calculations.finalPrice,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (error) {
      console.error("Error saving quote:", error);
      alert("Hubo un error al guardar tu cotización. Por favor intenta de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const generatePDF = (type: 'tourist' | 'agency') => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(5, 150, 105); // Emerald-600
    doc.text('Una Aventura Más', margin, y);
    y += 10;
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(type === 'tourist' ? 'Cotización de Itinerario Vacacional' : 'Reporte Interno de Rentabilidad', margin, y);
    y += 15;

    // Client Info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, y);
    y += 5;
    doc.text(`Periodo: ${data.startDate} al ${data.endDate} (${calculations.days} días)`, margin, y);
    y += 5;
    doc.text(`Personas: ${data.peopleCount}`, margin, y);
    y += 15;

    // Itinerary Table
    const tableData = [
      ['Cliente', data.customerName],
      ['Email', data.customerEmail],
      ['Teléfono', data.customerPhone],
      ['Transporte', calculations.vehicleName],
      ['Hospedaje', data.includeHospedaje ? `${calculations.nights} noches (${calculations.roomsNeeded} hab.)` : 'No incluido'],
      ['Guía', data.includeGuia ? 'Guía profesional incluido' : 'No incluido'],
      ['Alimentación', data.includeAlimentacion.length > 0 ? data.includeAlimentacion.join(', ') : 'No incluida'],
      ['Destinos', data.selectedDestinations.map(id => config.destinos.find(d => d.id === id)?.nombre).join(', ')],
      ['Tours Seleccionados', data.selectedTours.map(id => availableTours.find(t => t.id === id)?.title).join(', ')]
    ];

    (doc as any).autoTable({
      startY: y,
      head: [['Servicio', 'Detalle']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    if (type === 'tourist') {
      doc.setFontSize(12);
      doc.text('Nota Importante:', margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Nosotros gestionamos tus entradas al SINAC por ti, para que solo te preocupes por disfrutar.', margin, y);
      y += 15;

      doc.setFontSize(16);
      doc.setTextColor(5, 150, 105);
      doc.text(`Precio Total: ₡${calculations.finalPrice.toLocaleString()}`, margin, y);
    } else {
      // Agency Details
      const agencyData = [
        ['Costo Operativo Neto', `₡${calculations.totalNetCost.toLocaleString()}`],
        ['Margen de Ganancia (30%)', `₡${calculations.markupAmount.toLocaleString()}`],
        ['Precio de Venta Final', `₡${calculations.finalPrice.toLocaleString()}`]
      ];

      (doc as any).autoTable({
        startY: y,
        head: [['Concepto Financiero', 'Monto']],
        body: agencyData,
        theme: 'grid',
        headStyles: { fillColor: [31, 41, 55] }
      });
    }

    doc.save(`Cotizacion_${type === 'tourist' ? 'Turista' : 'Agencia'}_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Immersive Header */}
      <div className="bg-emerald-600 text-white p-4 sm:p-6 shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all" title="Volver al Inicio">
              <HomeIcon size={18} className="sm:w-5 sm:h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tighter uppercase leading-tight">Constructor de Aventuras</h1>
              <p className="text-emerald-100 text-[10px] sm:text-xs font-medium">Diseña tu viaje perfecto</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className={`flex items-center gap-2 ${idx <= currentStep ? 'text-white' : 'text-emerald-300'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${idx <= currentStep ? 'border-white bg-white/10' : 'border-emerald-400'}`}>
                  {idx < currentStep ? <CheckCircle2 size={16} /> : step.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{step.title}</span>
                {idx < STEPS.length - 1 && <ChevronRight size={14} className="opacity-50" />}
              </div>
            ))}
          </div>
          {/* Mobile Progress Indicator */}
          <div className="sm:hidden flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest mb-1">Paso {currentStep + 1}/5</span>
            <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500" 
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grow max-w-4xl w-full mx-auto p-3 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden"
          >
            {/* STEP 0: CONTACT */}
            {currentStep === 0 && (
              <div className="p-6 sm:p-10 space-y-8">
                <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                    <User size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Paso 1: Información de Contacto</h2>
                    <p className="text-stone-500 text-sm">Necesitamos estos datos para enviarte tu cotización personalizada.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Ej: Juan Pérez"
                        value={data.customerName}
                        onChange={e => setData({...data, customerName: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input 
                          type="email" 
                          placeholder="ejemplo@correo.com"
                          value={data.customerEmail}
                          onChange={e => setData({...data, customerEmail: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Teléfono / WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input 
                          type="tel" 
                          placeholder="+506 8888-8888"
                          value={data.customerPhone}
                          onChange={e => setData({...data, customerPhone: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP A: LOGISTICS */}
            {currentStep === 1 && (
              <div className="p-6 sm:p-10 space-y-8">
                <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                    <Car size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Paso A: Logística de Viaje</h2>
                    <p className="text-stone-500 text-sm">Define las fechas, pasajeros y el transporte ideal.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Fechas del Viaje</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input 
                          type="date" 
                          value={data.startDate}
                          onChange={e => setData({...data, startDate: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                        <input 
                          type="date" 
                          value={data.endDate}
                          onChange={e => setData({...data, endDate: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Cantidad de Personas</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="number" 
                        min="1"
                        value={data.peopleCount}
                        onChange={e => setData({...data, peopleCount: parseInt(e.target.value) || 1})}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Selecciona tu Vehículo</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {config.vehiculos.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setData({...data, vehicleId: v.id})}
                        className={`p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${data.vehicleId === v.id ? 'border-emerald-600 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}
                      >
                        <div className={`p-3 rounded-xl ${data.vehicleId === v.id ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                          <Car size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{v.nombre}</p>
                          <p className="text-[10px] text-stone-500 uppercase font-bold">Capacidad: {v.capacidad} pax</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP B: DESTINATIONS */}
            {currentStep === 2 && (
              <div className="p-6 sm:p-10 space-y-8">
                <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Paso 3: Destinos y Tours</h2>
                    <p className="text-stone-500 text-sm">Elige los Parques Nacionales y tours que deseas incluir.</p>
                  </div>
                </div>

                <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center gap-4 shadow-md">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Info size={20} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wide">
                    Nosotros gestionamos tus entradas al SINAC por ti, para que solo te preocupes por disfrutar.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Parques Nacionales (Destinos)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {config.destinos.map(d => (
                      <button
                        key={d.id}
                        onClick={() => {
                          const exists = data.selectedDestinations.includes(d.id);
                          setData({
                            ...data,
                            selectedDestinations: exists 
                              ? data.selectedDestinations.filter(id => id !== d.id)
                              : [...data.selectedDestinations, d.id]
                          });
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${data.selectedDestinations.includes(d.id) ? 'border-emerald-600 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-stone-900">{d.nombre}</p>
                          {data.selectedDestinations.includes(d.id) && <CheckCircle2 className="text-emerald-600" size={18} />}
                        </div>
                        <p className="text-xs text-stone-500 line-clamp-2">{d.descripcion}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {availableTours.length > 0 && (
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Tours Disponibles</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availableTours.map(t => (
                        <button
                          key={t.id}
                          onClick={() => {
                            const exists = data.selectedTours.includes(t.id);
                            setData({
                              ...data,
                              selectedTours: exists 
                                ? data.selectedTours.filter(id => id !== t.id)
                                : [...data.selectedTours, t.id]
                            });
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${data.selectedTours.includes(t.id) ? 'border-emerald-600 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 ${data.selectedTours.includes(t.id) ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                            <Compass size={20} />
                          </div>
                          <div className="grow">
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-stone-900 text-sm">{t.title}</p>
                              {data.selectedTours.includes(t.id) && <CheckCircle2 className="text-emerald-600" size={16} />}
                            </div>
                            <p className="text-[10px] text-stone-500 line-clamp-1">{t.location}</p>
                            <p className="text-xs font-black text-emerald-700 mt-1">
                              ₡{(t.price_national || t.price?.crc || 0).toLocaleString()}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Experiencias Propias</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {config.experiencias.map(e => (
                      <button
                        key={e.id}
                        onClick={() => {
                          const exists = data.selectedExperiences.includes(e.id);
                          setData({
                            ...data,
                            selectedExperiences: exists 
                              ? data.selectedExperiences.filter(id => id !== e.id)
                              : [...data.selectedExperiences, e.id]
                          });
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-2 ${data.selectedExperiences.includes(e.id) ? 'border-emerald-600 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}
                      >
                        <div className={`p-3 rounded-full ${data.selectedExperiences.includes(e.id) ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'}`}>
                          {e.id === 'senderismo' ? <Trees size={20} /> : e.id === 'fotografia-dron' ? <Camera size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-stone-900">{e.nombre}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP C: SERVICES */}
            {currentStep === 3 && (
              <div className="p-6 sm:p-10 space-y-8">
                <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                    <Hotel size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Paso C: Servicios Adicionales</h2>
                    <p className="text-stone-500 text-sm">Hospedaje, alimentación y guía profesional.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-2xl border-2 border-stone-100">
                      <div className="flex items-center gap-4">
                        <div className="bg-stone-100 p-3 rounded-xl text-stone-600">
                          <Hotel size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">Hospedaje</p>
                          <p className="text-xs text-stone-500">Hoteles seleccionados</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={data.includeHospedaje}
                        onChange={e => setData({...data, includeHospedaje: e.target.checked})}
                        className="w-6 h-6 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-6 rounded-2xl border-2 border-stone-100">
                      <div className="flex items-center gap-4">
                        <div className="bg-stone-100 p-3 rounded-xl text-stone-600">
                          <UserCheck size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">Guía Turístico</p>
                          <p className="text-xs text-stone-500">Acompañamiento 24/7</p>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={data.includeGuia}
                        onChange={e => setData({...data, includeGuia: e.target.checked})}
                        className="w-6 h-6 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300" 
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Alimentación Incluida</label>
                    <div className="space-y-3">
                      {config.alimentacion.map(meal => (
                        <button
                          key={meal.id}
                          onClick={() => {
                            const exists = data.includeAlimentacion.includes(meal.id);
                            setData({
                              ...data,
                              includeAlimentacion: exists 
                                ? data.includeAlimentacion.filter(id => id !== meal.id)
                                : [...data.includeAlimentacion, meal.id]
                            });
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${data.includeAlimentacion.includes(meal.id) ? 'border-emerald-600 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Utensils size={16} className={data.includeAlimentacion.includes(meal.id) ? 'text-emerald-600' : 'text-stone-400'} />
                            <span className="text-sm font-bold text-stone-900">{meal.nombre}</span>
                          </div>
                          {data.includeAlimentacion.includes(meal.id) && <CheckCircle2 className="text-emerald-600" size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP D: SUMMARY */}
            {currentStep === 4 && (
              <div className="p-6 sm:p-10 space-y-8">
                <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Paso 5: Resumen y Cotización</h2>
                    <p className="text-stone-500 text-sm">Revisa los detalles finales antes de generar los documentos.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-stone-50 p-6 rounded-3xl space-y-4">
                      <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Detalles del Itinerario</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">Cliente</span>
                          <span className="font-bold text-stone-900">{data.customerName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">Periodo</span>
                          <span className="font-bold text-stone-900">{data.startDate} al {data.endDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">Duración</span>
                          <span className="font-bold text-stone-900">{calculations.days} días / {calculations.nights} noches</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">Transporte</span>
                          <span className="font-bold text-stone-900">{calculations.vehicleName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                      <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4">Inversión Total</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-emerald-700">₡{calculations.finalPrice.toLocaleString()}</span>
                        <span className="text-emerald-600 text-xs font-bold uppercase">I.V.I</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-2 font-bold uppercase tracking-widest">Precio final para el cliente</p>
                    </div>

                    <button 
                      onClick={saveQuoteToFirebase}
                      disabled={isSaving || saveSuccess}
                      className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all shadow-lg ${saveSuccess ? 'bg-green-100 text-green-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                    >
                      {isSaving ? <Loader2 className="animate-spin" size={20} /> : saveSuccess ? <CheckCircle2 size={20} /> : <Save size={20} />}
                      {saveSuccess ? 'Cotización Guardada' : 'Guardar y Solicitar Cotización'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest">Acciones Disponibles</h3>
                    <button 
                      onClick={() => generatePDF('tourist')}
                      className="w-full flex items-center justify-between p-6 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg group"
                    >
                      <div className="flex items-center gap-4">
                        <Download size={24} />
                        <div className="text-left">
                          <p className="font-bold">PDF Versión Turista</p>
                          <p className="text-[10px] opacity-80 uppercase font-bold">Diseño premium para el cliente</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button 
                      onClick={() => generatePDF('agency')}
                      className="w-full flex items-center justify-between p-6 rounded-2xl bg-stone-800 text-white hover:bg-stone-900 transition-all shadow-lg group"
                    >
                      <div className="flex items-center gap-4">
                        <AlertCircle size={24} />
                        <div className="text-left">
                          <p className="font-bold">PDF Versión Agencia</p>
                          <p className="text-[10px] opacity-80 uppercase font-bold">Desglose de costos y rentabilidad</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="p-6 sm:p-8 bg-stone-50 border-t border-stone-100 flex justify-between items-center">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center gap-2 text-stone-500 font-bold text-xs uppercase tracking-widest disabled:opacity-0 transition-all"
              >
                <ChevronLeft size={16} />
                Atrás
              </button>
              
              {currentStep < STEPS.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                  <CheckCircle2 size={16} />
                  Listo para cotizar
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
