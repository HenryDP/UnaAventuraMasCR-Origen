export const ITINERARY_CONFIG = {
  margenGananciaAgencia: 0.30, // 30% de margen
  vehiculos: [
    { 
      id: 'suv-4x4', 
      nombre: 'SUV 4x4 (5 pasajeros)', 
      tarifaBase: 45000, 
      precioKm: 850, 
      capacidad: 5,
      cargoExtraPasajero: 5000 
    },
    { 
      id: 'microbus-kinglong', 
      nombre: 'Microbús King Long (19 pasajeros)', 
      tarifaBase: 85000, 
      precioKm: 1200, 
      capacidad: 19,
      cargoExtraPasajero: 8000 
    }
  ],
  destinos: [
    { 
      id: 'manuel-antonio', 
      nombre: 'P.N. Manuel Antonio', 
      costoEntradaNeto: 9500, 
      distanciaEstimadaKm: 170,
      descripcion: 'Playas de arena blanca y bosque tropical.'
    },
    { 
      id: 'arenal', 
      nombre: 'P.N. Volcán Arenal', 
      costoEntradaNeto: 8500, 
      distanciaEstimadaKm: 140,
      descripcion: 'Senderos de lava y vistas impresionantes al volcán.'
    },
    { 
      id: 'tortuguero', 
      nombre: 'P.N. Tortuguero', 
      costoEntradaNeto: 10500, 
      distanciaEstimadaKm: 120,
      descripcion: 'Canales naturales y observación de tortugas.'
    },
    { 
      id: 'corcovado', 
      nombre: 'P.N. Corcovado', 
      costoEntradaNeto: 12000, 
      distanciaEstimadaKm: 350,
      descripcion: 'La zona más intensa biológicamente del mundo.'
    }
  ],
  experiencias: [
    { id: 'senderismo', nombre: 'Rutas de Senderismo Guiado', costoOperativo: 15000 },
    { id: 'fotografia-dron', nombre: 'Sesión de Fotografía con Dron', costoOperativo: 25000 },
    { id: 'avistamiento-aves', nombre: 'Avistamiento de Aves', costoOperativo: 18000 }
  ],
  alimentacion: [
    { id: 'desayuno', nombre: 'Desayuno Típico', costoNetoPlato: 4500 },
    { id: 'almuerzo', nombre: 'Almuerzo (Casado)', costoNetoPlato: 6500 },
    { id: 'cena', nombre: 'Cena Especial', costoNetoPlato: 8500 }
  ],
  hospedaje: {
    costoNetoNocheHabitacion: 45000, // Promedio base
    maxPersonasPorHabitacion: 3
  },
  guia: {
    tarifaDiaria: 35000
  }
};

export type ItineraryConfig = typeof ITINERARY_CONFIG;
