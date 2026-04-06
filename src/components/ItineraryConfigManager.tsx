import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { 
  Car, 
  MapPin, 
  Utensils, 
  Trees, 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  DollarSign,
  Hotel,
  UserCheck,
  ChevronRight,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { ITINERARY_CONFIG, ItineraryConfig } from '../constants/itineraryConfig';

export default function ItineraryConfigManager() {
  const [config, setConfig] = useState<ItineraryConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vehiculos' | 'destinos' | 'experiencias' | 'alimentacion' | 'general'>('vehiculos');

  useEffect(() => {
    if (!db) return;

    const unsubscribe = onSnapshot(doc(db, "config", "itinerary"), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as ItineraryConfig);
      } else {
        // Initialize with default if not exists
        setConfig(ITINERARY_CONFIG);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveConfig = async (newConfig: ItineraryConfig) => {
    if (!db) return;
    try {
      await setDoc(doc(db, "config", "itinerary"), newConfig);
      alert("Configuración de itinerario guardada con éxito.");
    } catch (error) {
      console.error("Error saving itinerary config:", error);
      alert("Error al guardar la configuración.");
    }
  };

  if (loading || !config) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const updateField = (section: keyof ItineraryConfig, value: any) => {
    const newConfig = { ...config, [section]: value };
    setConfig(newConfig);
  };

  const addItem = (section: 'vehiculos' | 'destinos' | 'experiencias' | 'alimentacion', defaultItem: any) => {
    const newList = [...(config[section] as any[]), { ...defaultItem, id: `item-${Date.now()}` }];
    updateField(section, newList);
  };

  const removeItem = (section: 'vehiculos' | 'destinos' | 'experiencias' | 'alimentacion', id: string) => {
    const newList = (config[section] as any[]).filter(item => item.id !== id);
    updateField(section, newList);
  };

  const updateItem = (section: 'vehiculos' | 'destinos' | 'experiencias' | 'alimentacion', id: string, field: string, value: any) => {
    const newList = (config[section] as any[]).map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    updateField(section, newList);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-stone-900">Configuración del Itinerario</h2>
        <button 
          onClick={() => saveConfig(config)}
          className="w-full sm:w-auto flex items-center justify-center bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-lg font-bold"
        >
          <Save size={20} className="mr-2" />
          Guardar Cambios
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-stone-100 overflow-x-auto no-scrollbar bg-stone-50">
          {[
            { id: 'vehiculos', label: 'Vehículos', icon: <Car size={16} /> },
            { id: 'destinos', label: 'Destinos/SINAC', icon: <MapPin size={16} /> },
            { id: 'experiencias', label: 'Experiencias', icon: <Trees size={16} /> },
            { id: 'alimentacion', label: 'Alimentación', icon: <Utensils size={16} /> },
            { id: 'general', label: 'General/Margen', icon: <Settings size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? 'border-emerald-600 text-emerald-600 bg-white' : 'border-transparent text-stone-400 hover:text-stone-600 hover:bg-stone-100'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {/* VEHICLES */}
          {activeTab === 'vehiculos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Flotilla de Vehículos</h3>
                <button 
                  onClick={() => addItem('vehiculos', { nombre: 'Nuevo Vehículo', tarifaBase: 0, precioKm: 0, capacidad: 1, cargoExtraPasajero: 0 })}
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"
                >
                  <Plus size={16} /> Añadir Vehículo
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {config.vehiculos.map((v: any) => (
                  <div key={v.id} className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase">Nombre del Vehículo</label>
                          <input 
                            type="text" 
                            value={v.nombre}
                            onChange={e => updateItem('vehiculos', v.id, 'nombre', e.target.value)}
                            className="w-full p-2 rounded-lg border border-stone-200 text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase">Tarifa Base (₡)</label>
                          <input 
                            type="number" 
                            value={v.tarifaBase}
                            onChange={e => updateItem('vehiculos', v.id, 'tarifaBase', parseInt(e.target.value) || 0)}
                            className="w-full p-2 rounded-lg border border-stone-200 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase">Precio por KM (₡)</label>
                          <input 
                            type="number" 
                            value={v.precioKm}
                            onChange={e => updateItem('vehiculos', v.id, 'precioKm', parseInt(e.target.value) || 0)}
                            className="w-full p-2 rounded-lg border border-stone-200 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase">Capacidad (Pax)</label>
                          <input 
                            type="number" 
                            value={v.capacidad}
                            onChange={e => updateItem('vehiculos', v.id, 'capacidad', parseInt(e.target.value) || 1)}
                            className="w-full p-2 rounded-lg border border-stone-200 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase">Cargo Extra Pax (₡)</label>
                          <input 
                            type="number" 
                            value={v.cargoExtraPasajero}
                            onChange={e => updateItem('vehiculos', v.id, 'cargoExtraPasajero', parseInt(e.target.value) || 0)}
                            className="w-full p-2 rounded-lg border border-stone-200 text-sm"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem('vehiculos', v.id)}
                        className="ml-4 p-2 text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DESTINATIONS */}
          {activeTab === 'destinos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Destinos y Parques Nacionales</h3>
                <button 
                  onClick={() => addItem('destinos', { nombre: 'Nuevo Destino', costoEntradaNeto: 0, distanciaEstimadaKm: 0, descripcion: '' })}
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"
                >
                  <Plus size={16} /> Añadir Destino
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {config.destinos.map((d: any) => (
                  <div key={d.id} className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase">Nombre del Destino</label>
                          <input 
                            type="text" 
                            value={d.nombre}
                            onChange={e => updateItem('destinos', d.id, 'nombre', e.target.value)}
                            className="w-full p-2 rounded-lg border border-stone-200 text-sm font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase">Costo Entrada SINAC (₡)</label>
                          <input 
                            type="number" 
                            value={d.costoEntradaNeto}
                            onChange={e => updateItem('destinos', d.id, 'costoEntradaNeto', parseInt(e.target.value) || 0)}
                            className="w-full p-2 rounded-lg border border-stone-200 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase">Distancia desde San José (KM)</label>
                          <input 
                            type="number" 
                            value={d.distanciaEstimadaKm}
                            onChange={e => updateItem('destinos', d.id, 'distanciaEstimadaKm', parseInt(e.target.value) || 0)}
                            className="w-full p-2 rounded-lg border border-stone-200 text-sm"
                          />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3 space-y-1">
                          <label className="text-[10px] font-black text-stone-400 uppercase">Descripción Corta</label>
                          <input 
                            type="text" 
                            value={d.descripcion}
                            onChange={e => updateItem('destinos', d.id, 'descripcion', e.target.value)}
                            className="w-full p-2 rounded-lg border border-stone-200 text-sm"
                          />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem('destinos', d.id)}
                        className="ml-4 p-2 text-stone-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXPERIENCES */}
          {activeTab === 'experiencias' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Experiencias Propias</h3>
                <button 
                  onClick={() => addItem('experiencias', { nombre: 'Nueva Experiencia', costoOperativo: 0 })}
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"
                >
                  <Plus size={16} /> Añadir Experiencia
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.experiencias.map((e: any) => (
                  <div key={e.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex items-center gap-4">
                    <div className="flex-grow space-y-2">
                      <input 
                        type="text" 
                        value={e.nombre}
                        onChange={val => updateItem('experiencias', e.id, 'nombre', val.target.value)}
                        className="w-full p-2 rounded-lg border border-stone-200 text-xs font-bold"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-stone-400 uppercase">Costo (₡):</span>
                        <input 
                          type="number" 
                          value={e.costoOperativo}
                          onChange={val => updateItem('experiencias', e.id, 'costoOperativo', parseInt(val.target.value) || 0)}
                          className="w-24 p-1 rounded border border-stone-200 text-xs"
                        />
                      </div>
                    </div>
                    <button onClick={() => removeItem('experiencias', e.id)} className="text-stone-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEALS */}
          {activeTab === 'alimentacion' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Planes de Alimentación</h3>
                <button 
                  onClick={() => addItem('alimentacion', { nombre: 'Nuevo Plato', costoNetoPlato: 0 })}
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-xs flex items-center gap-1"
                >
                  <Plus size={16} /> Añadir Plato
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.alimentacion.map((m: any) => (
                  <div key={m.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex items-center gap-4">
                    <div className="flex-grow space-y-2">
                      <input 
                        type="text" 
                        value={m.nombre}
                        onChange={val => updateItem('alimentacion', m.id, 'nombre', val.target.value)}
                        className="w-full p-2 rounded-lg border border-stone-200 text-xs font-bold"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-stone-400 uppercase">Costo (₡):</span>
                        <input 
                          type="number" 
                          value={m.costoNetoPlato}
                          onChange={val => updateItem('alimentacion', m.id, 'costoNetoPlato', parseInt(val.target.value) || 0)}
                          className="w-24 p-1 rounded border border-stone-200 text-xs"
                        />
                      </div>
                    </div>
                    <button onClick={() => removeItem('alimentacion', m.id)} className="text-stone-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Margen */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={18} className="text-emerald-600" />
                    Margen de Ganancia
                  </h3>
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-emerald-600 uppercase">Porcentaje de Margen (Decimal)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          step="0.01"
                          value={config.margenGananciaAgencia}
                          onChange={e => updateField('margenGananciaAgencia', parseFloat(e.target.value) || 0)}
                          className="w-full p-3 rounded-xl border border-emerald-200 text-lg font-black text-emerald-700"
                        />
                        <div className="text-xs font-bold text-emerald-600">
                          {(config.margenGananciaAgencia * 100).toFixed(0)}%
                        </div>
                      </div>
                      <p className="text-[10px] text-emerald-600/60 italic">Ej: 0.30 representa un 30% sobre el costo neto.</p>
                    </div>
                  </div>
                </div>

                {/* Hospedaje */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <Hotel size={18} className="text-emerald-600" />
                    Hospedaje Base
                  </h3>
                  <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-400 uppercase">Costo Neto Noche (₡)</label>
                        <input 
                          type="number" 
                          value={config.hospedaje.costoNetoNocheHabitacion}
                          onChange={e => updateField('hospedaje', { ...config.hospedaje, costoNetoNocheHabitacion: parseInt(e.target.value) || 0 })}
                          className="w-full p-2 rounded-lg border border-stone-200 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-stone-400 uppercase">Max Pax / Hab</label>
                        <input 
                          type="number" 
                          value={config.hospedaje.maxPersonasPorHabitacion}
                          onChange={e => updateField('hospedaje', { ...config.hospedaje, maxPersonasPorHabitacion: parseInt(e.target.value) || 1 })}
                          className="w-full p-2 rounded-lg border border-stone-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guía */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck size={18} className="text-emerald-600" />
                    Tarifa de Guía
                  </h3>
                  <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-stone-400 uppercase">Tarifa Diaria (₡)</label>
                      <input 
                        type="number" 
                        value={config.guia.tarifaDiaria}
                        onChange={e => updateField('guia', { tarifaDiaria: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 rounded-xl border border-stone-200 text-lg font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3">
        <AlertCircle className="text-amber-600 shrink-0" size={20} />
        <p className="text-xs text-amber-700">
          <strong>Importante:</strong> Los cambios realizados aquí afectarán inmediatamente a todos los nuevos itinerarios generados por los usuarios en la sección "Arma tu Viaje". Asegúrate de que los costos operativos sean precisos para mantener la rentabilidad.
        </p>
      </div>
    </div>
  );
}
