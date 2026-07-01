import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface ProfileData {
  displayName: string;
  photoURL: string | null;
  weight?: string;
  height?: string;
  gender?: string;
  goal?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: {
    displayName: string;
    photoURL: string | null;
    weight?: string;
    height?: string;
    gender?: string;
    goal?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userRef);
          
          let existingData: any = {};
          if (docSnap.exists()) {
            existingData = docSnap.data();
          }

          const profileData: ProfileData = {
            displayName: existingData.displayName || currentUser.displayName || 'Guest User',
            photoURL: existingData.photoURL || currentUser.photoURL || null,
            weight: existingData.weight || '',
            height: existingData.height || '',
            gender: existingData.gender || '',
            goal: existingData.goal || ''
          };

          // Keep in sync
          await setDoc(userRef, {
            uid: currentUser.uid,
            displayName: profileData.displayName,
            email: currentUser.email || null,
            photoURL: profileData.photoURL,
            weight: profileData.weight || null,
            height: profileData.height || null,
            gender: profileData.gender || null,
            goal: profileData.goal || null,
            lastActive: new Date().toISOString()
          }, { merge: true });

          setProfile(profileData);
        } catch (e) {
          console.error('Error saving user profile to Firestore:', e);
          setProfile({
            displayName: currentUser.displayName || 'Guest User',
            photoURL: currentUser.photoURL || null,
            weight: '',
            height: '',
            gender: '',
            goal: ''
          });
        }
      } else {
        setProfile(null);
      }
      setUser(currentUser);
      setLoading(false);
    }, (error) => {
      console.error('onAuthStateChanged error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      // Set custom parameters to force selection if desired, or keep default
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Apple Sign-In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: {
    displayName: string;
    photoURL: string | null;
    weight?: string;
    height?: string;
    gender?: string;
    goal?: string;
  }) => {
    if (!auth.currentUser) throw new Error('No user is currently signed in.');
    try {
      const isBase64 = data.photoURL && data.photoURL.startsWith('data:');
      
      // Update Firebase Auth display name and photoURL (only if not base64)
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: isBase64 ? null : data.photoURL
      });

      // Update Firestore user document
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        uid: auth.currentUser.uid,
        displayName: data.displayName,
        photoURL: data.photoURL,
        weight: data.weight || null,
        height: data.height || null,
        gender: data.gender || null,
        goal: data.goal || null,
        lastActive: new Date().toISOString()
      }, { merge: true });

      // Update in-memory profile state
      setProfile({
        displayName: data.displayName,
        photoURL: data.photoURL,
        weight: data.weight || '',
        height: data.height || '',
        gender: data.gender || '',
        goal: data.goal || ''
      });

      // Reload to ensure firebase user state is synced
      await auth.currentUser.reload();
      setUser(auth.currentUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithApple, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
