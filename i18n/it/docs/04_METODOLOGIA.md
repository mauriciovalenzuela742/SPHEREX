<!-- i18n-header -->
> 🌐 **Lingua:** [English](../../en/docs/04_METODOLOGIA.md) · [Español](../../es/docs/04_METODOLOGIA.md) · [中文](../../zh/docs/04_METODOLOGIA.md) · [Deutsch](../../de/docs/04_METODOLOGIA.md) · **Italiano**
> 🕒 **Data della documentazione:** 2026-11-14 15:35 · **Fonte:** `docs/04_METODOLOGIA.md`
> ⚠️ Bozza tradotta automaticamente, in attesa di revisione di un madrelingua.
<!-- /i18n-header -->

# 04 — Metodologia: quattro persone, quattro agenti, 24 ore

Il rischio principale di un team di quattro con agenti non è restare senza idee: è **pestarsi i piedi**.
Quattro agenti che scrivono in fretta sullo stesso repository producono conflitti, codice duplicato e
un branch `main` rotto alle tre di notte. Questo documento è l'accordo perché ciò non accada.

---

## Ruoli

Quattro ruoli, ciascuno responsabile di alcuni file. (In questo team di sei, D si divide in D1 accesso e D2
fotogrammi, e V in V1 blink e V2 cielo; vedi [`README.md`](../README.md) §3.) **Responsabile** significa: quella persona decide, gli altri
chiedono. Non significa che lavori da sola.

### D — Dati (backend / IRSA)
Responsabile di `scaffold/backend/app/irsa/`, `scaffold/backend/app/cache/`.
Interroga SIA2, scarica i cutout, legge i MEF, raggruppa per banda, risolve il WCS e le lunghezze d'onda.
È il percorso critico: **se questo non funziona, non c'è progetto.**
Profilo adatto: chi ha più dimestichezza con Python scientifico e con l'astronomia osservativa.

### V — Visore (frontend)
Responsabile di `scaffold/frontend/src/`.
Aladin Lite, il pannello di blink, i controlli (stiramento, colore, fps), l'URL interrogabile.
Profilo adatto: chi ha più dimestichezza con il web moderno.

### C — Scienza e verifica
Responsabile di `data/campos_de_prueba.yml`, `tests/`, `docs/`.
Verifica che ciò che si mostra sia corretto: che il ritaglio sia del cielo che dice, che l'oggetto
sia dove Gaia prevede, che lo spettro non sia un artefatto. **È chi ha il permesso di dire
«questo è sbagliato» senza dover proporre la correzione.**
Profilo adatto: chi ha più criterio astronomico. In questo team, naturalmente dal lato della fisica.

### N — Narrativa e consegna
Responsabile di `README.md`, la demo, il pitch e il modulo di consegna.
Comincia a lavorare **dall'ora 0**, non alla fine. L'errore classico degli hackathon è lasciare la
consegna alle ultime due ore e scoprire che manca metà del modulo.
Profilo adatto: chi parla meglio in pubblico, perché è anche chi presenta.

> **I ruoli non sono gabbie.** A partire dall'ora 12, quando il percorso critico è sbloccato, D e
> V si spartiscono i punti extra. Ma C e N **non si dissolvono**: se nessuno verifica e nessuno prepara
> la consegna, il progetto viene consegnato in ritardo e con errori.

---

## Come si coordina il codice

**Trunk-based con branch brevi.** `main` deve sempre avviarsi.

```bash
git switch -c d/sia2-epochs      # inicial del rol + tema
# ... trabajo ...
git push -u origin d/sia2-epochs
# PR. Lo mira otro. Se mergea.
```

Regole:

1. **Nessuno fa push direttamente su `main`.** Né tu né il tuo agente.
2. **I branch vivono meno di 3 ore.** Se un branch dura di più, il compito era troppo grande.
3. **Un PR lo rivede una persona, non un agente.** Guardare il diff richiede due minuti e evita ore.
4. **Il contratto dell'API si cambia prima in `docs/03_ARQUITECTURA.md`** e si avvisa, prima di toccare
   il codice. Un cambio silenzioso di contratto blocca un altro senza che se ne accorga.
5. **Niente FITS nel repository.** `data/cache/` è in `.gitignore`.

### Worktree: una cartella per persona

Se due persone (o due agenti) lavorano nella stessa cartella, si sovrascrivono senza avviso. Con
`git worktree` ciascuno ha la sua copia sullo stesso repository:

```bash
git worktree add ../spherex-d d/sia2-epochs
cd ../spherex-d
```

