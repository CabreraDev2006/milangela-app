const fetch = require("node-fetch");

module.exports = {
  // ---------------------------------------------------------
  //  COP → EUR  (Yadio API)
  // ---------------------------------------------------------
  async copToEur() {
    try {
      const url = "https://co.dolarapi.com/v1/cotizaciones/eur";
      const r = await fetch(url);
      const data = await r.json();

      const eur_to_cop = parseFloat(data.venta);
      return 1 / eur_to_cop;

    } catch (e) {
      console.error("Error COP→EUR:", e);
      return 0;
    }
  },

  // ---------------------------------------------------------
  //  EUR → Bs BCV  (DolarApi.com)
  // ---------------------------------------------------------
  async eurToBcv() {
    try {
      const url = "https://ve.dolarapi.com/v1/euros/oficial";
      const r = await fetch(url);
      const data = await r.json();

      // ESTA es la propiedad correcta
      return parseFloat(data.promedio);

    } catch (e) {
      console.error("Error EUR→BCV:", e);
      return 0;
    }
  }
};
