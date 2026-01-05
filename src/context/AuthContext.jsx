import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { googleProvider } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthLoading(true);

      if (!firebaseUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...snap.data(), // name, role, licenceId
          });
        } else {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "user",
          });
        }
      } catch (err) {
        console.error("Auth load error:", err);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // LOGIN
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // ✅ REGISTER (UPDATED FOR LICENCE ID)
  const register = async (email, password, name, role, licenceId = null) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, { displayName: name });

    await setDoc(doc(db, "users", cred.user.uid), {
      name,
      email,
      role,
      licenceId: role === "ngo" ? licenceId : null, // ✅ STORED
      createdAt: serverTimestamp(),
    });
  };

  // GOOGLE LOGIN
  const googleLogin = async (role) => {
    const res = await signInWithPopup(auth, googleProvider);

    const ref = doc(db, "users", res.user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        name: res.user.displayName,
        email: res.user.email,
        role,
        licenceId: role === "ngo" ? "PENDING" : null, // optional
        createdAt: serverTimestamp(),
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        register,
        logout,
        googleLogin,
      }}
    >
      {!authLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}