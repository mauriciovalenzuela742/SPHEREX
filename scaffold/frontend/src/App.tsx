/** Esqueleto genérico. Solo comprueba que el frontend habla con el backend. */
import { useEffect, useState } from "react";

type Salud = { ok: boolean; version: string };

export default function App() {
  const [salud, setSalud] = useState<Salud | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/health")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setSalud)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 640 }}>
      <h1>Esqueleto</h1>
      <p>
        Backend:{" "}
        {error ? (
          <strong style={{ color: "crimson" }}>no responde ({error})</strong>
        ) : salud ? (
          <strong style={{ color: "green" }}>ok, versión {salud.version}</strong>
        ) : (
          "comprobando…"
        )}
      </p>
      <p style={{ color: "#666" }}>
        Si ves &quot;ok&quot;, el entorno está listo. La aplicación se construye durante el hackatón.
      </p>
    </main>
  );
}
