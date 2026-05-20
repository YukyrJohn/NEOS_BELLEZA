import { useState } from "react";
import { useStore } from "../context/StoreContext";
import "../styles/admin-clientes.css";


export default function AdminClientes() {
  const { clientes, crearCliente, vendedores, usuariosVendedores, actualizarClienteVendedor } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    cedula: "",
    nombre: "",
    direccion: "",
    telefono: "",
    correo: "",
    vendedor_id: null,
  });
  const [mensaje, setMensaje] = useState("");

  const handleCrearCliente = async () => {
    if (!nuevoCliente.cedula || !nuevoCliente.nombre || !nuevoCliente.direccion) {
      setMensaje("❌ Cédula, nombre y dirección son requeridos");
      return;
    }

    const resultado = await crearCliente(
      nuevoCliente.nombre,
      nuevoCliente.cedula,
      nuevoCliente.direccion,
      nuevoCliente.telefono,
      nuevoCliente.correo,
      nuevoCliente.vendedor_id ? parseInt(nuevoCliente.vendedor_id) : null
    );

    if (resultado.error) {
      setMensaje(`❌ ${resultado.error}`);
      return;
    }

    setMensaje(`✅ Cliente ${nuevoCliente.nombre} creado correctamente`);
    setNuevoCliente({
      cedula: "",
      nombre: "",
      direccion: "",
      telefono: "",
      correo: "",
      vendedor_id: null,
    });
    setTimeout(() => {
      setMostrarForm(false);
      setMensaje("");
    }, 2000);
  };

  const vendedoresConUsuarios = vendedores.map((vendedor) => {
    const usuario = usuariosVendedores.find((u) => u.id === vendedor.usuario_id);
    return {
      ...vendedor,
      nombre: usuario?.nombre || vendedor.nombre,
      email: usuario?.email || "",
      zona: vendedor.zona || usuario?.zona || "",
    };
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const clientesFiltrados = normalizedSearch
    ? clientes.filter((cliente) => {
        const vendedorNombre = vendedoresConUsuarios.find((v) => v.id === cliente.vendedor_id)?.nombre || "";
        return [
          cliente.nombre,
          cliente.cedula,
          cliente.direccion,
          cliente.telefono,
          cliente.correo,
          vendedorNombre,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
    : clientes;

  return (
    <div className="admin-clientes-page">
      <div className="admin-header">
        <h2>Administrar clientes</h2>
        <button className="btn-crear" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "✕ Cancelar" : "+ Crear Cliente"}
        </button>
      </div>

      {/* Formulario de creación */}
      {mostrarForm && (
        <div className="form-crear-cliente">
          <h3>Registrar Nuevo Cliente</h3>
          {mensaje && <div className={`mensaje ${mensaje.includes("✅") ? "exito" : "error"}`}>{mensaje}</div>}
          
          <div className="form-group">
            <input
              type="text"
              placeholder="Cédula o NIT"
              value={nuevoCliente.cedula}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, cedula: e.target.value })}
            />
            <input
              type="text"
              placeholder="Nombre Completo"
              value={nuevoCliente.nombre}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
            />
            <input
              type="text"
              placeholder="Dirección"
              value={nuevoCliente.direccion}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Teléfono (Opcional)"
              value={nuevoCliente.telefono}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
            />
            <input
              type="email"
              placeholder="Correo (Opcional)"
              value={nuevoCliente.correo}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, correo: e.target.value })}
            />
            <select
              className="select-vendedor"
              value={nuevoCliente.vendedor_id || ""}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, vendedor_id: e.target.value })}
            >
              <option value="">Seleccionar Vendedor (Opcional)</option>
              {vendedoresConUsuarios.map((vendedor) => (
                <option key={vendedor.id} value={vendedor.id}>
                  {vendedor.nombre} - {vendedor.zona || vendedor.email}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-guardar" onClick={handleCrearCliente}>
            Guardar Cliente
          </button>
        </div>
      )}

      {/* Lista de clientes */}
      <div className="clientes-grid">
        <div className="clientes-grid-header">
          <h3>Total de Clientes: {clientesFiltrados.length}{searchTerm ? ` de ${clientes.length}` : ""}</h3>
          <input
            type="search"
            placeholder="Buscar cliente por nombre, cédula, correo o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="busqueda-clientes"
          />
        </div>
        <div className="clientes-table">
          <div className="table-header">
            <div className="col-cedula">Cédula</div>
            <div className="col-nombre">Nombre</div>
            <div className="col-direccion">Dirección</div>
            <div className="col-telefono">Teléfono</div>
            <div className="col-correo">Correo</div>
            <div className="col-vendedor">Vendedor</div>
          </div>

          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map((cliente) => {
              const vendedor = vendedoresConUsuarios.find((v) => v.id === cliente.vendedor_id);
              return (
                <div key={cliente.id} className="table-row">
                  <div className="col-cedula">{cliente.cedula}</div>
                  <div className="col-nombre">{cliente.nombre}</div>
                  <div className="col-direccion">{cliente.direccion}</div>
                  <div className="col-telefono">{cliente.telefono || "-"}</div>
                  <div className="col-correo">{cliente.correo || "-"}</div>
                  <div className="col-vendedor">
                    <select
                      className="select-vendedor-row"
                      value={cliente.vendedor_id ?? ""}
                      onChange={(e) => actualizarClienteVendedor(cliente.id, e.target.value)}
                    >
                      <option value="">Sin vendedor</option>
                      {vendedoresConUsuarios.map((vendedorOption) => (
                        <option key={vendedorOption.id} value={vendedorOption.id}>
                          {vendedorOption.nombre} - {vendedorOption.zona || vendedorOption.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="table-empty">No hay clientes registrados</div>
          )}
        </div>
      </div>
    </div>
  );
}
