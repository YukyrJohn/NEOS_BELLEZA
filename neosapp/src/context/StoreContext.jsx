import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { validarDatosPedido, validarCarrito, calcularTotal } from "../utils/validaciones";
import { enviarConfirmacionPedido, enviarNotificacionVendedor } from "../services/emailService";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);

  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1522338242592-cb0acf6f85a2?w=500";

const adaptarProducto = (p) => ({
  id: p.id ?? p.identificacion,
  nombre: p.nombre,
  precio: p.precio,
  stock: p.stock ?? p.existencias ?? 0,
  descripcion: p.descripcion,
  categoria_id: p.categoria_id,
  categoria: p.categorias?.nombre || p.categoria || "",
  categorias: p.categorias ?? null,
  imagenes: [p.imagen_url || p.imagenes?.[0] || DEFAULT_IMAGE],
});

  const adaptarPedido = (p, items = []) => ({

    id: p.id,
    cliente: p.nombre ?? p.cliente,
    clienteCedula: p.cedula,
    direccion: p.direccion,
    fecha:
      p.fecha ||
      (p.created_at ? new Date(p.created_at).toLocaleDateString("es-CO") : ""),
    formaPago: p.forma_pago ?? p.formaPago ?? "",
    items,
    total: p.total ?? p.totalPedido ?? 0,
    estado: p.estado ?? "Pendiente",
    repartidor: p.repartidor ?? "",
  });

