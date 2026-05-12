import { useState } from "react";
import { useStore } from "../context/StoreContext";
import "../styles/admin-categorias.css";

export default function AdminCategorias() {
  const {
    categorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    cargandoCategorias,
  } = useStore();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevoCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
  });
  const [mensaje, setMensaje] = useState("");

  const limpiarFormulario = () => {
    setNuevaCategoria({ nombre: "", descripcion: "" });
    setEditando(null);
  };

  const handleGuardar = async () => {
    if (!nuevoCategoria.nombre.trim()) {
      setMensaje("❌ El nombre de la categoría es requerido");
      return;
    }

    try {
      let resultado;
      if (editando) {
        resultado = await actualizarCategoria(
          editando.id,
          nuevoCategoria.nombre,
          nuevoCategoria.descripcion
        );
        if (resultado.success) {
          setMensaje(`✅ Categoría "${nuevoCategoria.nombre}" actualizada correctamente`);
        }
      } else {
        resultado = await crearCategoria(
          nuevoCategoria.nombre,
          nuevoCategoria.descripcion
        );
        if (resultado.success) {
          setMensaje(`✅ Categoría "${nuevoCategoria.nombre}" creada correctamente`);
        }
      }

      if (resultado.error) {
        setMensaje(`❌ ${resultado.error}`);
        return;
      }

      limpiarFormulario();
      setTimeout(() => {
        setMostrarForm(false);
        setMensaje("");
      }, 2000);
    } catch (error) {
      setMensaje(`❌ Error: ${error.message}`);
    }
  };

  const handleEditar = (categoria) => {
    setEditando(categoria);
    setNuevaCategoria({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
    });
    setMostrarForm(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Está seguro que desea eliminar la categoría "${nombre}"?`)) {
      try {
        const resultado = await eliminarCategoria(id);
        if (resultado.success) {
          setMensaje(`✅ Categoría "${nombre}" eliminada correctamente`);
          setTimeout(() => setMensaje(""), 2000);
        } else {
          setMensaje(`❌ ${resultado.error}`);
        }
      } catch (error) {
        setMensaje(`❌ Error al eliminar: ${error.message}`);
      }
    }
  };

  const handleCancelar = () => {
    limpiarFormulario();
    setMostrarForm(false);
    setMensaje("");
  };

  return (
    <div className="admin-categorias-page">
      <div className="admin-header">
        <h2>Gestionar Categorías</h2>
        <button className="btn-crear" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? "✕ Cancelar" : "+ Nueva Categoría"}
        </button>
      </div>

      {/* Formulario de creación/edición */}
      {mostrarForm && (
        <div className="form-crear-categoria">
          <h3>{editando ? "Editar Categoría" : "Nueva Categoría"}</h3>
          {mensaje && (
            <div className={`mensaje ${mensaje.includes("✅") ? "exito" : "error"}`}>
              {mensaje}
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={nuevoCategoria.nombre}
              onChange={(e) =>
                setNuevaCategoria({ ...nuevoCategoria, nombre: e.target.value })
              }
              autoFocus
            />
            <textarea
              placeholder="Descripción (opcional)"
              value={nuevoCategoria.descripcion}
              onChange={(e) =>
                setNuevaCategoria({ ...nuevoCategoria, descripcion: e.target.value })
              }
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button className="btn-guardar" onClick={handleGuardar}>
              {editando ? "Guardar Cambios" : "Crear Categoría"}
            </button>
            <button className="btn-cancelar" onClick={handleCancelar}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="categorias-container">
        {cargandoCategorias ? (
          <p className="sin-datos">Cargando categorías...</p>
        ) : categorias.length === 0 ? (
          <p className="sin-datos">No hay categorías registradas</p>
        ) : (
          <div className="categorias-grid">
            {categorias.map((categoria) => (
              <div key={categoria.id} className="categoria-card">
                <div className="categoria-info">
                  <h4>{categoria.nombre}</h4>
                  {categoria.descripcion && (
                    <p className="descripcion">{categoria.descripcion}</p>
                  )}
                </div>
                <div className="categoria-actions">
                  <button
                    className="btn-editar"
                    onClick={() => handleEditar(categoria)}
                    title="Editar"
                  >
                    ✎ Editar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminar(categoria.id, categoria.nombre)}
                    title="Eliminar"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