È la differenza tra quattro agenti che collaborano e quattro agenti che litigano per gli stessi file.

---

## Il ciclo di 90 minuti

L'hackathon si divide in blocchi di 90 minuti. Alla fine di ogni blocco, **cinque minuti in piedi**,
tutti, con il comando `/standup`:

1. **Cosa è rimasto funzionante** — non «cosa ho fatto», ma cosa si può aprire e guardare.
2. **Cosa è bloccato e da chi.**
3. **Cosa faccio nei prossimi 90.**

Cinque minuti. Senza schermi. Se qualcuno ha bisogno di più, se ne parla a parte.

Perché 90: è sufficiente per finire qualcosa e abbastanza breve perché una strada sbagliata non costi mezza notte.

---

## Come si usa un agente qui

Questo è ciò che separa un team che usa gli agenti da uno che gli agenti battono.

**Una sessione per fronte.** Non mescolare il backend dei dati con il frontend in una stessa sessione di
Claude Code. Il contesto si contamina e l'agente comincia a commettere errori sciocchi. Se cambi
argomento, sessione nuova, con `/traspaso` se serve portarti dietro il contesto.

**L'agente propone, la persona decide.** Per qualsiasi cosa che tocchi più di due file: piano
prima, approvazione dopo. In un hackathon la tentazione di lasciarlo correre è enorme ed è il modo
più rapido di ritrovarsi con 2.000 righe che nessuno capisce alle 5 del mattino.

**Verifica l'artefatto, non il rapporto.** Che l'agente dica «ora funziona» è un dato, non un fatto.
Apri l'URL. Guarda l'immagine. Conta le epoche. Non è sfiducia: è che l'agente non può
vedere lo schermo.

**Quando qualcosa non riesce al terzo tentativo, cambia approccio, non prompt.** Se hai fatto tre tentativi
correggendo la stessa cosa, il problema non è come l'hai chiesto.

**Non lasciare mai che un agente decida da solo l'ambito.** L'ambito lo fissa il team con il piano di
[`05_PLAN_24H.md`](05_PLAN_24H.md). Un agente, se lo lasci fare, costruisce tutti i punti della sfida
a metà invece di tre completi.

**Usa i subagent per ciò che sporca il contesto.** Cercare nella documentazione di IRSA, provare
20 query SIA2, rivedere la UI: questo va a `explorador-datos`, `revisor-cientifico` o
`revisor-interfaz`, che restituiscono la conclusione senza il superfluo.

---

## Ripartizione tra Claude Code e Antigravity

Se nel team convivono i due strumenti, la ripartizione predefinita è **per file**, mai per
argomento:

| Strumento | File |
|---|---|
| Claude Code | `backend/`, `tests/`, `docs/` |
| Antigravity | `frontend/` |

Due agenti che modificano lo stesso file si sovrascrivono senza avviso, e nessuno dei due te lo dirà.

---

## Definizione di «finito»

Un compito è finito quando:

- [ ] Funziona con **almeno un campo reale** di `data/campos_de_prueba.yml`.
- [ ] Un'altra persona l'ha aperto e l'ha visto funzionare.
- [ ] Ciò che non è stato coperto è detto ad alta voce (bande mancanti, casi non provati).
- [ ] Non ha rotto nulla che già funzionava (`/chequeo-demo`).

Non è finito perché un agente ha detto che lo è.

---

## Le tre soste obbligatorie

Sono le uniche cose che non si negoziano, qualunque cosa accada al codice:

| Momento | Cosa succede |
|---|---|
| **T − 6 h** | **Congelamento dell'ambito.** Non si comincia nulla di nuovo. Si corregge e si rifinisce solo ciò che esiste |
| **T − 4 h** | **Demo registrata.** Il video deve essere pronto anche se l'applicazione continua a migliorare. Se poi migliora, si registra di nuovo. Se non c'è tempo, il video c'è già |
| **T − 2 h** | **Consegna caricata.** Modulo completo, link inseriti, dichiarazione d'uso dell'IA scritta. Se resta tempo, si modifica; ma **è già consegnato** |

`T` è l'ora di chiusura delle consegne dell'evento locale. Nell'evento di Santiago, JP ha confermato il 14 nov
(comunicato in diretta dall'organizzazione) che è alle **11:00 di domenica 15** ([`08_REGLAS_DEL_EVENTO.md`](08_REGLAS_DEL_EVENTO.md)).
È il numero che ordina tutto il resto.

Il progetto che vince non è quello con più codice. È quello che arriva intero.
