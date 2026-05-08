import initSqlJs from "sql.js/dist/sql-wasm.js";

let db = null;
let SQLLib = null;
const STORAGE_KEY = "milangela_db";

async function getSQL() {
  if (SQLLib) return SQLLib;

  SQLLib = await initSqlJs({
    locateFile: () => "sql-wasm.wasm"
  });

  return SQLLib;
}

// Uint8Array → base64
function uint8ToBase64(bytes) {
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// base64 → Uint8Array
function base64ToUint8(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function saveDB() {
  if (!db) return;

  const data = db.export();
  const base64 = uint8ToBase64(data);
  localStorage.setItem(STORAGE_KEY, base64);
}

export async function initDB() {
  if (db) return db;

  const SQL = await getSQL();
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    const bytes = base64ToUint8(saved);
    db = new SQL.Database(bytes);
  } else {
    db = new SQL.Database();
  }

  // TABLA DE PRODUCTOS
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio_cop REAL NOT NULL,
      precio_eur REAL NOT NULL,
      precio_bcv REAL NOT NULL,
      porcentaje_ganancia REAL NOT NULL,
      ganancia_cop REAL NOT NULL,
      ganancia_eur REAL NOT NULL,
      ganancia_bcv REAL NOT NULL,
      precio_final_cop REAL NOT NULL,
      precio_final_eur REAL NOT NULL,
      precio_final_bcv REAL NOT NULL,
      stock INTEGER NOT NULL,
      imagen TEXT,
      fecha TEXT NOT NULL
    );
  `);

  // TABLA CLIENTES
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT,
      fecha_registro TEXT NOT NULL
    );
  `);

  // TABLA DEUDAS DE CLIENTES
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes_deudas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_eur REAL NOT NULL,
      precio_bcv REAL NOT NULL,
      fecha TEXT NOT NULL
    );
  `);

  // TABLA PAGOS DE CLIENTES
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes_pagos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      monto_eur REAL NOT NULL,
      monto_bcv REAL NOT NULL,
      fecha TEXT NOT NULL
    );
  `);

  // 🔥 MIGRACIÓN: Agregar columna pagado si no existe (para bases de datos existentes)
  try {
    // Intentar seleccionar la columna pagado
    db.exec("SELECT pagado FROM clientes_deudas LIMIT 1");
    console.log("✅ Columna 'pagado' ya existe en clientes_deudas");
  } catch {
    // Si no existe, agregarla (el error se captura pero no necesitamos la variable)
    console.log("📦 Agregando columna 'pagado' a clientes_deudas...");
    db.run("ALTER TABLE clientes_deudas ADD COLUMN pagado INTEGER DEFAULT 0");
    console.log("✅ Columna 'pagado' agregada exitosamente");
  }

  await saveDB();
  return db;
}