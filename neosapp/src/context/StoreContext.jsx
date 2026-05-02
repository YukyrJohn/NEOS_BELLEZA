import { createContext, useContext, useState } from "react";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  // ============================================
  // 📦 PRODUCTOS - Gestión de inventario
  // ============================================
  const [productos, setProductos] = useState([
    { 
      id: 1, 
      nombre: "Gancho Dorado", 
      categoria: "Ganchos para cabello", 
      precio: 8000, 
      stock: 10,
      descripcion: "Gancho para cabello de alta calidad, resistente y duradero. Ideal para diferentes tipos de cabello.",
      imagenes: [
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1594975519620-37eb173d6204?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1615996001375-cd0ecfef5d3a?w=500&h=500&fit=crop"
      ]
    },
    { 
      id: 2, 
      nombre: "Keratina Pro", 
      categoria: "Tratamientos", 
      precio: 45000, 
      stock: 5,
      descripcion: "Tratamiento de keratina profesional que fortalece y suaviza el cabello. Restaura la vitalidad natural.",
      imagenes: [
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-af823e5b7a0e?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=500&fit=crop"
      ]
    },
    {
      id: 3,
      nombre: "Esmalte Rojo Intenso",
      categoria: "Esmaltes",
      precio: 12000,
      stock: 20,
      descripcion: "Esmalte de alta calidad con color intenso y durabilidad prolongada. Ideal para un look elegante.",
      imagenes: [
        "https://images.unsplash.com/photo-1593696145393-7c8e2f8f7c8f?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1593696145393-7c8e2f8f7c8f?w=500&h=500&fit=crop",
        "https://images.unsplash.com/photo-1593696145393-7c8e2f8f7c8f?w=500&h=500&fit=crop"
      ]
    }
  ]);

  // ============================================
  // 📦 FUNCIONES - PRODUCTOS
  // ============================================

  /**
   * Crea un nuevo producto con su stock inicial
   * @param {string} nombre - Nombre del producto
   * @param {number} precio - Precio del producto
   * @param {string} categoria - Categoría del producto
   * @param {number} stock - Stock inicial (cantidad disponible)
   * @param {string} descripcion - Descripción del producto (opcional)
   * @param {array} imagenes - Array de URLs de imágenes (opcional)
   * @returns {object} El producto creado
   */
  const crearProducto = (nombre, precio, categoria, stock = 10, descripcion = "", imagenes = []) => {
    if (!nombre || !precio || !categoria) {
      return { error: "Nombre, precio y categoría son requeridos" };
    }

    const nuevoProducto = {
      id: Date.now(),
      nombre,
      precio: Number(precio),
      categoria,
      stock: Number(stock),
      descripcion,
      imagenes: imagenes.length > 0 ? imagenes : ["https://images.unsplash.com/photo-1522338242592-cb0acf6f85a2?w=500&h=500&fit=crop"]
    };

    setProductos([...productos, nuevoProducto]);
    return { success: true, producto: nuevoProducto };
  };

  /**
   * Actualiza el stock de un producto (suma o resta)
   * @param {number} productoId - ID del producto
   * @param {number} cantidad - Cantidad a sumar (positivo) o restar (negativo)
   * @returns {boolean} true si se actualizó exitosamente
   */
  const actualizarStock = (productoId, cantidad) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return false;

    const nuevoStock = producto.stock + cantidad;
    if (nuevoStock < 0) return false; // No permitir negativos

    setProductos(
      productos.map((p) =>
        p.id === productoId ? { ...p, stock: nuevoStock } : p
      )
    );
    return true;
  };

  /**
   * Agota el stock de un producto (lo pone en 0)
   * @param {number} productoId - ID del producto a agotar
   * @returns {boolean} true si se completó exitosamente
   */
  const agotarProducto = (productoId) => {
    const producto = productos.find((p) => p.id === productoId);
    if (!producto) return false;

    setProductos(
      productos.map((p) =>
        p.id === productoId ? { ...p, stock: 0 } : p
      )
    );
    return true;
  };

  // ============================================
  // 🚗 REPARTIDORES - Gestión de entregas
  // ============================================
  const [repartidores, setRepartidores] = useState([
    { id: 1, nombre: "Carlos Rodríguez", zona: "Norte", estado: "activo", pedidosAsignados: 0 },
    { id: 2, nombre: "David García", zona: "Sur", estado: "activo", pedidosAsignados: 0 },
    { id: 3, nombre: "Elena Martínez", zona: "Oriente", estado: "activo", pedidosAsignados: 0 },
    { id: 4, nombre: "Miguel Ángel", zona: "Occidente", estado: "activo", pedidosAsignados: 0 }
  ]);

  // ============================================
  // 👨‍💼 VENDEDORES - Gestión por zonas
  // ============================================
  const [vendedores, setVendedores] = useState([
    { id: 1, nombre: "Carlos Rodríguez", zona: "Norte", clientesIds: [1] },
    { id: 2, nombre: "María López", zona: "Sur", clientesIds: [2] },
    { id: 3, nombre: "Juan Martínez", zona: "Oriente", clientesIds: [] },
    { id: 4, nombre: "Sandra García", zona: "Occidente", clientesIds: [] }
  ]);

  // ============================================
  // 👥 CLIENTES - Datos de clientes y transacciones
  // ============================================
  const [clientes, setClientes] = useState([
    {
      id: 1,
      nombre: "Ana Pérez",
      cedula: "1234567890",
      direccion: "Calle Principal 123",
      telefono: "3001234567",
      correo: "ana.perez@email.com",
      vendedor_id: 1,
      saldo: 30000,
      transacciones: [
        { id: 1, tipo: "pedido", monto: 45000, fecha: "10/02/2026", descripcion: "Pedido #1 - Crédito", pedidoId: 1 },
        { id: 2, tipo: "pago", monto: 15000, fecha: "11/02/2026", descripcion: "Abono parcial" }
      ]
    },
    {
      id: 2,
      nombre: "Laura Gómez",
      cedula: "0987654321",
      direccion: "Avenida Central 456",
      telefono: "3109876543",
      correo: "laura.gomez@email.com",
      vendedor_id: 2,
      saldo: 0,
      transacciones: [
        { id: 1, tipo: "pedido", monto: 30000, fecha: "10/02/2026", descripcion: "Pedido #2 - Efectivo", pedidoId: 2 }
      ]
    }
  ]);

  // ============================================
  // 📋 PEDIDOS - Órdenes y seguimiento
  // ============================================
  // Helper: modificar transacción de pedido en cliente
  const actualizarTransaccionPedido = (clienteNombre, pedidoId, nuevoTotal, formaPago) => {
    setClientes((clientesPrev) =>
      clientesPrev.map((c) => {
        if (c.nombre !== clienteNombre) return c;
        // Sólo ajusta transacción si existe y si pago no es efectivo
        if (formaPago === "Efectivo") return c;

        const transaccionesActualizadas = c.transacciones.map((t) => {
          if (t.tipo === "pedido" && t.pedidoId === pedidoId) {
            return {
              ...t,
              monto: nuevoTotal,
              descripcion: `Pedido #${pedidoId} - ${formaPago}`
            };
          }
          return t;
        });

        return {
          ...c,
          transacciones: transaccionesActualizadas
        };
      })
    );
  };

  const [pedidos, setPedidos] = useState([
    {
      id: 1,
      cliente: "Ana Pérez",
      direccion: "Calle Principal 123",
      items: [{ id: 1, nombre: "Gancho Dorado", precio: 8000, cantidad: 1 }],
      total: 45000,
      estado: "En camino",
      fecha: "10/02/2026",
      formaPago: "Crédito",
      repartidor: "Carlos Rodríguez"
    },
    {
      id: 2,
      cliente: "Laura Gómez",
      direccion: "Avenida Central 456",
      items: [{ id: 2, nombre: "Keratina Pro", precio: 45000, cantidad: 1 }],
      total: 30000,
      estado: "Pendiente",
      fecha: "10/02/2026",
      formaPago: "Efectivo",
      repartidor: "Carlos Rodríguez"
    },
    {
      id: 3,
      cliente: "María López",
      direccion: "Plaza Mayor 789",
      items: [{ id: 3, nombre: "Esmalte Rojo Intenso", precio: 12000, cantidad: 2 }],
      total: 24000,
      estado: "Entregado",
      fecha: "09/02/2026",
      formaPago: "Efectivo",
      repartidor: "Carlos Rodríguez"
    },
    {
      id: 4,
      cliente: "Pedro Sánchez",
      direccion: "Calle Nueva 321",
      items: [{ id: 1, nombre: "Gancho Dorado", precio: 8000, cantidad: 1 }],
      total: 8000,
      estado: "Cancelado",
      fecha: "10/02/2026",
      formaPago: "Crédito",
      repartidor: "Carlos Rodríguez"
    },
    {
      id: 5,
      cliente: "Sofia Ramírez",
      direccion: "Avenida Sur 654",
      items: [{ id: 2, nombre: "Keratina Pro", precio: 45000, cantidad: 1 }],
      total: 45000,
      estado: "En camino",
      fecha: "10/02/2026",
      formaPago: "Abono",
      repartidor: "David García"
    },
    {
      id: 6,
      cliente: "Juan Torres",
      direccion: "Calle Este 987",
      items: [{ id: 3, nombre: "Esmalte Rojo Intenso", precio: 12000, cantidad: 1 }],
      total: 12000,
      estado: "Pendiente",
      fecha: "10/02/2026",
      formaPago: "Efectivo",
      repartidor: "David García"
    },
    {
      id: 7,
      cliente: "Carmen Díaz",
      direccion: "Plaza Norte 147",
      items: [{ id: 1, nombre: "Gancho Dorado", precio: 8000, cantidad: 3 }],
      total: 24000,
      estado: "Entregado",
      fecha: "08/02/2026",
      formaPago: "Crédito",
      repartidor: "David García"
    },
    {
      id: 8,
      cliente: "Roberto Silva",
      direccion: "Avenida Oeste 258",
      items: [{ id: 2, nombre: "Keratina Pro", precio: 45000, cantidad: 1 }],
      total: 45000,
      estado: "En camino",
      fecha: "10/02/2026",
      formaPago: "Efectivo",
      repartidor: "Elena Martínez"
    },
    {
      id: 9,
      cliente: "Patricia Ruiz",
      direccion: "Calle Central 369",
      items: [{ id: 3, nombre: "Esmalte Rojo Intenso", precio: 12000, cantidad: 1 }],
      total: 12000,
      estado: "Pendiente",
      fecha: "10/02/2026",
      formaPago: "Abono",
      repartidor: "Elena Martínez"
    },
    {
      id: 11,
      cliente: "Isabel Morales",
      direccion: "Calle Antigua 852",
      items: [{ id: 3, nombre: "Esmalte Rojo Intenso", precio: 12000, cantidad: 1 }],
      total: 12000,
      estado: "Pendiente",
      fecha: "10/02/2026",
      formaPago: "Crédito",
      repartidor: "Miguel Ángel"
    },
    {
      id: 12,
      cliente: "Fernando Castro",
      direccion: "Avenida Moderna 963",
      items: [{ id: 1, nombre: "Gancho Dorado", precio: 8000, cantidad: 1 }],
      total: 8000,
      estado: "Entregado",
      fecha: "06/02/2026",
      formaPago: "Efectivo",
      repartidor: "Miguel Ángel"
    },
    {
      id: 13,
      cliente: "Gabriela Vega",
      direccion: "Plaza Vieja 159",
      items: [{ id: 2, nombre: "Keratina Pro", precio: 45000, cantidad: 1 }],
      total: 45000,
      estado: "Cancelado",
      fecha: "09/02/2026",
      formaPago: "Abono",
      repartidor: "Miguel Ángel"
    },
    {
      id: 14,
      cliente: "Andrés Pinto",
      direccion: "Calle Nueva Esperanza 753",
      items: [{ id: 3, nombre: "Esmalte Rojo Intenso", precio: 12000, cantidad: 1 }],
      total: 12000,
      estado: "Pendiente",
      fecha: "10/02/2026",
      formaPago: "Efectivo",
      repartidor: null // Pedido sin asignar
    }
  ]);

  // ============================================
  // 📋 FUNCIONES - PEDIDOS
  // ============================================
  
  /**
   * Crea un nuevo pedido
   * @param {string} clienteCedula - Cédula del cliente
   * @param {string} clienteNombre - Nombre del cliente
   * @param {string} direccion - Dirección de entrega
   * @param {array} items - Items del pedido [{id, nombre, precio, cantidad}]
   * @param {string} formaPago - Forma de pago: "Efectivo", "Crédito", "Abono"
   */
  const crearPedido = (clienteCedula, clienteNombre, direccion, items, formaPago) => {
    const total = items.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );

    const nuevoIdPedido =
      pedidos.length > 0
        ? Math.max(...pedidos.map((p) => p.id)) + 1
        : 1;

    const nuevoPedido = {
      id: nuevoIdPedido,
      cliente: clienteNombre,
      clienteCedula,
      direccion,
      items,
      total,
      estado: "Pendiente",
      fecha: new Date().toLocaleDateString(),
      formaPago,
      repartidor: null
    };

    // Descontar stock de productos
    const productosActualizados = productos.map((p) => {
      const itemPedido = items.find((i) => i.id === p.id);
      if (itemPedido) {
        return { ...p, stock: p.stock - itemPedido.cantidad };
      }
      return p;
    });

    // Manejar cliente por cédula
    let clientesActualizados = [...clientes];
    let clienteExistente = clientesActualizados.find(
      (c) => c.cedula === clienteCedula
    );

    if (!clienteExistente) {
      // Crear nuevo cliente automáticamente
      const nuevoClienteId = clientes.length > 0
        ? Math.max(...clientes.map((c) => c.id)) + 1
        : 1;

      clienteExistente = {
        id: nuevoClienteId,
        nombre: clienteNombre,
        cedula: clienteCedula,
        direccion,
        telefono: "",
        correo: "",
        vendedor_id: null,
        saldo: 0,
        transacciones: []
      };
      clientesActualizados.push(clienteExistente);
    } else {
      // Actualizar dirección si es diferente
      clienteExistente.direccion = direccion;
    }

    // Registrar transacción
    const transaccionId = clienteExistente.transacciones.length > 0
      ? Math.max(...clienteExistente.transacciones.map((t) => t.id)) + 1
      : 1;

    const nuevaTransaccion = {
      id: transaccionId,
      tipo: "pedido",
      monto: total,
      fecha: new Date().toLocaleDateString(),
      descripcion: `Pedido #${nuevoIdPedido} - ${formaPago}`,
      pedidoId: nuevoIdPedido
    };

    // Actualizar saldo según forma de pago
    if (formaPago === "Efectivo") {
      // No suma al saldo, es pago inmediato
    } else if (formaPago === "Crédito" || formaPago === "Abono") {
      clienteExistente.saldo += total;
    }

    clienteExistente.transacciones.push(nuevaTransaccion);
    clientesActualizados = clientesActualizados.map((c) =>
      c.id === clienteExistente.id ? clienteExistente : c
    );

    setProductos(productosActualizados);
    setClientes(clientesActualizados);
    setPedidos([...pedidos, nuevoPedido]);
  };

  /**
   * Cambia el estado de un pedido
   * @param {number} id - ID del pedido
   * @param {string} estado - Nuevo estado (Pendiente, En camino, Entregado, etc)
   */
  const cambiarEstadoPedido = (id, estado) => {
    setPedidos(
      pedidos.map((p) =>
        p.id === id ? { ...p, estado } : p
      )
    );
  };

  /**
   * Elimina un pedido y restaura el stock y saldo del cliente
   * @param {number} id - ID del pedido a eliminar
   */
  const eliminarPedido = (id) => {
    const pedido = pedidos.find((p) => p.id === id);
    if (!pedido) return;

    // Restaurar stock
    const productosActualizados = productos.map((prod) => {
      const item = pedido.items.find((i) => i.id === prod.id);
      if (item) {
        return { ...prod, stock: prod.stock + item.cantidad };
      }
      return prod;
    });

    // Restaurar saldo del cliente si es Crédito o Abono
    let clientesActualizados = [...clientes];
    if (pedido.formaPago === "Crédito" || pedido.formaPago === "Abono") {
      clientesActualizados = clientes.map((c) => {
        if (c.nombre === pedido.cliente) {
          return {
            ...c,
            saldo: c.saldo - pedido.total,
            transacciones: c.transacciones.filter(
              (t) => !(t.tipo === "pedido" && t.pedidoId === id)
            )
          };
        }
        return c;
      });
    }

    setProductos(productosActualizados);
    setClientes(clientesActualizados);
    setPedidos(pedidos.filter((p) => p.id !== id));
  };

  /**
   * Asigna un repartidor a un pedido
   * @param {number} id - ID del pedido
   * @param {string} repartidorNombre - Nombre del repartidor
   */
  const asignarRepartidor = (id, repartidorNombre) => {
    setPedidos(
      pedidos.map((p) =>
        p.id === id ? { ...p, repartidor: repartidorNombre } : p
      )
    );
  };

  /**
   * Agrega un item a un pedido existente y actualiza saldo del cliente
   * @param {number} pedidoId - ID del pedido
   * @param {number} productoId - ID del producto a agregar
   * @param {string} nombreProducto - Nombre del producto
   * @param {number} precio - Precio del producto
   * @param {number} cantidad - Cantidad a agregar (default 1)
   */
  const agregarItemPedido = (pedidoId, productoId, nombreProducto, precio, cantidad = 1) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return { error: "Pedido no encontrado" };

    // Verificar stock disponible
    const producto = productos.find((p) => p.id === productoId);
    if (!producto || producto.stock < cantidad) {
      return { error: "Stock insuficiente para este producto" };
    }

    // Buscar si el item ya existe en el pedido
    const itemExistente = pedido.items.find((item) => item.id === productoId);
    
    let itemsActualizado;
    if (itemExistente) {
      // Si existe, aumentar la cantidad
      itemsActualizado = pedido.items.map((item) =>
        item.id === productoId
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      );
    } else {
      // Si no existe, agregar el nuevo item
      itemsActualizado = [
        ...pedido.items,
        {
          id: productoId,
          nombre: nombreProducto,
          precio,
          cantidad
        }
      ];
    }

    // Calcular nuevo total
    const nuevoTotal = itemsActualizado.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );

    // Calcular diferencia de total
    const diferenciaMonto = nuevoTotal - pedido.total;

    // Actualizar stock del producto
    const productosActualizados = productos.map((p) =>
      p.id === productoId
        ? { ...p, stock: p.stock - cantidad }
        : p
    );

    // Actualizar saldo del cliente solo si es Crédito o Abono
    let clientesActualizados = [...clientes];
    if ((pedido.formaPago === "Crédito" || pedido.formaPago === "Abono") && diferenciaMonto !== 0) {
      clientesActualizados = clientes.map((c) => {
        if (c.nombre === pedido.cliente) {
          return {
            ...c,
            saldo: c.saldo + diferenciaMonto
          };
        }
        return c;
      });
    }

    // Actualizar el pedido
    const pedidosActualizados = pedidos.map((p) =>
      p.id === pedidoId
        ? { ...p, items: itemsActualizado, total: nuevoTotal }
        : p
    );

    setProductos(productosActualizados);
    setClientes(clientesActualizados);
    setPedidos(pedidosActualizados);

    // actualizar registro de pedido si existe (para crédito/abono)
    actualizarTransaccionPedido(pedido.cliente, pedidoId, nuevoTotal, pedido.formaPago);

    return { success: true, mensaje: "Item agregado al pedido" };
  };

  /**
   * Elimina un item de un pedido y actualiza saldo del cliente
   * @param {number} pedidoId - ID del pedido
   * @param {number} productoId - ID del producto a eliminar
   */
  const eliminarItemPedido = (pedidoId, productoId) => {
    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return { error: "Pedido no encontrado" };

    const item = pedido.items.find((i) => i.id === productoId);
    if (!item) return { error: "Item no encontrado en el pedido" };

    // Restaurar stock del producto
    const productosActualizados = productos.map((p) =>
      p.id === productoId
        ? { ...p, stock: p.stock + item.cantidad }
        : p
    );

    // Eliminar item del pedido
    const itemsActualizado = pedido.items.filter((i) => i.id !== productoId);

    // Calcular nuevo total
    const nuevoTotal = itemsActualizado.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );

    // Calcular diferencia de total
    const diferenciaMonto = nuevoTotal - pedido.total;

    // Actualizar saldo del cliente solo si es Crédito o Abono
    let clientesActualizados = [...clientes];
    if ((pedido.formaPago === "Crédito" || pedido.formaPago === "Abono") && diferenciaMonto !== 0) {
      clientesActualizados = clientes.map((c) => {
        if (c.nombre === pedido.cliente) {
          return {
            ...c,
            saldo: c.saldo + diferenciaMonto
          };
        }
        return c;
      });
    }

    // Actualizar el pedido
    const pedidosActualizados = pedidos.map((p) =>
      p.id === pedidoId
        ? { ...p, items: itemsActualizado, total: nuevoTotal }
        : p
    );

    setProductos(productosActualizados);
    setClientes(clientesActualizados);
    setPedidos(pedidosActualizados);

    // actualizar transacción existente
    actualizarTransaccionPedido(pedido.cliente, pedidoId, nuevoTotal, pedido.formaPago);

    return { success: true, mensaje: "Item eliminado del pedido" };
  };

  /**
   * Actualiza la cantidad de un item en un pedido y actualiza saldo del cliente
   * @param {number} pedidoId - ID del pedido
   * @param {number} productoId - ID del producto
   * @param {number} nuevaCantidad - Nueva cantidad (debe ser > 0)
   */
  const actualizarCantidadItemPedido = (pedidoId, productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      return eliminarItemPedido(pedidoId, productoId);
    }

    const pedido = pedidos.find((p) => p.id === pedidoId);
    if (!pedido) return { error: "Pedido no encontrado" };

    const item = pedido.items.find((i) => i.id === productoId);
    if (!item) return { error: "Item no encontrado en el pedido" };

    const diferenciaCantidad = nuevaCantidad - item.cantidad;

    // Verificar que hay stock disponible si es un aumento
    if (diferenciaCantidad > 0) {
      const producto = productos.find((p) => p.id === productoId);
      if (!producto || producto.stock < diferenciaCantidad) {
        return { error: "Stock insuficiente para aumentar la cantidad" };
      }
    }

    // Actualizar cantidad del item
    const itemsActualizado = pedido.items.map((i) =>
      i.id === productoId
        ? { ...i, cantidad: nuevaCantidad }
        : i
    );

    // Actualizar stock del producto
    const productosActualizados = productos.map((p) =>
      p.id === productoId
        ? { ...p, stock: p.stock - diferenciaCantidad }
        : p
    );

    // Calcular nuevo total
    const nuevoTotal = itemsActualizado.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0
    );

    // Calcular diferencia de total
    const diferenciaMonto = nuevoTotal - pedido.total;

    // Actualizar saldo del cliente solo si es Crédito o Abono
    let clientesActualizados = [...clientes];
    if ((pedido.formaPago === "Crédito" || pedido.formaPago === "Abono") && diferenciaMonto !== 0) {
      clientesActualizados = clientes.map((c) => {
        if (c.nombre === pedido.cliente) {
          return {
            ...c,
            saldo: c.saldo + diferenciaMonto
          };
        }
        return c;
      });
    }

    // Actualizar el pedido
    const pedidosActualizados = pedidos.map((p) =>
      p.id === pedidoId
        ? { ...p, items: itemsActualizado, total: nuevoTotal }
        : p
    );

    setProductos(productosActualizados);
    setClientes(clientesActualizados);
    setPedidos(pedidosActualizados);

    // registrar cambios en transacción
    actualizarTransaccionPedido(pedido.cliente, pedidoId, nuevoTotal, pedido.formaPago);

    return { success: true, mensaje: "Cantidad actualizada" };
  };

  // ============================================
  // 🚗 FUNCIONES - REPARTIDORES
  // ============================================

  /**
   * Crea un nuevo repartidor
   * @param {string} nombre - Nombre del repartidor
   * @param {string} zona - Zona de cobertura
   */
  const crearRepartidor = (nombre, zona) => {
    if (!nombre || !zona) return;

    const nuevoId =
      repartidores.length > 0
        ? Math.max(...repartidores.map((r) => r.id)) + 1
        : 1;

    const nuevoRepartidor = {
      id: nuevoId,
      nombre,
      zona,
      pedidosAsignados: 0
    };

    setRepartidores([...repartidores, nuevoRepartidor]);
  };

  /**
   * Elimina un repartidor y limpia sus asignaciones
   * @param {number} id - ID del repartidor a eliminar
   */
  const eliminarRepartidor = (id) => {
    // Limpiar asignaciones de este repartidor en los pedidos
    setPedidos(
      pedidos.map((p) => 
        p.repartidor && 
        repartidores.find((r) => r.id === id)?.nombre === p.repartidor 
          ? { ...p, repartidor: null }
          : p
      )
    );
    
    setRepartidores(repartidores.filter((r) => r.id !== id));
  };

  // ============================================
  // 👥 FUNCIONES - CLIENTES
  // ============================================

  /**
   * Crea un nuevo cliente
   * @param {string} nombre - Nombre del cliente
   * @param {string} cedula - Cédula o NIT del cliente
   * @param {string} direccion - Dirección del cliente
   * @param {string} telefono - Teléfono (opcional)
   * @param {string} correo - Correo electrónico (opcional)
   * @param {number} vendedor_id - ID del vendedor asignado (opcional)
   * @returns {object} Resultado {success: true, cliente} o {error: mensaje}
   */
  const crearCliente = (nombre, cedula, direccion, telefono = "", correo = "", vendedor_id = null) => {
    if (!nombre || !cedula) {
      return { error: "Nombre y cédula son requeridos" };
    }

    // Verificar si la cédula ya existe
    const clienteExistente = clientes.find((c) => c.cedula === cedula);
    if (clienteExistente) {
      return { error: "Este cliente ya está registrado" };
    }

    const nuevoClienteId = clientes.length > 0
      ? Math.max(...clientes.map((c) => c.id)) + 1
      : 1;

    const nuevoCliente = {
      id: nuevoClienteId,
      nombre,
      cedula,
      direccion,
      telefono,
      correo,
      vendedor_id,
      saldo: 0,
      transacciones: []
    };

    setClientes([...clientes, nuevoCliente]);

    // Asignar cliente a vendedor si se proporciona
    if (vendedor_id) {
      const vendedoresActualizados = vendedores.map((v) =>
        v.id === vendedor_id
          ? { ...v, clientesIds: [...v.clientesIds, nuevoClienteId] }
          : v
      );
      setVendedores(vendedoresActualizados);
    }

    return { success: true, cliente: nuevoCliente };
  };

  /**
   * Busca un cliente por su cédula
   * @param {string} cedula - Cédula del cliente
   * @returns {object|null} Cliente encontrado o null
   */
  const buscarClientePorCedula = (cedula) => {
    return clientes.find((c) => c.cedula === cedula) || null;
  };

  /**
   * Registra un pago (o abono) para un cliente.
   * Métodos posibles: "efectivo", "consignacion", "credito".
   * - efectivo: reduce saldo inmediatamente
   * - consignacion: similar a efectivo pero queda registro del método
   * - credito: registra incremento de saldo (cliente adeuda)
   *
   * @param {number} clienteId - ID del cliente
   * @param {number} monto - Monto de la transacción
   * @param {string} metodo - "efectivo" | "consignacion" | "credito"
   * @param {string} descripcion - Descripción adicional
   */
  const registrarPago = (clienteId, monto, metodo = "efectivo", descripcion = "Pago") => {
    if (monto <= 0) return;

    const clientesActualizados = clientes.map((c) => {
      if (c.id === clienteId) {
        const transaccionId = c.transacciones.length > 0
          ? Math.max(...c.transacciones.map((t) => t.id)) + 1
          : 1;

        // calcular saldo según método
        let nuevoSaldo = c.saldo;
        if (metodo === "efectivo" || metodo === "consignacion") {
          nuevoSaldo = c.saldo - monto;
        } else if (metodo === "credito") {
          nuevoSaldo = c.saldo + monto;
        }

        return {
          ...c,
          saldo: nuevoSaldo,
          transacciones: [
            ...c.transacciones,
            {
              id: transaccionId,
              tipo: metodo,
              monto: monto,
              fecha: new Date().toLocaleDateString(),
              descripcion
            }
          ]
        };
      }
      return c;
    });

    setClientes(clientesActualizados);
  };

  /**
   * Actualiza el teléfono de un cliente
   * @param {number} clienteId - ID del cliente
   * @param {string} telefono - Nuevo teléfono
   */
  const actualizarClienteTelefono = (clienteId, telefono) => {
    const clientesActualizados = clientes.map((c) =>
      c.id === clienteId ? { ...c, telefono } : c
    );
    setClientes(clientesActualizados);
  };

  // ============================================
  // 👨‍💼 FUNCIONES - VENDEDORES
  // ============================================

  /**
   * Asigna un cliente a un vendedor
   * @param {number} clienteId - ID del cliente
   * @param {number} vendedorId - ID del vendedor
   */
  const asignarClienteAVendedor = (clienteId, vendedorId) => {
    // Actualizar cliente
    const clientesActualizados = clientes.map((c) =>
      c.id === clienteId ? { ...c, vendedor_id: vendedorId } : c
    );

    // Actualizar vendedores
    const vendedoresActualizados = vendedores.map((v) => {
      // Remover cliente de su vendedor anterior
      if (v.clientesIds.includes(clienteId)) {
        return { ...v, clientesIds: v.clientesIds.filter((id) => id !== clienteId) };
      }
      // Agregar cliente al nuevo vendedor
      if (v.id === vendedorId) {
        return { ...v, clientesIds: [...v.clientesIds, clienteId] };
      }
      return v;
    });

    setClientes(clientesActualizados);
    setVendedores(vendedoresActualizados);
  };

  /**
   * Obtiene todos los clientes de un vendedor
   * @param {number} vendedorId - ID del vendedor
   * @returns {array} Array de clientes del vendedor
   */
  const obtenerClientesPorVendedor = (vendedorId) => {
    const vendedor = vendedores.find((v) => v.id === vendedorId);
    if (!vendedor) return [];
    return clientes.filter((c) => vendedor.clientesIds.includes(c.id));
  };

  /**
   * Calcula el total de ventas de un vendedor
   * @param {number} vendedorId - ID del vendedor
   * @returns {number} Total de ventas en pesos
   */
  const calcularVentasPorVendedor = (vendedorId) => {
    const clientesVendedor = obtenerClientesPorVendedor(vendedorId);
    return clientesVendedor.reduce((totalVentas, cliente) => {
      const ventasCliente = cliente.transacciones
        .filter((t) => t.tipo === "pedido")
        .reduce((sum, t) => sum + t.monto, 0);
      return totalVentas + ventasCliente;
    }, 0);
  };


  // ============================================
  // 🔌 PROVIDER - Exportar contexto
  // ============================================
  return (
    <StoreContext.Provider
      value={{
        // 📦 Productos
        productos,
        setProductos,
        crearProducto,
        actualizarStock,
        agotarProducto,

        // 🚗 Repartidores
        repartidores,
        crearRepartidor,
        eliminarRepartidor,

        // 👨‍💼 Vendedores
        vendedores,
        asignarClienteAVendedor,
        obtenerClientesPorVendedor,
        calcularVentasPorVendedor,

        // 👥 Clientes
        clientes,
        crearCliente,
        buscarClientePorCedula,
        registrarPago,
        actualizarClienteTelefono,

        // 📋 Pedidos
        pedidos,
        crearPedido,
        cambiarEstadoPedido,
        eliminarPedido,
        asignarRepartidor,
        agregarItemPedido,
        eliminarItemPedido,
        actualizarCantidadItemPedido
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
