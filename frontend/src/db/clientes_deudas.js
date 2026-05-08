import { initDB, saveDB } from "./database";

// ---------------------------------------------------------
//  REGISTRAR COMPRA (DEUDA) + DESCONTAR STOCK
// ---------------------------------------------------------
export async function registrarDeuda({ cliente_id, producto_id, cantidad, precio_eur, precio_bcv }) {
  const db = await initDB();

  // 1. Registrar la deuda
  const stmt = db.prepare(`
    INSERT INTO clientes_deudas (cliente_id, producto_id, cantidad, precio_eur, precio_bcv, fecha)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    cliente_id,
    producto_id,
    cantidad,
    precio_eur,
    precio_bcv,
    new Date().toISOString()
  ]);

  stmt.free();

  // 2. Descontar stock del producto
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
