rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user is the master admin by email
    function isMasterAdmin() {
      return isAuthenticated() && 
             request.auth.token.email == 'duranhenry1981@gmail.com';
    }

    // Helper function to check if user has admin role in their profile
    function hasAdminRole() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Combined admin check
    function isAdmin() {
      return isMasterAdmin() || hasAdminRole();
    }

    // Site configuration: Public read, Admin write
    match /config/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Tours: Public read, Admin write
    match /tours/{tourId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Reviews: Public read and create, Admin update/delete
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if true; // Allow public to leave reviews
      allow update, delete: if isAdmin();
    }

    // Sales/Reservations: Admin only
    match /sales/{saleId} {
      allow read, write: if isAdmin();
    }

    // Quotes: Public create, Admin read/update/delete
    match /quotes/{quoteId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }

    // Itinerary Config: Public read, Admin write
    match /config/itinerary {
      allow read: if true;
      allow write: if isAdmin();
    }

    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }
    
    // Default allow for admin on everything else
    match /{allPaths=**} {
      allow read, write: if isAdmin();
    }
  }
}
