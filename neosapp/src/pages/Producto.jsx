import { useState, useRef } from "react";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import "./producto.css";

const CATEGORIAS = [
  "Pedrería Adhesiva",
  "Tratamientos",
  "Cabello",
  "Halloween",
  "Maquillaje"
];

const FORMAS_PAGO = ["Efectivo", "Crédito", "Abono"];

export default function Producto() {
  const { productos, setProductos, crearProducto, actualizarStock, agotarProducto, crearPedido, clientes } = useStore();
  const { esAdmin, esVendedor, obtenerDatosUsuario } = useAuth();
  const vendedorData = obtenerDatosUsuario();
  
  // Referencias para los scrolls horizontales
  const scrollRefs = useRef({});
  const [scrollNecesario, setScrollNecesario] = useState({});
  const [dragging, setDragging] = useState({});
  const [dragStart, setDragStart] = useState({});
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    precio: "",
    categoria: CATEGORIAS[0],
    stock: "",
    descripcion: "",
    imagenes: [],
  });
  const [imagenesVista, setImagenesVista] = useState([]);

  // Estados para ver detalles del producto
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [productoDetalles, setProductoDetalles] = useState(null);
  const [indiceCarrusel, setIndiceCarrusel] = useState(0);
  const [cantidadDetalles, setCantidadDetalles] = useState(1);

  // Estados para actualizar stock
  const [mostrarModalStock, setMostrarModalStock] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nuevoStock, setNuevoStock] = useState("");

  // Estados para el carrito
  const [carrito, setCarrito] = useState([]);
  const [mostrarModalPedido, setMostrarModalPedido] = useState(false);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarListaClientes, setMostrarListaClientes] = useState(false);
  const [datosCliente, setDatosCliente] = useState({
    cedula: "",
    nombre: "",
    direccion: "",
    correoElectronico: "",
    numeroCelular: "",
    formaPago: FORMAS_PAGO[0],
  });
