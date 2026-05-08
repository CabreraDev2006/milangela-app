import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiBox,
  FiBarChart2,
  FiUsers,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiPackage,
  FiTrendingUp,
  FiUserCheck,
  FiCreditCard,
  FiX
} from "react-icons/fi";

export default function Sidebar({ isMobile: externalIsMobile, closeSidebar }) {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && open) {
        setOpen(false);
      }
      if (!mobile && !open && !externalIsMobile) {
        setOpen(true);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [open, externalIsMobile]);

  // Función para cerrar el sidebar (móvil)
  const handleCloseSidebar = () => {
    setOpen(false);
    if (closeSidebar) {
      closeSidebar();
    }
  };

  // Marca el item activo según la ruta
  const isActive = (path) => location.pathname === path;

  // Items del menú
  const menuItems = [
    { path: "/", icon: FiBox, label: "Inventario", description: "Gestiona productos y stock" },
    { path: "/estadisticas", icon: FiBarChart2, label: "Estadísticas", description: "Analiza ventas y ganancias" },
    { path: "/clientes", icon: FiUsers, label: "Clientes", description: "Administra tu cartera" },
    { path: "/cobros", icon: FiShoppingCart, label: "Cobros", description: "Registra pagos y deudas" },
  ];

  // Información adicional del sistema
  const systemInfo = [
    { icon: FiPackage, text: "Productos", value: "En stock" },
    { icon: FiTrendingUp, text: "Ventas", value: "Tiempo real" },
    { icon: FiUserCheck, text: "Clientes", value: "Gestionados" },
    { icon: FiCreditCard, text: "Cobros", value: "Seguros" },
  ];

  const isExpanded = open;

  return (
    <div className="flex relative">
      {/* Overlay para móvil */}
      {isMobile && open && (
        <div 
          className="fixed inset-0 bg-black/50 z-10"
          onClick={handleCloseSidebar}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          ${isExpanded ? "w-72" : "w-20"}
          relative z-20
          bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950
          backdrop-blur-2xl
          border-r border-white/5
          h-screen
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          flex flex-col
          shadow-2xl shadow-black/50
          ${isMobile && !open ? "absolute" : "relative"}
          ${isMobile && open ? "fixed left-0 top-0" : ""}
        `}
      >
        {/* Botón cerrar en móvil */}
        {isMobile && open && (
          <div className="flex justify-end p-3 border-b border-white/5">
            <button onClick={handleCloseSidebar} className="p-2 rounded-lg hover:bg-white/10">
              <FiX size={20} className="text-gray-400" />
            </button>
          </div>
        )}

        {/* Logo y Header */}
        <div className="relative px-3 lg:px-4 pt-6 pb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 blur-2xl"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg lg:rounded-xl blur-lg opacity-30"></div>
                <div className="relative p-1.5 lg:p-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg lg:rounded-xl border border-white/10">
                  <FiShoppingCart className="text-gray-300" size={20} />
                </div>
              </div>
              {isExpanded && (
                <div className="overflow-hidden">
                  <h1 className="text-base lg:text-xl font-bold text-white tracking-tight">
                    Milangela
                  </h1>
                  <p className="text-[10px] lg:text-xs text-gray-500">Sistema de gestión</p>
                </div>
              )}
            </div>
            
            {!isMobile && (
              <button
                onClick={() => setOpen(!open)}
                className="group p-1.5 lg:p-2 rounded-lg lg:rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:scale-110"
              >
                {open ? (
                  <FiChevronLeft size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                ) : (
                  <FiChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 px-2 lg:px-3 space-y-1 overflow-y-auto sidebar-scroll">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && handleCloseSidebar()}
                onMouseEnter={() => setHovered(item.path)}
                onMouseLeave={() => setHovered(null)}
                className={`
                  group relative flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg lg:rounded-xl
                  transition-all duration-300 overflow-hidden
                  ${active 
                    ? "bg-gradient-to-r from-gray-800 to-gray-800/50 border border-white/10 shadow-lg" 
                    : "hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                {/* Fondo animado */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 
                  transition-all duration-500
                  ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                `} />
                
                {/* Indicador activo */}
                {active && (
                  <div className="absolute left-0 w-0.5 lg:w-1 h-6 lg:h-7 bg-gradient-to-b from-gray-400 to-gray-600 rounded-r-full" />
                )}
                
                {/* Icono */}
                <div className={`
                  relative p-1.5 lg:p-2 rounded-lg transition-all duration-300
                  ${active 
                    ? "bg-gradient-to-br from-gray-700 to-gray-800 shadow-lg" 
                    : "group-hover:bg-white/10"
                  }
                  ${hovered === item.path ? "scale-110 rotate-6" : ""}
                `}>
                  <Icon 
                    size={16} 
                    className={`
                      transition-all duration-300
                      ${active ? "text-gray-200" : "text-gray-500 group-hover:text-gray-300"}
                    `}
                  />
                </div>
                
                {/* Label y descripción */}
                {isExpanded && (
                  <div className="flex-1">
                    <span className={`
                      text-sm lg:text-base font-medium transition-all duration-300 block
                      ${active ? "text-white" : "text-gray-400 group-hover:text-gray-200"}
                    `}>
                      {item.label}
                    </span>
                    <span className="text-[9px] lg:text-[10px] text-gray-500 block leading-tight">
                      {item.description}
                    </span>
                  </div>
                )}
                
                {/* Tooltip cuando está colapsado */}
                {!open && hovered === item.path && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 lg:px-3 py-1 lg:py-1.5 bg-gray-900 rounded-lg border border-white/10 text-xs lg:text-sm whitespace-nowrap shadow-xl z-50 animate-fade-in text-gray-300">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-[10px] text-gray-400">{item.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Información del sistema */}
        {isExpanded && (
          <div className="px-2 lg:px-3 py-3 mx-2 mb-2 rounded-xl bg-gray-800/30 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <FiInfo size={12} className="text-gray-500" />
              <p className="text-[10px] text-gray-500 font-medium">INFORMACIÓN DEL SISTEMA</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {systemInfo.map((info, idx) => {
                const IconInfo = info.icon;
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    <IconInfo size={10} className="text-gray-600" />
                    <div>
                      <p className="text-[8px] text-gray-500">{info.text}</p>
                      <p className="text-[9px] text-gray-400 font-medium">{info.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logo decorativo con versión incluida */}
        <div className="px-2 lg:px-3 py-3 lg:py-4 border-t border-white/5">
          <div className="flex justify-center">
            <div className={`
              relative transition-all duration-500
              ${isExpanded ? "w-full" : "w-14 lg:w-16"}
            `}>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg lg:rounded-xl blur-xl opacity-30"></div>
              <div className={`
                relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg lg:rounded-xl 
                flex flex-col items-center justify-center border border-white/10 shadow-2xl
                transition-all duration-500
                ${isExpanded ? "py-2 lg:py-3 px-3 lg:px-4" : "py-1.5 lg:py-2 px-0"}
              `}>
                <FiShoppingCart className={`
                  text-gray-500 transition-all duration-500
                  ${isExpanded ? "text-2xl lg:text-3xl mb-0.5 lg:mb-1" : "text-base lg:text-lg"}
                `} />
                {isExpanded && (
                  <div className="text-center w-full">
                    <p className="text-[10px] lg:text-[11px] text-gray-400 font-medium">Milangela Tienda</p>
                    <div className="mt-1.5 lg:mt-2 pt-1 lg:pt-1.5 border-t border-white/10 w-full">
                      <p className="text-[8px] lg:text-[9px] text-gray-500">Versión 2.0.0</p>
                      <p className="text-[7px] lg:text-[8px] text-gray-600 mt-0.5">© 2026</p>
                    </div>
                  </div>
                )}
                {!isExpanded && (
                  <div className="mt-0.5 text-center">
                    <p className="text-[6px] lg:text-[7px] text-gray-500">v2</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}