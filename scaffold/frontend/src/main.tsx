import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { IdiomaProvider } from "./state/idioma";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IdiomaProvider>
      <App />
    </IdiomaProvider>
  </React.StrictMode>
);

// PWA: solo en producción, para no estorbar el hot reload de Vite.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
