const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

const registerConversionAPI = require("./api/conversion.ipc");
const conversion = require("./api/conversion");

let mainWindow = null;
let isSplashVisible = true;

// Función para obtener la ruta correcta del frontend
function getFrontendPath() {
  // En desarrollo (cuando no está empaquetado)
  if (!app.isPackaged) {
    return path.join(__dirname, "..", "frontend", "dist", "index.html");
  }
  // En producción (empaquetado)
  // Los archivos están en resources/app.asar/frontend/dist/
  return path.join(process.resourcesPath, "app.asar", "frontend", "dist", "index.html");
}

function createWindow(rates, isSplash = true) {
  const windowOptions = isSplash ? {
    width: 800,
    height: 450,
    frame: false,
    resizable: false,
    center: true,
    icon: path.join(__dirname, "assets", "icono.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  } : {
    width: 1200,
    height: 800,
    frame: false,
    icon: path.join(__dirname, "assets", "icono.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  };

  mainWindow = new BrowserWindow(windowOptions);

  // Cargar la app con la ruta correcta
  const indexPath = getFrontendPath();
  console.log("Cargando index desde:", indexPath);
  mainWindow.loadFile(indexPath);

  // Enviar tasas al frontend cuando cargue
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("app:rates", rates);
  });

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("window:isMaximized", true);
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("window:isMaximized", false);
  });
}

// Función para expandir la ventana después del splash
function expandWindow() {
  if (mainWindow && isSplashVisible) {
    isSplashVisible = false;
    mainWindow.setSize(1200, 800);
    mainWindow.center();
    mainWindow.setResizable(true);
  }
}

// ---------------------------
//  HANDLERS DE CONTROL DE VENTANA
// ---------------------------
ipcMain.handle("window:minimize", () => {
  BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.handle("window:maximize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  if (win.isMaximized()) {
    win.restore();
    win.webContents.send("window:isMaximized", false);
  } else {
    win.maximize();
    win.webContents.send("window:isMaximized", true);
  }
});

ipcMain.handle("window:restore", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  win.restore();
  win.webContents.send("window:isMaximized", false);
});

ipcMain.handle("window:close", () => {
  BrowserWindow.getFocusedWindow()?.close();
});

// Nuevo handler para expandir la ventana desde el frontend
ipcMain.handle("window:expand", () => {
  expandWindow();
});

// ---------------------------
//  INICIO DE LA APP
// ---------------------------
app.whenReady().then(async () => {
  registerConversionAPI();

  // Obtener tasas nuevas
  const copEur = await conversion.copToEur();
  const eurBcv = await conversion.eurToBcv();

  console.log("Tasas actualizadas:", { copEur, eurBcv });

  // Crear ventana pequeña para el splash screen
  createWindow({ copEur, eurBcv }, true);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});