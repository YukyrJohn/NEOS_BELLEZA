import { useState } from "react";
import { useStore } from "../context/StoreContext";
import "../styles/repartidores.css";
import { supabase } from "../context/supabaseClient";



export default function Repartidores() {
  const { repartidores, crearRepartidor, eliminarRepartidor } = useStore();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [zona, setZona] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const agregarRepartidor = async () => {
    const resultado = await crearRepartidor(nombre, email, zona, password);
    
    if (resultado.error) {
      setMensaje(resultado.error);
    } else {
      setMensaje("Repartidor agregado exitosamente");
      setNombre("");
      setEmail("");
      setZona("");
      setPassword("");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  return (
    <>
      <div className="repartidores-header">
        <h2>Repartidores</h2>
        <p>Panel de repartidores.</p>
      </div>

      {/* Formulario */}
      <div className="repartidores-form">
        <input
          type="text"
          className="repartidores-input"
          placeholder="Nombre del repartidor"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <input
          type="email"
          className="repartidores-input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          className="repartidores-input"
          placeholder="Zona"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
        />

        <input
          type="password"
          className="repartidores-input"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn-agregar" onClick={agregarRepartidor}>
          Agregar Repartidor
        </button>

        {mensaje && (
          <p className={`mensaje ${mensaje.toLowerCase().includes("error") ? "error" : "exito"}`}>
            {mensaje}
          </p>
        )}
      </div>

      {/* Tarjetas */}
      <div className="repartidores-container">
        {repartidores.map((repartidor) => (
          <div key={repartidor.id} className="tarjeta-repartidor">
            <h4>{repartidor.nombre}</h4>
            <p>Email: {repartidor.email}</p>
            <p>Zona: {repartidor.zona}</p>

            <button
              className="btn-eliminar"
              onClick={() => eliminarRepartidor(repartidor.id)}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
