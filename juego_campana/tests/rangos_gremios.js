// Posición media de cada gremio en la clasificación final (piloto automático).
const { cargar } = require("./entorno");
const JG = cargar(["util.js", "datos.js", "combate.js", "campana.js", "ia.js"]);
const C = JG.campana;
const N = Number(process.argv[2] || 40), S = Number(process.argv[3] || 8);
const pos = {}, vic = {};
for (let i = 0; i < N; i++) {
  const e = C.nueva({ gremio: JG.DATOS.gremios[i % 7].id, sesiones: S, semilla: 5000 + i });
  C.jugador(e).personalidad = { coop: 0.6, codicia: 0.5 };
  let g = 0;
  while (!e.finalizada && g++ < 300) {
    if (e.fase === "encargos") { while (C.turnoEncargos(e)) JG.ia.turnoEncargos(e, C.banda(e, C.turnoEncargos(e))); C.terminarEncargos(e); }
    else if (e.fase === "batalla") C.jugarBatallas(e);
    else if (e.fase === "resolucion") C.aPreparacion(e);
    else if (e.fase === "preparacion") { JG.ia.preparar(e, C.jugador(e)); C.terminarSesion(e); }
  }
  C.clasificacion(e).forEach((b, k) => { const o = JG.gremio(b.gremio).oficio; (pos[o] = pos[o] || []).push(k + 1); vic[o] = (vic[o] || 0) + (b.victorias / S); });
}
for (const [o, l] of Object.entries(pos).sort((a, b) => JG.suma(a[1]) / a[1].length - JG.suma(b[1]) / b[1].length))
  console.log(o.padEnd(22), "posición media", (JG.suma(l) / l.length).toFixed(2), "· batallas ganadas", (100 * vic[o] / l.length).toFixed(0) + "%", "· campañas", l.length);
