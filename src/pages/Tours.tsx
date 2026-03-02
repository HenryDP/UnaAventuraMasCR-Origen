import React, { useState } from 'react';
import { Search, Compass } from 'lucide-react';
import TourList from '../components/TourList';

export default function Tours() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'nacional' | 'internacional'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-stone-50 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-4 tracking-tight">Nuestras Aventuras</h1>
          <p className="text-stone-600 max-w-2xl">
            Explora nuestra selección curada de experiencias únicas en Costa Rica y el mundo.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por destino, actividad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none shadow-sm"
            />
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-stone-200 shadow-sm overflow-x-auto">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setActiveCategory('nacional')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'nacional' ? 'bg-emerald-600 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              Nacionales
            </button>
            <button 
              onClick={() => setActiveCategory('internacional')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'internacional' ? 'bg-emerald-600 text-white shadow-md' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              Internacionales
            </button>
          </div>
        </div>

        {/* Tours Grid */}
        <TourList 
          category={activeCategory === 'all' ? undefined : activeCategory} 
          searchQuery={searchQuery}
        />

        {/* Newsletter / CTA */}
        <div className="mt-24 bg-emerald-900 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <Compass size={400} className="absolute -bottom-20 -right-20 text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">¿No encuentras lo que buscas?</h2>
            <p className="text-emerald-100 mb-10 max-w-2xl mx-auto">
              Diseñamos viajes a la medida. Cuéntanos tus sueños y nosotros los hacemos realidad.
            </p>
            <button className="bg-white text-emerald-900 px-10 py-4 rounded-full font-bold hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-xl">
              Contactar un Asesor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
