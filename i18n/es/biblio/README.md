<!-- i18n-header -->
> 🌐 **Idioma:** [English](../../en/biblio/README.md) · **Español** · [中文](../../zh/biblio/README.md) · [Deutsch](../../de/biblio/README.md) · [Italiano](../../it/biblio/README.md)
> 🕒 **Fecha de la documentación:** 2026-11-14 15:35 · **Fuente:** `biblio/README.md`
> ⚠️ Copia fiel del original en español.
<!-- /i18n-header -->

# Bibliografía

Referencias organizadas **por para qué sirven**, no por orden alfabético. Cada entrada dice qué
aporta a este proyecto concreto y en qué estado de verificación está.

## Cómo leer la columna «estado»

| Marca | Significa |
|---|---|
| ✅ | Identificador y título comprobados en una búsqueda el 14-nov-2026 |
| 🟡 | Existe y es conocido, pero **no comprobamos el identificador exacto**. Verificar antes de citarlo |
| 📄 | Documentación oficial, con URL abierta y leída |

**Nunca cites de aquí sin verificar lo que esté en 🟡.** Que un paper exista no prueba que diga lo
que se le atribuye; un jurado con astrónomos de la NASA lo nota. Usa `/verifica-cifra`.

Las entradas en formato BibTeX están en [`referencias.bib`](../../../biblio/referencias.bib). Los repositorios de
código, en [`repos.md`](repos.md). Las fichas de lectura, en [`fichas/`](../../../biblio/fichas/).

---

## 1. SPHEREx: la misión y sus datos

Lo que hay que leer para entender el instrumento y no cometer errores con los datos.

| Ref | Qué es | Por qué importa | Estado |
|---|---|---|---|
| **SPHEREx Explanatory Supplement** · <https://irsa.ipac.caltech.edu/data/SPHEREx/docs/SPHEREx_Expsupp_QR_v2.0.pdf> | Documento de especificación de los productos de datos | **El documento de referencia.** La tabla 16 define los bits de `FLAGS`, que es lo que pide la viñeta de *contamination flags* | 📄 |
| **SPHEREx Archive at IRSA** · <https://caltech-ipac.github.io/spherex-archive-documentation/> | Guía de acceso y de productos | Colecciones SIA2, cutouts, estructura del MEF. **Lo más útil del día 1** | 📄 |
| Bock et al. (2026), *The SPHEREx Satellite Mission*, ApJ · arXiv:2511.02985 | Paper canónico de la misión | Es el que IRSA pide citar. Describe el catálogo previsto de objetos del sistema solar | ✅ |
| Akeson et al. (2026), *The SPHEREx Image and Spectrophotometry Processing Pipeline*, ApJS · arXiv:2511.15823 · doi:10.3847/1538-4365/ae8843 | Cómo se producen los datos que usamos | Explica el nivel 2, la calibración y los tiempos de disponibilidad | ✅ |
| Crill et al. (2025), *The SPHEREx Sky Simulator* · arXiv:2505.24856 | Simulador del cielo de SPHEREx | Útil si hace falta entender qué debería verse en un campo | ✅ |
| Korngut et al. (2026), *Instrument & Calibration* | Instrumento y calibración | Lo cita IRSA como canónico. **Identificador no comprobado** | 🟡 |
| Doré et al. (2016), *Science Impacts of the SPHEREx All-Sky Survey* · arXiv:1606.07039 | Caso científico original | Contexto para el pitch | ✅ (id); 🟡 (autoría) |
| Lim et al. (2026), *SOLO: wide-field asteroid light curve monitoring system for SPHEREx* · arXiv:2602.08037 | Sistema terrestre de apoyo al catálogo de objetos del sistema solar de SPHEREx | **Muy relevante**: explica por qué las curvas de luz hacen falta para corregir los espectros de asteroides por rotación | ✅ |

---

## 2. El precedente directo: WiseView, unWISE y Backyard Worlds

Esto es lo que el desafío pide replicar y superar. **Si solo se lee una sección, que sea esta.**

