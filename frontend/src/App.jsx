import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import { useState, useEffect } from "react";

import Inventario from "./pages/Inventario";
import Estadisticas from "./pages/Estadisticas";
import Clientes from "./pages/Clientes";
import ClientePerfil from "./pages/ClientePerfil";

import Cobros from "./pages/Cobros";
import CobroRegistrar from "./pages/CobroRegistrar";

import SplashScreen from "./components/SplashScreen";

import { recalcularProductosFrontend } from "./db/productos";

// Detectar si está en Electron (PC)
const isElectron = () => {
  return window.electronAPI !== undefined;
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Inicializar la app
    const initApp = async () => {
      // Solo en Electron: escuchar tasas
      if (isElectron() && window.electronAPI && window.electronAPI.onRates) {
        window.electronAPI.onRates(async (rates) => {
          console.log("Tasas recibidas desde Electron:", rates);

          try {
            localStorage.setItem("copEur", String(rates.copEur));
            localStorage.setItem("eurBcv", String(rates.eurBcv));
          } catch (e) {
            console.warn("No se pudieron guardar las tasas en localStorage:", e);
          }

          await recalcularProductosFrontend({
            copEur: rates.copEur,
            eurBcv: rates.eurBcv
          });

          console.log("Base de datos recalculada con nuevas tasas");
          setIsReady(true);
        });
      } else {
        // En web o Capacitor (iOS/Android), no hay tasas de Electron
        console.log("Ejecutando en web o móvil - sin tasas de Electron");
        
        // Cargar tasas desde localStorage si existen
        const savedCopEur = localStorage.getItem("copEur");
        const savedEurBcv = localStorage.getItem("eurBcv");
        
        if (savedCopEur && savedEurBcv) {
          await recalcularProductosFrontend({
            copEur: parseFloat(savedCopEur),
            eurBcv: parseFloat(savedEurBcv)
          });
        }
        
        // Simular carga de datos
        setTimeout(() => {
          setIsReady(true);
        }, 1500);
      }
    };

    initApp();
  }, []);

  // Función para ocultar el splash screen
  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Esperar a que la app esté lista antes de ocultar el splash
  useEffect(() => {
    if (isReady) {
      setTimeout(() => {
        setShowSplash(false);
      }, 500);
    }
  }, [isReady]);

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      
      <div className={showSplash ? "hidden" : "block"}>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Inventario />} />
              <Route path="/estadisticas" element={<Estadisticas />} />

              {/* CLIENTES */}
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/cliente/:id" element={<ClientePerfil />} />

              {/* COBROS */}
              <Route path="/cobros" element={<Cobros />} />
              <Route path="/cobros/registrar/:clienteId" element={<CobroRegistrar />} />
            </Routes>
          </Layout>
        </HashRouter>
      </div>
    </>
  );
}