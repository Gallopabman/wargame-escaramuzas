// Juega campañas completas en piloto automático (el jugador también lo lleva
// la IA) y comprueba que el juego es jugable de principio a fin.
// Uso: node tests/simular_campana.js [campañas] [sesiones] [--detalle]
const { cargar } = require("./entorno");
const JG = cargar(["util.js", "datos.js", "combate.js", "campana.js", "ia.js"]);
const C = JG.campana;

const N = Number(process.argv[2] || 20);
const SES = process.argv[3] ? [Number(process.argv[3])] : [4, 8, 12];
const DETALLE = process.argv.includes("--detalle");
const errores = [];

function comprobar(e, donde) {
  for (const b of e.bandas) {
    for (const k of ["influencia", "xp", "renombre"]) {
      if (!Number.isFinite(b[k])) errores.push(donde + ": " + b.nombre + " tiene " + k + " = " + b[k]);
      if (b[k] < 0) errores.push(donde + ": " + b.nombre + " tiene " + k + " negativa (" + b[k] + ")");
    }
    for (const p of b.personajes) {
      for (const a of ["fue", "agi", "mag", "men", "vida", "nivel"]) {
        if (!Number.isFinite(p[a])) errores.push(donde + ": " + p.nombre + "." + a + " = " + p[a]);
      }
      if (p.vida < 1 && !p.muerto) errores.push(donde + ": " + p.nombre + " tiene Vida " + p.vida);
      if (!p.armaCC) errores.push(donde + ": " + p.nombre + " sin arma cuerpo a cuerpo");
    }
    if (!C.vivos(b).some((p) => p.lider) && C.vivos(b).some((p) => !p.bestia)) errores.push(donde + ": " + b.nombre + " sin líder");
  }
  if (!Number.isFinite(e.amenaza.valor)) errores.push(donde + ": amenaza NaN");
}

function jugarCampana(gremio, sesiones, semilla) {
  const e = C.nueva({ gremio, sesiones, semilla, nombre: "Prueba" });
  const j = C.jugador(e);
  j.personalidad = { nombre: "jugador", coop: Number(process.env.COOP || 0.6), codicia: 0.5 };
  let guard = 0;
  while (!e.finalizada && guard++ < 200) {
    const donde = "sesión " + e.sesion + " (" + e.fase + ")";
    if (e.fase === "encargos") {
      let g2 = 0;
      while (C.turnoEncargos(e) && g2++ < 300) {
        const t = C.turnoEncargos(e);
        JG.ia.turnoEncargos(e, C.banda(e, t));
      }
      C.terminarEncargos(e);
    } else if (e.fase === "batalla") {
      const plan = JG.ia.planBatalla(e, j);
      e.batalla.postura = plan.postura; e.batalla.ordenes = plan.ordenes;
      C.jugarBatallas(e);
      if (DETALLE) {
        const par = C.parejaDelJugador(e);
        console.log("  S" + e.sesion + " " + par.resultado.escenarioNombre + ": " + par.resultado.puntos.join("–") + " · " + e.resolucion[j.id].join(" | "));
      }
    } else if (e.fase === "resolucion") {
      C.aPreparacion(e);
    } else if (e.fase === "preparacion") {
      JG.ia.preparar(e, j);
      C.terminarSesion(e);
    }
    comprobar(e, donde);
  }
  if (guard >= 200) errores.push("La campaña no termina (" + gremio + ", " + sesiones + ")");
  // Guardado y carga ida y vuelta
  const json = C.exportar(e);
  JSON.parse(json);
  return e;
}

const resumen = {};
for (const s of SES) {
  const r = resumen[s] = { n: 0, derrotas: 0, ganaJugador: 0, muertes: 0, renombre: 0, sesionCaida: [], amenazaFinal: 0, nivel: 0, ganadores: {} };
  for (let i = 0; i < N; i++) {
    const g = JG.DATOS.gremios[i % JG.DATOS.gremios.length].id;
    const e = jugarCampana(g, s, 1000 + i * 17 + s);
    r.n++;
    if (e.derrota) { r.derrotas++; r.sesionCaida.push(e.sesion); }
    const cl = C.clasificacion(e);
    if (!e.derrota) { r.ganadores[JG.gremio(cl[0].gremio).oficio] = (r.ganadores[JG.gremio(cl[0].gremio).oficio] || 0) + 1; if (cl[0].jugador) r.ganaJugador++; }
    r.muertes += JG.suma(e.bandas, (b) => b.caidos.length) / 4;
    r.renombre += JG.suma(e.bandas, (b) => b.renombre) / 4;
    r.amenazaFinal += e.amenaza.valor / e.amenaza.max;
    r.nivel += JG.suma(e.bandas, (b) => JG.suma(C.vivos(b), (p) => p.nivel) / Math.max(1, C.vivos(b).length)) / 4;
    if (DETALLE) console.log("Campaña " + g + " (" + s + "): " + (e.derrota ? "DERROTA ante la Niebla en la sesión " + e.sesion : "gana " + cl[0].nombre) +
      " · Renombre " + cl.map((b) => b.nombre.split(" ").slice(-1)[0] + " " + b.renombre).join(", ") + " · Niebla " + e.amenaza.valor + "/" + e.amenaza.max);
  }
}
console.log("\nSesiones  campañas  caen ante la Niebla  gana el jugador  muertes/banda  Renombre/banda  nivel medio  Niebla final");
for (const s of SES) {
  const r = resumen[s];
  console.log(String(s).padStart(8), String(r.n).padStart(9), (r.derrotas + " (" + (100 * r.derrotas / r.n).toFixed(0) + "%)").padStart(20),
    ((100 * r.ganaJugador / r.n).toFixed(0) + "%").padStart(16), (r.muertes / r.n).toFixed(1).padStart(14), (r.renombre / r.n).toFixed(1).padStart(15),
    (r.nivel / r.n).toFixed(1).padStart(12), ((100 * r.amenazaFinal / r.n).toFixed(0) + "%").padStart(13));
  console.log("          ganadores:", JSON.stringify(r.ganadores), r.sesionCaida.length ? "· caídas en sesiones " + r.sesionCaida.join(",") : "");
}
console.log(errores.length ? "\nERRORES (" + errores.length + "):\n" + [...new Set(errores)].slice(0, 30).join("\n") : "\nSin errores de coherencia.");
