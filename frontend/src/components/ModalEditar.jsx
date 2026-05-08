import { useState, useEffect, useMemo } from "react";
import { actualizarProducto } from "../db/productos";
import { convertirCopAEur, convertirEurABcv } from "../utils/conversiones";
import { 
  FiX, 
  FiPackage, 
  FiDollarSign, 
  FiTrendingUp, 
  FiBox, 
  FiImage,
  FiSave,
  FiRefreshCw,
  FiBarChart2,
  FiEdit
} from "react-icons/fi";

export default function ModalEditar({ producto, cerrar }) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [precioCop, setPrecioCop] = useState(producto.precio_cop);
  const [porcentaje, setPorcentaje] = useState(producto.porcentaje_ganancia);
  const [stock, setStock] = useState(producto.stock);
  const [imagen, setImagen] = useState(producto.imagen);
  const [imagenPreview, setImagenPreview] = useState(producto.imagen);

  // Tasas dinámicas
  const [tasaCopEur, setTasaCopEur] = useState(0);
  const [tasaEurBcv, setTasaEurBcv] = useState(0);
  const [loadingTasas, setLoadingTasas] = useState(true);

  // Cargar tasas reales
  useEffect(() => {
    async function cargarTasas() {
      setLoadingTasas(true);
      const eur = await convertirCopAEur(1);
      const bcv = await convertirEurABcv(1);
      setTasaCopEur(eur);
      setTasaEurBcv(bcv);
      setLoadingTasas(false);
    }
    cargarTasas();
  }, []);

  // Cálculo profesional con useMemo
  const preview = useMemo(() => {
    if (!precioCop || !porcentaje) {
      return {
        precio_eur: 0,
        precio_bcv: 0,
        ganancia_cop: 0,
        ganancia_eur: 0,
        ganancia_bcv: 0,
        precio_final_cop: 0,
        precio_final_eur: 0,
        precio_final_bcv: 0
      };
    }

    const costo = parseFloat(precioCop);
    const porc = parseFloat(porcentaje) / 100;

    const precio_eur = costo * tasaCopEur;
    const precio_bcv = precio_eur * tasaEurBcv;

    const ganancia_cop = costo * porc;
    const ganancia_eur = precio_eur * porc;
    const ganancia_bcv = precio_bcv * porc;

    const precio_final_cop = costo + ganancia_cop;
    const precio_final_eur = precio_eur + ganancia_eur;
    const precio_final_bcv = precio_bcv + ganancia_bcv;

    return {
      precio_eur,
      precio_bcv,
      ganancia_cop,
      ganancia_eur,
      ganancia_bcv,
      precio_final_cop,
      precio_final_eur,
      precio_final_bcv
    };
  }, [precioCop, porcentaje, tasaCopEur, tasaEurBcv]);

  // Convertir imagen a base64
  function handleImagen(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagen(reader.result);
      setImagenPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function guardar() {
    if (!nombre || !precioCop || !porcentaje) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    await actualizarProducto({
      id: producto.id,
      nombre,
      precio_cop: parseFloat(precioCop),
      precio_eur: preview.precio_eur,
      precio_bcv: preview.precio_bcv,

      porcentaje_ganancia: parseFloat(porcentaje),

      ganancia_cop: preview.ganancia_cop,
      ganancia_eur: preview.ganancia_eur,
      ganancia_bcv: preview.ganancia_bcv,

      precio_final_cop: preview.precio_final_cop,
      precio_final_eur: preview.precio_final_eur,
      precio_final_bcv: preview.precio_final_bcv,

      stock: parseInt(stock),
      imagen
    });

    cerrar();
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-950 px-4 sm:px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-xl">
              <FiEdit size={20} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Editar producto</h2>
              <p className="text-[10px] sm:text-[11px] text-gray-500">Modifica los datos del producto</p>
            </div>
          </div>
          <button
            onClick={cerrar}
            className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            <FiX size={20} className="text-gray-500 hover:text-white" />
          </button>
        </div>

        {/* Contenido - responsive */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Nombre del producto */}
          <div>
            <label className="block text-gray-400 text-xs mb-1 flex items-center gap-2">
              <FiPackage size={12} />
              Nombre del producto
            </label>
            <input
              type="text"
              placeholder="Ej: Camisa de vestir"
              className="w-full p-3 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all focus:ring-1 focus:ring-gray-500/50 text-white placeholder-gray-500"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Costo COP y Porcentaje */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1 flex items-center gap-2">
                <FiDollarSign size={12} />
                Costo en COP
              </label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full p-3 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all focus:ring-1 focus:ring-gray-500/50 text-white placeholder-gray-500"
                value={precioCop}
                onChange={(e) => setPrecioCop(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1 flex items-center gap-2">
                <FiTrendingUp size={12} />
                Ganancia (%)
              </label>
              <input
                type="number"
                placeholder="30"
                className="w-full p-3 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all focus:ring-1 focus:ring-gray-500/50 text-white placeholder-gray-500"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
              />
            </div>
          </div>

          {/* Stock e Imagen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs mb-1 flex items-center gap-2">
                <FiBox size={12} />
                Stock
              </label>
              <input
                type="number"
                placeholder="1"
                className="w-full p-3 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all focus:ring-1 focus:ring-gray-500/50 text-white placeholder-gray-500"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1 flex items-center gap-2">
                <FiImage size={12} />
                Imagen (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagen}
                className="w-full p-2 rounded-xl bg-gray-800/80 border border-white/10 text-gray-400 text-sm file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 transition-all"
              />
            </div>
          </div>

          {/* Preview de imagen actual */}
          {imagenPreview && (
            <div className="flex justify-center">
              <div className="relative group">
                <img
                  src={imagenPreview}
                  alt="Preview"
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl border border-white/10 shadow-lg"
                />
                <button
                  onClick={() => {
                    setImagen(null);
                    setImagenPreview(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <FiX size={12} className="text-white" />
                </button>
              </div>
            </div>
          )}

          {/* Tasas actuales */}
          {loadingTasas ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <FiRefreshCw size={14} className="text-gray-500 animate-spin" />
              <p className="text-[11px] text-gray-500">Cargando tasas...</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-2">
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-gray-500">COP→EUR: {tasaCopEur.toFixed(6)}</p>
              </div>
              <div className="hidden sm:block w-px h-3 bg-white/10"></div>
              <div className="flex items-center gap-1">
                <FiBarChart2 size={10} className="text-gray-600" />
                <p className="text-[10px] text-gray-500">EUR→Bs: {tasaEurBcv.toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Vista previa de cálculos */}
          {precioCop && porcentaje && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/10 overflow-x-auto">
              <p className="text-[11px] text-gray-500 mb-3 flex items-center gap-2">
                <FiTrendingUp size={12} />
                VISTA PREVIA DE CÁLCULOS
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-[10px]">Precio base EUR</p>
                  <p className="text-white font-mono font-bold">{preview.precio_eur.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Precio base Bs</p>
                  <p className="text-white font-mono font-bold">{preview.precio_bcv.toFixed(2)} Bs</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Ganancia EUR</p>
                  <p className="text-emerald-400 font-mono">+{preview.ganancia_eur.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px]">Ganancia Bs</p>
                  <p className="text-emerald-400 font-mono">+{preview.ganancia_bcv.toFixed(2)} Bs</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-white/10">
                  <p className="text-gray-500 text-[10px]">Precio final</p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-1">
                    <p className="text-blue-400 font-mono font-bold text-xs sm:text-sm">{preview.precio_final_cop.toFixed(2)} COP</p>
                    <p className="text-blue-400 font-mono font-bold text-xs sm:text-sm">{preview.precio_final_eur.toFixed(2)} €</p>
                    <p className="text-blue-400 font-mono font-bold text-xs sm:text-sm">{preview.precio_final_bcv.toFixed(2)} Bs</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-900 to-gray-950 px-4 sm:px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={cerrar}
            className="px-4 sm:px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 text-gray-300 hover:text-white text-sm sm:text-base"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            className="px-4 sm:px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl transition-all duration-200 shadow-lg text-white flex items-center gap-2 text-sm sm:text-base"
          >
            <FiSave size={16} />
            Guardar cambios
          </button>
        </div>

      </div>
    </div>
  );
}