import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const login = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const [session, setSession] = useState(null);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event);
      if (event === "SIGNED_IN") {
        setUser(session.user);
        setSession(session);
        setAuth(true);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user !== null || user !== undefined) {
      console.log(user.email);
      console.log("user state is being set");
    }
  });

  return (
    <AuthContext.Provider value={{ user, auth, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
