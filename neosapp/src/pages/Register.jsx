import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../context/supabaseClient";
import "./login.css";

export default function Register() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    setCargando(true);

    // Validar campos
    if (!nombre.trim() || !cedula.trim()) {
      setError("Todos los campos son requeridos");
      setCargando(false);
      return;
    }

    if (cedula.length < 5) {
      setError("El NIT/CC debe tener al menos 5 caracteres");
      setCargando(false);
      return;
    }

    try {
      // Verificar si el usuario ya existe
      const { data: usuarioExistente } = await supabase
        .from("usuarios")
        .select("*")
        .eq("nombre", nombre)
        .single();

      if (usuarioExistente) {
        setError("Este usuario ya existe");
        setCargando(false);
        return;
      }

      // Insertar nuevo usuario
      const { data, error: insertError } = await supabase
        .from("usuarios")
        .insert([
          {
            nombre: nombre,
            cedula: cedula,
            rol: "cliente", // Por defecto es cliente
            zona: null, // Los clientes no tienen zona
          },
        ])
        .select();

      if (insertError) {
        setError("Error al crear el usuario: " + insertError.message);
        setCargando(false);
        return;
      }

      setExito("¡Cuenta creada exitosamente! Redirigiendo al login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError("Error al procesar el registro: " + err.message);
    }

    setCargando(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>NEOSAPP</h1>
          <p>Crear Nueva Cuenta</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label>Usuario (Nombre)</label>
            <input
              type="text"
              placeholder="Ej: Juan García"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label>NIT / Cédula</label>
            <input
              type="password"
              placeholder="Ej: 1234567890"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              disabled={cargando}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {exito && <div className="success-message">{exito}</div>}

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ color: "#aaa", fontSize: "14px" }}>
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: "#c8a951",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "14px",
              }}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
