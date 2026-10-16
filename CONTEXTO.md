# Contexto para retomar el trabajo

> Léelo al empezar cada sesión. Resume en qué punto está el diseño, cómo
> trabajamos y qué toca hacer después. Última actualización: 2026-10-16.

## Qué es este proyecto

Diseño de un **wargame de escaramuzas de fantasía medieval** (miniaturas de
28–32 mm, bandas de 4–8 miniaturas, partidas de 5–6 turnos) con foco narrativo
y estructura **PvEvP**: dos jugadores compiten en una campaña mientras una
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
| `03_facciones/` | Un archivo por gremio o facción (vacío por ahora). |
| `04_escenarios_especiales.md` | Terreno, escenarios, eventos (vacío). |
| `05_campana.md` | Campaña, Amenaza, progresión (vacío). |
| `decisiones.md` | Registro fechado de cada decisión y su motivo. |
| `pendientes.md` | Preguntas abiertas y huecos. **Empieza por aquí.** |
| `simulaciones/` | Simulador de combate y resultados. |

## Núcleo de reglas en una pantalla

- **Estadísticas:** Fuerza, Agilidad, Magia, Mente (1–5; más con magia),
  Vida (provisional 2–5), Acciones (normalmente 2; esbirros 1; élites 3),
  Movimiento (pulgadas), Especial.
- **Tiradas:** 3D6, **cada dado por separado** + modificador ≥ umbral (6 por
  defecto; 8 / 10 / 12 para difícil, compleja, imposible). 1 natural siempre
  falla; 6 natural siempre acierta, da un dado extra y activa el Crítico.
- **Activación alternada**, una miniatura cada jugador.
- **Disparo:** el objetivo puede gastar 1 acción para Bloquear (Parada; solo
  con escudo o habilidad) o Esquivar (Agilidad + Esquiva; luego mueve 2").
  Cada éxito del defensor anula uno del atacante. *(Siguiente tema a revisar.)*
- **Cuerpo a cuerpo: siempre combaten los dos** (sin coste de acción). Ambos
  tiran 3D6 (+1 dado por cada aliado que ayuda) y, alternando dado a dado,
  **empezando quien inicia el combate**, deciden:
  - **Golpear** (dado + Atributo ≥ 6): impacta.
  - **Parar** (dado + Parada ≥ 6): elimina un dado del rival; un 6 solo se
    para con un 6.
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
4. **Superar en número es muy fuerte:** +1 dado sube la victoria del 50% al
   78% en un duelo igualado.
5. La escala grande (Vida 4–10, Daño 2–5) da casi lo mismo que la pequeña:
   solo cambia algo cuando cambia la cuenta de golpes para matar.

## Próximos pasos

1. Cerrar el combate cuerpo a cuerpo con los datos de la v3 (ver
   `pendientes.md`).
2. Pasar al **disparo**.
3. Definir **Críticos** y más reglas especiales.

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
