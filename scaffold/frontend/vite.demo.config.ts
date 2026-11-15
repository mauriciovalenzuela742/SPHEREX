/**
 * Configuración SOLO para grabar la demo del pitch (no la usa el sitio ni Vercel).
 *
 *   npx vite --config vite.demo.config.ts --port 5191
 *
 * Igual que vite.config.ts, pero /api y /proto-api van a los mismos servidores que usa producción (vercel.json) y cada
 * respuesta se guarda en disco (.demo-cache/). La primera visita tarda lo de siempre (~20 s el grid); las siguientes
 * salen del disco al instante. Es una comodidad de grabación: los datos son los mismos que entrega el servidor real.
 */
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DESTINOS: [string, string][] = [
  ["/proto-api/", "https://spherex-prototipo-d2.vercel.app/api/"],
  ["/api/", "https://spherex-api.vercel.app/api/"],
];
const CACHE = join(fileURLToPath(new URL(".", import.meta.url)), ".demo-cache");

function cacheDemo(): Plugin {
  return {
    name: "cache-demo",
    configureServer(server) {
      mkdirSync(CACHE, { recursive: true });
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        const d = DESTINOS.find(([p]) => url.startsWith(p));
        if (!d || (req.method && req.method !== "GET")) return next();
        const destino = d[1] + url.slice(d[0].length);
        const clave = createHash("sha1").update(destino).digest("hex");
        const cuerpo = join(CACHE, clave + ".bin");
        const meta = join(CACHE, clave + ".json");
        if (existsSync(cuerpo) && existsSync(meta)) {
          const m = JSON.parse(readFileSync(meta, "utf8"));
          res.statusCode = m.status ?? 200;
          res.setHeader("content-type", m.type);
          res.setHeader("x-demo-cache", "hit");
          res.end(readFileSync(cuerpo));
          return;
        }
        let ultimo = "";
        for (let intento = 0; intento < 3; intento++) {
          try {
            const r = await fetch(destino);
            const buf = Buffer.from(await r.arrayBuffer());
            const type = r.headers.get("content-type") ?? "application/octet-stream";
            // También se guarda el 404 («no hay visita»): es una respuesta definitiva, no un fallo pasajero.
            if (r.ok || r.status === 404) {
              writeFileSync(cuerpo, buf);
              writeFileSync(meta, JSON.stringify({ url: destino, type, status: r.status }));
            }
            res.statusCode = r.status;
            res.setHeader("content-type", type);
            res.end(buf);
            return;
          } catch (e) {
            ultimo = String(e);
          }
        }
        res.statusCode = 502;
        res.end(ultimo);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), cacheDemo()],
  server: { port: 5191, strictPort: true },
});
