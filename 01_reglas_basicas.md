# Reglas básicas

> Lo marcado como **[PENDIENTE]** está sin decidir o es ambiguo (ver `pendientes.md`).
> Lo marcado como **[A PROBAR]** está decidido pero se revisará con simulaciones.

## 1. Perfil de una miniatura

Cada miniatura tiene las siguientes estadísticas:

| Estadística | Qué representa |
|---|---|
| **Fuerza** | Potencia física. Se usa para parar. |
| **Agilidad** | Rapidez y destreza. Se usa para esquivar. |
| **Magia** | Capacidad mágica. |
| **Mente** | Voluntad e intelecto. |
| **Vitalidad** | Puntos de vida. |
| **Acciones** | Número de acciones por activación. |
| **Movimiento** | Pulgadas que mueve al usar la acción *Moverse*. |
| **Especial** | Reglas especiales de la miniatura (ver `02_equipo_habilidades.md`). |

- Fuerza, Agilidad, Magia y Mente van de **1 a 5**. Solo pueden llegar a
  **6** mediante magia o habilidades.
- Lo normal son **2 acciones**. Esbirros e invocaciones tienen **1**; algunas
  élites tienen **3**.
- [PENDIENTE: usos de Magia y Mente]

## 2. Tiradas

- **Siempre se tiran 3D6**, salvo que una regla indique otra cosa.
- **Cada dado es una tirada independiente**: los dados no se suman entre sí.
- A cada dado se le suma el modificador que corresponda. Si el resultado
  alcanza o supera el **umbral**, ese dado es un **éxito**.
- El umbral es **6** salvo que una regla indique otra cosa:

| Dificultad | Umbral |
|---|---|
| Común (por defecto) | 6 |
| Difícil | 8 |
| Compleja | 10 |
| Imposible | 12 |

- **1 natural: siempre es un fallo.**
- **6 natural: siempre es un éxito.** Además, permite **tirar un dado extra**
  y **activa el Crítico** del arma.
  [PENDIENTE: ¿el dado extra puede volver a explotar?]
- Los modificadores pueden ser **negativos** (p. ej. una armadura pesada
  con Esquiva −1).

## 3. Ronda y activación

- **Activación alternada:** cada jugador elige una miniatura y la activa;
  después el otro jugador hace lo mismo, y así sucesivamente.
- Una miniatura activada realiza hasta tantas acciones como su estadística
  *Acciones*.
- [PENDIENTE: quién empieza la ronda; qué ocurre si un bando tiene más
  miniaturas sin activar que el otro; fin de ronda y fin de partida]

## 4. Reacciones

- **Contra un disparo:** el objetivo puede **reaccionar gastando 1 de sus
  propias acciones** de la ronda, si le quedan, para **Bloquear** o
  **Esquivar** (5.2). Las acciones gastadas en reaccionar ya no se pueden usar
  en su propia activación.
- **Contra un ataque cuerpo a cuerpo:** **siempre combaten los dos**
  (combate mutuo, 5.3). No cuesta acciones al defensor, y también combate una
  miniatura que ya haya gastado todas sus acciones.

## 5. Combate

### 5.1 Ataque sin reacción (disparo)
1. Elige un objetivo dentro del *Alcance* del arma y el arma que usas.
2. Tira **3D6**. Suma a cada dado la estadística del *Atributo* del arma.
   [PENDIENTE: ¿se suma también la *Precisión* del arma?]
3. Cada dado que alcanza el umbral (6) es un **éxito**.
4. **Cada éxito es un impacto** que hace el *Daño* del arma (ver 6. Daño).

### 5.2 Reacción contra un disparo
El defensor gasta 1 acción, elige **antes de tirar** si bloquea o esquiva, y
tira 3D6. **Cada éxito del defensor anula un éxito del atacante.**

- **Bloquear:** cada dado + *Parada* del arma o escudo. Los disparos
  **solo se pueden bloquear** con un arma o habilidad que lo permita (un
  escudo sí; una espada no).
- **Esquivar:** cada dado + Agilidad + *Esquiva* de la armadura. Al terminar
  la acción, el defensor puede moverse **2"**, pero debe acabar a la misma
  distancia o más lejos del atacante.

