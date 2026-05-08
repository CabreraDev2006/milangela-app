import { initDB, saveDB } from "./database";

// ---------------------------------------------------------
//  REGISTRAR PAGO DEL CLIENTE
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
