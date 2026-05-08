const { contextBridge, ipcRenderer } = require("electron");

// ---------------------------
//  API DE PRODUCTOS Y CONVERSIONES
// ---------------------------
contextBridge.exposeInMainWorld("api", {
  productos: {
    list: () => ipcRenderer.invoke("productos:list"),
    create: (data) => ipcRenderer.invoke("productos:create", data),
    delete: (id) => ipcRenderer.invoke("productos:delete", id)
  },

  conversion: {
    copToEur: () => ipcRenderer.invoke("conversion:cop-eur"),
    eurToBcv: () => ipcRenderer.invoke("conversion:eur-bcv"),
    getRates: () => ipcRenderer.invoke("conversion:get-rates")
  }
});

// ---------------------------
//  EVENTOS GLOBALES DESDE ELECTRON
// ---------------------------
contextBridge.exposeInMainWorld("electronAPI", {
  onRates: (callback) => ipcRenderer.on("app:rates", (_, data) => callback(data)),
  expandWindow: () => ipcRenderer.invoke("window:expand")
});

// ---------------------------
//  CONTROLES DE VENTANA
// ---------------------------
contextBridge.exposeInMainWorld("windowControls", {
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  restore: () => ipcRenderer.invoke("window:restore"),
  close: () => ipcRenderer.invoke("window:close"),

  onMaximized: (callback) => {
    ipcRenderer.on("window:isMaximized", (_, value) => callback(value));
  }
});