### 5.3 Combate mutuo (cuerpo a cuerpo)
Siempre que una miniatura ataca a otra cuerpo a cuerpo, **ambas combaten**:
los dados no se tiran para "pegar", sino para combatir, y cada jugador decide
en el momento qué hace con cada uno.

1. **Ambos jugadores tiran 3D6 a la vez** (más los dados por superioridad
   numérica, 5.5).
2. **Empieza siempre quien inicia el combate** (quien ataca o carga).
3. **Por turnos, alternando, cada jugador asigna un dado** a una de estas
   opciones. El modificador se elige después de tirar, según la opción:
   - **Golpear** (dado + *Atributo* del arma): si es un éxito, es un
     impacto.
   - **Parar** (dado + *Parada* del arma o escudo ≥ 6): elige un dado del
     rival que aún no haya usado; **ambos dados desaparecen**. Un **6
     natural** del rival solo se puede parar con un **6 natural**.
   - **Esquivar** (dado + Agilidad ± *Esquiva* de la armadura): elige un
     dado del rival que aún no haya usado. Si tu resultado **iguala o supera
     ese dado + el Atributo de golpe del rival**, **ambos dados
     desaparecen**. Ejemplo: el rival tiene un 5 y golpea con Fuerza 3 →
     necesitas 8. Con un 3 en tu dado y Agilidad 5 (sin penalizador de
     armadura): 3 + 5 = 8 → esquivas.
     - Las armaduras suelen dar Esquiva **negativa**: cuanto más pesada y
       robusta, más cuesta moverse.
4. **Defensa reactiva** [A PROBAR]: cuando el rival declara un golpe, puedes
   gastar **al momento** uno de tus dados para **pararlo o esquivarlo** (con
   las mismas condiciones), sin perder tu turno de asignar. Si no reaccionas,
   el golpe impacta. También puedes parar o esquivar en tu turno.
5. Ejemplo de reparto: con +2 al golpe y +4 a la esquiva, un 2 no sirve
   para golpear (2+2=4) pero sí para esquivar un dado bajo del rival.

### 5.4 Cargar
- Cuesta **2 acciones**.
- La miniatura se mueve hasta quedar a **1"** del objetivo e **inicia el
  combate** (no hay que pagar el ataque aparte).
- **Distancia de carga:** el Movimiento del personaje **+ 1D3 + 1** pulgadas.
  El 1D3 se tira con un D6: 1–2 = 1, 3–4 = 2, 5–6 = 3.

### 5.5 Varios contra uno
- Con **un aliado** ayudando, el combatiente con superioridad numérica puede
  **repetir un dado** después de tirar.
- Con **dos aliados**, puede **repetir un dado y además tira un dado extra**
  (4 dados en total).
- **Ayudar** es estar **trabado con el defensor**. Cada personaje trabado con
  el defensor, además del que combate, cuenta como una ayuda. El que está
  combatiendo no cuenta como ayuda.
- El **máximo son 2 ayudas**: un tercer aliado trabado ya no da más bonus.

### 5.6 Salir de un combate
- Salir de un combate **no cuesta nada extra**: se hace con una acción de
  **Moverse** normal, tirando antes **Agilidad difícil (8)**: cada dado +
  Agilidad; basta **un éxito**.
- Si lo superas, te vas sin más.
- Si fallas, el enemigo trabado contigo puede, si quiere, **iniciar un
  combate gratis** contra ti.
- Si te has salido de un combate, **no puedes cargar ese turno**.
- [PENDIENTE: si fallas, ¿te quedas trabado o te mueves igualmente tras el
  combate gratis? Si hay varios enemigos trabados, ¿puede atacarte cada uno?]

## 6. Daño

- **Cada impacto** hace el *Daño* del arma.
- Si el objetivo lleva armadura con Durabilidad, se resta su **Reducción** al
  daño de ese impacto y la armadura pierde **1 de Durabilidad**, también si
  el impacto ha quedado en 0. Con Durabilidad 0, la armadura queda
  inutilizada.
- El daño restante se descuenta de la **Vitalidad**.
- **Vida 0:** el personaje queda **fuera de combate** y se retira de la mesa.

## 7. Moral
[PENDIENTE]
