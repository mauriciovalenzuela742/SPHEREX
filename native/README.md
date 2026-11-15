# Apps nativas de AstroTRACK

Envoltorios mínimos del visor web. Abren el sitio publicado (`https://spherex-planet-x-tau.vercel.app`) en una
ventana nativa, así que usan los mismos `/api` y `/proto-api` por rewrites, sin CORS, y siempre muestran la
versión desplegada. Necesitan internet (la app lo necesita igual para traer los datos).

| Plataforma | Carpeta | Herramienta | Archivo del release |
|---|---|---|---|
| Windows | `tauri/` | Tauri 2 | `AstroTRACK-windows-*.exe` (instalador) y `.msi` |
| macOS (Intel y Apple Silicon) | `tauri/` | Tauri 2 | `AstroTRACK-macos-*.dmg` |
| Linux | `tauri/` | Tauri 2 | `.AppImage` y `.deb` |
| Android | `android/` | Capacitor 6 | `AstroTRACK-android-vX.Y.Z.apk` |
| iPhone / iPad | — | PWA | Safari → Compartir → Añadir a pantalla de inicio |

Todo se construye en GitHub Actions (`.github/workflows/release.yml`) al empujar una etiqueta `vX.Y.Z`.
Para probar sin publicar: Actions → Release → *Run workflow* (deja los archivos como artefactos del run).

## Sin firmar

- **Windows:** SmartScreen avisa «Windows protegió tu equipo» → *Más información* → *Ejecutar de todos modos*.
- **macOS:** Gatekeeper lo bloquea → clic derecho sobre la app → *Abrir*.
- **Android:** es un APK firmado con la clave de depuración. Hay que permitir «instalar apps desconocidas».
- **iPhone:** un `.ipa` exige una cuenta Apple Developer de pago (99 USD/año). Mientras tanto, la PWA.

Para firmar de verdad: certificado de código (Windows), Developer ID + notarización (macOS) y un keystore propio
(Android), guardados como secretos del repositorio. No se incluyen ahora.

## Cambiar la URL

Si el dominio de Vercel cambia, editar `app.windows[0].url` en `tauri/src-tauri/tauri.conf.json` y
`server.url` en `android/capacitor.config.json`.
