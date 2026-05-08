import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { obtenerCliente } from "../db/clientes";
import { listarProductos } from "../db/productos";
import { registrarCompraMultiple } from "../db/cobros";
import { FiArrowLeft, FiShoppingCart, FiTrash2, FiSearch } from "react-icons/fi";

export default function CobroRegistrar() {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [carrito, setCarrito] = useState([]);

  // Cargar cliente y productos
  useEffect(() => {
    async function cargar() {
      const c = await obtenerCliente(clienteId);
      const p = await listarProductos();

      setCliente(c);
      setProductos(p);
    }
    cargar();
  }, [clienteId]);

  // Filtrar productos
  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agregar producto al carrito
  function agregarAlCarrito(producto, cantidad) {
    if (!cantidad || cantidad <= 0) return alert("Cantidad inválida");
    if (cantidad > producto.stock) return alert("No hay suficiente stock");

    const existe = carrito.find((c) => c.id === producto.id);

    if (existe) {
      const nuevaCantidad = existe.cantidad + cantidad;
      if (nuevaCantidad > producto.stock)
        return alert("No hay suficiente stock");

      setCarrito(
        carrito.map((c) =>
          c.id === producto.id ? { ...c, cantidad: nuevaCantidad } : c
        )
      );
    } else {
      setCarrito([
        ...carrito,
        {
          id: producto.id,
          nombre: producto.nombre,
          cantidad,
          precio_eur: producto.precio_final_eur,  // 🔥 CORREGIDO: usar precio_final_eur
          precio_bcv: producto.precio_final_bcv,  // 🔥 CORREGIDO: usar precio_final_bcv
          stock: producto.stock
        }
      ]);
    }
  }

  // Eliminar del carrito
  function eliminarDelCarrito(id) {
    setCarrito(carrito.filter((c) => c.id !== id));
  }

  // Confirmar compra
  async function confirmarCompra() {
    if (carrito.length === 0) return alert("El carrito está vacío");

    const items = carrito.map((item) => ({
      producto_id: item.id,
      cantidad: item.cantidad,
      precio_eur: item.precio_eur,    // ✅ Ya usa precio_final_eur
      precio_bcv: item.precio_bcv     // ✅ Ya usa precio_final_bcv
    }));

    const res = await registrarCompraMultiple(clienteId, items);

    if (!res.ok) {
      alert("Error registrando compra");
      return;
    }

    alert("Compra registrada con éxito");
    navigate(`/cliente/${clienteId}`);
  }

  if (!cliente) {
    return <div className="text-white p-6">Cargando...</div>;
  }

  return (
    <div className="text-white w-full h-full overflow-y-auto custom-scroll">
      <div className="w-full min-w-0">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/cobros"
            className="group p-2.5 bg-gray-800/60 rounded-xl hover:bg-gray-700/80 transition-all duration-300 hover:scale-105"
          >
            <FiArrowLeft size={20} className="text-gray-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-white">Registrar compra</h1>
            <p className="text-gray-500 text-sm">Cliente: {cliente.nombre}</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl p-4 rounded-2xl border border-white/10 mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <FiSearch size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Lista de productos */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 rounded-2xl border border-white/10 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-white/10 bg-gray-800/30">
              <h2 className="text-xl font-bold text-white">Productos</h2>
            </div>
            <div className="p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto custom-scroll">
              {filtrados.length === 0 && (
                <p className="text-gray-500 text-center py-8">No se encontraron productos</p>
              )}
              {filtrados.map((p) => (
                <ProductoItem key={p.id} producto={p} agregar={agregarAlCarrito} />
              ))}
            </div>
          </div>

          {/* Carrito */}
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 rounded-2xl border border-white/10 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-white/10 bg-gray-800/30">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiShoppingCart /> Carrito ({carrito.length})
              </h2>
            </div>

            <div className="p-4 flex flex-col gap-3 max-h-[60vh] overflow-y-auto custom-scroll">
              {carrito.length === 0 && (
                <p className="text-gray-500 text-center py-8">El carrito está vacío</p>
              )}

              {carrito.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 p-3 rounded-xl border border-white/10 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-white">{item.nombre}</p>
                    <p className="text-gray-400 text-sm">
                      Cantidad: {item.cantidad}
                    </p>
                    <p className="text-emerald-400 text-sm font-mono">
                      {item.precio_eur.toFixed(2)} EUR / {item.precio_bcv.toFixed(2)} Bs
                    </p>
                  </div>

                  <button
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="p-2 bg-red-600/50 hover:bg-red-600 rounded-xl transition-all duration-200"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Totales */}
            {carrito.length > 0 && (
              <div className="p-4 border-t border-white/10 bg-gray-800/30">
                <h3 className="text-lg font-bold mb-3">Total</h3>
                <div className="space-y-1">
                  <p className="text-gray-300">
                    EUR: <span className="text-emerald-400 font-bold">
                      {carrito
                        .reduce((acc, item) => acc + item.precio_eur * item.cantidad, 0)
                        .toFixed(2)}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    Bs: <span className="text-emerald-400 font-bold">
                      {carrito
                        .reduce((acc, item) => acc + item.precio_bcv * item.cantidad, 0)
                        .toFixed(2)}
                    </span>
                  </p>
                </div>

                <button
                  onClick={confirmarCompra}
                  className="mt-4 w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
                >
                  Confirmar compra
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   COMPONENTE: ProductoItem
--------------------------------------------------------- */
function ProductoItem({ producto, agregar }) {
  const [cantidad, setCantidad] = useState("");

  return (
    <div className="bg-gray-800/50 p-3 rounded-xl border border-white/10 flex justify-between items-center">
      <div>
        <p className="font-bold text-white">{producto.nombre}</p>
        <p className="text-gray-400 text-sm">Stock: {producto.stock}</p>
        <p className="text-emerald-400 text-sm font-mono">
          {producto.precio_final_eur.toFixed(2)} EUR / {producto.precio_final_bcv.toFixed(2)} Bs
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Cant."
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value))}
          className="w-20 p-2 bg-gray-900 border border-white/10 rounded-lg text-white placeholder-gray-500"
        />
        <button
          onClick={() => {
            if (cantidad) {
              agregar(producto, cantidad);
              setCantidad("");
            }
          }}
          className="bg-blue-600/80 hover:bg-blue-600 px-3 py-2 rounded-lg transition-all"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}