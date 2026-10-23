// Crea la banda inicial de un gremio (versión mínima para pruebas del motor).
module.exports = function (JG, g, azar) {
  return g.bandaInicial.map((tipo, i) => {
    const d = g.datacards[tipo];
    const buscar = (cat) => d.equipo.find((id) => JG.DATOS.equipo[id].cat === cat) || null;
    return {
      id: g.id + i + "_" + azar.entero(0, 1e9), nombre: (d.nombreBestia ? d.nombreBestia + " " : "") + JG.nombreAleatorio(azar),
      tipo, tipoNombre: d.nombre, lider: !!d.lider, fue: d.fue, agi: d.agi, mag: d.mag, men: d.men, vida: d.vida,
      acc: d.acc, mov: d.mov, armaCC: buscar("cc"), armaDist: buscar("dist"), escudo: buscar("escudo"),
      armadura: buscar("armadura"), hab: d.hab.slice()
    };
  });
};
