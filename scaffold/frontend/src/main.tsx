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
