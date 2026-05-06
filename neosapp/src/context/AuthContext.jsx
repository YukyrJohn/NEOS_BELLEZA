import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const register = async (email, password, role = 'cliente', metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          ...metadata
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || 'cliente';
  };

  const getUserMetadata = () => {
    return user?.user_metadata || {};
  };

  // Funciones de compatibilidad con el código existente
  const esAdmin = () => getUserRole() === "admin";
  const esRepartidor = () => getUserRole() === "repartidor";
  const esVendedor = () => getUserRole() === "vendedor";
  const obtenerUsuario = () => user?.email;
  const obtenerDatosUsuario = () => getUserMetadata();
  const isAuthenticated = () => !!user;
  const usuarioAutenticado = !!user;

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    getUserRole,
    getUserMetadata,
    // Funciones de compatibilidad
    esAdmin,
    esRepartidor,
    esVendedor,
    obtenerUsuario,
    obtenerDatosUsuario,
    isAuthenticated,
    usuarioAutenticado,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}