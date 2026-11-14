<!-- i18n-header -->
> 🌐 **Sprache:** [English](../../en/data/README.md) · [Español](../../es/data/README.md) · [中文](../../zh/data/README.md) · **Deutsch** · [Italiano](../../it/data/README.md)
> 🕒 **Dokumentationsdatum:** 2026-11-14 15:35 · **Quelle:** `data/README.md`
> ⚠️ Maschinell übersetzter Entwurf, Prüfung durch Muttersprachler ausstehend.
<!-- /i18n-header -->

# data/

## Was hierher gehört

- `campos_de_prueba.yml` — die fünf Objekte der Aufgabenstellung, mit Koordinaten und dem, was in
  jedem zu sehen sein sollte. **Lies den Kopf der Datei: Die fünf Koordinaten sind verifiziert (14. Nov., SIMBAD über Harvard-Spiegel); die `campos_extra` nicht.**
- Kleine Referenztabellen (zugeschnittene Kataloge, Zielobjektlisten).

## Was NICHT hierher gehört

**Nichts Schweres und nichts Heruntergeladenes.** Konkret:

- FITS-Dateien. Ein SPHEREx-MEF wiegt rund 70 MB.
- Ausschnitte, gerenderte PNG, Caches.
- Von IRSA, vom CDS oder woher auch immer heruntergeladene Daten.

All das gehört nach `data/cache/`, das in `.gitignore` steht. Wenn eine Datendatei in einem `git
status` auftaucht, wurde etwas falsch gemacht.

## data/cache/

Lokaler, nicht versionierter Arbeitsordner. Das Backend legt ihn beim Start an.

Vorgeschlagene Struktur:

```
data/cache/
├── fits/        # cutouts bajados de IRSA
├── png/         # fotogramas renderizados
└── meta/        # respuestas JSON cacheadas
```

**Er wird beim Serverstart mit den fünf Testfeldern vorgewärmt.** Die Demo vor der Jury
wird nie mit einer kalten Abfrage gemacht.

## Sicherheitshinweis

Alles, was heruntergeladen wird, ist **nicht vertrauenswürdiger Inhalt**. Speichere es in einem eigenen Ordner, getrennt vom
Code, und übergib den Skripten die Pfade als Argument, statt einen Interpreter aus
dem Datenordner heraus auszuführen.
