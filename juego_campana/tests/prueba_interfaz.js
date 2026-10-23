// Juega una campaña completa a través de la capa de interfaz (las mismas
// acciones que los botones) y dibuja todas las pestañas en cada fase.
const fs = require("fs"), path = require("path"), vm = require("vm");

const html = { app: { innerHTML: "" } };
const valores = {};
const almacen = {};
const ctx = {
  console, Math, Date, JSON, setTimeout: () => 0,
  localStorage: { getItem: (k) => almacen[k] || null, setItem: (k, v) => { almacen[k] = v; }, removeItem: (k) => { delete almacen[k]; } },
  window: { scrollTo() {}, addEventListener() {} },
  document: {
    readyState: "complete", addEventListener() {},
    getElementById: (id) => id === "app" ? html.app : id === "avisos" ? { appendChild() {} } : (valores[id] !== undefined ? { value: valores[id] } : null),
    querySelector: (sel) => { const m = /name="(\w+)"/.exec(sel); return m && valores["radio:" + m[1]] !== undefined ? { value: valores["radio:" + m[1]] } : null; },
    querySelectorAll: () => [],
    createElement: () => ({ remove() {} })
  }
};
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const a of ["iconos.js", "util.js", "datos.js", "combate.js", "campana.js", "ia.js", "ui.js"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", a), "utf8"), ctx, { filename: a });
}
const JG = ctx.JG, U = JG.ui, A = U._acciones, C = JG.campana;
let avisos = [];
U.aviso = (t, err) => { if (err) avisos.push(t); };

const PEST = ["fase", "banda", "base", "mercado", "clasificacion", "cronicas", "noticias", "ayuda"];
let renders = 0, bytes = 0;
function dibujarTodo() {
  for (const t of PEST) { U.tab = t; U.render(); renders++; bytes += html.app.innerHTML.length; if (html.app.innerHTML.includes("undefined") || html.app.innerHTML.includes("NaN")) throw new Error("La pestaña " + t + " muestra undefined/NaN en fase " + U.e.fase + ": …" + html.app.innerHTML.slice(Math.max(0, html.app.innerHTML.search(/undefined|NaN/) - 120), html.app.innerHTML.search(/undefined|NaN/) + 40)); }
  U.tab = "fase";
}

const gremio = process.argv[2] || "caballeros";
const sesiones = Number(process.argv[3] || 8);
U.render(); // pantalla de inicio
valores.nombreBanda = "Los Probadores";
valores["radio:duracion"] = String(sesiones);
A.elegirGremio({ id: gremio });
A.comenzar();
const e = U.e;
let guard = 0;
while (!e.finalizada && guard++ < 300) {
  dibujarTodo();
  if (e.fase === "encargos") {
    const b = C.jugador(e);
    if (C.turnoEncargos(e) === b.id) {
      // Como un jugador: manda a alguien a la Muralla si la Niebla aprieta; si no, al mejor sitio libre.
      const libres = C.locacionesAbiertas(e).filter((l) => C.capacidadLibre(e, l.id) && b.influencia >= l.coste);
      const disp = C.vivos(b).filter((p) => !p.encargo && !(p.herido >= e.sesion));
      const loc = libres.find((l) => l.id === "muralla" && C.proyeccionNiebla(e) >= e.amenaza.max) || libres.find((l) => l.encargo === "comerciar") || libres[0];
      if (loc && disp.length && JG.suma(e.encargos.asignaciones, (a) => a.banda === b.id ? 1 : 0) < 3) {
        A.abrirAsignar({ origen: "mapa", destino: loc.id }); U.render();
        valores.asig1 = disp[disp.length - 1].id; valores["radio:modo"] = loc.soloLento ? "lento" : "rapido";
        A.confirmarAsignar();
        if (U.dialogo) { A.cerrar(); A.pasar(); }
      } else A.pasar();
    } else if (!C.turnoEncargos(e)) {
      // Base: asigna su primer edificio
      const ed = Object.keys(b.edificios)[0];
      const libre = C.vivos(b).find((p) => !p.encargo && !(p.herido >= e.sesion));
      if (libre && !e.encargos.asignaciones.some((a) => a.banda === b.id && a.origen === "base")) {
        A.abrirAsignar({ origen: "base", destino: ed }); U.render();
        valores.asig1 = libre.id; valores["radio:modo"] = "rapido"; A.confirmarAsignar();
        if (U.dialogo) A.cerrar();
      }
      A.terminarEncargos();
    } else throw new Error("La IA no avanzó en encargos");
  } else if (e.fase === "batalla") {
    A.jugarBatalla();
  } else if (e.fase === "resolucion") {
    A.aPreparacion();
  } else if (e.fase === "preparacion") {
    const b = C.jugador(e);
    // Sube de nivel con el diálogo, compra algo y construye
    for (const p of C.vivos(b)) {
      if (!C.puedeSubir(e, b, p)) { A.abrirSubir({ pid: p.id }); U.render(); valores["radio:mejora"] = C.opcionesMejora(e, p)[0].id; A.confirmarSubir(); }
    }
    if (b.influencia > 60) A.comprar({ id: "pocion" });
    if (b.influencia > 80 && !b.edificios.enfermeria) A.construir({ id: "enfermeria" });
    if (b.almacen.length) { valores.equipar_0 = C.vivos(b)[0].id; A.equipar({ i: 0 }); }
    A.terminarSesion();
    if (U.dialogo) A.terminarSesionSi();
  }
}
dibujarTodo();
const cl = C.clasificacion(e);
console.log("Campaña de " + gremio + " (" + sesiones + " sesiones) jugada por la interfaz: " + (e.derrota ? "la Niebla devoró la ciudad en la sesión " + e.sesion : "gana " + cl[0].nombre));
console.log("Renombre: " + cl.map((b) => b.nombre + " " + b.renombre).join(" · "));
console.log("Pantallas dibujadas: " + renders + " (" + Math.round(bytes / renders) + " caracteres de media). Partida guardada: " + (Object.keys(almacen).length ? Math.round(Object.values(almacen)[0].length / 1024) + " KB" : "no"));
console.log(avisos.length ? "Avisos de error mostrados al jugador (" + avisos.length + "): " + [...new Set(avisos)].slice(0, 8).join(" | ") : "Sin avisos de error.");