| Ref | Qué es | Por qué importa | Estado |
|---|---|---|---|
| **WiseView** · Caselden, Westin et al. · ASCL:1806.004 · <http://byw.tools/wiseview> | La herramienta que el desafío nombra como modelo | Parpadeo de coadds de WISE en el navegador, con estiramiento, color y velocidad ajustables. Cientos de descubrimientos de enanas marrones | ✅ |
| Lang (2014), *unWISE: unblurred coadds of the WISE imaging* · arXiv:1405.0308 | Los coadds que WiseView muestra | **Combinar antes de mostrar** es lo que hace visibles las fuentes débiles | 🟡 |
| Meisner et al., *unWISE Coadds: The Five-year Data Set* · arXiv:1909.05444 | Coadds extendidos | Cómo se construye una serie temporal a partir de un survey | ✅ (id) |
| Schlafly et al. (2019), *The unWISE Catalog: Two Billion Infrared Sources* · arXiv:1901.03337 | Catálogo derivado | Escala del problema | ✅ (id) |
| Meisner et al. (2022), *unTimely: a Full-sky, Time-Domain unWISE Catalog* · arXiv:2209.14327 | Catálogo resuelto en el tiempo | **El paso de «imágenes» a «dominio temporal»**, que es nuestro problema | ✅ |
| Kuchner et al. (2017), *Backyard Worlds: Planet 9* | El proyecto de ciencia ciudadana | La justificación social del desafío. Voluntarios encuentran lo que los algoritmos del survey dejan pasar | 🟡 |
| **Cool Neighbors** (Zooniverse) · <https://www.zooniverse.org/projects/coolneighbors/backyard-worlds-cool-neighbors/> | Proyecto sucesor | Usa la API de WiseView para generar su material. **Prueba de que una herramienta con URL consultable se vuelve infraestructura** | 📄 |

---

## 3. Visualización de datos astronómicos en el navegador

| Ref | Qué es | Por qué importa | Estado |
|---|---|---|---|
| Fernique et al. (2015), *Hierarchical progressive surveys (HiPS)* · arXiv:1505.02291 | El formato HiPS | El cubo de todo el cielo de SPHEREx DR1 se publica en HiPS. Describe además cómo Aladin recorre un cubo plano a plano o como animación | ✅ |
| Baumann et al. (2022), *Aladin Lite v3: Behind the Scenes of a Major Overhaul*, ADASS · 2022ASPC..532....7B | El visor que usamos | Proyecciones, teselas FITS, embebido. Lo cita el propio desafío | ✅ |
| **Aladin Lite — API** · <https://aladin.cds.unistra.fr/AladinLite/doc/API> | Documentación de referencia | `createImageSurvey`, `getEmbedCode`, `getViewDataURL` | 📄 |
| **Firefly** (IPAC) · <https://github.com/Caltech-IPAC/firefly> | El motor del Data Explorer de IRSA | El notebook oficial del cubo HiPS de SPHEREx lo usa | 📄 |
| **Astropy** · <https://docs.astropy.org> | FITS, WCS, coordenadas, visualización | `ZScaleInterval`, `AsinhStretch`, `ImageNormalize`, `SkyCoord`. **No reimplementes nada de esto** | 📄 |

---

## 4. Detección de objetos en movimiento (lo que NO vamos a implementar, pero hay que saber)

| Ref | Qué es | Por qué importa | Estado |
|---|---|---|---|
| Whidden et al. (2019), *Enabling Deep All-Sky Searches of Outer Solar System Objects* · arXiv:1901.08549 | **KBMOD**: shift-and-stack en GPU | El estado del arte para encontrar lo que no se ve en una sola imagen. ~10¹⁰ trayectorias/min | ✅ |
| *Fast algorithms for slow moving asteroids* · arXiv:1901.02492 | Trabajo asociado | Restricciones sobre la distribución de objetos del cinturón de Kuiper | ✅ (id) |
| Smotherman et al. (2024), *Detecting Moving Objects With Machine Learning* · arXiv:2405.06148 | Cribado de candidatos de KBMOD | **Dónde encaja de verdad el ML aquí**: filtrar miles de falsos positivos, no reemplazar el visor | ✅ (id); 🟡 (autoría) |
| *DECam Ecliptic Exploration Project (DEEP) VI* · arXiv:2310.03678 | KBMOD aplicado a un survey real | 105 objetos transneptunianos nuevos; tiempos de cómputo reales | ✅ |
| *Candidate Distant TNOs — New Horizons Subaru TNO Survey* · arXiv:2407.21142 | Otro uso real de KBMOD | Umbrales y tasas de falsos positivos | ✅ (id) |

---

## 5. Clasificación en tiempo real: ALeRCE (el terreno propio del laboratorio)

| Ref | Qué es | Por qué importa | Estado |
|---|---|---|---|
| Förster et al. (2021), *The ALeRCE Alert Broker*, AJ · arXiv:2008.03303 | El broker chileno de alertas de ZTF | **Ventaja del equipo.** La disciplina de clasificar en tiempo real y presentarle candidatos dudosos a un humano es justo lo que le falta a un visor | ✅ |
| Carrasco-Davis et al., *Stamp classifier* | CNN sobre recortes de ciencia/referencia/diferencia, con invarianza rotacional | **El modelo correcto de «IA» para este problema**, no un transformer de video: red chica, sobre recortes, con invarianzas elegidas a mano | 🟡 |
| Sánchez-Sáez et al., *Light curve classifier* | Random forest balanceado en dos niveles sobre rasgos de variabilidad | Para distinguir variabilidad real de artefacto | 🟡 |
| *Temporal Stamp Classifier* · arXiv:2405.15073 | Versión con eje temporal | Lo más cercano a «modelo de video» que tiene sentido aquí | ✅ (id) |

