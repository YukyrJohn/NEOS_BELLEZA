import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/layout.css";

export default function Header() {
  const navigate = useNavigate();
  const { usuarioAutenticado, obtenerDatosUsuario, esAdmin, esVendedor, esRepartidor, logout } = useAuth();
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const datosUsuario = obtenerDatosUsuario();
  const usuario = datosUsuario?.nombre || datosUsuario?.usuario;
  const esAdministrador = esAdmin();
  const esVend = esVendedor();
  const esRepar = esRepartidor();

  let tipoUsuario = "Invitado";
  if (esAdministrador) tipoUsuario = "Administrador";
  else if (esVend) tipoUsuario = "Vendedor";
  else if (esRepar) tipoUsuario = "Repartidor";
  else if (usuarioAutenticado) tipoUsuario = "Cliente";

  const iniciales = usuario?.substring(0, 2).toUpperCase() || "?";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/registro");
  };

  const handleHomeClick = () => {
    if (usuarioAutenticado) {
      navigate("/");
    } else {
      navigate("/");
    }
  };

  const tipoClase = esAdministrador ? "admin" : esVend ? "vendedor" : esRepar ? "repartidor" : usuarioAutenticado ? "cliente" : "invitado";

  return (
    <header className="header header-dark">
      <div className="header-logo-container">
        <button 
          className="header-logo-main"
          onClick={handleHomeClick}
          title="Ir al inicio"
        >
          NEOS
        </button>
        <div className="header-logo-subtitle">
          Distribución de Belleza
        </div>
      </div>

      <div className="header-right">
        <div className="usuario-info">
          <span className={`badge-tipo ${tipoClase}`}>
            {tipoUsuario}
          </span>
          <span className="usuario-nombre">{usuario || "Usuario Invitado"}</span>
        </div>

        <div className="avatar-menu">
          <button
            className="avatar"
            onClick={() => setMostrarMenu(!mostrarMenu)}
            title={usuario || "Usuario Invitado"}
          >
            {iniciales}
          </button>

          {mostrarMenu && (
            <div className="menu-desplegable">
              {usuarioAutenticado ? (
                <>
                  <div className="menu-item disabled">
                    <span className="menu-label">Usuario:</span>
                    <strong>{usuario}</strong>
                  </div>
                  <div className="menu-item disabled">
                    <span className="menu-label">Tipo:</span>
                    <strong>{tipoUsuario}</strong>
                  </div>
                  <hr className="menu-divider" />
                  <button
                    className="menu-item logout"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <div className="menu-item disabled">
                    <span className="menu-label">No tienes sesión iniciada</span>
                  </div>
                  <hr className="menu-divider" />
                  <button
                    className="menu-item login"
                    onClick={handleLogin}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    className="menu-item register"
                    onClick={handleRegister}
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
