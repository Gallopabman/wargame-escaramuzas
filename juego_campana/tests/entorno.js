// Carga los scripts del juego (sin interfaz) en Node para poder probarlos.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function cargar(archivos) {
  const ctx = { console, Math, Date, JSON };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const a of archivos) {
    const ruta = path.join(__dirname, "..", "js", a);
    vm.runInContext(fs.readFileSync(ruta, "utf8"), ctx, { filename: ruta });
  }
  return ctx.JG;
}

module.exports = { cargar };