//
  const crearProductoHandler = () => {
    if (!nuevo.nombre || !nuevo.precio || !nuevo.stock) {
      alert("Por favor completa nombre, precio y stock");
      return;
    }

    const resultado = crearProducto(
      nuevo.nombre, 
      nuevo.precio, 
      nuevo.categoria, 
      nuevo.stock,
      nuevo.descripcion,
      nuevo.imagenes.length > 0 ? nuevo.imagenes : []
    );
//
    if (resultado.error) {
      alert(`Error: ${resultado.error}`);
      return;
    }

    setNuevo({ nombre: "", precio: "", categoria: CATEGORIAS[0], stock: "", descripcion: "", imagenes: [] });
    setImagenesVista([]);
    setMostrarModal(false);
    alert("✅ Producto creado exitosamente");
  }; 
 
  const handleImagenSeleccionada = (e) => {
    const archivos = Array.from(e.target.files);
    const maxImagenes = 5;
    
    if (archivos.length + nuevo.imagenes.length > maxImagenes) {
      alert(`Máximo ${maxImagenes} imágenes permitidas`);
      return;
    }

    // Procesar cada archivo
    archivos.forEach((archivo) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imagenBase64 = event.target.result;
        setNuevo((prev) => ({
          ...prev,
          imagenes: [...prev.imagenes, imagenBase64],
        }));
        setImagenesVista((prev) => [...prev, imagenBase64]);
      };
      reader.readAsDataURL(archivo);
    });
  };

  const eliminarImagen = (index) => {
    setNuevo((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index),
    }));
    setImagenesVista((prev) => prev.filter((_, i) => i !== index));
  };

  const abrirDetalles = (producto) => {
    setProductoDetalles(producto);
    setIndiceCarrusel(0);
    setCantidadDetalles(1);
    setMostrarDetalles(true);
  };

  const siguienteImagen = () => {
    setIndiceCarrusel(
      (prev) => (prev + 1) % productoDetalles.imagenes.length
    );
  };

  const imagenAnterior = () => {
    setIndiceCarrusel(
      (prev) => (prev - 1 + productoDetalles.imagenes.length) % productoDetalles.imagenes.length
    );
  };

  // Funciones para scroll horizontal
  const hacerScroll = (categoria, direccion) => {
    const container = scrollRefs.current[categoria];
    if (container) {
      const scrollAmount = 240; // ancho de tarjeta + gap
      if (direccion === "izquierda") {
        container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const verificarScrollNecesario = (categoria) => {
    const container = scrollRefs.current[categoria];
    if (container) {
      const necesario = container.scrollWidth > container.clientWidth;
      setScrollNecesario((prev) => ({
        ...prev,
        [categoria]: necesario,
      }));
    }
  };

  const handleMouseDown = (categoria, e) => {
    const container = scrollRefs.current[categoria];
    if (!container) return;

    setDragging((prev) => ({ ...prev, [categoria]: true }));
    setDragStart((prev) => ({
      ...prev,
      [categoria]: {
        x: e.clientX,
        scrollLeft: container.scrollLeft,
      },
    }));
  };

  const handleMouseMove = (categoria, e) => {
    if (!dragging[categoria]) return;

    const container = scrollRefs.current[categoria];
    if (!container) return;

    const distance = e.clientX - dragStart[categoria].x;
    container.scrollLeft = dragStart[categoria].scrollLeft - distance;
  };

  const handleMouseUp = (categoria) => {
    setDragging((prev) => ({ ...prev, [categoria]: false }));
  };

  const abrirModalStock = (producto) => {
    setProductoSeleccionado(producto);
    setNuevoStock(producto.stock.toString());
    setMostrarModalStock(true);
  };

  const actualizarStockHandler = () => {
    if (!nuevoStock) return;

    const cantidad = Number(nuevoStock) - productoSeleccionado.stock;
    if (cantidad === 0) {
      alert("El stock es igual al actual");
      setMostrarModalStock(false);
      return;
    }

    const resultado = actualizarStock(productoSeleccionado.id, cantidad);
    if (resultado) {
      alert(`✅ Stock actualizado a ${nuevoStock} unidades`);
      setMostrarModalStock(false);
      setNuevoStock("");
    } else {
      alert("❌ No se puede establecer un stock negativo");
    }
  };

  const agregarAlCarrito = (producto) => {
    if (producto.stock <= 0) return;

    // Verificar si ya está en el carrito
    const productoEnCarrito = carrito.find((p) => p.id === producto.id);

    if (!productoEnCarrito) {
      // Agregar con cantidad 0 para que el usuario la especifique en el carrito
      setCarrito([...carrito, { ...producto, cantidad: 0 }]);
    }
  };



  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter((p) => p.id !== productoId));
  };

  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }

    const producto = productos.find((p) => p.id === productoId);
    if (cantidad > producto.stock) return;

    setCarrito(
      carrito.map((p) =>
        p.id === productoId ? { ...p, cantidad } : p
      )
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  };

  // Obtener clientes según el rol del usuario
  const obtenerClientesFiltrados = () => {
    let clientesFiltrados = clientes;
    
    // Si es vendedor, mostrar solo sus clientes
    if (esVendedor()) {
      clientesFiltrados = clientes.filter(c => vendedorData?.clientesIds?.includes(c.id));
    }
    
    // Filtrar por búsqueda
    if (busquedaCliente.trim()) {
      const busqueda = busquedaCliente.toLowerCase();
      clientesFiltrados = clientesFiltrados.filter(c => 
        c.nombre.toLowerCase().includes(busqueda) || 
        c.cedula.includes(busqueda)
      );
    }
    
    return clientesFiltrados;
  };

  // Ordenar productos alfabéticamente
  const obtenerProductosOrdenados = (productosFiltrados) => {
    return [...productosFiltrados].sort((a, b) => 
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
  };

  // Obtener categorías a mostrar basado en filtros
  const obtenerCategoriasConProductos = () => {
    let categoriasAMostrar = CATEGORIAS;
    
    // Si se filtra por categoría, solo mostrar esa
    if (categoriaSeleccionada !== "Todas") {
      categoriasAMostrar = [categoriaSeleccionada];
    }

    // Filtrar solo categorías que tienen productos que coinciden con la búsqueda
    return categoriasAMostrar.filter(categoria => {
      return productos.some(p => {
        const coincideCategoria = p.categoria === categoria;
        const coincideBusqueda = p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase());
        return coincideCategoria && coincideBusqueda;
      });
    });
  };

  // Obtener productos filtrados por categoría y búsqueda
  const obtenerProductosFiltrados = (categoria) => {
    return productos.filter(p => 
      p.categoria === categoria && 
      p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
    );
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setDatosCliente({
      cedula: cliente.cedula || "",
      nombre: cliente.nombre || "",
      direccion: cliente.direccion || "",
      correoElectronico: cliente.correo || "",
      numeroCelular: cliente.telefono || "",
      formaPago: FORMAS_PAGO[0],
    });
    setBusquedaCliente("");
    setMostrarListaClientes(false);
  };

  const limpiarSeleccionCliente = () => {
    setClienteSeleccionado(null);
    setBusquedaCliente("");
    setDatosCliente({
      cedula: "",
      nombre: "",
      direccion: "",
      correoElectronico: "",
      numeroCelular: "",
      formaPago: FORMAS_PAGO[0],
    });
  };

  const finalizarPedido = () => {
    if (!datosCliente.cedula || !datosCliente.nombre || !datosCliente.direccion || !datosCliente.correoElectronico || !datosCliente.numeroCelular || !datosCliente.password_hash || carrito.length === 0) {
      alert("Por favor completa todos los datos (Cédula, Nombre, Dirección) y agrega productos");
      return;
    }

    crearPedido(datosCliente.cedula, datosCliente.nombre, datosCliente.direccion, carrito,  datosCliente.formaPago);

    setCarrito([]);
    setDatosCliente({
      cedula: "",
      nombre: "",
      direccion: "",
      correoElectronico: "",
      numeroCelular: "",
      formaPago: FORMAS_PAGO[0],
    });
    setMostrarModalPedido(false);
    alert("Pedido creado exitosamente");
  };

  return (
    <div className="productos-page">
      <div className="productos-header">
        <h2>Tienda de Productos</h2>
        <div>
          {esAdmin() && (
            <button
              className="btn-primary"
              onClick={() => setMostrarModal(true)}
            >
              + Nuevo producto
            </button>
          )}
          {carrito.length > 0 && (
            <button
              className="btn-carrito"
              onClick={() => setMostrarModalPedido(true)}
            >
              🛒 Carrito ({carrito.length})
            </button>
          )}
        </div>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="productos-filtros">
        <div className="busqueda-container">
          <input
            type="text"
            className="input-busqueda"
            placeholder="🔍 Buscar producto por nombre..."
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
          />
        </div>

        <div className="filtro-categorias">
          <button
            className={`categoria-btn ${categoriaSeleccionada === "Todas" ? "activa" : ""}`}
            onClick={() => setCategoriaSeleccionada("Todas")}
          >
            Todas
          </button>
          {CATEGORIAS.map((categoria) => (
            <button
              key={categoria}
              className={`categoria-btn ${categoriaSeleccionada === categoria ? "activa" : ""}`}
              onClick={() => setCategoriaSeleccionada(categoria)}
            >
              {categoria}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTOS */}
      {obtenerCategoriasConProductos().length > 0 ? (
        obtenerCategoriasConProductos().map((categoria) => {
          const productosFiltrados = obtenerProductosOrdenados(obtenerProductosFiltrados(categoria));
          const mostrarGrid = categoriaSeleccionada !== "Todas";

          return (
            <div className="categoria-bloque" key={categoria}>
              <h3 className="categoria-titulo">{categoria}</h3>

              {mostrarGrid ? (
                <div className="productos-grid">
                  {productosFiltrados.map((p) => (
                    <div 
                      className="producto-card" 
                      key={p.id}
                      onClick={() => abrirDetalles(p)}
                      role="button"
                      tabIndex="0"
                    >
                      <div className="producto-imagen">
                        <img 
                          src={p.imagenes?.[0] || "https://images.unsplash.com/photo-1522338242592-cb0acf6f85a2?w=500&h=500&fit=crop"} 
                          alt={p.nombre}
                        />
                      </div>

                      <div className="producto-info">
                        <span className="producto-nombre">
                          {p.nombre}
                        </span>
                        <span className="producto-precio">
                          ${p.precio.toLocaleString()}
                        </span>
                        <span className={`producto-stock ${p.stock <= 0 ? "sinstock" : ""}`}>
                          Stock: {p.stock}
                        </span>
                      </div>

                      <div className="producto-acciones">
                        <button
                          className="btn-agregar-carrito"
                          onClick={() => agregarAlCarrito(p)}
                          disabled={p.stock <= 0}
                        >
                          Agregar
                        </button>
                        {esAdmin() && (
                          <>
                            <button
                              className="btn-stock"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModalStock(p);
                              }}
                              title="Actualizar stock"
                            >
                              Actualizar stock
                            </button>
                            <button
                              className="btn-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setProductos(
                                  productos.filter((x) => x.id !== p.id)
                                );
                              }}
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  className="productos-scroll-container"
                  onMouseEnter={() => verificarScrollNecesario(categoria)}
                >
                  {scrollNecesario[categoria] && (
                    <button 
                      className="scroll-btn scroll-btn-left"
                      onClick={() => hacerScroll(categoria, "izquierda")}
                      title="Desplazar izquierda"
                    >
                      ◀
                    </button>
                  )}
                  
                  <div 
                    className="productos-scroll"
                    ref={(el) => scrollRefs.current[categoria] = el}
                    onMouseDown={(e) => handleMouseDown(categoria, e)}
                    onMouseMove={(e) => handleMouseMove(categoria, e)}
                    onMouseUp={() => handleMouseUp(categoria)}
                    onMouseLeave={() => handleMouseUp(categoria)}
                    style={{ cursor: dragging[categoria] ? "grabbing" : "grab" }}
                  >
                    {productosFiltrados.map((p) => (
                      <div 
                        className="producto-card" 
                        key={p.id}
                        onClick={() => {
                          // Evitar abrir detalles si se está arrastrando
                          if (!dragging[categoria]) {
                            abrirDetalles(p);
                          }
                        }}
                        role="button"
                        tabIndex="0"
                      >
                        <div className="producto-imagen">
                          <img 
                            src={p.imagenes?.[0] || "https://images.unsplash.com/photo-1522338242592-cb0acf6f85a2?w=500&h=500&fit=crop"} 
                            alt={p.nombre}
                          />
                        </div>

                        <div className="producto-info">
                          <span className="producto-nombre">
                            {p.nombre}
                          </span>
                          <span className="producto-precio">
                            ${p.precio.toLocaleString()}
                          </span>
                          <span className={`producto-stock ${p.stock <= 0 ? "sinstock" : ""}`}>
                            Stock: {p.stock}
                          </span>
                        </div>

                        <div className="producto-acciones">
                          <button
                            className="btn-agregar-carrito"
                            onClick={() => agregarAlCarrito(p)}
                            disabled={p.stock <= 0}
                          >
                            Agregar
                          </button>
                          {esAdmin() && (
                            <>
                              <button
                                className="btn-stock"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  abrirModalStock(p);
                                }}
                                title="Actualizar stock"
                              >
                                Actualizar stock
                              </button>
                              <button
                                className="btn-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProductos(
                                    productos.filter((x) => x.id !== p.id)
                                  );
                                }}
                              >
                                Eliminar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {scrollNecesario[categoria] && (
                    <button 
                      className="scroll-btn scroll-btn-right"
                      onClick={() => hacerScroll(categoria, "derecha")}
                      title="Desplazar derecha"
                    >
                      ▶
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="sin-resultados">
          <p>No hay productos que coincidan con tu búsqueda</p>
        </div>
      )}

      {/* Modal para crear producto */}
      {mostrarModal && esAdmin() && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Nuevo producto</h3>

            <input
              placeholder="Nombre"
              value={nuevo.nombre}
              onChange={(e) =>
                setNuevo({ ...nuevo, nombre: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Precio"
              value={nuevo.precio}
              onChange={(e) =>
                setNuevo({ ...nuevo, precio: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Stock inicial"
              value={nuevo.stock}
              onChange={(e) =>
                setNuevo({ ...nuevo, stock: e.target.value })
              }
              min="0"
            />

            <textarea
              placeholder="Descripción del producto (opcional)"
              value={nuevo.descripcion}
              onChange={(e) =>
                setNuevo({ ...nuevo, descripcion: e.target.value })
              }
              rows="3"
              style={{ fontFamily: "inherit", resize: "vertical" }}
            />

            <select
              value={nuevo.categoria}
              onChange={(e) =>
                setNuevo({ ...nuevo, categoria: e.target.value })
              }
            >
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            {/* Sección de imágenes */}
            <div className="seccion-imagenes">
              <label className="etiqueta-imagenes">Imágenes del producto (máximo 5):</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagenSeleccionada}
                className="input-imagenes"
              />
              
              {imagenesVista.length > 0 && (
                <div className="previsualizacion-imagenes">
                  {imagenesVista.map((imagen, index) => (
                    <div key={index} className="item-imagen-preview">
                      <img src={imagen} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="btn-eliminar-imagen"
                        onClick={() => eliminarImagen(index)}
                        title="Eliminar imagen"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => {
                setMostrarModal(false);
                setNuevo({ nombre: "", precio: "", categoria: CATEGORIAS[0], stock: "", descripcion: "", imagenes: [] });
                setImagenesVista([]);
              }}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={crearProductoHandler}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para actualizar stock */}
      {mostrarModalStock && productoSeleccionado && esAdmin() && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Actualizar Stock</h3>
            <p><strong>{productoSeleccionado.nombre}</strong></p>
            <p>Stock actual: <strong>{productoSeleccionado.stock}</strong> unidades</p>

            <input
              type="number"
              placeholder="Nuevo stock"
              value={nuevoStock}
              onChange={(e) => setNuevoStock(e.target.value)}
              min="0"
            />

            <div className="modal-actions">
              <button onClick={() => setMostrarModalStock(false)}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={actualizarStockHandler}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del producto */}
      {mostrarDetalles && productoDetalles && (
        <div className="modal-overlay" onClick={() => setMostrarDetalles(false)}>
          <div className="modal-detalles" onClick={(e) => e.stopPropagation()}>
            <button 
              className="btn-cerrar"
              onClick={() => setMostrarDetalles(false)}
            >
              ✕
            </button>

            <div className="detalles-contenedor">
              {/* Carrusel de imágenes */}
              <div className="detalles-carrusel">
                <img 
                  src={productoDetalles.imagenes[indiceCarrusel]} 
                  alt={productoDetalles.nombre}
                  className="imagen-principal"
                />
                
                {productoDetalles.imagenes.length > 1 && (
                  <>
                    <button 
                      className="btn-carrusel-prev"
                      onClick={imagenAnterior}
                    >
                      ❮
                    </button>
                    <button 
                      className="btn-carrusel-next"
                      onClick={siguienteImagen}
                    >
                      ❯
                    </button>
                  </>
                )}

                <div className="indicadores-carrusel">
                  {productoDetalles.imagenes.map((_, index) => (
                    <button
                      key={index}
                      className={`indicador ${index === indiceCarrusel ? "activo" : ""}`}
                      onClick={() => setIndiceCarrusel(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Información del producto */}
              <div className="detalles-info">
                <h2>{productoDetalles.nombre}</h2>
                
                <div className="detalles-categoria">
                  <span className="badge-categoria">{productoDetalles.categoria}</span>
                </div>

                <p className="detalles-descripcion">
                  {productoDetalles.descripcion || "No hay descripción disponible"}
                </p>

                <div className="detalles-precio-stock">
                  <div className="precio-grande">
                    ${productoDetalles.precio.toLocaleString()}
                  </div>
                  <div className={`stock-info ${productoDetalles.stock <= 0 ? "sinstock" : "constock"}`}>
                    {productoDetalles.stock <= 0 
                      ? "❌ Sin stock" 
                      : `✓ ${productoDetalles.stock} disponibles`}
                  </div>
                </div>

                <div className="detalles-acciones">
                  <div className="cantidad-detalles">
                    <label>Cantidad:</label>
                    <div className="cantidad-input-group-detalles">
                      <button
                        onClick={() => setCantidadDetalles(Math.max(1, cantidadDetalles - 1))}
                        className="btn-cantidad-detalles"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={cantidadDetalles}
                        onChange={(e) => {
                          const valor = Number(e.target.value);
                          if (valor > 0 && valor <= productoDetalles.stock) {
                            setCantidadDetalles(valor);
                          }
                        }}
                        min="1"
                        max={productoDetalles.stock}
                        className="cantidad-input-detalles"
                      />
                      <button
                        onClick={() => setCantidadDetalles(Math.min(productoDetalles.stock, cantidadDetalles + 1))}
                        className="btn-cantidad-detalles"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn-agregar-grande"
                    onClick={() => {
                      if (cantidadDetalles <= 0 || cantidadDetalles > productoDetalles.stock) {
                        alert("Cantidad inválida");
                        return;
                      }

                      const productoEnCarrito = carrito.find((p) => p.id === productoDetalles.id);
                      if (productoEnCarrito) {
                        const nuevaCantidad = productoEnCarrito.cantidad + cantidadDetalles;
                        if (nuevaCantidad > productoDetalles.stock) {
                          alert(`No hay suficiente stock. Máximo disponible: ${productoDetalles.stock}`);
                          return;
                        }
                        setCarrito(
                          carrito.map((p) =>
                            p.id === productoDetalles.id
                              ? { ...p, cantidad: nuevaCantidad }
                              : p
                          )
                        );
                      } else {
                        setCarrito([...carrito, { ...productoDetalles, cantidad: cantidadDetalles }]);
                      }

                      setMostrarDetalles(false);
                      setCantidadDetalles(1);
                    }}
                    disabled={productoDetalles.stock <= 0}
                  >
                    🛒 Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Modal para finalizar pedido */}
      {mostrarModalPedido && (
        <div className="modal-overlay">
          <div className="modal modal-grande">
            <h3>Finalizar Pedido</h3>

            <div className="modal-carrito">
              <h4>Productos en el carrito:</h4>
              <div className="carrito-items">
                {carrito.map((item) => (
                  <div key={item.id} className="carrito-item">
                    <div>
                      <p><strong>{item.nombre}</strong></p>
                      <p>${item.precio.toLocaleString()}</p>
                    </div>
                    <div className="cantidad-control">
                      <button
                        onClick={() =>
                          actualizarCantidad(item.id, item.cantidad - 1)
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={item.cantidad}
                        onChange={(e) =>
                          actualizarCantidad(item.id, Number(e.target.value))
                        }
                      />
                      <button
                        onClick={() =>
                          actualizarCantidad(item.id, item.cantidad + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <p><strong>${(item.precio * item.cantidad).toLocaleString()}</strong></p>
                    <button
                      className="btn-delete-small"
                      onClick={() => eliminarDelCarrito(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="carrito-total">
                <h4>Total: ${calcularTotal().toLocaleString()}</h4>
              </div>
            </div>

            <div className="formulario-cliente">
              <h4>Datos del cliente:</h4>
              
              {(esAdmin() || esVendedor()) ? (
                <div className="busqueda-cliente">
                  <div className="busqueda-input-wrapper">
                    <input
                      type="text"
                      placeholder="Buscar cliente por nombre o cédula..."
                      value={busquedaCliente}
                      onChange={(e) => {
                        setBusquedaCliente(e.target.value);
                        setMostrarListaClientes(true);
                      }}
                      onFocus={() => setMostrarListaClientes(true)}
                      className="busqueda-input"
                    />
                    {clienteSeleccionado && (
                      <button
                        className="btn-limpiar-cliente"
                        onClick={limpiarSeleccionCliente}
                        title="Limpiar selección"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {mostrarListaClientes && (
                    <div className="lista-clientes-dropdown">
                      {obtenerClientesFiltrados().length > 0 ? (
                        obtenerClientesFiltrados().map((cliente) => (
                          <div
                            key={cliente.id}
                            className="cliente-opcion"
                            onClick={() => seleccionarCliente(cliente)}
                          >
                            <div className="cliente-info">
                              <strong>{cliente.nombre}</strong>
                              <span className="cliente-cedula">{cliente.cedula}</span>
                            </div>
                            <small className="cliente-direccion">{cliente.direccion}</small>
                          </div>
                        ))
                      ) : (
                        <div className="sin-resultados">
                          {busquedaCliente ? "No se encontraron clientes" : "No hay clientes disponibles"}
                        </div>
                      )}
                    </div>
                  )}

                  {clienteSeleccionado && (
                    <div className="cliente-seleccionado">
                      <p><strong>Cliente seleccionado:</strong> {clienteSeleccionado.nombre}</p>
                      <p><small>{clienteSeleccionado.cedula}</small></p>
                      <p><small>Correo: {datosCliente.correoElectronico || "No registrado"}</small></p>
                      <p><small>Celular: {datosCliente.numeroCelular || "No registrado"}</small></p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <input
                    placeholder="Cédula o NIT"
                    value={datosCliente.cedula}
                    onChange={(e) =>
                      setDatosCliente({ ...datosCliente, cedula: e.target.value })
                    }
                  />

                  <input
                    placeholder="Nombre del cliente"
                    value={datosCliente.nombre}
                    onChange={(e) =>
                      setDatosCliente({ ...datosCliente, nombre: e.target.value })
                    }
                  />

                  <input
                    placeholder="Dirección"
                    value={datosCliente.direccion}
                    onChange={(e) =>
                      setDatosCliente({ ...datosCliente, direccion: e.target.value })
                    }
                  />

                  <input
                    placeholder="Correo electrónico"
                    value={datosCliente.correoElectronico}
                    onChange={(e) =>
                      setDatosCliente({ ...datosCliente, correoElectronico: e.target.value })
                    }
                  />

                  <input
                    placeholder="Número de celular"
                    value={datosCliente.numeroCelular}
                    onChange={(e) =>
                      setDatosCliente({ ...datosCliente, numeroCelular: e.target.value })
                    }
                  />
                                    <input
                    placeholder="Contraseña"
                    value={datosCliente.password_hash}
                    onChange={(e) =>
                      setDatosCliente({ ...datosCliente, password_hash: e.target.value })
                    }
                  />
                </>
              )}

              <select
                value={datosCliente.formaPago}
                onChange={(e) =>
                  setDatosCliente({ ...datosCliente, formaPago: e.target.value })
                }
              >
                {FORMAS_PAGO.map((forma) => (
                  <option key={forma}>{forma}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={() => setMostrarModalPedido(false)}>
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={finalizarPedido}
              >
                Crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante del carrito */}
      {carrito.length > 0 && (
        <button
          className="carrito-flotante"
          onClick={() => setMostrarModalPedido(true)}
          title="Ver carrito"
        >
          <span className="carrito-icono">🛒</span>
          <span className="carrito-cantidad">{carrito.length}</span>
        </button>
      )}
    </div>
  );
}
