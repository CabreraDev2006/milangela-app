// src/db/cobros.js


import { initDB, saveDB } from "./database";

/**
 * Registrar varias compras (deudas) para un cliente.
 * items = [
 *   { producto_id, cantidad, precio_eur, precio_bcv }
 * ]
 */
export async function registrarCompraMultiple(cliente_id, items) {
  const db = await initDB();

  try {
    // Iniciar transacción
    db.exec("BEGIN TRANSACTION");

    for (const item of items) {
      // Registrar deuda (esto también descuenta stock)
      const stmt = db.prepare(`
        INSERT INTO clientes_deudas (cliente_id, producto_id, cantidad, precio_eur, precio_bcv, fecha)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        cliente_id,
        item.producto_id,
        item.cantidad,
        item.precio_eur,
        item.precio_bcv,
        new Date().toISOString()
      ]);

      stmt.free();

      // Descontar stock
      db.run(
        `UPDATE productos SET stock = stock - ? WHERE id = ?`,
        [item.cantidad, item.producto_id]
      );
    }

    // Confirmar transacción
    db.exec("COMMIT");

    await saveDB();
    return { ok: true };

  } catch (error) {
    console.error("Error registrando compra múltiple:", error);

    // Revertir si algo falla
    db.exec("ROLLBACK");

    return { ok: false, error };
  }
}
