// Diagnóstico de equilibrio: rendimiento medio de cada datacard en batalla.
const { cargar } = require("./entorno");
const JG = cargar(["util.js", "datos.js", "combate.js"]);
const crear = require("./prueba_batalla_util");

const azar = new JG.Azar(7);
const gs = JG.DATOS.gremios;
const N = Number(process.argv[2] || 60);
const st = {};
for (let i = 0; i < gs.length; i++) for (let j = 0; j < gs.length; j++) {
  if (i === j) continue;
  for (let k = 0; k < N; k++) {
    const b = [gs[i], gs[j]].map((g) => ({ nombre: g.nombre, gremio: g.id, miniaturas: crear(JG, g, azar), postura: "equilibrada" }));
    const r = JG.batalla(b, JG.DATOS.escenarios[k % 3].id, azar, {});
    for (const m of r.miniaturas) {
      const g = gs[m.lado === 0 ? i : j];
      const key = g.oficio.slice(0, 11) + " · " + m.tipo;
      const s = st[key] = st[key] || { n: 0, hecho: 0, recibido: 0, bajas: 0, caidas: 0, dist: 0 };
      s.n++; s.hecho += m.st.danoHecho; s.recibido += m.st.danoRecibido; s.bajas += m.st.bajas; s.dist += m.st.bajasDist;
      if (m.fuera) s.caidas++;
    }
  }
}
console.log("Datacard".padEnd(46), "daño hecho  recibido  bajas  (a dist.)  cae");
for (const [k, s] of Object.entries(st).sort()) {
  console.log(k.padEnd(46), (s.hecho / s.n).toFixed(2).padStart(9), (s.recibido / s.n).toFixed(2).padStart(9),
    (s.bajas / s.n).toFixed(2).padStart(6), (s.dist / s.n).toFixed(2).padStart(9), (100 * s.caidas / s.n).toFixed(0).padStart(5) + "%");
}
