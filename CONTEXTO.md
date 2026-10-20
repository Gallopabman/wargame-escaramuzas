# Contexto para retomar el trabajo

> Léelo al empezar cada sesión. Resume en qué punto está el diseño, cómo
> trabajamos y qué toca hacer después. Última actualización: 2026-10-20.

## Qué es este proyecto

Diseño de un **wargame de escaramuzas de fantasía medieval** (miniaturas de
28–32 mm, bandas que empiezan con 5 personajes, partidas cuya duración fija
el escenario) con foco narrativo
y estructura **PvEvP**: los jugadores compiten en una campaña mientras una
**Amenaza** automática (la "IA") avanza; si la dejan actuar, la campaña la
pierden todos.

Es **mini-agnóstico pero no facción-agnóstico**: vale cualquier miniatura que
encaje con el concepto de la facción. Se está estudiando organizar el juego
en **gremios** (p. ej. *Las Hojas Afiladas*: asesinos sigilosos, rápidos y
con venenos), cada uno con subfacciones.

Inspiraciones: Warcry, Kill Team, Necromunda, Mordheim, Infinity.

Objetivos del autor: revisar el núcleo de reglas, completar huecos, hacer
simulaciones de equilibrio, crear un constructor de bandas y producir un
manual usable. Quiere un combate **letal**, con **elección real** en cada
dado, **azar controlado** y donde el **equipo elegido sea determinante**.

## Archivos

| Archivo | Contenido |
|---|---|
| `00_concepto.md` | Documento brújula: pilares de diseño y formato. |
| `01_reglas_basicas.md` | Perfil, tiradas, activación, reacciones, combate y daño. |
| `02_equipo_habilidades.md` | Rangos de valores, reglas especiales, armas, armaduras. |
| `03_facciones/` | Gremios: plantilla e ideas sin decidir. |
| `04_escenarios_especiales.md` | Terreno, escenarios, eventos (casi vacío). |
| `05_campana.md` | Campaña: marco, fases, monedas, progresión, banda inicial. |
| `decisiones.md` | Registro fechado de cada decisión y su motivo. |
| `pendientes.md` | Preguntas abiertas y huecos. **Empieza por aquí.** |
| `simulaciones/` | Simulador de combate y resultados. |
| `sesiones/` | Resúmenes de sesiones hechas fuera de VS Code (PDF). |

## Núcleo de reglas en una pantalla

- **Estadísticas:** Fuerza, Agilidad, Magia, Mente (1–5; más con magia),
  Vida (provisional 2–5), Acciones (normalmente 2; esbirros 1; élites 3),
  Movimiento (pulgadas), Especial.
- **Tiradas:** 3D6, **cada dado por separado** + modificador ≥ umbral (6 por
  defecto; 8 / 10 / 12 para difícil, compleja, imposible). 1 natural siempre
  falla; 6 natural siempre acierta, da un dado extra y activa el Crítico.
- **Ronda:** Iniciativa (1D6) → Órdenes (habilidades de banda) →
  Activaciones alternadas, una miniatura cada jugador (el ganador de la
  iniciativa empieza siempre) → Mantenimiento
  (veneno, efectos de control…).
- **Puntos de acción y reacciones** (sección 4, en revisión): al activar una
  miniatura gastas de 1 a todos sus puntos; los guardados sirven para
  reaccionar. Si ya activaste todas tus miniaturas y el rival no, puedes
  reaccionar con una tras cada activación suya.
