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
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { Tour, SiteConfig } from '../components/TourCard';
import { compressImage } from '../utils/imageUtils';
import { Unsubscribe } from 'firebase/auth';

const TOURS_COLLECTION = 'tours';
const CONFIG_COLLECTION = 'config';
const SITE_CONFIG_DOC = 'site';
const REVIEWS_COLLECTION = 'reviews';

export interface Review {
  id: string;
  tourId?: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: any;
  status: 'approved' | 'pending' | 'rejected';
  adminResponse?: string;
  respondedAt?: any;
}

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
      
      // Sort in memory to avoid needing a composite index in Firestore
      tours.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

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
      collection(db, TOURS_COLLECTION)
    );

    return onSnapshot(q, (snapshot) => {
      const tours = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tour[];

      // Sort in memory
      tours.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

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
   * Upload an image to Firebase Storage with compression
   */
  uploadTourImage: async (file: File): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage not initialized");
    
    // Compress image before upload
    const compressedFile = await compressImage(file);
    
    const storageRef = ref(storage, `tours/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, compressedFile);
    return await getDownloadURL(snapshot.ref);
  },

  /**
   * Subscribe to reviews for a specific tour
   */
  subscribeToTourReviews: (tourId: string, callback: (reviews: Review[]) => void, errorCallback?: (error: any) => void) => {
    if (!db) return () => {};
    
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('tourId', '==', tourId)
    );

    return onSnapshot(q, (snapshot) => {
      let reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      // Filter and sort in memory to avoid needing a composite index
      reviews = reviews
        .filter(r => r.status === 'approved')
        .sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return dateB - dateA;
        });

      callback(reviews);
    }, (error) => {
      console.error("Error listening to reviews:", error);
      if (errorCallback) errorCallback(error);
    });
  },

  /**
   * Add a new review
   */
  addReview: async (reviewData: { tourId?: string; userName: string; rating: number; comment: string }) => {
    try {
      if (!db) {
        console.error("Firebase Firestore (db) is not initialized. Check your environment variables.");
        throw new Error("El servicio de base de datos no está disponible. Por favor verifica la configuración de Firebase.");
      }
      
      const data: any = {
        userName: reviewData.userName.trim(),
        rating: Number(reviewData.rating),
        comment: reviewData.comment.trim(),
        status: 'approved', // Publicly visible immediately
        createdAt: serverTimestamp()
      };

      if (reviewData.tourId) {
        data.tourId = reviewData.tourId;
      }
      
      const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), data);
      return docRef;
    } catch (error: any) {
      console.error("Detailed error in addReview:", error);
      if (error.code === 'permission-denied') {
        throw new Error("No tienes permisos para enviar reseñas. Por favor contacta al administrador.");
      }
      throw error;
    }
  },

  /**
   * Update a review
   */
  updateReview: async (id: string, reviewData: Partial<Review>) => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    return await updateDoc(docRef, {
      ...reviewData,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Update review status
   */
  updateReviewStatus: async (id: string, status: 'approved' | 'rejected') => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    return await updateDoc(docRef, { status });
  },

  /**
   * Add or update admin response to a review
   */
  updateReviewResponse: async (id: string, response: string) => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    return await updateDoc(docRef, { 
      adminResponse: response,
      respondedAt: serverTimestamp()
    });
  },

  /**
   * Delete a review
   */
  deleteReview: async (id: string) => {
    if (!db) throw new Error("Firebase not initialized");
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    return await deleteDoc(docRef);
  },

  /**
   * Subscribe to all reviews (Admin view)
   */
  subscribeToAllReviews: (callback: (reviews: Review[]) => void, errorCallback?: (error: any) => void) => {
    if (!db) return () => {};
    
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      callback(reviews);
    }, (error) => {
      console.error("Error listening to all reviews:", error);
      if (errorCallback) errorCallback(error);
    });
  },

  /**
   * Subscribe to the latest reviews globally
   */
  subscribeToLatestReviews: (limitCount: number, callback: (reviews: Review[]) => void, errorCallback?: (error: any) => void) => {
    if (!db) return () => {};
    
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount * 2) // Fetch more to account for unapproved ones
    );

    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review))
        .filter(r => r.status === 'approved')
        .slice(0, limitCount);
      
      callback(reviews);
    }, (error) => {
      console.error("Error listening to latest reviews:", error);
      if (errorCallback) errorCallback(error);
    });
  }
};
