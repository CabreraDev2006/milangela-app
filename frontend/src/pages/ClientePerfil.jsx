import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, FiDollarSign, FiEdit, FiTrash2, FiShoppingCart, 
  FiTrash, FiUser, FiPhone, FiCalendar, FiCheckCircle, 
  FiClock, FiTrendingUp, FiPackage, FiCreditCard 
} from "react-icons/fi";
import {
  obtenerCliente,
  obtenerDeudasCliente,
  obtenerPagosCliente,
  registrarPago,
  obtenerTotalesCliente,
  editarCliente,
  eliminarCliente,
  eliminarDeuda,
  marcarDeudaComoPagada,
  eliminarHistorialPagos
} from "../db/clientes";
import { obtenerProducto } from "../db/productos";

export default function ClientePerfil() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [deudas, setDeudas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [totales, setTotales] = useState(null);
  const [productosInfo, setProductosInfo] = useState({});

  const [pago, setPago] = useState({ eur: "", bcv: "" });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteDeudaModal, setShowDeleteDeudaModal] = useState(false);
  const [showDeleteHistorialModal, setShowDeleteHistorialModal] = useState(false);

  const [deudaSeleccionada, setDeudaSeleccionada] = useState(null);

  const [editData, setEditData] = useState({
    nombre: "",
    telefono: ""
  });

  // TASA EUR ↔ BS
  const [eurBcv, setEurBcv] = useState(() => {
    const saved = localStorage.getItem("eurBcv");
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.onRates) {
      window.electronAPI.onRates((rates) => {
        setEurBcv(rates.eurBcv);
        localStorage.setItem("eurBcv", rates.eurBcv);
      });
    }
  }, []);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    const c = await obtenerCliente(id);
    const d = await obtenerDeudasCliente(id);
    const p = await obtenerPagosCliente(id);
    const t = await obtenerTotalesCliente(id);

    setCliente(c);
    setDeudas(d);
    setPagos(p);
    setTotales(t);

    // Cargar información de productos
    const productosMap = {};
    for (const deuda of d) {
      if (!productosMap[deuda.producto_id]) {
        const producto = await obtenerProducto(deuda.producto_id);
        if (producto) {
          productosMap[deuda.producto_id] = producto;
        } else {
          productosMap[deuda.producto_id] = { nombre: "Producto eliminado", imagen: null };
        }
      }
    }
    setProductosInfo(productosMap);
  }, [id]);

  useEffect(() => {
    queueMicrotask(() => {
      cargarDatos();
    });
  }, [cargarDatos]);

  // Autoconversión EUR ↔ Bs
  function handleEUR(e) {
    const value = e.target.value;
    const num = parseFloat(value);

    let bcv = "";
    if (!isNaN(num) && eurBcv > 0) {
      bcv = (num * eurBcv).toFixed(2);
    }

    setPago({
      eur: value,
      bcv
    });
  }

  function handleBCV(e) {
    const value = e.target.value;
    const num = parseFloat(value);

    let eur = "";
    if (!isNaN(num) && eurBcv > 0) {
      eur = (num / eurBcv).toFixed(2);
    }

    setPago({
      eur,
      bcv: value
    });
  }

  // Registrar pago
  async function handleRegistrarPago() {
    const deudasActivas = deudas.filter(d => d.pagado === 0);
    
    if (deudasActivas.length === 0) {
      alert("Este cliente no tiene compras activas. No puede realizar pagos.");
      return;
    }

    if (!pago.eur && !pago.bcv) return;

    const montoEur = parseFloat(pago.eur) || 0;
    const montoBcv = parseFloat(pago.bcv) || 0;
    
    const tolerancia = 0.01;
    const pendienteEur = totales.pendienteEur;
    const pendienteBcv = totales.pendienteBcv;
    
    const pagoExactoEur = Math.abs(montoEur - pendienteEur) <= tolerancia;
    const pagoExactoBcv = Math.abs(montoBcv - pendienteBcv) <= tolerancia;
    const liquidacionCompleta = pagoExactoEur || pagoExactoBcv;
    
    if (!liquidacionCompleta) {
      const excedeEur = montoEur > pendienteEur + tolerancia;
      const excedeBcv = montoBcv > pendienteBcv + tolerancia;
      
      if (excedeEur || excedeBcv) {
        alert(`No se puede registrar el pago porque excede la deuda pendiente.\n\nDeuda pendiente: ${Math.max(0, pendienteEur).toFixed(2)} EUR / ${Math.max(0, pendienteBcv).toFixed(2)} Bs\nPago intentado: ${montoEur.toFixed(2)} EUR / ${montoBcv.toFixed(2)} Bs`);
        return;
      }
    }
    
    let montoEurFinal = montoEur;
    let montoBcvFinal = montoBcv;
    
    if (pagoExactoEur) montoEurFinal = pendienteEur;
    if (pagoExactoBcv) montoBcvFinal = pendienteBcv;

    if (liquidacionCompleta) {
      if (!confirm(`Este pago liquidará la deuda pendiente.\n¿Deseas continuar?`)) return;
    }

    await registrarPago(id, montoEurFinal, montoBcvFinal);
    
    if (liquidacionCompleta) {
      for (const deuda of deudasActivas) {
        await marcarDeudaComoPagada(deuda.id);
      }
      alert(`Deuda liquidada completamente. Se han marcado ${deudasActivas.length} compras como pagadas.`);
    }

    setPago({ eur: "", bcv: "" });
    cargarDatos();
  }

  // Eliminar historial de pagos
  async function handleEliminarHistorial() {
    if (confirm("¿Estás seguro de que deseas eliminar TODO el historial de pagos de este cliente? Esta acción no se puede deshacer.")) {
      await eliminarHistorialPagos(id);
      setShowDeleteHistorialModal(false);
      cargarDatos();
      alert("Historial de pagos eliminado correctamente.");
    }
  }

  // Editar cliente
  function abrirEditar() {
    setEditData({
      nombre: cliente.nombre,
      telefono: cliente.telefono
    });
    setShowEditModal(true);
  }

  async function handleEditar() {
    await editarCliente(cliente.id, editData);
    setShowEditModal(false);
    cargarDatos();
  }

  // Eliminar cliente
  function abrirEliminar() {
    setShowDeleteModal(true);
  }

  async function handleEliminar() {
    await eliminarCliente(cliente.id);
    navigate("/clientes");
  }

  // Eliminar deuda individual
  function abrirEliminarDeuda(deuda) {
    if (deuda.pagado === 1) {
      alert("No puedes eliminar una compra que ya está pagada.");
      return;
    }
    setDeudaSeleccionada(deuda);
    setShowDeleteDeudaModal(true);
  }

  async function handleEliminarDeuda() {
    await eliminarDeuda(deudaSeleccionada.id);
    setShowDeleteDeudaModal(false);
    cargarDatos();
  }

  if (!cliente || !totales) {
    return (
      <div className="text-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const deudasActivas = deudas.filter(deuda => deuda.pagado === 0);
  const deudasPagadas = deudas.filter(deuda => deuda.pagado === 1);

  const historialItems = [
    ...pagos.map(pagoItem => ({
      ...pagoItem,
      tipo: "pago",
      detalles: deudasActivas.map(deuda => {
        const producto = productosInfo[deuda.producto_id];
        return {
          producto_nombre: producto ? producto.nombre : "Producto eliminado",
          cantidad: deuda.cantidad,
          precio_eur: deuda.precio_eur
        };
      })
    })),
    ...deudasPagadas.map(deuda => {
      const producto = productosInfo[deuda.producto_id];
      return {
        ...deuda,
        tipo: "compra_pagada",
        productoNombre: producto ? producto.nombre : "Producto eliminado",
        productoImagen: producto ? producto.imagen : null
      };
    })
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const porcentajeProgreso = totales.totalDeudaEur > 0 
    ? (totales.totalPagadoEur / totales.totalDeudaEur) * 100 
    : 0;

  return (
    <div className="text-white h-full overflow-y-auto custom-scroll w-full min-w-0">
      <div className="pr-3 w-full min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link
              to="/clientes"
              className="group p-2.5 bg-gray-800/60 rounded-xl hover:bg-gray-700/80 transition-all duration-300 hover:scale-105"
            >
              <FiArrowLeft size={20} className="text-gray-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all" />
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {cliente.nombre}
              </h1>
              <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                <FiCalendar size={12} />
                Cliente desde {new Date(cliente.fecha_registro).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/cobros/registrar/${cliente.id}`)}
              className="group px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-gray-700/25 hover:scale-105 border border-white/5"
            >
              <FiShoppingCart size={18} className="text-gray-400 group-hover:text-white group-hover:rotate-12 transition-all" />
              <span className="hidden sm:inline text-gray-300 group-hover:text-white">Registrar compra</span>
            </button>

            <button
              onClick={abrirEditar}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-105 border border-white/5"
            >
              <FiEdit size={18} className="text-gray-400 hover:text-white transition-colors" />
            </button>

            <button
              onClick={abrirEliminar}
              className="p-2.5 bg-gray-800 hover:bg-red-600/80 rounded-xl transition-all duration-300 hover:scale-105 border border-white/5"
            >
              <FiTrash2 size={18} className="text-gray-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl p-5 rounded-2xl border border-white/10 mb-6 shadow-xl">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-xl">
                <FiUser size={18} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Nombre</p>
                <p className="font-medium text-gray-200">{cliente.nombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-xl">
                <FiPhone size={18} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Teléfono</p>
                <p className="font-medium text-gray-200">{cliente.telefono || "No registrado"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-xl">
                <FiCalendar size={18} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">Registrado</p>
                <p className="font-medium text-gray-200">{new Date(cliente.fecha_registro).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 shadow-lg hover:shadow-gray-700/20 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <FiDollarSign size={20} className="text-gray-400" />
              <p className="text-gray-500 text-sm">Deuda total</p>
            </div>
            <h2 className="text-2xl font-bold text-gray-200">
              {Math.max(0, totales.totalDeudaEur).toFixed(2)} EUR
            </h2>
            <h2 className="text-xl font-bold text-gray-300">
              {Math.max(0, totales.totalDeudaBcv).toFixed(2)} Bs
            </h2>
          </div>

          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 shadow-lg hover:shadow-gray-700/20 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <FiCheckCircle size={20} className="text-emerald-400" />
              <p className="text-gray-500 text-sm">Pagado</p>
            </div>
            <h2 className="text-2xl font-bold text-emerald-400">
              {Math.max(0, totales.totalPagadoEur).toFixed(2)} EUR
            </h2>
            <h2 className="text-xl font-bold text-emerald-400">
              {Math.max(0, totales.totalPagadoBcv).toFixed(2)} Bs
            </h2>
          </div>

          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 p-5 rounded-2xl border border-white/10 shadow-lg hover:shadow-gray-700/20 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp size={20} className="text-yellow-400" />
              <p className="text-gray-500 text-sm">Pendiente</p>
            </div>
            <h2 className="text-2xl font-bold text-yellow-400">
              {Math.max(0, totales.pendienteEur).toFixed(2)} EUR
            </h2>
            <h2 className="text-xl font-bold text-yellow-400">
              {Math.max(0, totales.pendienteBcv).toFixed(2)} Bs
            </h2>

            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progreso</span>
                <span className="font-mono text-gray-400">{porcentajeProgreso.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 via-emerald-500 to-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, porcentajeProgreso)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Registrar pago */}
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl p-5 rounded-2xl border border-white/10 mb-8 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gray-800 rounded-xl">
              <FiCreditCard size={18} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Registrar pago</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="number"
              step="0.01"
              placeholder="Monto en EUR"
              value={pago.eur}
              onChange={handleEUR}
              className="p-3 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all focus:ring-1 focus:ring-gray-500/50 placeholder-gray-500 text-white"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Monto en Bs"
              value={pago.bcv}
              onChange={handleBCV}
              className="p-3 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all focus:ring-1 focus:ring-gray-500/50 placeholder-gray-500 text-white"
            />
          </div>

          <button
            onClick={handleRegistrarPago}
            className="w-full bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-gray-700/25 hover:scale-[1.02] border border-white/5 text-gray-200 hover:text-white"
          >
            Registrar pago
          </button>
        </div>

        {/* Compras activas */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-800 rounded-xl">
              <FiPackage size={18} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Compras activas</h2>
          </div>
          <button
            onClick={() => setShowDeleteHistorialModal(true)}
            className="group flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-red-600/80 rounded-xl text-sm transition-all duration-300 hover:scale-105 border border-white/5"
          >
            <FiTrash size={14} className="text-gray-400 group-hover:text-white" />
            <span className="text-gray-400 group-hover:text-white">Eliminar historial</span>
          </button>
        </div>
        
        <div className="mb-8 space-y-3">
          {deudasActivas.length === 0 && (
            <div className="text-center py-8 bg-gray-900/40 rounded-2xl border border-white/5">
              <FiPackage className="text-4xl text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500">No tiene compras activas.</p>
            </div>
          )}

          {deudasActivas.map((d) => {
            const producto = productosInfo[d.producto_id];
            return (
              <div
                key={d.id}
                className="group bg-gradient-to-r from-gray-900/80 to-gray-800/40 p-4 rounded-xl border border-white/10 hover:border-gray-600/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {producto && producto.imagen ? (
                      <img 
                        src={producto.imagen} 
                        alt={producto.nombre}
                        className="w-14 h-14 object-cover rounded-xl shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center">
                        <FiPackage className="text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-lg text-white">
                        {producto ? producto.nombre : "Producto eliminado"}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1">
                        <p className="text-gray-400">Cantidad: {d.cantidad} unidades</p>
                        <p className="text-gray-400">Precio: {d.precio_eur.toFixed(2)} EUR / {d.precio_bcv.toFixed(2)} Bs</p>
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <FiCalendar size={10} />
                          {new Date(d.fecha).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => abrirEliminarDeuda(d)}
                    className="p-2 bg-gray-800 hover:bg-red-600/80 rounded-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <FiTrash2 size={14} className="text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Historial */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gray-800 rounded-xl">
            <FiClock size={18} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Historial</h2>
        </div>
        
        <div className="space-y-3">
          {historialItems.length === 0 && (
            <div className="text-center py-8 bg-gray-900/40 rounded-2xl border border-white/5">
              <FiClock className="text-4xl text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500">No hay registros en el historial.</p>
            </div>
          )}

          {historialItems.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300"
            >
              {item.tipo === "pago" ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400 font-medium">Pago registrado</span>
                    <span className="text-gray-400 font-semibold">— {item.monto_eur.toFixed(2)} EUR / {item.monto_bcv.toFixed(2)} Bs</span>
                  </div>
                  {item.detalles && item.detalles.length > 0 && (
                    <>
                      <p className="text-gray-400 text-sm mt-2 mb-1">Pagó por:</p>
                      <div className="pl-4 space-y-1">
                        {item.detalles.map((detalle, idx) => (
                          <p key={idx} className="text-gray-500 text-sm flex items-center gap-2">
                            <FiCheckCircle size={12} className="text-emerald-400" />
                            {detalle.producto_nombre} ({detalle.cantidad} unidades) — {detalle.precio_eur.toFixed(2)} EUR
                          </p>
                        ))}
                      </div>
                    </>
                  )}
                  <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                    <FiCalendar size={10} />
                    {new Date(item.fecha).toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 font-medium">Compra pagada</span>
                    <span className="text-gray-400 font-semibold">— {item.productoNombre}</span>
                  </div>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    <FiPackage size={12} />
                    Cantidad: {item.cantidad} unidades
                  </p>
                  <p className="text-gray-500 text-sm">
                    Precio: {item.precio_eur.toFixed(2)} EUR / {item.precio_bcv.toFixed(2)} Bs
                  </p>
                  <p className="text-gray-600 text-xs mt-2 flex items-center gap-1">
                    <FiCalendar size={10} />
                    {new Date(item.fecha).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Modales */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-white/10 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gray-800 rounded-xl">
                <FiEdit size={24} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Editar cliente</h2>
            </div>

            <input
              type="text"
              placeholder="Nombre"
              value={editData.nombre}
              onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
              className="w-full p-3 mb-3 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all text-white placeholder-gray-500"
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={editData.telefono}
              onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
              className="w-full p-3 mb-5 rounded-xl bg-gray-800/80 border border-white/10 focus:border-gray-500 outline-none transition-all text-white placeholder-gray-500"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition text-gray-300">
                Cancelar
              </button>
              <button onClick={handleEditar} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl transition shadow-lg text-white">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-white/10 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-600/20 rounded-xl">
                <FiTrash2 size={24} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-400">¿Eliminar cliente?</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Esta acción eliminará al cliente, sus deudas y sus pagos.
              <br />
              <strong className="text-red-400">No se puede deshacer.</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition text-gray-300">
                Cancelar
              </button>
              <button onClick={handleEliminar} className="px-5 py-2 bg-red-600/80 hover:bg-red-600 rounded-xl transition shadow-lg text-white">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDeudaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-white/10 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-600/20 rounded-xl">
                <FiTrash2 size={24} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-400">¿Eliminar esta compra?</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Esta acción eliminará la compra seleccionada y restaurará el stock del producto.
              <br />
              <strong className="text-red-400">No se puede deshacer.</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteDeudaModal(false)} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition text-gray-300">
                Cancelar
              </button>
              <button onClick={handleEliminarDeuda} className="px-5 py-2 bg-red-600/80 hover:bg-red-600 rounded-xl transition shadow-lg text-white">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteHistorialModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 rounded-2xl border border-white/10 w-96 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-600/20 rounded-xl">
                <FiTrash size={24} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-400">¿Eliminar historial?</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Esta acción eliminará todos los pagos registrados de este cliente.
              <br />
              <strong className="text-red-400">No se puede deshacer.</strong>
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteHistorialModal(false)} className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition text-gray-300">
                Cancelar
              </button>
              <button onClick={handleEliminarHistorial} className="px-5 py-2 bg-red-600/80 hover:bg-red-600 rounded-xl transition shadow-lg text-white">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}