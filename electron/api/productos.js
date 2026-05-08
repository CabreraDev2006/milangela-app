const { ipcMain } = require("electron")
const productos = require("../db/productos")

module.exports = function registerProductosAPI() {

  ipcMain.handle("productos:list", () => {
    return productos.list()
  })

  ipcMain.handle("productos:create", (event, data) => {
    return productos.create(data)
  })

  ipcMain.handle("productos:delete", (event, id) => {
    return productos.delete(id)
  })
}
