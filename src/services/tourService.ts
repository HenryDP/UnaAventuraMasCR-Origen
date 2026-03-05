import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  setDoc,
  query, 
  where, 
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Tour, SiteConfig } from '../components/TourCard';

const TOURS_COLLECTION = 'tours';
const CONFIG_COLLECTION = 'config';
const SITE_CONFIG_DOC = 'site';

export const tourService = {
  /**
   * Subscribe to active tours with optional filtering (Public view)
   */
  subscribeToActiveTours: (
    callback: (tours: Tour[]) => void, 
    options: { category?: 'nacional' | 'internacional'; limit?: number } = {}
  ) => {
    if (!db) return () => {};
    
    // Solo pedimos los activos y la categoría, SIN orderBy
    let q = query(
      collection(db, TOURS_COLLECTION),
      where('active', '==', true)
    );

    if (options.category) {
      q = query(q, where('category', '==', options.category));
    }

    return onSnapshot(q, (snapshot) => {
      let tours = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tour[];
      
      // ORDENAMIENTO EN MEMORIA (¡La magia para evitar el error de índices!)
      tours.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      
      if (options.limit) {
        tours = tours.slice(0, options.limit);
      }
      
      callback(tours);
    }, (error) => {
      console.error("Error listening to tours:", error);
    });
  },

  /**
   * Subscribe to all tours (Admin view)
   */
  subscribeToAllTours: (callback: (tours: Tour[]) => void) => {
    if (!db) return () => {};
    
    // Sin orderBy para no requerir índices
    const q = query(
      collection(db, TOURS_COLLECTION)
    );

    return onSnapshot(q, (snapshot) => {
      let tours = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tour[];

      // Ordenamos en memoria también aquí
      tours.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      callback(tours);
    }, (error) => {
      console.error("Error listening to all tours:", error);
    });
  },

  /**
   * Get a single tour by ID
   */
  getTourById: async (id: string): Promise<Tour | null> => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, TOURS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Tour;
    }
    return null;
  },

  /**
   * Get site configuration
   */
  getSiteConfig: async (): Promise<SiteConfig | null> => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, CONFIG_COLLECTION, SITE_CONFIG_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteConfig;
    }
    return null;
  },

  /**
   * Update site configuration
   */
  updateSiteConfig: async (configData: Partial<SiteConfig>) => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, CONFIG_COLLECTION, SITE_CONFIG_DOC);
    return await setDoc(docRef, configData, { merge: true });
  },

  /**
   * Create a new tour
   */
  createTour: async (tourData: Omit<Tour, 'id' | 'createdAt'>) => {
    if (!db) throw new Error("Firebase not initialized");
    
    return await addDoc(collection(db, TOURS_COLLECTION), {
      ...tourData,
      createdAt: serverTimestamp()
    });
  },

  /**
   * Update an existing tour
   */
  updateTour: async (id: string, tourData: Partial<Tour>) => {
    if (!db) throw new Error("Firebase not initialized");
    
    const tourRef = doc(db, TOURS_COLLECTION, id);
    return await updateDoc(tourRef, {
      ...tourData,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Delete a tour
   */
  deleteTour: async (id: string) => {
    if (!db) throw new Error("Firebase not initialized");
    
    return await deleteDoc(doc(db, TOURS_COLLECTION, id));
  },

  /**
   * Subir imagen a Firebase Storage
   */
  uploadTourImage: async (file: File): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage no inicializado");
    
    // Crea una referencia única en la carpeta 'tours/'
    const storageRef = ref(storage, tours/${Date.now()}_${file.name});
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
};