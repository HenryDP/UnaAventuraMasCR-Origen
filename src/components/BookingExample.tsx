import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Tour } from './TourCard';
import { calculateFinalPrice, UserCategory } from '../services/pricingService';
import { CreditCard, User as UserIcon, Info } from 'lucide-react';

interface BookingExampleProps {
  tour: Tour;
}

/**
 * Componente de ejemplo que demuestra la implementación de la lógica de precios diferenciada
 */
export default function BookingExample({ tour }: BookingExampleProps) {
  const { user } = useAuth();
  const [pricing, setPricing] = useState<{
    amount: number;
    currency: string;
    category: UserCategory;
    loading: boolean;
    error: string | null;
  }>({
    amount: 0,
    currency: '',
    category: 'Extranjero',
    loading: true,
    error: null
  });

  useEffect(() => {
    const getPrice = async () => {
      if (!user) {
        setPricing(prev => ({ ...prev, loading: false, error: 'Inicie sesión para ver su tarifa personalizada' }));
        return;
      }

      try {
        const result = await calculateFinalPrice(user.uid, tour);
        setPricing({
          amount: result.amount,
          currency: result.currency,
          category: result.category as UserCategory,
          loading: false,
          error: null
        });
      } catch (err: any) {
        console.error(err);
        setPricing(prev => ({ ...prev, loading: false, error: 'Error al calcular el precio' }));
      }
    };

    getPrice();
  }, [user, tour]);

  if (pricing.loading) {
    return <div className="animate-pulse h-20 bg-stone-100 rounded-xl"></div>;
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center">
        <CreditCard className="mr-2 text-emerald-600" size={20} />
        Resumen de Reserva
      </h3>

      {pricing.error ? (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
          <Info className="text-amber-500 shrink-0" size={18} />
          <p className="text-sm text-amber-800">{pricing.error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-stone-100">
            <div className="flex items-center text-stone-600">
              <UserIcon size={16} className="mr-2" />
              <span className="text-sm font-medium">Tarifa Aplicada:</span>
            </div>
            <span className="text-sm font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
              {pricing.category}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-stone-900 font-bold">Total a Pagar:</span>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">
                {pricing.currency === 'CRC' ? '₡' : '$'}
                {pricing.amount.toLocaleString()}
              </span>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                Impuestos Incluidos
              </p>
            </div>
          </div>

          <button className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex justify-center items-center space-x-2">
            <span>Confirmar Reserva</span>
          </button>
          
          <p className="text-[10px] text-center text-stone-400">
            * Se requerirá presentar {pricing.category === 'Nacional/Residente' ? 'Cédula o DIMEX' : 'Pasaporte'} al realizar el tour.
          </p>
        </div>
      )}
    </div>
  );
}
