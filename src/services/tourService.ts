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
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
    
    let q = query(
      collection(db, TOURS_COLLECTION),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );

    if (options.category) {
      q = query(q, where('category', '==', options.category));
    }

    if (options.limit) {
      // limit() is imported from firebase/firestore
      // I need to make sure it's available.
    }

    return onSnapshot(q, (snapshot) => {
      let tours = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tour[];
      
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
    
    const q = query(
      collection(db, TOURS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const tours = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tour[];
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
  }
};