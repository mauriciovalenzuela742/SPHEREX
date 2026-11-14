<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/data/README.md) · [Español](../../es/data/README.md) · [中文](../../zh/data/README.md) · [Deutsch](../../de/data/README.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `data/README.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# data/

## Cosa va qui

- `campos_de_prueba.yml` — i cinque oggetti del testo della sfida, con coordinate e cosa dovrebbe vedersi in
  ciascuno. **Leggi l'intestazione del file: le cinque coordinate sono verificate (14 nov, SIMBAD tramite mirror di Harvard); i `campos_extra`, no.**
- Piccole tabelle di riferimento (cataloghi ritagliati, liste di obiettivi).

## Cosa NON va qui

**Niente di pesante e niente di scaricato.** In concreto:

- File FITS. Un MEF di SPHEREx pesa circa 70 MB.
- Ritagli, PNG renderizzati, cache.
- Dati scaricati da IRSA, dal CDS o da qualunque altro posto.

Tutto questo va in `data/cache/`, che è in `.gitignore`. Se un file di dati compare in un `git
status`, qualcosa è stato fatto male.

## data/cache/

Cartella di lavoro locale, non versionata. La crea il backend all'avvio.

Struttura suggerita:

```
data/cache/
├── fits/        # cutouts bajados de IRSA
├── png/         # fotogramas renderizados
└── meta/        # respuestas JSON cacheadas
```

**Si preriscalda con i cinque campi di prova all'avvio del server.** La demo davanti alla giuria
non si fa mai con una query a freddo.

## Nota di sicurezza

Tutto ciò che viene scaricato è **contenuto non attendibile**. Salvalo nella sua cartella, separata dal
codice, e passa i percorsi come argomento agli script invece di eseguire un interprete dall'interno
della cartella dei dati.
