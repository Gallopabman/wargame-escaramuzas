# Gremios de la Niebla

Juego web de **gestión de campaña** basado en el wargame de escaramuzas de
este repositorio. Es un "manager": tú diriges a tu gremio entre batallas y las
batallas se simulan solas con las reglas del juego de mesa, narradas como una
crónica.

- **Un jugador** contra **tres gremios rivales** controlados por la IA, cada uno
  con su personalidad (cooperativa, codiciosa o equilibrada).
- **7 gremios** jugables, con sus datacards, habilidades y base.
- Campañas de **4, 8 o 12 sesiones**.
- Se guarda solo en el navegador.

## Cómo jugar

Abre `index.html` con doble clic (Chrome, Edge o Firefox). No hace falta
instalar nada ni conexión a internet; con conexión se cargan además las
tipografías de Google Fonts.

En la pestaña **Cómo se juega** del propio juego tienes las reglas. En
resumen, cada sesión tiene cuatro fases:

1. **Encargos:** por turnos, mandas miniaturas a las locaciones del mapa
   (bloqueándolas para los demás) o a los edificios de tu base.
2. **Batalla:** eliges alineación, postura y órdenes; la batalla se simula.
3. **Resolución:** recompensas, heridas, proezas y avance de la Niebla.
4. **Preparación:** subes niveles, compras equipo, reclutas y construyes.

Gana quien tenga más **Renombre** al final… si la **Niebla Hambrienta** no
devora antes la ciudad, porque entonces **perdéis todos**.

## Qué sale del diseño y qué está inventado

**Del diseño del repositorio** (`01_reglas_basicas.md`, `05_campana.md`,
`03_facciones/`):

- Las reglas de batalla: 3D6 con cada dado por separado y umbral 6; el 1 falla
  y el 6 acierta y explota; activación alternada con puntos de acción (hay que
  gastar al menos 1); combate mutuo siempre, empezando quien lo inicia; parar,
  esquivar y defensa reactiva; doble parada, doble golpe y rompearmaduras;
  ayudas (repetir un dado y dado extra); carga a Movimiento + 1D3 + 1; salir
  de un combate con Agilidad difícil; disparo con defensa y cobertura (5+);
  disparar a un combate; reacción por falta de miniaturas; Vida de 2 a 5 y
  Daño de 1 a 3.
- La campaña: fases Encargos → Batalla → Resolución → Preparación, encargos
  rápidos y lentos, locaciones bloqueables y edificios gratis en la base,
  slots dobles, Experiencia en pozo común con tope de brecha, Influencia,
  tiers en las sesiones 1/3/6 (formato de 8), proezas y títulos,
  cicatrices, banda inicial de 5 desde datacards, equipo de tier 3 solo en
  batallas y mazmorras, y los 7 gremios de la lluvia de ideas.

**Inventado para el juego** (el diseño aún no lo define):

- El nombre del juego, la Amenaza (*La Niebla Hambrienta*) y sus números:
  medidor de 10 + 3 × sesiones, avance de 6 + tier por sesión, eventos de la
  línea de tiempo, encargos más peligrosos a partir del 50% y una locación
  devorada por sesión a partir del 75%.
- Todas las datacards, habilidades de gremio concretas, equipo, precios,
  locaciones, edificios, escenarios, proezas, tabla de heridas, tabla de
  venganza al despedir, costes de nivel (3 + 2 × nivel) y mantenimiento (1
  por miniatura y por edificio).
- **Ajustes de equilibrio** hechos con simulaciones (no están en el diseño):
  defenderse de un disparo cuesta 1 punto de acción; las armas pesadas y los
  hechizos son *lentos* (un disparo por activación); el Báculo hace Daño 1 pero
  ignora la armadura; la doble parada solo vale una vez por combate; el veneno
  se aplica con cualquier impacto; las bandas despliegan a 10"; una banda con
  menos de 3 miniaturas recibe reclutas novatos gratis.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html`, `css/estilo.css` | Página y estilos. |
| `js/iconos.js` | Iconos en línea (de `assets/iconos/`). |
| `js/util.js` | Azar reproducible, dados y nombres. |
| `js/datos.js` | Gremios, datacards, equipo, locaciones, escenarios, eventos. |
| `js/combate.js` | Motor de batallas y crónica. |
| `js/campana.js` | Fases de la campaña, economía, Amenaza, guardado. |
| `js/ia.js` | IA de los gremios rivales (también piloto automático). |
| `js/ui.js` | Interfaz. |
| `tests/` | Pruebas y herramientas de equilibrio (necesitan Node.js). |

## Pruebas

Con [Node.js](https://nodejs.org):

```
node tests/prueba_batalla.js 150         # equilibrio de batallas entre gremios
node tests/diagnostico.js 60             # rendimiento de cada datacard
node tests/simular_campana.js 20         # campañas completas en piloto automático
node tests/rangos_gremios.js 56 8        # posición media de cada gremio
node tests/prueba_interfaz.js caballeros 8   # una campaña entera a través de la interfaz
```

`tests/vista_previa.html?fase=batalla&sesion=3` abre una campaña de ejemplo
ya avanzada, útil para revisar pantallas.

## Créditos

Iconos de [game-icons.net](https://game-icons.net) bajo licencia
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Ver `CREDITOS.md`.
