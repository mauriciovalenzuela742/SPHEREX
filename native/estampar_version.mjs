// Estampa la versión del release en los envoltorios nativos. La fuente única es la etiqueta git (vX.Y.Z):
// el workflow de release llama a este script con X.Y.Z y así el nombre de los archivos y la versión que
// lleva cada app por dentro coinciden con el release.
//
//   node native/estampar_version.mjs tauri   0.4.2   -> tauri.conf.json y Cargo.toml (Windows, macOS, Linux)
//   node native/estampar_version.mjs android 0.4.2   -> versionName/versionCode del proyecto Android generado
//
// versionCode = mayor*10000 + menor*100 + parche (0.4.2 -> 402): crece con cada versión, como pide Android.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const [, , destino, version] = process.argv;
const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(version ?? "");
if (!m || !["tauri", "android"].includes(destino ?? "")) {
  console.error("uso: node native/estampar_version.mjs <tauri|android> <X.Y.Z>");
  process.exit(1);
}
const codigo = Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]);

function reemplazar(ruta, patron, nuevo, etiqueta) {
  const antes = readFileSync(ruta, "utf8");
  if (!patron.test(antes)) {
    console.error(`no encontré ${etiqueta} en ${ruta}`);
    process.exit(1);
  }
  writeFileSync(ruta, antes.replace(patron, nuevo));
  console.log(`${ruta}: ${etiqueta} = ${version}`);
}

if (destino === "tauri") {
  const base = join(aqui, "tauri", "src-tauri");
  reemplazar(join(base, "tauri.conf.json"), /("version"\s*:\s*")[^"]+(")/, `$1${version}$2`, "version");
  reemplazar(join(base, "Cargo.toml"), /^(version\s*=\s*")[^"]+(")/m, `$1${version}$2`, "version");
} else {
  const gradle = join(aqui, "android", "android", "app", "build.gradle");
  reemplazar(gradle, /versionCode\s+\d+/, `versionCode ${codigo}`, "versionCode");
  reemplazar(gradle, /versionName\s+"[^"]*"/, `versionName "${version}"`, "versionName");
  reemplazar(join(aqui, "android", "package.json"), /("version"\s*:\s*")[^"]+(")/, `$1${version}$2`, "version");
}
