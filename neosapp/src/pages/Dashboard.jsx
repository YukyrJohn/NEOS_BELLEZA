import "./dashboard.css";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import Producto from "./Producto";
import RepartidoresChart from "../components/RepartidoresChart";

export default function Dashboard() {
  const { pedidos, repartidores, productos, clientes, vendedores, obtenerClientesPorVendedor, calcularVentasPorVendedor } = useStore();
  const { esAdmin, obtenerUsuario } = useAuth();
  const esAdministrador = esAdmin();
  const usuarioActual = obtenerUsuario();

  // Si es cliente, mostrar cartera y productos
  if (!esAdministrador) {
    // Buscar cartera del cliente
    const clienteActual = clientes.find(c => c.nombre === usuarioActual);
    const cartera = clienteActual?.saldo || 0;

    return (
      <div className="dashboard dashboard-cliente">
        <div className="cartera-section">
          <div className="card cartera-card">
            <h2>Cartera</h2>
            <div className="cartera-amount">${cartera.toLocaleString()}</div>
            <p className="cartera-label">Saldo disponible</p>
          </div>
        </div>

        <div className="productos-section">
          <Producto />
        </div>
      </div>
    );
  }

  const pedidosHoy = pedidos.length;

  const entregasEnCurso = pedidos.filter(
    (p) => p.estado === "En camino"
  ).length;

  const incidencias = pedidos.filter(
    (p) => p.estado === "Retraso" || p.estado === "Cancelado"
  ).length;

  const pedidosRecientes = pedidos.slice(-3).reverse();

  const repartidoresActivos = repartidores?.filter(
    (r) => r.estado === "activo"
  ).length || 0;

  const vendedorStats = (vendedores || []).map((vendedor) => {
    const clientesVendedor = obtenerClientesPorVendedor(vendedor.id);
    const ventasTotales = calcularVentasPorVendedor(vendedor.id);
    const pedidosCount = pedidos.filter((pedido) =>
      clientesVendedor.some((cliente) => cliente.cedula === pedido.clienteCedula)
    ).length;

    return {
      id: vendedor.id,
      nombre: vendedor.nombre || "Sin nombre",
      clientesCount: clientesVendedor.length,
      pedidosCount,
      ventasTotales,
    };
  });

  return (
    <div className="dashboard">

      {/* KPIs */}
      <div className="kpi-grid">
        <Kpi title="Pedidos Hoy" value={pedidosHoy} />
        <Kpi title="Repartidores Activos" value={repartidoresActivos} />
        <Kpi title="Entregas en Curso" value={entregasEnCurso} />
        <Kpi title="Incidencias" value={incidencias} alert />
      </div>

      {/* Pedidos Recientes */}
      <div className="card">
        <h3>Pedidos recientes</h3>

        <table className="table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Repartidor</th>
            </tr>
          </thead>

          <tbody>
            {pedidosRecientes.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.cliente}</td>
                <td>
                  <span className={`badge ${getBadge(p.estado)}`}>
                    {p.estado}
                  </span>
                </td>
                <td>{p.repartidor || "—"}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Gráfica de Repartidores */}
      <div className="card">
        <h3>Estadísticas de Repartidores</h3>
        <RepartidoresChart pedidos={pedidos} repartidores={repartidores || []} />
      </div>

      {/* Tabla de estadísticas de vendedores */}
      <div className="card">
        <h3>Estadísticas de Vendedores</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Vendedor</th>
              <th>Clientes asignados</th>
              <th>Pedidos</th>
              <th>Ventas totales</th>
            </tr>
          </thead>
          <tbody>
            {vendedorStats.map((vendedor) => (
              <tr key={vendedor.id}>
                <td>{vendedor.nombre}</td>
                <td>{vendedor.clientesCount}</td>
                <td>{vendedor.pedidosCount}</td>
                <td>${vendedor.ventasTotales.toLocaleString("es-CO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

/* Helpers */

function getBadge(estado) {
  switch (estado) {
    case "En camino":
      return "success";
    case "Pendiente":
      return "warning";
    case "Cancelado":
      return "danger";
    default:
      return "warning";
  }
}

/* Componentes visuales */

function Kpi({ title, value, alert }) {
  return (
    <div className={`card kpi ${alert ? "alert" : ""}`}>
      <span className="kpi-title">{title}</span>
      <span className="kpi-value">{value}</span>
    </div>
  );
}

function Driver({ name, status }) {
  return (
    <div className="driver">
      <span>{name}</span>
      <span className={`status ${status}`}>
        {status}
      </span>
    </div>
  );
}
