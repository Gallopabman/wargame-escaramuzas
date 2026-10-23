// Prueba rápida del motor: batallas entre las bandas iniciales de cada gremio.
const { cargar } = require("./entorno");
const JG = cargar(["util.js", "datos.js", "combate.js"]);

function bandaInicial(g, azar) {
  return g.bandaInicial.map((tipo, i) => {
    const d = g.datacards[tipo];
    const eq = d.equipo.map((id) => JG.DATOS.equipo[id]);
    const buscar = (cat) => { const k = d.equipo.find((id) => JG.DATOS.equipo[id].cat === cat); return k || null; };
    return {
      id: g.id + i, nombre: (d.nombreBestia || "") + JG.nombreAleatorio(azar), tipo, tipoNombre: d.nombre,
      lider: !!d.lider, fue: d.fue, agi: d.agi, mag: d.mag, men: d.men, vida: d.vida, acc: d.acc, mov: d.mov,
      armaCC: buscar("cc"), armaDist: buscar("dist"), escudo: buscar("escudo"), armadura: buscar("armadura"),
      hab: d.hab.slice()
    };
  });
}

const azar = new JG.Azar(42);
const gs = JG.DATOS.gremios;
const N = Number(process.argv[2] || 200);
const tabla = {};
for (const a of gs) tabla[a.id] = { v: 0, e: 0, d: 0, rondas: 0, bajas: 0 };
let ejemplo = null;
for (let i = 0; i < gs.length; i++) {
  for (let j = 0; j < gs.length; j++) {
    if (i === j) continue;
    for (let k = 0; k < N; k++) {
      const esc = JG.DATOS.escenarios[k % 3].id;
      const b = [gs[i], gs[j]].map((g) => ({ nombre: g.nombre, gremio: g.id, miniaturas: bandaInicial(g, azar), postura: "equilibrada", pociones: 1 }));
      const r = JG.batalla(b, esc, azar, { proezas: ["primera", "verdugo"] });
      if (!ejemplo) ejemplo = r;
      const A = tabla[gs[i].id];
      if (r.ganador === 0) A.v++; else if (r.ganador === 1) A.d++; else A.e++;
      A.bajas += r.bajas[0];
      A.rondas += r.cronica.filter((c) => c.tipo === "ronda").length;
    }
  }
}
console.log("Ejemplo de crónica (" + ejemplo.escenarioNombre + "):");
for (const c of ejemplo.cronica.slice(0, 40)) console.log("  [" + c.r + "] " + c.texto);
console.log("…\n  " + ejemplo.cronica[ejemplo.cronica.length - 1].texto);
console.log("\nGremio                 victorias  empates  derrotas  bajas/batalla  rondas/batalla");
for (const g of gs) {
  const t = tabla[g.id], n = t.v + t.e + t.d;
  console.log(g.oficio.padEnd(22), (100 * t.v / n).toFixed(0).padStart(8) + "%", (100 * t.e / n).toFixed(0).padStart(7) + "%",
    (100 * t.d / n).toFixed(0).padStart(8) + "%", (t.bajas / n).toFixed(1).padStart(13), (t.rondas / n).toFixed(1).padStart(14));
}
