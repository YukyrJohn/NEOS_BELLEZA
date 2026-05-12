import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1522338242592-cb0acf6f85a2?w=500";

  const adaptarProducto = (p) => ({
    id: p.id ?? p.identificacion,
    nombre: p.nombre,
    precio: p.precio,
    stock: p.stock ?? p.existencias ?? 0,
    descripcion: p.descripcion,
    categoria: p.categoria ?? p.categorias ?? "",
    imagenes: [p.imagen_url || p.imagenes?.[0] || DEFAULT_IMAGE],
  });

  const adaptarPedido = (p) => ({
    id: p.id,
    cliente: p.nombre ?? p.cliente,
    clienteCedula: p.cedula,
    direccion: p.direccion,
    fecha:
      p.fecha ||
      (p.created_at ? new Date(p.created_at).toLocaleDateString("es-CO") : ""),
    formaPago: p.forma_pago ?? p.formaPago ?? "",
    items: p.items ?? [],
    total: p.total ?? p.totalPedido ?? 0,
    estado: p.estado ?? "Pendiente",
    repartidor: p.repartidor ?? "",
  });

  const cargarProductos = async () => {
    const { data, error } = await supabase.from("productos").select("*");
    if (error) {
      console.error("Error cargando productos:", error);
      return;
    }
    setProductos((data || []).map(adaptarProducto));
  };

  const cargarClientes = async () => {
    const { data, error } = await supabase.from("clientes").select("*");
    if (error) {
      console.error("Error cargando clientes:", error);
      return;
    }
    setClientes(
      (data || []).map((cliente) => ({
        ...cliente,
        saldo: cliente.saldo ?? 0,
        transacciones: cliente.transacciones ?? [],
      }))
    );
  };

  const cargarPedidos = async () => {
    const { data, error } = await supabase.from("pedidos").select("*");
    if (error) {
      console.error("Error cargando pedidos:", error);
      return;
    }
    setPedidos((data || []).map(adaptarPedido));
  };

  const cargarRepartidores = async () => {
    const { data, error } = await supabase.from("repartidores").select("*");
    if (error) {
      console.error("Error cargando repartidores:", error);
      return;
    }
    setRepartidores(data || []);
  };

  const cargarVendedores = async () => {
    const { data, error } = await supabase.from("vendedores").select("*");
    if (error) {
      console.error("Error cargando vendedores:", error);
      return;
    }
    setVendedores(data || []);
  };

  const cargarCategorias = async () => {
    const { data, error } = await supabase.from("categorias").select("*");
    if (error) {
      console.error("Error cargando categorías:", error);
      return;
    }
    setCategorias(data || []);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await Promise.all([
        cargarProductos(),
        cargarClientes(),
        cargarPedidos(),
        cargarRepartidores(),
        cargarVendedores(),
        cargarCategorias(),
      ]);
    };

    cargarDatos();
  }, []);

  const crearProducto = async (
    nombre,
    precio,
    categoria,
    stock = 10,
    descripcion = "",
    imagenes = []
  ) => {
    if (!nombre || !precio || !categoria) {
      return { error: "Nombre, precio y categoría son requeridos" };
    }

    const { data, error } = await supabase
      .from("productos")
      .insert([
        {
          nombre,
          precio: Number(precio),
          stock: Number(stock),
          descripcion,
          categoria,
          imagen_url: imagenes[0] || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creando producto:", error);
      return { error: error.message };
    }

    const nuevoProducto = adaptarProducto(data);
    setProductos((prev) => [...prev, nuevoProducto]);
    return { success: true, producto: nuevoProducto };
  };

  const actualizarStock = async (productoId, cantidad) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return false;

    const nuevoStock = producto.stock + cantidad;
    if (nuevoStock < 0) return false;

    const { error } = await supabase
      .from("productos")
      .update({ stock: nuevoStock })
      .eq("id", productoId);

    if (error) {
      console.error("Error actualizando stock:", error);
      return false;
    }

    setProductos((prev) =>
      prev.map((p) =>
        p.id === productoId ? { ...p, stock: nuevoStock } : p
      )
    );
    return true;
  };

  const agotarProducto = async (productoId) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return false;

    const { error } = await supabase
      .from("productos")
      .update({ stock: 0 })
      .eq("id", productoId);

    if (error) {
      console.error("Error agotando producto:", error);
      return false;
    }

    setProductos((prev) =>
      prev.map((p) => (p.id === productoId ? { ...p, stock: 0 } : p))
    );
    return true;
  };

  const crearPedido = async (cedula, nombre, direccion, carrito, formaPago) => {
    if (!cedula || !nombre || !direccion || !carrito?.length) {
      return { error: "Cédula, nombre, dirección y carrito son requeridos" };
    }

    const pedidoData = {
      cedula,
      nombre,
      direccion,
      forma_pago: formaPago,
      estado: "Pendiente",
      total: carrito.reduce(
        (sum, item) => sum + Number(item.precio) * Number(item.cantidad || 1),
        0
      ),
    };

    const { data: pedidoCreado, error: errorPedido } = await supabase
      .from("pedidos")
      .insert([pedidoData])
      .select()
      .single();

    if (errorPedido) {
      console.error("Error creando pedido:", errorPedido);
      return { error: errorPedido.message };
    }

    const detalles = carrito.map((item) => ({
      pedido_id: pedidoCreado.id,
      producto_id: item.id,
      cantidad: item.cantidad || 1,
      precio: item.precio,
    }));

    const { error: errorDetalle } = await supabase
      .from("pedido_detalle")
      .insert(detalles);

    if (errorDetalle) {
      console.error("Error creando detalle de pedido:", errorDetalle);
      return { error: errorDetalle.message };
    }

    for (const item of carrito) {
      const nuevoStock = Number(item.stock ?? 0) - Number(item.cantidad || 1);
      const { error: errorStock } = await supabase
        .from("productos")
        .update({ stock: nuevoStock })
        .eq("id", item.id);

      if (errorStock) {
        console.error("Error actualizando stock de producto:", errorStock);
        return { error: errorStock.message };
      }
    }

    setProductos((prev) =>
      prev.map((producto) => {
        const item = carrito.find((i) => i.id === producto.id);
        if (!item) return producto;
        return { ...producto, stock: Number(producto.stock || 0) - Number(item.cantidad || 1) };
      })
    );

    const nuevoPedido = adaptarPedido({
      ...pedidoCreado,
      items: carrito,
    });

    setPedidos((prev) => [...prev, nuevoPedido]);
    return { success: true, pedido: nuevoPedido };
  };

  const crearVendedor = async (nombre, zona) => {
    if (!nombre || !zona) {
      return { error: "Nombre y zona son requeridos" };
    }

    const { data, error } = await supabase
      .from("vendedores")
      .insert([{ nombre, zona }])
      .select()
      .single();

    if (error) {
      console.error("Error creando vendedor:", error);
      return { error: error.message };
    }

    setVendedores((prev) => [...prev, data]);
    return { success: true, vendedor: data };
  };

