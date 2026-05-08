import initSqlJs from 'sqlite-wasm';

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Crear tabla si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT
    )
  `);

  // Insertar un producto de prueba
  db.run("INSERT INTO productos (nombre) VALUES ('Café')");

  dbInstance = db;
  return dbInstance;
}
