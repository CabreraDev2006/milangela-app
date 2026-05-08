import { useState, useEffect, useCallback } from "react";
import { FiShoppingCart } from "react-icons/fi";

// Detectar si está en Electron
const isElectron = () => {
  return window.electronAPI !== undefined;
};

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Iniciando sistema...");

  const handleFinish = useCallback(() => {
    // Solo expandir ventana si es Electron (PC)
    if (isElectron() && window.electronAPI && window.electronAPI.expandWindow) {
      window.electronAPI.expandWindow();
    }
    if (onFinish) {
      onFinish();
    }
  }, [onFinish]);

  const getProgressColor = () => {
    if (progress < 50) return "#ef4444";
    if (progress < 80) return "#eab308";
    return "#3b82f6";
  };

  useEffect(() => {
    const loadingMessages = [
      "Iniciando sistema...",
      "Cargando módulos...",
      "Conectando base de datos...",
      "Sincronizando tasas...",
      "Preparando inventario...",
      "Cargando clientes...",
      "¡Casi listo!",
    ];

    let isMounted = true;
    let intervalId = null;

    const updateProgress = () => {
      if (!isMounted) return;
      
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        
        if (newProgress >= 100) {
          if (intervalId) clearInterval(intervalId);
          setLoadingText("¡Listo! Abriendo...");
          
          setTimeout(() => {
            if (isMounted) handleFinish();
          }, 400);
          
          return 100;
        }
        
        const messageIndex = Math.floor(newProgress / 15);
        if (messageIndex < loadingMessages.length) {
          setLoadingText(loadingMessages[messageIndex]);
        }
        
        return newProgress;
      });
    };

    intervalId = setInterval(updateProgress, 180);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [handleFinish]);

  return (
    <div className="splash-container">
      
      {/* Logo */}
      <div className="logo-wrapper">
        <div className="logo-glow"></div>
        <div className="logo-box">
          <FiShoppingCart className="logo-icon" />
        </div>
      </div>

      {/* Título */}
      <div className="title-section">
        <h1 className="title">Milangela</h1>
        <p className="subtitle">Sistema de gestión de tienda</p>
      </div>

      {/* Barra de progreso */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-text">{loadingText}</span>
          <span className="progress-percent">{Math.floor(progress)}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%`, backgroundColor: getProgressColor() }}
          />
        </div>
      </div>

      {/* Versión */}
      <div className="version-footer">
        <p>© 2026 Milangela Store</p>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .splash-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to right, #0a0a0a, #111827, #0a0a0a);
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Logo */
        .logo-wrapper {
          position: relative;
          margin-bottom: 20px;
        }
        
        .logo-glow {
          position: absolute;
          inset: 0;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          filter: blur(20px);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .logo-box {
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .logo-icon {
          font-size: 48px;
          color: white;
        }
        
        /* Título */
        .title-section {
          text-align: center;
          margin-bottom: 16px;
        }
        
        .title {
          font-size: 24px;
          font-weight: bold;
          color: white;
          letter-spacing: -0.025em;
          margin: 0;
        }
        
        .subtitle {
          font-size: 10px;
          color: #9ca3af;
          margin-top: 4px;
        }
        
        /* Barra de progreso */
        .progress-section {
          width: 280px;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #6b7280;
          margin-bottom: 6px;
        }
        
        .progress-text {
          color: #6b7280;
        }
        
        .progress-percent {
          font-family: monospace;
          color: #9ca3af;
        }
        
        .progress-bar-bg {
          height: 4px;
          background: #1f2937;
          border-radius: 9999px;
          overflow: hidden;
        }
        
        .progress-bar-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease-out;
        }
        
        /* Versión */
        .version-footer {
          position: absolute;
          bottom: 16px;
          left: 0;
          right: 0;
          text-align: center;
        }
        
        .version-footer p {
          font-size: 8px;
          color: #4b5563;
        }
        
        /* Animaciones */
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}