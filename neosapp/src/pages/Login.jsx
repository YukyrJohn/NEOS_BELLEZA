import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../context/supabaseClient";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [cedula, setCedula] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("nombre", usuario)   // ← CAMBIO AQUÍ
      .eq("cedula", cedula)
      .single();

    if (error || !data) {
      setError("Usuario o contraseña incorrectos");
      setCargando(false);
      return;
    }

    const resultado = login(
      data.nombre,
      data.cedula,
      data.rol,
      data.zona
    );

    if (resultado.success) {
      navigate("/");
    } else {
      setError("Error al iniciar sesión");
    }

    setCargando(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>NEOSAPP</h1>
          <p>Sistema de Gestión de Ventas</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Usuario / Razón Social</label>
            <input
              type="text"
              placeholder="Ej: NEOSAPP"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label>Contraseña (Cédula / NIT)</label>
            <input
              type="password"
              placeholder="Ej: 123456789"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              disabled={cargando}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-login" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ color: "#aaa", fontSize: "14px" }}>
            ¿No tienes cuenta?{" "}
            <button
              onClick={() => navigate("/registro")}
              style={{
                background: "none",
                border: "none",
                color: "#c8a951",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "14px",
              }}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}