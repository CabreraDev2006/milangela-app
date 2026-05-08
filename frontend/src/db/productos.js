import { initDB, saveDB } from "./database";

// ---------------------------------------------------------
//  AGREGAR PRODUCTO
// ---------------------------------------------------------
export async function agregarProducto(p) {
  const db = await initDB();

  const stmt = db.prepare(`
    INSERT INTO productos 
    (nombre, precio_cop, precio_eur, precio_bcv,
     porcentaje_ganancia,
     ganancia_cop, ganancia_eur, ganancia_bcv,
     precio_final_cop, precio_final_eur, precio_final_bcv,
     stock, imagen, fecha)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    p.nombre,
    p.precio_cop,
    p.precio_eur,
    p.precio_bcv,

    p.porcentaje_ganancia,

    p.ganancia_cop,
    p.ganancia_eur,
    p.ganancia_bcv,

    p.precio_final_cop,
    p.precio_final_eur,
    p.precio_final_bcv,

    parseInt(p.stock, 10),
    p.imagen,
    new Date().toISOString()
  ]);

  stmt.free();
  await saveDB();
}

// ---------------------------------------------------------
//  LISTAR PRODUCTOS
// ---------------------------------------------------------
export async function listarProductos() {
  const db = await initDB();
  const res = db.exec("SELECT * FROM productos ORDER BY id DESC");

  if (res.length === 0) return [];

  const cols = res[0].columns;
  const rows = res[0].values;

  return rows.map(row => {
    const obj = {};
    cols.forEach((c, i) => obj[c] = row[i]);
    return obj;
  });
}

// ---------------------------------------------------------
//  🔥 NUEVO: OBTENER PRODUCTO POR ID
// ---------------------------------------------------------
export async function obtenerProducto(id) {
  const db = await initDB();

  const stmt = db.prepare(`
    SELECT * FROM productos WHERE id = ?
  `);

  const result = stmt.getAsObject([id]);
  stmt.free();

  return result;
}

// ---------------------------------------------------------
//  ELIMINAR PRODUCTO
// ---------------------------------------------------------
export async function eliminarProducto(id) {
  const db = await initDB();
  db.run("DELETE FROM productos WHERE id = ?", [id]);
  await saveDB();
}

// ---------------------------------------------------------
//  OBTENER TOTALES
// ---------------------------------------------------------
export async function obtenerTotales() {
  const db = await initDB();

  const res = db.exec(`
    SELECT 
      COUNT(*) as totalProductos,

      SUM(precio_cop) as totalCop,
      SUM(precio_final_eur) as totalEur,
      SUM(precio_final_bcv) as totalBcv,

      SUM(ganancia_cop) as totalGananciaCop,
      SUM(ganancia_eur) as totalGananciaEur,
      SUM(ganancia_bcv) as totalGananciaBcv,

      SUM(ganancia_cop * stock) as totalGananciaEstimadoCop,
      SUM(ganancia_eur * stock) as totalGananciaEstimadoEur,
      SUM(ganancia_bcv * stock) as totalGananciaEstimadoBcv,

      SUM(precio_final_cop * stock) as totalVendidoEstimadoCop,
      SUM(precio_final_eur * stock) as totalVendidoEstimadoEur,
      SUM(precio_final_bcv * stock) as totalVendidoEstimadoBcv,

      SUM(precio_final_cop) as totalPrecioFinalCop,
      SUM(precio_final_eur) as totalPrecioFinalEur,
      SUM(precio_final_bcv) as totalPrecioFinalBcv,

      SUM(stock) as totalStockGeneral
    FROM productos
  `);

  if (res.length === 0) {
    return {
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
      totalStockGeneral: 0
    };
  }

  const r = res[0].values[0];

  return {
    totalProductos: r[0] || 0,
    totalCop: r[1] || 0,
    totalEur: r[2] || 0,
    totalBcv: r[3] || 0,
    totalGananciaCop: r[4] || 0,
    totalGananciaEur: r[5] || 0,
    totalGananciaBcv: r[6] || 0,
    totalGananciaEstimadoCop: r[7] || 0,
    totalGananciaEstimadoEur: r[8] || 0,
    totalGananciaEstimadoBcv: r[9] || 0,
    totalVendidoEstimadoCop: r[10] || 0,
    totalVendidoEstimadoEur: r[11] || 0,
    totalVendidoEstimadoBcv: r[12] || 0,
    totalPrecioFinalCop: r[13] || 0,
    totalPrecioFinalEur: r[14] || 0,
    totalPrecioFinalBcv: r[15] || 0,
    totalStockGeneral: r[16] || 0
  };
}

// ---------------------------------------------------------
//  ACTUALIZAR PRODUCTO
// ---------------------------------------------------------
export async function actualizarProducto(p) {
  const db = await initDB();

  const stmt = db.prepare(`
    UPDATE productos SET
      nombre = ?,
      precio_cop = ?,
      precio_eur = ?,
      precio_bcv = ?,

      porcentaje_ganancia = ?,

      ganancia_cop = ?,
      ganancia_eur = ?,
      ganancia_bcv = ?,

      precio_final_cop = ?,
      precio_final_eur = ?,
      precio_final_bcv = ?,

      stock = ?,
      imagen = ?
    WHERE id = ?
  `);

  stmt.run([
    p.nombre,
    p.precio_cop,
    p.precio_eur,
    p.precio_bcv,

    p.porcentaje_ganancia,

    p.ganancia_cop,
    p.ganancia_eur,
    p.ganancia_bcv,

    p.precio_final_cop,
    p.precio_final_eur,
    p.precio_final_bcv,

    parseInt(p.stock, 10),
    p.imagen,
    p.id
  ]);

  stmt.free();
  await saveDB();
}

// ---------------------------------------------------------
//  RECALCULAR TODOS LOS PRODUCTOS (FRONTEND)
// ---------------------------------------------------------
export async function recalcularProductosFrontend({ copEur, eurBcv }) {
  const db = await initDB();

  const res = db.exec("SELECT * FROM productos");
  if (res.length === 0) return;

  const cols = res[0].columns;
  const rows = res[0].values;

  rows.forEach(row => {
    const p = {};
    cols.forEach((c, i) => p[c] = row[i]);

    const precio_cop = p.precio_cop;

    // Recalcular precios base
    const precio_eur = precio_cop * copEur;
    const precio_bcv = precio_eur * eurBcv;

    // Recalcular ganancias
    const ganancia_cop = precio_cop * (p.porcentaje_ganancia / 100);
    const ganancia_eur = ganancia_cop * copEur;
    const ganancia_bcv = ganancia_eur * eurBcv;

    // Precios finales
    const precio_final_cop = precio_cop + ganancia_cop;
    const precio_final_eur = precio_eur + ganancia_eur;
    const precio_final_bcv = precio_bcv + ganancia_bcv;

    db.run(
      `
      UPDATE productos SET
        precio_eur = ?, precio_bcv = ?,
        ganancia_cop = ?, ganancia_eur = ?, ganancia_bcv = ?,
        precio_final_cop = ?, precio_final_eur = ?, precio_final_bcv = ?
      WHERE id = ?
      `,
      [
        precio_eur, precio_bcv,
        ganancia_cop, ganancia_eur, ganancia_bcv,
        precio_final_cop, precio_final_eur, precio_final_bcv,
        p.id
      ]
    );
  });

  await saveDB();
}