const cargarProductos = async () => {
  const { data, error } = await supabase.from("productos").select("*");

  if (error) {
    console.error("Error cargando productos:", error);
    return [];
  }

  const adaptados = (data || []).map(adaptarProducto);
  setProductos(adaptados);
  return adaptados;
};

  const cargarClientes = async () => {
    const tableNames = ["clientes", "cliente", "Clientes"];

    const fetchClientes = async (table) => {
      const { data, error } = await supabase.from(table).select("*");
      if (error) {
        console.error(`Error cargando clientes desde ${table}:`, error);
        return null;
      }
      return data || [];
    };

    let clientesData = [];
    let tableUsada = "clientes";

    for (const table of tableNames) {
      const data = await fetchClientes(table);
      if (data === null) continue;
      if (data.length > 0) {
        clientesData = data;
        tableUsada = table;
        break;
      }
      if (table === "clientes") {
        clientesData = data;
      }
    }

    console.log(`Clientes cargados desde Supabase (${tableUsada}):`, clientesData);

    setClientes(
      clientesData.map((cliente) => {
        const clienteId =
          cliente.id ??
          cliente.cliente_id ??
          cliente.Cliente_id ??
          cliente.clienteId ??
          cliente.Usuario_id ??
          cliente.usuario_id ??
          cliente.usuarioId ??
          cliente.user_id ??
          cliente.userId ??
          null;

        return {
          ...cliente,
          id: clienteId,
          cedula:
            cliente.cedula ??
            cliente.cedula_cliente ??
            cliente.Cedula ??
            cliente.CI ??
            cliente.ci ??
            "",
          nombre:
            cliente.nombre ??
            cliente.Nombre ??
            cliente.name ??
            cliente.nombre_cliente ??
            "Cliente",
          direccion:
            cliente.direccion ??
            cliente.dirección ??
            cliente.Direccion ??
            cliente.dirección_cliente ??
            cliente.address ??
            "",
          telefono:
            cliente.telefono ??
            cliente.telefono_cliente ??
            cliente.Telefono ??
            cliente.phone ??
            "",
          correo:
            cliente.correo ??
            cliente.email ??
            cliente.Email ??
            cliente.correo_cliente ??
            "",
          saldo: cliente.saldo ?? cliente.balance ?? 0,
          transacciones: cliente.transacciones ?? cliente.transactions ?? [],
          vendedor_id:
            cliente.vendedor_id ??
            cliente["vendedor id"] ??
            cliente.vendedorId ??
            cliente.Vendedor_id ??
            cliente.vendedor ??
            null,
          usuario_id:
            cliente.usuario_id ??
            cliente.Usuario_id ??
            cliente.usuarioId ??
            cliente.user_id ??
            cliente.userId ??
            null,
        };
      })
    );
  };

  const cargarPedidos = async (productosCargados = []) => {
    const { data, error } = await supabase.from("pedidos").select("*");
    if (error) {
      console.error("Error cargando pedidos:", error);
      return;
    }

    const pedidosData = data || [];
    const pedidoIds = pedidosData
      .map((pedido) => pedido.id)
      .filter((id) => id != null);

    let detalleData = [];
    if (pedidoIds.length > 0) {
      const { data: detalles, error: detalleError } = await supabase
        .from("pedido_detalle")
        .select("*")
        .in("pedido_id", pedidoIds);

      if (detalleError) {
        console.error("Error cargando detalles de pedidos:", detalleError);
      } else {
        detalleData = detalles || [];
      }
    }

    const detallesPorPedido = detalleData.reduce((acc, detalle) => {
      const pedidoId =
        detalle.pedido_id ?? detalle.Pedido_id ?? detalle.pedidoId ?? detalle.PedidoId;
      const productoId =
        detalle.producto_id ??
        detalle.Producto_id ??
        detalle.productoId ??
        detalle.ProductoId;

      const producto = (productosCargados.length > 0 ? productosCargados : productos).find(
        (prod) => String(prod.id) === String(productoId)
      );

      const item = {
        id: productoId,
        nombre:
          producto?.nombre ||
          detalle.nombre ||
          `Producto #${productoId}`,
        precio: Number(detalle.precio ?? detalle.Precio ?? producto?.precio ?? 0),
        cantidad: Number(detalle.cantidad ?? detalle.Cantidad ?? 1),
        imagen:
          producto?.imagenes?.[0] ||
          detalle.imagen ||
          detalle.imagen_url ||
          "",
      };

      acc[pedidoId] = [...(acc[pedidoId] || []), item];
      return acc;
    }, {});

    setPedidos(
      pedidosData.map((pedido) =>
        adaptarPedido(
          pedido,
          detallesPorPedido[pedido.id] || pedido.items || []
        )
      )
    );
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
    setCargandoCategorias(true);
    try {
      const { data, error } = await supabase.from("categorias").select("*");
      if (error) {
        console.error("Error cargando categorías:", error);
        setCategorias([]);
        return;
      }
      setCategorias(data || []);
    } finally {
      setCargandoCategorias(false);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const productosCargados = await cargarProductos();
      await Promise.all([
        cargarClientes(),
        cargarPedidos(productosCargados),
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

const categoriaEncontrada = categorias.find(
  (c) => c.nombre === categoria
);

if (!categoriaEncontrada) {
  return { error: "Categoría no encontrada" };
}

const { data, error } = await supabase
  .from("productos")
  .insert([
    {
      nombre,
      precio: Number(precio),
      stock: Number(stock),
      descripcion,
      categoria_id: categoriaEncontrada.id,
      imagen_url: imagenes[0] || null,
    },
  ])
  .select("*")
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

  const actualizarProducto = async (productoId, datos) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return { error: "Producto no encontrado" };

    const datosActualizacion = {};
    if (datos.nombre != null) datosActualizacion.nombre = datos.nombre;
    if (datos.precio != null) datosActualizacion.precio = Number(datos.precio);
    if (datos.stock != null) datosActualizacion.stock = Number(datos.stock);
    if (datos.descripcion != null) datosActualizacion.descripcion = datos.descripcion;
    if (datos.imagenes != null && datos.imagenes.length > 0) {
      datosActualizacion.imagen_url = datos.imagenes[0];
    }

    const { data, error } = await supabase
      .from("productos")
      .update(datosActualizacion)
      .eq("id", productoId)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando producto:", error);
      return { error: error.message };
    }

    const productoActualizado = adaptarProducto(data);
    setProductos((prev) =>
      prev.map((p) => (p.id === productoId ? productoActualizado : p))
    );

    return { success: true, producto: productoActualizado };
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

  const crearPedido = async (cedula, nombre, direccion, carrito, formaPago, emailCliente = "", telefonoCliente = "") => {
    // Validar datos básicos
    if (!cedula || !nombre || !direccion || !carrito?.length) {
      return { error: "Cédula, nombre, dirección y carrito son requeridos" };
    }

    // Validar carrito
    const validacionCarrito = validarCarrito(carrito);
    if (!validacionCarrito.valido) {
      return { error: validacionCarrito.errores.join("; ") };
    }

    // Validar datos del pedido
    const datosValidar = {
      cedula,
      nombre,
      direccion,
      email: emailCliente,
      telefono: telefonoCliente,
      formaPago,
      carrito,
    };

    const validacion = validarDatosPedido(datosValidar);
    if (!validacion.valido) {
      return { error: validacion.errores.join("; ") };
    }

    // Obtener cliente para tener acceso a su email
    const clienteEncontrado = clientes.find((c) => c.cedula === cedula);
    const emailDestino = emailCliente || clienteEncontrado?.correo;

    const total = calcularTotal(carrito);

    const pedidoData = {
      cedula,
      nombre,
      direccion,
      forma_pago: formaPago,
      estado: "Pendiente",
      total,
    };

    try {
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

      // Actualizar stock
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

      // Enviar correo de confirmación al cliente
      if (emailDestino) {
        try {
          await enviarConfirmacionPedido({
            pedidoId: pedidoCreado.id,
            cliente: nombre,
            email: emailDestino,
            telefono: telefonoCliente || clienteEncontrado?.telefono,
            items: carrito,
            total,
            formaPago,
            direccion,
          });
        } catch (errorEmail) {
          console.error("Error enviando correo de confirmación:", errorEmail);
          // No retornar error aquí, el pedido ya fue creado
        }
      }

      return { success: true, pedido: nuevoPedido };
    } catch (error) {
      console.error("Error en crearPedido:", error);
      return { error: error.message || "Error al crear el pedido" };
    }
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
      actualizarProducto,
      cargandoCategorias,
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