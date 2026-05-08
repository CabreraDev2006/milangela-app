import { useState, useEffect } from "react";
import TitleBar from "../components/TitleBar";
import Sidebar from "../components/Sidebar";

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      
      {/* Title bar global */}
      <TitleBar isMobile={isMobile} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Sidebar + contenido */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar - responsive */}
        <div className={`
          fixed lg:relative z-30 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isMobile ? 'w-64' : 'lg:w-auto'}
        `}>
          <Sidebar isMobile={isMobile} closeSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay para móvil cuando sidebar está abierto */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Panel de contenido */}
        <div className={`
          flex-1 w-full min-w-0 overflow-y-auto custom-scroll
          transition-all duration-300
          ${isMobile ? 'p-3' : 'p-6'}
        `}>
          {children}
        </div>

      </div>
    </div>
  );
}