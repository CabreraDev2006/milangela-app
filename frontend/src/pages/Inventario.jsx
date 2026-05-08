import { useEffect, useState } from "react";
import { listarProductos, eliminarProducto } from "../db/productos";
import ModalAgregar from "../components/ModalAgregar";
import ModalEditar from "../components/ModalEditar";
import { FiImage, FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);

  async function cargar() {
    const lista = await listarProductos();
    setProductos(lista);
  }

  useEffect(() => {
    (async () => {
      await cargar();
    })();
  }, []);

  return (
    <div className="text-white h-full overflow-y-auto w-full min-w-0">
      <div className="w-full min-w-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Inventario</h1>
            <p className="text-gray-500 text-sm mt-1">Gestión de productos y stock</p>
          </div>

          <button
            onClick={() => setMostrarModalAgregar(true)}
            className="group px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-gray-700/25 border border-white/5"
          >
            <FiPlus size={18} className="text-gray-400 group-hover:text-white group-hover:rotate-90 transition-all" />
            <span className="text-gray-300 group-hover:text-white">Agregar producto</span>
          </button>
        </div>

        {/* Tabla con scrollbar personalizado */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-gray-800/50 overflow-hidden">
          <div 
            className="w-full overflow-x-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05)",
              msOverflowStyle: "auto"
            }}
          >
            <div className="min-w-[800px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-900">
                    <th className="p-4 text-gray-400 font-medium">Imagen</th>
                    <th className="p-4 text-gray-400 font-medium">Nombre</th>
                    <th className="p-4 text-gray-400 font-medium">Costo COP</th>
                    <th className="p-4 text-gray-400 font-medium">Precio EUR</th>
                    <th className="p-4 text-gray-400 font-medium">Precio Bs</th>
                    <th className="p-4 text-gray-400 font-medium">Ganancia COP</th>
                    <th className="p-4 text-gray-400 font-medium">Ganancia EUR</th>
                    <th className="p-4 text-gray-400 font-medium">Ganancia Bs</th>
                    <th className="p-4 text-gray-400 font-medium">Stock</th>
                    <th className="p-4 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {productos.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                      <td className="p-3">
                        {p.imagen ? (
                          <img
                            src={p.imagen}
                            alt="producto"
                            className="w-20 h-20 object-cover rounded-lg shadow-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center">
                            <FiImage size={32} className="text-gray-600" />
                          </div>
                        )}
                      </td>

                      <td className="p-3 font-medium text-white">{p.nombre}</td>
                      <td className="p-3 text-gray-400 font-mono">{p.precio_cop.toFixed(2)}</td>
                      <td className="p-3 text-emerald-400 font-mono font-bold">{p.precio_final_eur.toFixed(2)} €</td>
                      <td className="p-3 text-emerald-400 font-mono font-bold">{p.precio_final_bcv.toFixed(2)} Bs</td>

                      <td className="p-3 text-green-400 font-mono">
                        {p.ganancia_cop.toFixed(2)}
                      </td>

                      <td className="p-3 text-green-400 font-mono">
                        {p.ganancia_eur.toFixed(2)} €
                      </td>

                      <td className="p-3 text-green-400 font-mono">
                        {p.ganancia_bcv.toFixed(2)} Bs
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${p.stock > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {p.stock} uds
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setProductoEditar(p)}
                            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200"
                            title="Editar"
                          >
                            <FiEdit size={16} className="text-gray-400 hover:text-white" />
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm(`¿Eliminar "${p.nombre}"?`)) {
                                await eliminarProducto(p.id);
                                await cargar();
                              }
                            }}
                            className="p-2 bg-gray-800 hover:bg-red-600/80 rounded-lg transition-all duration-200"
                            title="Eliminar"
                          >
                            <FiTrash2 size={16} className="text-gray-400 hover:text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {productos.length === 0 && (
          <div className="text-center py-12 bg-gray-900/40 rounded-2xl border border-white/5 mt-4">
            <p className="text-gray-500">No hay productos en el inventario.</p>
            <button
              onClick={() => setMostrarModalAgregar(true)}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-300 hover:text-white transition"
            >
              Agregar primer producto
            </button>
          </div>
        )}

        {/* Modales */}
        {mostrarModalAgregar && (
          <ModalAgregar
            cerrar={async () => {
              setMostrarModalAgregar(false);
              await cargar();
            }}
          />
        )}

        {productoEditar && (
          <ModalEditar
            producto={productoEditar}
            cerrar={async () => {
              setProductoEditar(null);
              await cargar();
            }}
          />
        )}

      </div>

      {/* Estilos personalizados para el scrollbar */}
      <style>{`
        /* Para WebKit (Chrome, Safari, Edge) */
        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Para Firefox */
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}