import { useState } from "react";
import { useStore } from "../context/StoreContext";
import "../styles/clientes.css";
import { supabase } from "../context/supabaseClient";


export default function Clientes() {
  const { clientes, pedidos, registrarPago, actualizarClienteTelefono } = useStore();
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState(null);
  const [montoPago, setMontoPago] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [descripcionPago, setDescripcionPago] = useState("");
  const [telefonoTemporal, setTelefonoTemporal] = useState("");

  // Obtener cliente actual del contexto
  const clienteSeleccionado = clienteSeleccionadoId 
    ? clientes.find((c) => c.id === clienteSeleccionadoId) 
    : null;

  const pedidosCliente = clienteSeleccionado
    ? pedidos.filter((p) => p.clienteCedula === clienteSeleccionado.cedula)
    : [];

  const handleRegistrarPago = () => {
    if (!clienteSeleccionado || !montoPago || parseFloat(montoPago) <= 0) {
      alert("Por favor completa los datos");
      return;
    }

    const descripcion = descripcionPago.trim() || "Pago/Abono";
    registrarPago(clienteSeleccionado.id, parseFloat(montoPago), metodoPago, descripcion);
    
    setMontoPago("");
    setDescripcionPago("");
    setMetodoPago("efectivo");
    alert("Pago registrado correctamente");
  };

  const handleActualizarTelefono = () => {
    if (!clienteSeleccionado || !telefonoTemporal.trim()) {
      alert("Por favor completa el teléfono");
      return;
    }
    
    actualizarClienteTelefono(clienteSeleccionado.id, telefonoTemporal);
    
    setTelefonoTemporal("");
    alert("Teléfono actualizado correctamente");
  };

  return (
    <div className="clientes-page">
      <h2>Cartera de Clientes</h2>
      <p>Gestión de clientes, sald0s y pagos</p>

      <div className="clientes-contenedor">
        {/* Lista de clientes */}
        <div className="clientes-lista">
          <h3>Clientes ({clientes.length})</h3>
          <div className="clientes-scroll">
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                className={`cliente-item ${clienteSeleccionadoId === cliente.id ? "activo" : ""}`}
                onClick={() => setClienteSeleccionadoId(cliente.id)}
              >
                <p className="cliente-nombre">{cliente.nombre}</p>
                <p className="cliente-cedula">{cliente.cedula}</p>
                <p className="cliente-saldo">
                  Saldo: <span className={cliente.saldo > 0 ? "debe" : cliente.saldo < 0 ? "favor" : "al-dia"}>
                    {cliente.saldo > 0 ? "$" : cliente.saldo < 0 ? "-$" : "$"}{Math.abs(cliente.saldo).toLocaleString()}
                  </span>
                </p>
                <p className="cliente-pedidos">{pedidos.filter((p) => p.clienteCedula === cliente.cedula).length} pedidos</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detalles del cliente */}
        {clienteSeleccionado && (
          <div className="cliente-detalle">
            <div className="detalle-header">
              <h3>{clienteSeleccionado.nombre}</h3>
            </div>

            {/* Información del cliente */}
            <div className="info-cliente">
              <div className="info-group">
                <label>Cédula:</label>
                <p>{clienteSeleccionado.cedula}</p>
              </div>

              <div className="info-group">
                <label>Dirección:</label>
                <p>{clienteSeleccionado.direccion}</p>
              </div>

              <div className="info-group">
                <label>Teléfono:</label>
                <p>{clienteSeleccionado.telefono || "No asignado"}</p>
              </div>

              <div className="info-group">
                <label>Saldo actual:</label>
                <p className={`saldo-grande ${clienteSeleccionado.saldo > 0 ? "debe" : clienteSeleccionado.saldo < 0 ? "favor" : "al-dia"}`}>
                  {clienteSeleccionado.saldo > 0 ? "$" : clienteSeleccionado.saldo < 0 ? "-$" : "$"}{Math.abs(clienteSeleccionado.saldo).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Actualizar teléfono */}
            <div className="seccion-telefono">
              <h4>Actualizar teléfono</h4>
              <div className="input-group">
                <input
                  type="tel"
                  placeholder="Ej: 3001234567"
                  value={telefonoTemporal}
                  onChange={(e) => setTelefonoTemporal(e.target.value)}
                />
                <button onClick={handleActualizarTelefono} className="btn-actualizar">
                  Actualizar
                </button>
              </div>
            </div>

            {/* Registrar pago */}
            {clienteSeleccionado && (
              <div className="seccion-pago">
                <h4>Registrar Pago/Abono</h4>
                {clienteSeleccionado.saldo === 0 && (
                  <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
                    💡 Abono anticipado para próximos pedidos
                  </p>
                )}
                <div className="pago-group">
                  <input
                    type="number"
                    placeholder="Monto del pago"
                    value={montoPago}
                    onChange={(e) => setMontoPago(e.target.value)}
                    min="0"
                  />
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="consignacion">Consignación</option>
                    <option value="credito">Crédito</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Descripción (Ej: Abono anticipado, Consignación)"
                    value={descripcionPago}
                    onChange={(e) => setDescripcionPago(e.target.value)}
                  />
                  <button onClick={handleRegistrarPago} className="btn-pago">
                    Registrar
                  </button>
                </div>
              </div>
            )}

            {/* Pedidos del cliente */}
            {pedidosCliente.length > 0 && (
              <div className="seccion-pedidos">
                <h4>Pedidos ({pedidosCliente.length})</h4>
                <div className="pedidos-list">
                  {pedidosCliente.map((pedido) => (
                    <div key={pedido.id} className="pedido-mini">
                      <div className="pedido-mini-header">
                        <span className="pedido-numero">Pedido #{pedido.id}</span>
                        <span className={`estado-badge ${pedido.estado.toLowerCase().replace(" ", "-")}`}>
                          {pedido.estado}
                        </span>
                      </div>
                      <p className="pedido-fecha">{pedido.fecha}</p>
                      <p className="pedido-monto">${pedido.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historial de transacciones */}
            <div className="seccion-transacciones">
              <h4>Historial de Transacciones</h4>
              <div className="transacciones-list">
                {clienteSeleccionado.transacciones.length > 0 ? (
                  clienteSeleccionado.transacciones.map((trans) => (
                    <div key={trans.id} className={`transaccion-item ${trans.tipo}`}>
                      <div className="trans-info">
                        <p className="trans-descripcion">{trans.descripcion}</p>
                        <p className="trans-fecha">{trans.fecha}</p>
                      </div>
                      <p className={`trans-monto ${trans.tipo}`}>
                        {trans.tipo === "pedido" ? "+" : "-"}${trans.monto.toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="sin-transacciones">Sin transacciones</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sin cliente seleccionado */}
        {!clienteSeleccionado && (
          <div className="sin-seleccion">
            <p>Selecciona un cliente para ver sus detalles</p>
          </div>
        )}
      </div>
    </div>
  );
}
