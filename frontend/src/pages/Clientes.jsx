import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiUserPlus, FiUser, FiSearch, FiDollarSign, FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import {
  listarClientes,
  agregarCliente,
  obtenerTotalesCliente
} from "../db/clientes";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    telefono: ""
  });

  // Función para cargar clientes
  async function cargarClientes() {
    setLoading(true);
    const lista = await listarClientes();

    const clientesConTotales = [];
    for (const c of lista) {
      const tot = await obtenerTotalesCliente(c.id);
      clientesConTotales.push({ ...c, ...tot });
    }

    setClientes(clientesConTotales);
    setLoading(false);
  }

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Calcular porcentaje de pago (evitando NaN e infinito)
  const calcularPorcentaje = (pagado, deuda) => {
    if (deuda === 0) return 0;
    const porcentaje = (pagado / deuda) * 100;
    if (isNaN(porcentaje) || !isFinite(porcentaje)) return 0;
    return Math.min(100, Math.max(0, porcentaje));
  };

  // Registrar cliente
  async function handleRegistrar() {
    if (!nuevoCliente.nombre.trim()) return;

    await agregarCliente(nuevoCliente);
    setNuevoCliente({ nombre: "", telefono: "" });
    setShowModal(false);
    await cargarClientes();
  }

  if (loading) {
    return (
      <div className="text-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white h-full overflow-y-auto custom-scroll w-full min-w-0">
      <div className="w-full min-w-0">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Clientes</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona tus clientes y sus deudas</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="group px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-gray-700/25 border border-white/5"
          >
            <FiUserPlus size={18} className="text-gray-400 group-hover:text-white group-hover:rotate-12 transition-all" />
            <span className="text-gray-300 group-hover:text-white">Registrar cliente</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl p-4 rounded-2xl border border-white/10 mb-6 shadow-lg">
          <div className="flex items-center gap-3">
            <FiSearch size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-500"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="text-gray-500 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clientesFiltrados.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FiUser className="text-5xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {clientes.length === 0 ? "No hay clientes registrados." : "No se encontraron clientes con ese nombre."}
              </p>
            </div>
          )}

          {clientesFiltrados.map((c) => {
            const porcentaje = calcularPorcentaje(c.totalPagadoEur, c.totalDeudaEur);
            
            return (
              <Link
                key={c.id}
                to={`/cliente/${c.id}`}
                className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl p-5 rounded-2xl border border-white/10 hover:border-gray-600/50 transition-all duration-300 hover:shadow-2xl overflow-hidden"
              >
                {/* Fondo animado */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                {/* Header del cliente */}
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-2.5 bg-gray-800 rounded-xl group-hover:bg-gray-700 transition-all duration-300">
                    <FiUser size={22} className="text-gray-400 group-hover:text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white truncate">{c.nombre}</h2>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <FiClock size={10} />
                      Desde {new Date(c.fecha_registro).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4 relative z-10">
                  <FiUser size={12} />
                  <span>{c.telefono || "No registrado"}</span>
                </div>

                {/* Stats */}
                <div className="space-y-3 relative z-10">
                  {/* Deuda */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <FiDollarSign size={14} className="text-red-400" />
                      <span>Deuda total</span>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 font-mono font-bold">{c.totalDeudaEur.toFixed(2)} EUR</span>
                      <span className="text-gray-600 text-xs mx-1">/</span>
                      <span className="text-red-400 font-mono font-bold">{c.totalDeudaBcv.toFixed(2)} Bs</span>
                    </div>
                  </div>

                  {/* Pagado */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <FiCheckCircle size={14} className="text-emerald-400" />
                      <span>Pagado</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-mono font-bold">{c.totalPagadoEur.toFixed(2)} EUR</span>
                      <span className="text-gray-600 text-xs mx-1">/</span>
                      <span className="text-emerald-400 font-mono font-bold">{c.totalPagadoBcv.toFixed(2)} Bs</span>
                    </div>
                  </div>

                  {/* Pendiente */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <FiTrendingUp size={14} className="text-yellow-400" />
                      <span>Pendiente</span>
                    </div>
                    <div className="text-right">
                      <span className="text-yellow-400 font-mono font-bold">{c.pendienteEur.toFixed(2)} EUR</span>
                      <span className="text-gray-600 text-xs mx-1">/</span>
                      <span className="text-yellow-400 font-mono font-bold">{c.pendienteBcv.toFixed(2)} Bs</span>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4 relative z-10">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso</span>
                    <span className="font-mono text-gray-400">{porcentaje.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 via-emerald-500 to-green-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>

                {/* Badge de estado */}
                {c.pendienteEur === 0 && c.totalDeudaEur > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                      Pagado
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Modal registrar cliente */}
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-white/10 w-96 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gray-800 rounded-xl">
                  <FiUserPlus size={22} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Registrar cliente</h2>
              </div>

              <input
                type="text"
                placeholder="Nombre completo"
                value={nuevoCliente.nombre}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                className="w-full p-3 mb-3 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all focus:ring-1 focus:ring-gray-500/50 placeholder-gray-500 text-white"
              />

              <input
                type="text"
                placeholder="Teléfono (opcional)"
                value={nuevoCliente.telefono}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                className="w-full p-3 mb-5 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all focus:ring-1 focus:ring-gray-500/50 placeholder-gray-500 text-white"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrar}
                  className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 shadow-lg text-white"
                >
                  Guardar cliente
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}