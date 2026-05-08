import { useEffect, useState } from "react";

export default function TestAPI() {
  const [copEur, setCopEur] = useState(null);
  const [eurBcv, setEurBcv] = useState(null);

  useEffect(() => {
    async function cargar() {
      const tasa1 = await window.api.conversion.copToEur();
      const tasa2 = await window.api.conversion.eurToBcv();

      setCopEur(Number(tasa1));
      setEurBcv(Number(tasa2));
    }

    cargar();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Prueba de APIs</h1>

      <p>
        1 COP → EUR:{" "}
        {copEur !== null ? copEur.toFixed(6) : "Cargando..."}
      </p>

      <p>
        1 EUR → Bs BCV:{" "}
        {eurBcv !== null ? eurBcv.toFixed(2) : "Cargando..."}
      </p>
    </div>
  );
}
