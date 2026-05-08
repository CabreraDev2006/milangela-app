const { ipcMain } = require("electron")
const conversion = require("./conversion")

module.exports = function registerConversionAPI() {

  ipcMain.handle("conversion:cop-eur", async () => {
    return await conversion.copToEur()
  })

  ipcMain.handle("conversion:eur-bcv", async () => {
    return await conversion.eurToBcv()
  })

  ipcMain.handle("conversion:get-rates", async () => {
    return {
      copEur: await conversion.copToEur(),
      eurBcv: await conversion.eurToBcv()
    }
  });
  

}
