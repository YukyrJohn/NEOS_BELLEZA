import { useState } from "react";
import { useStore } from "../context/StoreContext";
import "../styles/pedidos.css";

export default function Pedidos() {
  const { 
    pedidos, 
    repartidores, 
    productos,
    cambiarEstadoPedido, 
    eliminarPedido, 
    asignarRepartidor,
    agregarItemPedido,
    eliminarItemPedido,
    actualizarCantidadItemPedido
  } = useStore();

  const [pedidoExpandido, setPedidoExpandido] = useState(null);
  const [pedidoTemp, setPedidoTemp] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [modalPedido, setModalPedido] = useState(null);

  const abrirEdicion = (pedido) => {
    setPedidoExpandido(pedido.id);
    setPedidoTemp({ ...pedido });
  };

  const cerrarEdicion = () => {
    setPedidoExpandido(null);
    setPedidoTemp({});
  };

  const handleAgregarItem = (pedidoId, productoId) => {
    const producto = productos.find((p) => p.id === productoId);
    if (producto) {
      agregarItemPedido(pedidoId, productoId, producto.nombre, producto.precio, 1);
    }
  };

  const handleEliminarItem = (pedidoId, productoId) => {
    eliminarItemPedido(pedidoId, productoId);
  };

  const handleActualizarCantidad = (pedidoId, productoId, nuevaCantidad) => {
    if (nuevaCantidad > 0) {
      actualizarCantidadItemPedido(pedidoId, productoId, nuevaCantidad);
    }
  };

  const productosDisponibles = productos.filter(
    (p) => !pedidoTemp.items?.some((item) => item.id === p.id)
  );

  const pedidosFiltrados = pedidos.filter(p =>
    p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  return (
    <div className="pedidos-page">
      <h2>Pedidos</h2>
      <p>Gestión de pedidos creados desde la tienda</p>

      {/* Buscador */}
      <div className="buscador-container">
        <input
          type="text"
          placeholder="Buscar por cliente o ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="buscador-input"
        />
      </div>

      {/* Tabla pedidos */}
      <table className="pedidos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Fecha de entrega</th>
            <th>Valor</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="6" className="sin-pedidos">No hay pedidos que coincidan con la búsqueda.</td>
            </tr>
          ) : (
            pedidosFiltrados.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.cliente}</td>
                <td>{p.fecha}</td>
                <td>${p.total.toLocaleString()}</td>
                <td>
                  <span className={`estado-badge estado-${p.estado.toLowerCase().replace(' ', '-')}`}>
                    {p.estado}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-detalle"
                    onClick={() => setModalPedido(p)}
                    title="Ver detalle"
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal de detalle */}
      {modalPedido && (
        <div className="modal-overlay" onClick={() => setModalPedido(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pedido-card">
              <div className="pedido-header">
                <strong>Pedido #{modalPedido.id}</strong>
                <div className="pedido-header-acciones">
                  <button
                    className="btn-editar"
                    onClick={() => abrirEdicion(modalPedido)}
                    title="Editar items"
                  >
                    ✎ Editar
                  </button>
                  <button
                    className="btn-cerrar-modal"
                    onClick={() => setModalPedido(null)}
                    title="Cerrar"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="pedido-body">
                <div className="pedido-info-cliente">
                  <p><strong>Cliente:</strong> {modalPedido.cliente}</p>
                  <p><strong>Dirección:</strong> {modalPedido.direccion}</p>
                  <p><strong>Fecha:</strong> {modalPedido.fecha}</p>
                  <p><strong>Forma de pago:</strong> <span className={`forma-pago ${modalPedido.formaPago.toLowerCase()}`}>{modalPedido.formaPago}</span></p>
                </div>

                {/* Items con controles de edición si está expandido */}
                {pedidoExpandido === modalPedido.id ? (
                  <div className="pedido-items-editable">
                    <h5>Productos:</h5>
                    <div className="items-container">
                      {modalPedido.items.map((item, index) => (
                        <div key={index} className="pedido-item-editable">
                          <div className="item-info">
                            <span className="item-nombre">{item.nombre}</span>
                            <span className="item-precio-unitario">${item.precio.toLocaleString()}</span>
                          </div>
                          <div className="item-controls">
                            <button
                              className="btn-cantidad"
                              onClick={() => handleActualizarCantidad(modalPedido.id, item.id, item.cantidad - 1)}
                              disabled={item.cantidad === 1}
                              title="Disminuir cantidad"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={(e) => handleActualizarCantidad(modalPedido.id, item.id, parseInt(e.target.value) || 1)}
                              className="cantidad-input"
                            />
                            <button
                              className="btn-cantidad"
                              onClick={() => handleActualizarCantidad(modalPedido.id, item.id, item.cantidad + 1)}
                              title="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>
                          <span className="item-subtotal">${(item.precio * item.cantidad).toLocaleString()}</span>
                          <button
                            className="btn-eliminar-item"
                            onClick={() => handleEliminarItem(modalPedido.id, item.id)}
                            title="Eliminar este item"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Agregar nuevo item */}
                    {productosDisponibles.length > 0 && (
                      <div className="agregar-item-container">
                        <label>Agregar producto:</label>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAgregarItem(modalPedido.id, parseInt(e.target.value));
                              e.target.value = "";
                            }
                          }}
                          className="select-agregar"
                        >
                          <option value="">Seleccionar producto...</option>
                          {productosDisponibles.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.nombre} - ${prod.precio.toLocaleString()} (Stock: {prod.stock})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="edicion-botones">
                      <button className="btn-guardar" onClick={cerrarEdicion}>
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pedido-items">
                    <h5>Productos:</h5>
                    {modalPedido.items.map((item, index) => (
                      <div key={index} className="pedido-item">
                        <span>{item.nombre}</span>
                        <span>x{item.cantidad}</span>
                        <span className="price">${(item.precio * item.cantidad).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="pedido-total"><strong>Total:</strong> ${modalPedido.total.toLocaleString()}</p>

                {pedidoExpandido === modalPedido.id && (
                  <div className="pedido-acciones">
                    <div className="control">
                      <label>Estado:</label>
                      <select
                        value={modalPedido.estado}
                        onChange={(e) =>
                          cambiarEstadoPedido(modalPedido.id, e.target.value)
                        }
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En camino">En camino</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>

                    <div className="control">
                      <label>Repartidor:</label>
                      <select
                        value={modalPedido.repartidor || ""}
                        onChange={(e) =>
                          asignarRepartidor(modalPedido.id, e.target.value || null)
                        }
                      >
                        <option value="">Asignar repartidor</option>
                        {repartidores.map((r) => (
                          <option key={r.id} value={r.nombre}>
                            {r.nombre} - {r.zona}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