---

## 6. Planet X: el estado real de la búsqueda

| Ref | Qué es | Por qué importa | Estado |
|---|---|---|---|
| Batygin & Brown (2016), *Evidence for a Distant Giant Planet in the Solar System*, AJ 151, 22 · arXiv:1601.05438 · doi:10.3847/0004-6256/151/2/22 | La hipótesis moderna de Planet Nine | El origen del nombre del desafío | ✅ |
| Phan et al., candidato a partir de IRAS + AKARI, PASA | Un único objeto compatible en dos sondeos infrarrojos separados 23 años | **La técnica es exactamente la del desafío.** Los autores subrayan que no han descubierto Planet Nine | 🟡 (identificador y año sin comprobar) |
| *A targeted, parallax-based search for Planet Nine* · The Open Journal of Astrophysics · <https://astro.theoj.org/article/155004> | Búsqueda óptica dirigida | Sin candidatos creíbles en el campo cubierto. Útil para no exagerar en el pitch | ✅ (título y revista) |

**Para el pitch:** a noviembre de 2026 Planet Nine **no se ha encontrado**. Nunca afirmar lo contrario.

---

## 7. Modelos de video (evaluados y descartados como núcleo)

El argumento completo está en [`../docs/01_ESTADO_DEL_ARTE.md`](../docs/01_ESTADO_DEL_ARTE.md) §6.
Se listan para poder responder al jurado con precisión.

| Ref | Qué es | Estado |
|---|---|---|
| Bertasius, Wang & Torresani (2021), *Is Space-Time Attention All You Need for Video Understanding?* (**TimeSformer**), ICML · arXiv:2102.05095 | Atención separada en espacio y tiempo sobre parches de fotogramas | ✅ |
| Arnab et al. (2021), *ViViT: A Video Vision Transformer*, ICCV · arXiv:2103.15691 | Transformer de video de Google Research | ✅ |
| Tong et al. (2022), *VideoMAE* · arXiv:2203.12602 | Autoencoder enmascarado para video, eficiente en datos | ✅ |
| *VideoMAE V2: Scaling Video Masked Autoencoders with Dual Masking* · arXiv:2303.16727 | Versión escalada | ✅ |
| Ni et al. (2022), *Expanding Language-Image Pretrained Models for General Video Recognition* (**X-CLIP**) · arXiv:2208.02816 | CLIP extendido a video | ✅ |

**Resumen de por qué no:** el desafío pide un visor, no un clasificador; el preentrenamiento en video
natural no transfiere a secuencias astronómicas; no hay etiquetas en 24 horas; y los métodos clásicos
aprovechan la física del problema. Donde sí aportaría el ML es en el cribado de candidatos, y para
eso el modelo correcto es el *stamp classifier* de ALeRCE (sección 5), no un transformer de video.

---

## 8. Recursos de la agencia socia (CSA)

Usarlos suma en el criterio *Global Connection* del jurado.

| Recurso | URL |
|---|---|
| NEOSSat (misión) | <https://www.asc-csa.gc.ca/eng/satellites/neossat/> |
| NEOSSat — tutorial en Python | <https://github.com/asc-csa/NEOSSAT_Tutorial> |
| NEOSSat — datos | <https://data.asc-csa.gc.ca/dataset/neossat> |
| Canadian Astronomy Data Centre | <https://www.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/en/> |

---

## Qué falta por buscar

Honestidad sobre los límites de esta revisión, hecha el 14-nov-2026:

- No encontramos un paper de 2026 dedicado específicamente a **detección de objetos en movimiento con
  SPHEREx**. Lo más cercano es el catálogo de objetos del sistema solar descrito en el paper de misión
  y el trabajo de apoyo SOLO.
- No confirmamos si el **código fuente de WiseView** es público. Sí lo son los paquetes derivados
  (`flipbooks`, `unWISE-verse`). Ver [`repos.md`](repos.md).
- El **SIMBAD del CDS** no respondía el 14-nov; las coordenadas de los campos de prueba se verificaron
  contra el espejo de Harvard (CfA): ver
  [`../data/campos_de_prueba.yml`](../../../data/campos_de_prueba.yml).
- Las entradas marcadas 🟡 necesitan que alguien abra la fuente antes de citarlas.
