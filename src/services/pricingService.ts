import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tour } from '../components/TourCard';

/**
 * Categorías de Usuario en el sistema de turismo de Costa Rica
 */
export type UserCategory = 'Nacional/Residente' | 'Extranjero';

/**
 * Tipos de documentos de identidad soportados
 */
export type IdentityDocumentType = 'cedula' | 'dimex' | 'pasaporte';

/**
 * Perfil de usuario en Firestore
 */
export interface UserProfile {
  uid: string;
  documentType: IdentityDocumentType;
  fullName: string;
  email: string;
}

/**
 * Esquema propuesto para el documento 'Tour' en Firestore
 * 
 * {
 *   "id": "tour-123",
 *   "title": "Volcán Poás & Coffee Tour",
 *   "price_national": 15000,      // Precio para nacionales/residentes (usualmente en CRC)
 *   "price_foreigner": 45,        // Precio para extranjeros (usualmente en USD)
 *   "currency_foreigner": "USD",  // Moneda base para extranjeros
 *   "active": true,
 *   ...
 * }
 */

const EXCHANGE_RATE = 520; // Tasa de cambio variable (ejemplo)

/**
 * Determina la categoría del usuario basándose en su tipo de documento
 */
export const getUserCategory = (documentType: IdentityDocumentType): UserCategory => {
  if (documentType === 'cedula' || documentType === 'dimex') {
    return 'Nacional/Residente';
  }
  return 'Extranjero';
};

/**
 * Función principal para determinar el precio final de un tour
 * 
 * @param userId ID del usuario en Firebase Auth
 * @param tour Objeto del tour obtenido de Firestore
 * @returns Objeto con el monto final, la moneda y la categoría aplicada
 */
export const calculateFinalPrice = async (userId: string, tour: Tour) => {
  if (!db) throw new Error("Firebase no inicializado");

  // 1. Consultar el perfil del usuario en Firestore
  const userDoc = await getDoc(doc(db, 'users', userId));
  
  if (!userDoc.exists()) {
    throw new Error("Perfil de usuario no encontrado");
  }

  const userData = userDoc.data() as UserProfile;
  const category = getUserCategory(userData.documentType);

  // 2. Aplicar lógica de precios diferenciada
  let finalAmount: number;
  let finalCurrency: string;

  if (category === 'Nacional/Residente') {
    // Si hay un precio específico para nacionales, lo usamos
    if (tour.price_national) {
      finalAmount = tour.price_national;
      finalCurrency = 'CRC';
    } else {
      // Si no hay precio nacional, convertimos el precio extranjero usando la tasa de cambio
      // Asumimos que el precio extranjero está en USD si no se especifica
      const basePrice = tour.price_foreigner || 0;
      finalAmount = basePrice * EXCHANGE_RATE;
      finalCurrency = 'CRC';
    }
  } else {
    // Para extranjeros usamos la tarifa estándar
    finalAmount = tour.price_foreigner || 0;
    finalCurrency = tour.currency_foreigner || 'USD';
  }

  return {
    amount: finalAmount,
    currency: finalCurrency,
    category: category,
    exchangeRateUsed: category === 'Nacional/Residente' && !tour.price_national ? EXCHANGE_RATE : null
  };
};

/**
 * Ejemplo de uso en un componente de Reserva:
 * 
 * const handleBooking = async () => {
 *   try {
 *     const pricingInfo = await calculateFinalPrice(currentUser.uid, selectedTour);
 *     console.log(`Precio aplicado: ${pricingInfo.currency} ${pricingInfo.amount}`);
 *     console.log(`Categoría: ${pricingInfo.category}`);
 *     
 *     // Proceder con la pasarela de pago o reserva
 *     setBookingPrice(pricingInfo.amount);
 *   } catch (error) {
 *     console.error("Error al calcular precio:", error);
 *   }
 * };
 */
