import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarClientes, obtenerTotalesCliente } from "../db/clientes";
import { FiSearch, FiUser, FiShoppingCart, FiDollarSign, FiCheckCircle, FiTrendingUp, FiUsers } from "react-icons/fi";

export default function Cobros() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [totales, setTotales] = useState({});

  // Cargar clientes + totales
  useEffect(() => {
    async function cargar() {
      setLoading(true);
      const lista = await listarClientes();
      setClientes(lista);

      // Cargar totales por cliente
      const t = {};
      for (const c of lista) {
        t[c.id] = await obtenerTotalesCliente(c.id);
      }
      setTotales(t);
      setLoading(false);
    }

    cargar();
  }, []);

  // Filtrar clientes
  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-white tracking-tight">Cobros</h1>
            <p className="text-gray-500 text-sm mt-1">Registra pagos y gestiona deudas</p>
          </div>
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
        <div className="flex flex-col gap-4">
          {filtrados.length === 0 && (
            <div className="text-center py-12 bg-gray-900/40 rounded-2xl border border-white/5">
              <FiUsers className="text-5xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {clientes.length === 0 ? "No hay clientes registrados." : "No se encontraron clientes con ese nombre."}
              </p>
            </div>
          )}

          {filtrados.map((c) => {
            const t = totales[c.id];
            const porcentaje = t && t.totalDeudaEur > 0 ? (t.totalPagadoEur / t.totalDeudaEur) * 100 : 0;

            return (
              <div
                key={c.id}
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
                    <h2 className="text-xl font-bold text-white">{c.nombre}</h2>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                      <FiUser size={12} />
                      Tel: {c.telefono || "No registrado"}
                    </p>
                  </div>
                </div>

                {/* Stats de deuda */}
                {t && (
                  <div className="grid grid-cols-3 gap-3 mb-4 relative z-10">
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <FiDollarSign size={12} className="text-red-400" />
                        <p className="text-gray-500 text-xs">Deuda</p>
                      </div>
                      <p className="text-red-400 font-bold text-sm">{t.totalDeudaEur.toFixed(2)} €</p>
                      <p className="text-red-400/80 text-xs">{t.totalDeudaBcv.toFixed(2)} Bs</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <FiCheckCircle size={12} className="text-emerald-400" />
                        <p className="text-gray-500 text-xs">Pagado</p>
                      </div>
                      <p className="text-emerald-400 font-bold text-sm">{t.totalPagadoEur.toFixed(2)} €</p>
                      <p className="text-emerald-400/80 text-xs">{t.totalPagadoBcv.toFixed(2)} Bs</p>
                    </div>
                    <div className="bg-black/30 rounded-xl p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <FiTrendingUp size={12} className="text-yellow-400" />
                        <p className="text-gray-500 text-xs">Pendiente</p>
                      </div>
                      <p className="text-yellow-400 font-bold text-sm">{t.pendienteEur.toFixed(2)} €</p>
                      <p className="text-yellow-400/80 text-xs">{t.pendienteBcv.toFixed(2)} Bs</p>
                    </div>
                  </div>
                )}

                {/* Barra de progreso */}
                {t && t.totalDeudaEur > 0 && (
                  <div className="mb-4 relative z-10">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progreso de pago</span>
                      <span className="font-mono text-gray-400">{porcentaje.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 via-emerald-500 to-green-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(100, porcentaje)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 relative z-10">
                  <Link
                    to={`/cliente/${c.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-300 hover:text-white"
                  >
                    <FiUser size={16} />
                    <span>Ver perfil</span>
                  </Link>

                  <Link
                    to={`/cobros/registrar/${c.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 text-white shadow-lg"
                  >
                    <FiShoppingCart size={16} />
                    <span>Registrar compra</span>
                  </Link>
                </div>

                {/* Badge de estado */}
                {t && t.pendienteEur === 0 && t.totalDeudaEur > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                      Pagado
                    </span>
                  </div>
                )}

                {t && t.pendienteEur > 0 && t.totalDeudaEur > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 backdrop-blur-sm">
                      Pendiente
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}