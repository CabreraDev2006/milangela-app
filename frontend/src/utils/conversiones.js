// ---------------------------------------------------------
//  COP → EUR  (Yadio API) — versión frontend
// ---------------------------------------------------------
export async function convertirCopAEur(cop) {
    try {
      const url = "https://co.dolarapi.com/v1/cotizaciones/eur";
      const r = await fetch(url);
      const data = await r.json();
  
      const eur_to_cop = parseFloat(data.venta);
      return (1 / eur_to_cop) * cop;
  
    } catch (e) {
      console.error("Error COP→EUR:", e);
      return 0;
    }
  }
  
  // ---------------------------------------------------------
  //  EUR → Bs BCV  (DolarApi.com) — versión frontend
  // ---------------------------------------------------------
  export async function convertirEurABcv(eur) {
    try {
      const url = "https://ve.dolarapi.com/v1/euros/oficial";
      const r = await fetch(url);
      const data = await r.json();
  
      const tasa = parseFloat(data.promedio);
      return eur * tasa;
  
    } catch (e) {
      console.error("Error EUR→BCV:", e);
      return 0;
    }
  }
  