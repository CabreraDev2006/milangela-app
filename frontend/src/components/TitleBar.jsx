import { useEffect, useState } from "react";
import { 
  Minus, 
  Square, 
  CopyMinus, 
  X, 
  Store,
  TrendingUp,
  TrendingDown,
  Menu
} from "lucide-react";

export default function TitleBar({ isMobile, toggleSidebar }) {
  const [isMax, setIsMax] = useState(false);
  const [tasaCopEur, setTasaCopEur] = useState(null);
  const [tasaEurBcv, setTasaEurBcv] = useState(null);
  const [prevTasaEurBcv, setPrevTasaEurBcv] = useState(null);

  useEffect(() => {
    if (window.windowControls) {
      window.windowControls.onMaximized((value) => {
        setIsMax(value);
      });
    }

    if (window.api && window.api.conversion) {
      window.api.conversion.getRates().then((rates) => {
        setPrevTasaEurBcv(tasaEurBcv);
        setTasaCopEur(rates.copEur);
        setTasaEurBcv(rates.eurBcv);
      });
    }

    const interval = setInterval(async () => {
      if (window.api && window.api.conversion) {
        const rates = await window.api.conversion.getRates();
        setPrevTasaEurBcv(tasaEurBcv);
        setTasaCopEur(rates.copEur);
        setTasaEurBcv(rates.eurBcv);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [tasaEurBcv]);

  const getTendencia = () => {
    if (prevTasaEurBcv === null || tasaEurBcv === null) return null;
    if (tasaEurBcv > prevTasaEurBcv) return "up";
    if (tasaEurBcv < prevTasaEurBcv) return "down";
    return "stable";
  };

  const tendencia = getTendencia();

  return (
    <div
      className="w-full h-11 flex items-center justify-between px-2 sm:px-4 select-none bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border-b border-white/5"
      style={{ WebkitAppRegion: "drag" }}
    >

      {/* IZQUIERDA: LOGO + NOMBRE */}
      <div className="flex items-center gap-2 sm:gap-3" style={{ WebkitAppRegion: "no-drag" }}>
        {isMobile && toggleSidebar && (
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/10 transition">
            <Menu size={18} className="text-gray-400" />
          </button>
        )}
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg blur-md opacity-30"></div>
          <div className="relative p-1.5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg">
            <Store size={14} className="text-gray-300" />
          </div>
        </div>
        
        {!isMobile && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white tracking-tight">Milangela</span>
            <span className="text-[10px] text-gray-500 -mt-0.5">Sistema de gestión</span>
          </div>
        )}
      </div>

      {/* CENTRO: TASAS - oculto en móvil */}
      {!isMobile && (
        <div className="flex items-center gap-4 lg:gap-8" style={{ WebkitAppRegion: "no-drag" }}>
          {/* Tasa COP → EUR */}
          <div className="group relative hidden sm:flex">
            <div className="flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
              <span className="text-[9px] lg:text-[11px] font-mono text-gray-400">COP/EUR</span>
              <span className="text-xs lg:text-sm font-bold text-white font-mono">
                {tasaCopEur !== null ? tasaCopEur.toFixed(6) : "—"}
              </span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 rounded-md text-[10px] text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Tasa de cambio COP a EUR
            </div>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-white/10 hidden sm:block"></div>

          {/* Tasa EUR → Bs */}
          <div className="group relative hidden sm:flex">
            <div className="flex items-center gap-2 px-2 lg:px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] lg:text-[11px] font-mono text-gray-400">EUR/BS</span>
              <span className="text-xs lg:text-sm font-bold text-white font-mono">
                {tasaEurBcv !== null ? tasaEurBcv.toFixed(2) : "—"}
              </span>
              {tendencia === "up" && <TrendingUp size={12} className="text-emerald-400 ml-1" />}
              {tendencia === "down" && <TrendingDown size={12} className="text-red-400 ml-1" />}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 rounded-md text-[10px] text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Tasa de cambio EUR a Bolívares
            </div>
          </div>
        </div>
      )}

      {/* Versión móvil - mostrar solo nombre */}
      {isMobile && (
        <div className="text-center" style={{ WebkitAppRegion: "no-drag" }}>
          <span className="text-sm font-semibold text-white">Milangela</span>
        </div>
      )}

      {/* DERECHA: BOTONES DE VENTANA */}
      {window.windowControls && (
        <div className="flex h-full -mr-3 sm:-mr-4" style={{ WebkitAppRegion: "no-drag" }}>
          <button
            onClick={() => window.windowControls.minimize()}
            className="group w-8 sm:w-12 h-full flex items-center justify-center hover:bg-white/10 transition-all duration-200"
          >
            <Minus size={14} className="text-gray-400 group-hover:text-white" />
          </button>

          <button
            onClick={() => {
              if (isMax) window.windowControls.restore();
              else window.windowControls.maximize();
            }}
            className="group w-8 sm:w-12 h-full flex items-center justify-center hover:bg-white/10 transition-all duration-200"
          >
            {isMax ? <CopyMinus size={14} className="text-gray-400 group-hover:text-white" /> : <Square size={12} className="text-gray-400 group-hover:text-white" />}
          </button>

          <button
            onClick={() => window.windowControls.close()}
            className="group w-8 sm:w-12 h-full flex items-center justify-center hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 transition-all duration-200"
          >
            <X size={14} className="text-gray-400 group-hover:text-white" />
          </button>
        </div>
      )}
    </div>
  );
}