- **Disparo:** 3D6 + Atributo + Precisión. Sin penalización por distancia; se
  puede mover y disparar, o disparar dos veces. El objetivo puede gastar sus
  puntos de acción (si los guardó) para Bloquear (Parada; solo
  con escudo) o Esquivar (Agilidad ± Esquiva contra el dado del tirador +
  su Atributo y Precisión; luego mueve 2"). Después, la **cobertura**: 1D6
  por éxito, con 5+ se anula. Disparar a un combate: 1D6 decide si das al
  aliado (1–3) o al enemigo (4–6), y pierdes 1 de Lealtad.
- **Cuerpo a cuerpo: siempre combaten los dos** (sin coste de acción). Ambos
  tiran 3D6 (con un aliado ayudando: repetir un dado; con dos: repetir y
  +1 dado) y, alternando dado a dado,
  **empezando quien inicia el combate**, deciden:
  - **Golpear** (dado + Atributo + Precisión ≥ 6): impacta.
  - **Parar** (dado + Parada ≥ 6): elimina un dado del rival; un crítico solo se
    para con otro crítico (por ahora, crítico = 6 natural).
  - **Esquivar** (dado + Agilidad ± Esquiva ≥ dado rival + su Atributo):
    elimina ese dado.
  - **Defensa reactiva** (provisional): cuando el rival declara un golpe,
    puedes gastar al momento un dado para pararlo o esquivarlo.
- **No hay Velocidad.** **Cargar:** 2 acciones, mueve a 1" e inicia el combate.
- **Salir de un combate:** Agilidad difícil (8); si fallas, el enemigo puede
  declarar un combate gratis.
- **Daño:** cada impacto hace el Daño del arma (provisional 1–3). La armadura
  resta su Reducción y pierde 1 de Durabilidad por impacto.
- **Reglas especiales:** Doble parada (escudos: un dado elimina dos), Doble
  golpe (dagas: dos golpes a la vez), Rompearmaduras (hachas: un impacto
  inutiliza la armadura).
- **Armas:** Atributo, Daño, Parada, Precisión, Alcance, Crítico, Especial.
  **Armaduras:** Esquiva, Reducción, Durabilidad, Especial.

## Lo que han enseñado las simulaciones

Perfiles de prueba inventados (Dañino con hacha, Tanque con escudo, Ágil con
dagas, Equilibrado con espada). Resultados en `simulaciones/resultados_*.txt`;
la más reciente es `resultados_combate_v3_escala{A,B}.txt`.

1. **Lo que decide es cuántos golpes hacen falta para matar.** Cambios de 1
   punto de Reducción o Daño solo importan si cambian esa cuenta.
2. **La defensa reactiva hace que aparezcan los arquetipos** (el tanque para,
   el ágil esquiva, el dañino golpea) y da más decisiones reales.
3. Con las reglas v3 (reglas especiales incluidas), **un experto gana el
   63–83%** contra quien siempre golpea (antes, 53–62%).
4. **Superar en número es muy fuerte:** con un aliado (repetir un dado) se
   gana ~73% de un duelo igualado; con dos (repetir + 1 dado), ~91%.
5. La escala grande (Vida 4–10, Daño 2–5) da casi lo mismo que la pequeña:
   solo cambia algo cuando cambia la cuenta de golpes para matar.

## Campaña en una pantalla

Ver `05_campana.md` (sesión del 2026-10-19).

- Cualquier número de jugadores, **sin máster**: los jugadores fiscalizan y
  los eventos están fijados en la línea de tiempo.
- Duraciones de 4, 8 o 12 sesiones (diseño sobre 8); **3 tiers** que se
  abren en las sesiones 1, 3 y 6.
- Ronda de campaña: **Encargos → Batalla → Resolución → Preparación**.
- Dos monedas: **Experiencia** (pozo común; sube niveles, con tope de brecha)
  e **Influencia** (equipo, reclutas, contratados, órdenes, base, locaciones).
- **Banda inicial:** 5 personajes desde datacards, algo de Influencia y una
  base. No se arma por puntos.
- **Proezas** que dan títulos; **cicatrices** como progresión negativa.
- **La Amenaza se diseña al final.**

## Próximos pasos

1. **Mecánica de reacciones:** cerrar las preguntas de la sección 4 de
   `01_reglas_basicas.md`.
2. Magia (ligada a hechizos), fase de órdenes y fase de mantenimiento.
3. Desarrollar la campaña (muchos [PENDIENTE] en `05_campana.md`).
4. Los **Críticos** no son parte del núcleo: más adelante. La **Amenaza**,
   al final.

## Cómo trabajamos

- Todo en **castellano**.
- **No inventar reglas**: lo que no está decidido se marca **[PENDIENTE]** y
  lo que se revisará con simulaciones, **[A PROBAR]**. Proponer opciones con
  una recomendación; el autor decide. Cuando pide datos, no cambiar reglas.
- Cada decisión nueva va a `decisiones.md` (con fecha y motivo) y se quita de
  `pendientes.md`.
- Al terminar una sesión, actualizar este archivo y hacer push a GitHub
  (https://github.com/Gallopabman/wargame-escaramuzas).
- **Simulaciones:** en este equipo no hay Python ni Node. El simulador
  (`simulaciones/combate_mutuo.cs`) está escrito en C# y se ejecuta desde
  scripts de PowerShell (`ejecutar_*.ps1`) que lo compilan con `Add-Type`.
  Usa minimax (juego óptimo de ambos jugadores) sobre tiradas aleatorias.
  Los .ps1 deben guardarse en UTF-8 **con BOM** para que PowerShell 5 lea bien
  las tildes.
- **Sesiones fuera de VS Code** (p. ej. en la app de Claude): el autor deja
  un resumen en PDF; se guarda en `sesiones/` y se reparte en los archivos.
  Ojo: esas sesiones pueden trabajar con información antigua del proyecto;
  hay que contrastarlas con `decisiones.md` y señalar los conflictos.