const crearCliente = async (
  nombre,
  cedula,
  direccion,
  telefono = "",
  correo = "",
  vendedor_id = null,
  password = "123456"
) => {
  if (!nombre || !cedula || !direccion) {
    return { error: "Nombre, cédula y dirección son requeridos" };
  }

  // 1. Verificar si ya existe usuario
  const { data: usuarioExistente } = await supabase
    .from("usuarios")
    .select("id")
    .eq("cedula", cedula)
    .maybeSingle();

  // 2. Crear usuario si no existe
  if (!usuarioExistente) {
    const { error: errorUsuario } = await supabase
      .from("usuarios")
      .insert([
        {
          nombre,
          cedula,
          email: correo || null,
          rol: "cliente",
          password_hash: password,
        },
      ]);

    if (errorUsuario) {
      console.error("Error creando usuario:", errorUsuario);
      return { error: errorUsuario.message };
    }
  }

  // 3. Crear cliente
  const { data, error } = await supabase
    .from("clientes")
    .insert([
      { nombre, cedula, direccion, telefono, correo, vendedor_id },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creando cliente:", error);
    return { error: error.message };
  }

  setClientes((prev) => [
    ...prev,
    {
      ...data,
      saldo: data.saldo ?? 0,
      transacciones: data.transacciones ?? [],
    },
  ]);

  return { success: true, cliente: data };
  };

  const obtenerClientesPorVendedor = (vendedorId) =>
    clientes.filter((cliente) => cliente.vendedor_id === vendedorId);

  const calcularVentasPorVendedor = (vendedorId) => {
    const clientesVendedor = obtenerClientesPorVendedor(vendedorId);
    const cedulas = clientesVendedor.map((cliente) => cliente.cedula);
    return pedidos
      .filter((pedido) => cedulas.includes(pedido.clienteCedula))
      .reduce((sum, pedido) => sum + Number(pedido.total || 0), 0);
  };

  const crearRepartidor = async (nombre, zona) => {
    if (!nombre || !zona) return { error: "Nombre y zona son requeridos" };

    const { data, error } = await supabase
      .from("repartidores")
      .insert([{ nombre, zona }])
      .select()
      .single();

    if (error) {
      console.error("Error creando repartidor:", error);
      return { error: error.message };
    }

    setRepartidores((prev) => [...prev, data]);
    return { success: true, repartidor: data };
  };

  const eliminarRepartidor = async (id) => {
    const { error } = await supabase
      .from("repartidores")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando repartidor:", error);
      return false;
    }

    setRepartidores((prev) => prev.filter((r) => r.id !== id));
    return true;
  };

  const registrarPago = async (
    clienteId,
    monto,
    metodoPago = "efectivo",
    descripcion = ""
  ) => {
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!cliente) return false;

    const nuevoSaldo = Number(cliente.saldo ?? 0) - Number(monto || 0);
    const { error } = await supabase
      .from("clientes")
      .update({ saldo: nuevoSaldo })
      .eq("id", clienteId);

    if (error) {
      console.error("Error registrando pago:", error);
      return false;
    }

    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId
          ? {
              ...c,
              saldo: nuevoSaldo,
              transacciones: [
                ...(c.transacciones ?? []),
                {
                  id: `${Date.now()}`,
                  tipo: "pago",
                  monto: Number(monto),
                  descripcion,
                  fecha: new Date().toLocaleDateString("es-CO"),
                },
              ],
            }
          : c
      )
    );
    return true;
  };

  const actualizarClienteTelefono = async (clienteId, telefono) => {
    const { error } = await supabase
      .from("clientes")
      .update({ telefono })
      .eq("id", clienteId);

    if (error) {
      console.error("Error actualizando teléfono:", error);
      return false;
    }

    setClientes((prev) =>
      prev.map((c) => (c.id === clienteId ? { ...c, telefono } : c))
    );
    return true;
  };

  const cambiarEstadoPedido = async (pedidoId, estado) => {
    const { error } = await supabase
      .from("pedidos")
      .update({ estado })
      .eq("id", pedidoId);

    if (error) {
      console.error("Error cambiando estado de pedido:", error);
      return false;
    }

    setPedidos((prev) =>
      prev.map((pedido) =>
        pedido.id === pedidoId ? { ...pedido, estado } : pedido
      )
    );
    return true;
  };

  const eliminarPedido = async (pedidoId) => {
    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("id", pedidoId);

    if (error) {
      console.error("Error eliminando pedido:", error);
      return false;
    }

    setPedidos((prev) => prev.filter((pedido) => pedido.id !== pedidoId));
    return true;
  };

  const asignarRepartidor = async (pedidoId, repartidor) => {
    const { error } = await supabase
      .from("pedidos")
      .update({ repartidor })
      .eq("id", pedidoId);

    if (error) {
      console.error("Error asignando repartidor:", error);
      return false;
    }

    setPedidos((prev) =>
      prev.map((pedido) =>
        pedido.id === pedidoId ? { ...pedido, repartidor } : pedido
      )
    );
    return true;
  };

  const updatePedidoItems = (pedidoId, items) => {
    setPedidos((prev) =>
      prev.map((pedido) =>
        pedido.id === pedidoId
          ? {
              ...pedido,
              items,
              total: items.reduce(
                (sum, item) => sum + Number(item.precio) * Number(item.cantidad || 1),
                0
              ),
            }
          : pedido
      )
    );
  };

  const agregarItemPedido = (pedidoId, productoId, nombre, precio, cantidad) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return false;

    const nuevoItem = { id: productoId, nombre, precio, cantidad };
    const items = [...(pedido.items || []), nuevoItem];
    updatePedidoItems(pedidoId, items);
    return true;
  };

  const eliminarItemPedido = (pedidoId, productoId) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return false;

    const items = (pedido.items || []).filter((item) => item.id !== productoId);
    updatePedidoItems(pedidoId, items);
    return true;
  };

  const actualizarCantidadItemPedido = (pedidoId, productoId, cantidad) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return false;

    const items = (pedido.items || []).map((item) =>
      item.id === productoId ? { ...item, cantidad } : item
    );
    updatePedidoItems(pedidoId, items);
    return true;
  };

  // CRUD de Categorías
  const crearCategoria = async (nombre, descripcion = "") => {
    if (!nombre || nombre.trim() === "") {
      return { error: "El nombre de la categoría es requerido" };
    }

    const { data, error } = await supabase
      .from("categorias")
      .insert([{ nombre: nombre.trim(), descripcion }])
      .select()
      .single();

    if (error) {
      console.error("Error creando categoría:", error);
      return { error: error.message };
    }

    setCategorias((prev) => [...prev, data]);
    return { success: true, categoria: data };
  };

  const actualizarCategoria = async (id, nombre, descripcion = "") => {
    if (!nombre || nombre.trim() === "") {
      return { error: "El nombre de la categoría es requerido" };
    }

    const { data, error } = await supabase
      .from("categorias")
      .update({ nombre: nombre.trim(), descripcion })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando categoría:", error);
      return { error: error.message };
    }

    setCategorias((prev) =>
      prev.map((cat) => (cat.id === id ? data : cat))
    );
    return { success: true, categoria: data };
  };

  const eliminarCategoria = async (id) => {
    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error eliminando categoría:", error);
      return { error: error.message };
    }

    setCategorias((prev) => prev.filter((cat) => cat.id !== id));
    return { success: true };
  };

return (
  <StoreContext.Provider
    value={{
      productos,
      setProductos,
      clientes,
      pedidos,
      repartidores,
      vendedores,
      categorias,
      crearProducto,
      actualizarStock,
      agotarProducto,
      crearPedido,
      crearCliente,
      crearVendedor,
      obtenerClientesPorVendedor,
      calcularVentasPorVendedor,
      crearRepartidor,
      eliminarRepartidor,
      registrarPago,
      actualizarClienteTelefono,
      cambiarEstadoPedido,
      eliminarPedido,
      asignarRepartidor,
      agregarItemPedido,
      eliminarItemPedido,
      actualizarCantidadItemPedido,
      crearCategoria,
      actualizarCategoria,
      eliminarCategoria,
    }}
  >
    {children}
  </StoreContext.Provider>
);
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}