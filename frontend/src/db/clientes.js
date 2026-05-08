import { initDB, saveDB } from "./database";

// ---------------------------------------------------------
//  REGISTRAR CLIENTE
// ---------------------------------------------------------
export async function agregarCliente({ nombre, telefono }) {
  const db = await initDB();

  const stmt = db.prepare(`
    INSERT INTO clientes (nombre, telefono, fecha_registro)
    VALUES (?, ?, ?)
  `);

  stmt.run([
    nombre,
    telefono || "",
    new Date().toISOString()
  ]);

  stmt.free();
  await saveDB();
}

// ---------------------------------------------------------
//  LISTAR CLIENTES
// ---------------------------------------------------------
export async function listarClientes() {
  const db = await initDB();
  const res = db.exec("SELECT * FROM clientes ORDER BY id DESC");

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
//  OBTENER UN CLIENTE POR ID
// ---------------------------------------------------------
export async function obtenerCliente(id) {
  const db = await initDB();

  const res = db.exec(`
    SELECT * FROM clientes
    WHERE id = ${id}
    LIMIT 1
  `);

  if (res.length === 0) return null;

  const cols = res[0].columns;
  const row = res[0].values[0];

  const obj = {};
  cols.forEach((c, i) => obj[c] = row[i]);

  return obj;
}

// ---------------------------------------------------------
//  REGISTRAR DEUDA (COMPRA) + DESCONTAR STOCK
// ---------------------------------------------------------
export async function registrarDeuda({ cliente_id, producto_id, cantidad, precio_eur, precio_bcv }) {
  const db = await initDB();

  const stmt = db.prepare(`
    INSERT INTO clientes_deudas (cliente_id, producto_id, cantidad, precio_eur, precio_bcv, fecha, pagado)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    cliente_id,
    producto_id,
    cantidad,
    precio_eur,
    precio_bcv,
    new Date().toISOString(),
    0
  ]);

  stmt.free();

  db.run(
    `UPDATE productos SET stock = stock - ? WHERE id = ?`,
    [cantidad, producto_id]
  );

  await saveDB();
}

// ---------------------------------------------------------
//  OBTENER TODAS LAS DEUDAS DEL CLIENTE
// ---------------------------------------------------------
export async function obtenerDeudasCliente(clienteId) {
  const db = await initDB();

  const res = db.exec(`
    SELECT * FROM clientes_deudas
    WHERE cliente_id = ${clienteId}
    ORDER BY id DESC
  `);

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
//  ELIMINAR UNA DEUDA INDIVIDUAL (con restauración de stock)
// ---------------------------------------------------------
export async function eliminarDeuda(id) {
  const db = await initDB();
  
  // Obtener producto_id y cantidad antes de eliminar
  const deuda = db.exec(`SELECT producto_id, cantidad FROM clientes_deudas WHERE id = ${id}`);
  if (deuda.length > 0 && deuda[0].values.length > 0) {
    const producto_id = deuda[0].values[0][0];
    const cantidad = deuda[0].values[0][1];
    
    // Restaurar stock
    db.run(`UPDATE productos SET stock = stock + ? WHERE id = ?`, [cantidad, producto_id]);
  }
  
  db.run(`DELETE FROM clientes_deudas WHERE id = ?`, [id]);
  await saveDB();
}

// ---------------------------------------------------------
//  MARCAR DEUDA COMO PAGADA
// ---------------------------------------------------------
export async function marcarDeudaComoPagada(id) {
  const db = await initDB();
  db.run(`UPDATE clientes_deudas SET pagado = 1 WHERE id = ?`, [id]);
  await saveDB();
}

// ---------------------------------------------------------
//  REGISTRAR PAGO
// ---------------------------------------------------------
export async function registrarPago(cliente_id, monto_eur, monto_bcv) {
  const db = await initDB();

  const stmt = db.prepare(`
    INSERT INTO clientes_pagos (cliente_id, monto_eur, monto_bcv, fecha)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run([
    cliente_id,
    parseFloat(monto_eur) || 0,
    parseFloat(monto_bcv) || 0,
    new Date().toISOString()
  ]);

  stmt.free();
  await saveDB();
}

// ---------------------------------------------------------
//  OBTENER PAGOS DEL CLIENTE
// ---------------------------------------------------------
export async function obtenerPagosCliente(clienteId) {
  const db = await initDB();

  const res = db.exec(`
    SELECT * FROM clientes_pagos
    WHERE cliente_id = ${clienteId}
    ORDER BY id DESC
  `);

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
//  ELIMINAR HISTORIAL DE PAGOS
// ---------------------------------------------------------
export async function eliminarHistorialPagos(clienteId) {
  const db = await initDB();
  db.run(`DELETE FROM clientes_pagos WHERE cliente_id = ?`, [clienteId]);
  await saveDB();
}

// ---------------------------------------------------------
//  OBTENER TOTALES DEL CLIENTE (solo deudas NO pagadas)
// ---------------------------------------------------------
export async function obtenerTotalesCliente(clienteId) {
  const db = await initDB();

  const deuda = db.exec(`
    SELECT 
      COALESCE(SUM(precio_eur * cantidad), 0),
      COALESCE(SUM(precio_bcv * cantidad), 0)
    FROM clientes_deudas
    WHERE cliente_id = ${clienteId} AND pagado = 0
  `);

  const totalDeudaEur = deuda[0].values[0][0] || 0;
  const totalDeudaBcv = deuda[0].values[0][1] || 0;

  const pagos = db.exec(`
    SELECT 
      COALESCE(SUM(monto_eur), 0),
      COALESCE(SUM(monto_bcv), 0)
    FROM clientes_pagos
    WHERE cliente_id = ${clienteId}
  `);

  const totalPagadoEur = pagos[0].values[0][0] || 0;
  const totalPagadoBcv = pagos[0].values[0][1] || 0;

  const pendienteEur = Math.max(0, totalDeudaEur - totalPagadoEur);
  const pendienteBcv = Math.max(0, totalDeudaBcv - totalPagadoBcv);

  return {
    totalDeudaEur,
    totalDeudaBcv,
    totalPagadoEur,
    totalPagadoBcv,
    pendienteEur,
    pendienteBcv
  };
}

// ---------------------------------------------------------
//  EDITAR CLIENTE
// ---------------------------------------------------------
export async function editarCliente(id, { nombre, telefono }) {
  const db = await initDB();

  db.run(
    `UPDATE clientes SET nombre = ?, telefono = ? WHERE id = ?`,
    [nombre, telefono || "", id]
  );

  await saveDB();
}

// ---------------------------------------------------------
//  ELIMINAR CLIENTE + DEUDAS + PAGOS
// ---------------------------------------------------------
export async function eliminarCliente(id) {
  const db = await initDB();

  db.run(`DELETE FROM clientes_pagos WHERE cliente_id = ?`, [id]);
  db.run(`DELETE FROM clientes_deudas WHERE cliente_id = ?`, [id]);
  db.run(`DELETE FROM clientes WHERE id = ?`, [id]);

  await saveDB();
}