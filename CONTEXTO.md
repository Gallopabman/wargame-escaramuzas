# Contexto para retomar el trabajo

> Léelo al empezar cada sesión. Resume en qué punto está el diseño, cómo
> trabajamos y qué toca hacer después. Última actualización: 2026-10-15.

## Qué es este proyecto

Diseño de un **wargame de escaramuzas de fantasía medieval** (miniaturas de
28–32 mm, bandas de 4–8 miniaturas) con foco narrativo y estructura **PvEvP**:
dos jugadores compiten en una campaña mientras una **Amenaza** automática
(la "IA") avanza; si la dejan actuar, la campaña la pierden todos.

Es **mini-agnóstico pero no facción-agnóstico**: vale cualquier miniatura que
encaje con el concepto de la facción. Se está estudiando organizar el juego
en **gremios** (p. ej. *Las Hojas Afiladas*: asesinos sigilosos, rápidos y
con venenos), cada uno con subfacciones.

Inspiraciones: Warcry, Kill Team, Necromunda, Mordheim, Infinity.

Objetivos del autor: revisar el núcleo de reglas, completar huecos, hacer
simulaciones de equilibrio, crear un constructor de bandas y producir un
manual usable.

## Archivos

| Archivo | Contenido |
|---|---|
| `00_concepto.md` | Documento brújula: pilares de diseño y formato. |
| `01_reglas_basicas.md` | Perfil, tiradas, activación, reacciones, combate y daño. |
| `02_equipo_habilidades.md` | Reglas especiales, armas, armaduras, habilidades. |
| `03_facciones/` | Un archivo por gremio o facción (vacío por ahora). |
| `04_escenarios_especiales.md` | Terreno, escenarios, eventos (vacío). |
| `05_campana.md` | Campaña, Amenaza, progresión (vacío). |
| `decisiones.md` | Registro fechado de cada decisión y su motivo. |
| `pendientes.md` | Preguntas abiertas y huecos. **Empieza por aquí.** |
| `simulaciones/` | Simulador de combate y resultados. |

## Núcleo de reglas en una pantalla

- **Estadísticas:** Fuerza, Agilidad, Magia, Mente (1–5; hasta 6 con magia),
  Vitalidad (vida), Acciones (normalmente 2; esbirros 1; élites 3),
  Movimiento (pulgadas), Especial.
- **Tiradas:** 3D6, **cada dado por separado** + modificador ≥ umbral (6 por
  defecto; 8 / 10 / 12 para difícil, compleja, imposible). 1 natural siempre
  falla; 6 natural siempre acierta, da un dado extra y activa el Crítico.
- **Activación alternada**, una miniatura cada jugador.
- **Reacciones:** el objetivo de un ataque gasta 1 de sus acciones para
  reaccionar.
  - Contra **disparos**: Bloquear (Fuerza + Parada; solo con escudo o
    habilidad) o Esquivar (Agilidad + Esquiva; luego mueve 2" alejándose).
    Cada éxito del defensor anula un éxito del atacante.
  - En **cuerpo a cuerpo**: **combate mutuo**. Ambos tiran 3D6 y, alternando
    dado a dado, deciden Golpear, Parar (elimina un dado rival; un 6 natural
    solo se para con otro 6) o Esquivar (el dado debe igualar el valor total
    del golpe). Empieza quien cargó; si no, la mayor Velocidad; si hay empate,
    el jugador activo.
- **Cargar:** cuesta 2 acciones, mueve hasta quedar a 1" e inicia el combate mutuo con la iniciativa.
- **Daño:** cada éxito es un impacto con el Daño del arma. La armadura resta
  su Reducción y pierde 1 de Durabilidad por impacto.
- **Armas:** Atributo, Daño, Parada, Precisión, Alcance, Velocidad, Crítico,
  Especial. **Armaduras:** Esquiva, Reducción, Durabilidad, Especial.

## Resultados de la simulación v2 (combate mutuo, 2026-10-16)

La v1 usaba una esquiva mal entendida (como respuesta a un golpe) y queda
obsoleta. La v2 aplica las reglas corregidas, con vida y muerte. Perfiles de
prueba inventados (Soldado, Asesino, Bruto, Caballero). Ver
`simulaciones/resultados_combate_mutuo_v2.txt`.

1. **Empezar primero ahora sí importa mucho** (Bruto contra Bruto: quien
   empieza mata el 77% de las veces y quien no, el 19%). La carga tal como
   está ya vale la pena; añadirle +1 dado sería excesivo.
2. **Saltos de vida y daño:** 1 punto de Reducción puede cambiar cuántos
   golpes hacen falta para matar y disparar los resultados (Soldado sin
   armadura muere el 51%; con R1 D1, el 10%).
3. **El penalizador de Esquiva funciona:** al Asesino le va mejor con
   armadura ligera sin penalizador que con armadura pesada.
4. Parar lo usa sobre todo quien tiene Parada alta (Caballero); esquivar,
   quien tiene Agilidad alta (Asesino). Buena diferenciación.
5. La "gasolina" empeora mucho al Asesino. Recomendación: no usarla.
6. Reaccionar sigue siendo muy rentable → riesgo de juego pasivo.
7. El Asesino con dagas (Daño 2) apenas hace daño a miniaturas con
   armadura: necesita Críticos o venenos.

## Próximos pasos

1. Recibir **perfiles reales** de 2–3 miniaturas del autor.
2. **Simulación de activaciones completas** (2 acciones, decidir cuándo
   reaccionar) para comprobar si aparece el juego pasivo.
3. Definir **Críticos** y reglas especiales (venenos).
4. Resolver el resto de `pendientes.md`: disparo, Vitalidad 0, ronda, la
   Amenaza, gremios.

## Cómo trabajamos

- Todo en **castellano**.
- **No inventar reglas**: lo que no está decidido se marca **[PENDIENTE]** y
  lo que se revisará con simulaciones, **[A PROBAR]**. Proponer opciones con
  una recomendación; el autor decide.
- Cada decisión nueva va a `decisiones.md` (con fecha y motivo) y se quita de
  `pendientes.md`.
- **Simulaciones:** en este equipo no hay Python ni Node. El simulador está
  escrito en C# y se ejecuta desde PowerShell con
  `simulaciones/ejecutar_combate_mutuo.ps1`, que lo compila con `Add-Type`.
  Usa minimax (juego óptimo de ambos jugadores) sobre tiradas aleatorias.
