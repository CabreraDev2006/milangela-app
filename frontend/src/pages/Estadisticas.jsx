import { useEffect, useState } from "react";
import { obtenerTotales } from "../db/productos";
import { listarClientes, obtenerPagosCliente } from "../db/clientes";
import { 
  FiHelpCircle, 
  FiRotateCcw, 
  FiPackage, 
  FiDollarSign, 
  FiTrendingUp, 
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiTarget
} from "react-icons/fi";

const Tooltip = ({ text }) => (
  <div className="relative group inline-block ml-1">
    <FiHelpCircle size={14} className="text-gray-600 cursor-pointer hover:text-gray-400 transition-colors" />
    <div className="absolute left-0 mt-2 w-56 p-2 bg-gray-900 text-xs text-gray-300 rounded-lg border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none backdrop-blur-sm">
      {text}
    </div>
  </div>
);

export default function Estadisticas() {
  const [totales, setTotales] = useState({
    totalProductos: 0,
    totalCop: 0,
    totalEur: 0,
    totalBcv: 0,
    totalGananciaCop: 0,
    totalGananciaEur: 0,
    totalGananciaBcv: 0,
    totalGananciaEstimadoCop: 0,
    totalGananciaEstimadoEur: 0,
    totalGananciaEstimadoBcv: 0,
    totalVendidoEstimadoCop: 0,
    totalVendidoEstimadoEur: 0,
    totalVendidoEstimadoBcv: 0,
    totalPrecioFinalCop: 0,
    totalPrecioFinalEur: 0,
    totalPrecioFinalBcv: 0,
    totalStockGeneral: 0,
  });

  const [ventasReales, setVentasReales] = useState({
    totalVendidoEur: 0,
    totalVendidoBcv: 0,
    gananciaRealEur: 0,
    gananciaRealBcv: 0
  });

  const [mostrarReset, setMostrarReset] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calcular ventas reales desde los pagos de clientes
  const calcularVentasReales = async () => {
    const clientes = await listarClientes();
    let totalEur = 0;
    let totalBcv = 0;

    for (const cliente of clientes) {
      const pagos = await obtenerPagosCliente(cliente.id);
      for (const pago of pagos) {
        totalEur += pago.monto_eur;
        totalBcv += pago.monto_bcv;
      }
    }

    const gananciaRealEur = totalEur * 0.3;
    const gananciaRealBcv = totalBcv * 0.3;

    setVentasReales({
      totalVendidoEur: totalEur,
      totalVendidoBcv: totalBcv,
      gananciaRealEur: gananciaRealEur,
      gananciaRealBcv: gananciaRealBcv
    });
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const t = await obtenerTotales();
      setTotales(t);
      await calcularVentasReales();
      setLoading(false);
    })();
  }, []);

  const resetEstadisticas = () => {
    if (confirm("¿Estás seguro de que deseas resetear las estadísticas? Esto solo ocultará los datos actuales hasta que recargues la página.")) {
      setVentasReales({
        totalVendidoEur: 0,
        totalVendidoBcv: 0,
        gananciaRealEur: 0,
        gananciaRealBcv: 0
      });
      setMostrarReset(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white h-full overflow-y-auto custom-scroll w-full min-w-0">
      <div className="pr-3 w-full min-w-0">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Estadísticas</h1>
            <p className="text-gray-500 text-sm mt-1">Análisis completo de tu negocio</p>
          </div>
          
          <button
            onClick={() => setMostrarReset(true)}
            className="group flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-600/80 rounded-xl transition-all duration-300 border border-white/5 hover:shadow-lg"
          >
            <FiRotateCcw size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-gray-400 group-hover:text-white">Resetear mes</span>
          </button>
        </div>

        {/* Cards de resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 hover:border-gray-600/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gray-800 rounded-xl">
                <FiPackage size={18} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm flex items-center">
                Total productos
                <Tooltip text="Cantidad total de productos registrados en el sistema." />
              </p>
            </div>
            <h2 className="text-3xl font-bold text-white">{totales.totalProductos}</h2>
          </div>

          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 hover:border-gray-600/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gray-800 rounded-xl">
                <FiDollarSign size={18} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm flex items-center">
                Costo total COP
                <Tooltip text="Suma del costo de compra de todos los productos en COP." />
              </p>
            </div>
            <h2 className="text-2xl font-bold text-white">{totales.totalCop.toFixed(2)}</h2>
          </div>

          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 hover:border-gray-600/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gray-800 rounded-xl">
                <FiTrendingUp size={18} className="text-emerald-400" />
              </div>
              <p className="text-gray-500 text-sm flex items-center">
                Valor total EUR
                <Tooltip text="Valor total de los productos convertido a euros." />
              </p>
            </div>
            <h2 className="text-2xl font-bold text-emerald-400">{totales.totalEur.toFixed(2)} €</h2>
          </div>

          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 hover:border-gray-600/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gray-800 rounded-xl">
                <FiBarChart2 size={18} className="text-blue-400" />
              </div>
              <p className="text-gray-500 text-sm flex items-center">
                Valor total Bs
                <Tooltip text="Valor total de los productos convertido a bolívares." />
              </p>
            </div>
            <h2 className="text-2xl font-bold text-blue-400">{totales.totalBcv.toFixed(2)} Bs</h2>
          </div>
        </div>

        {/* VENTAS REALES */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <FiCheckCircle size={18} className="text-emerald-400" />
            </div>
            <p className="text-emerald-400 text-sm font-semibold">
              VENTAS REALES (Pagos recibidos)
            </p>
            <Tooltip text="Total de dinero recibido por pagos de clientes." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">Total vendido (EUR)</p>
              <h2 className="text-3xl font-bold text-emerald-400">
                {ventasReales.totalVendidoEur.toFixed(2)} €
              </h2>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">Total vendido (Bs)</p>
              <h2 className="text-3xl font-bold text-emerald-400">
                {ventasReales.totalVendidoBcv.toFixed(2)} Bs
              </h2>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">Ganancia estimada (EUR)</p>
              <h2 className="text-2xl font-bold text-yellow-400">
                {ventasReales.gananciaRealEur.toFixed(2)} €
              </h2>
              <p className="text-xs text-gray-600 mt-1">*Basado en 30% de ganancia</p>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">Ganancia estimada (Bs)</p>
              <h2 className="text-2xl font-bold text-yellow-400">
                {ventasReales.gananciaRealBcv.toFixed(2)} Bs
              </h2>
              <p className="text-xs text-gray-600 mt-1">*Basado en 30% de ganancia</p>
            </div>
          </div>
        </div>

        {/* Total a vender (sin stock) */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <FiTarget size={18} className="text-blue-400" />
            </div>
            <p className="text-blue-400 text-sm font-semibold">
              Total a vender (sin stock)
            </p>
            <Tooltip text="Suma del precio final de cada producto sin multiplicar por stock." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">COP</p>
              <h2 className="text-xl font-bold text-blue-400">
                {totales.totalPrecioFinalCop.toFixed(2)}
              </h2>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">EUR</p>
              <h2 className="text-xl font-bold text-blue-400">
                {totales.totalPrecioFinalEur.toFixed(2)} €
              </h2>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">Bs</p>
              <h2 className="text-xl font-bold text-blue-400">
                {totales.totalPrecioFinalBcv.toFixed(2)} Bs
              </h2>
            </div>
          </div>
        </div>

        {/* Ganancias totales */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <FiTrendingUp size={18} className="text-purple-400" />
            </div>
            <p className="text-purple-400 text-sm font-semibold">
              Ganancias totales (sobre costo)
            </p>
            <Tooltip text="Ganancia total obtenida sumando todos los productos." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">COP</p>
              <h2 className="text-xl font-bold text-purple-400">
                {totales.totalGananciaCop.toFixed(2)}
              </h2>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">EUR</p>
              <h2 className="text-xl font-bold text-purple-400">
                {totales.totalGananciaEur.toFixed(2)} €
              </h2>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">Bs</p>
              <h2 className="text-xl font-bold text-purple-400">
                {totales.totalGananciaBcv.toFixed(2)} Bs
              </h2>
            </div>
          </div>
        </div>

        {/* Ganancia estimada + Total vendido estimado */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <FiClock size={18} className="text-yellow-400" />
            </div>
            <p className="text-yellow-400 text-sm font-semibold flex items-center gap-2">
              Ganancia estimada (por stock)
              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-lg">
                {totales.totalStockGeneral} unidades
              </span>
            </p>
            <Tooltip text="Ganancia potencial si vendes todo el stock disponible." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">COP</p>
              <h2 className="text-xl font-bold text-yellow-400">
                {totales.totalGananciaEstimadoCop.toFixed(2)}
              </h2>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">EUR</p>
              <h2 className="text-xl font-bold text-yellow-400">
                {totales.totalGananciaEstimadoEur.toFixed(2)} €
              </h2>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-sm">Bs</p>
              <h2 className="text-xl font-bold text-yellow-400">
                {totales.totalGananciaEstimadoBcv.toFixed(2)} Bs
              </h2>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-xl">
                <FiBarChart2 size={18} className="text-orange-400" />
              </div>
              <p className="text-orange-400 text-sm font-semibold">
                Total vendido estimado (precio final × stock)
              </p>
              <Tooltip text="Valor total si vendes todas las unidades al precio final." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-gray-500 text-sm">COP</p>
                <h2 className="text-xl font-bold text-orange-400">
                  {totales.totalVendidoEstimadoCop.toFixed(2)}
                </h2>
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-gray-500 text-sm">EUR</p>
                <h2 className="text-xl font-bold text-orange-400">
                  {totales.totalVendidoEstimadoEur.toFixed(2)} €
                </h2>
              </div>

              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-gray-500 text-sm">Bs</p>
                <h2 className="text-xl font-bold text-orange-400">
                  {totales.totalVendidoEstimadoBcv.toFixed(2)} Bs
                </h2>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal reset */}
      {mostrarReset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-white/10 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/20 rounded-xl">
                <FiRotateCcw size={24} className="text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-400">Resetear estadísticas</h2>
            </div>

            <p className="text-gray-400 mb-4">
              Esto ocultará las estadísticas actuales de ventas.
              <br />
              <strong className="text-yellow-400">Los datos reales no se borran</strong>, solo se ocultan visualmente.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarReset(false)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition text-gray-300"
              >
                Cancelar
              </button>

              <button
                onClick={resetEstadisticas}
                className="px-5 py-2 bg-yellow-600/80 hover:bg-yellow-600 rounded-xl transition shadow-lg text-white"
              >
                Resetear
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}