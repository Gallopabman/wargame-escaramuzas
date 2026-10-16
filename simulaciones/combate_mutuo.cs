// Simulación del combate mutuo (reglas 5.3-5.5) con juego óptimo (minimax). v3
// Cada jugador maximiza: daño hecho - daño recibido + BONO_MUERTE si mata
// (y lo resta si muere). Si una miniatura llega a 0 de vida, el combate acaba.
// Supuestos (ver pendientes.md):
//  - Golpear = dado + Atributo + Precisión.
//  - Cada 6 natural da 1 dado extra que no vuelve a explotar.
//  - Asignar es obligatorio (se puede descartar un dado, pero no guardarlo).
//  - Parar y Esquivar se usan en tu turno contra un dado del rival aún no
//    usado, y ambos dados se van. Parar: dado + Parada >= 6 (un 6 rival solo
//    se para con un 6). Esquivar: dado + Agilidad + Esquiva de armadura >=
//    dado rival + su golpe.
//  - Un golpe declarado impacta directamente, salvo con "reactiva": el
//    defensor puede gastar al momento un dado para pararlo o esquivarlo.
//  - Reglas especiales: Doble parada, Doble golpe, Rompearmaduras (Perfil.Especial).
//  - Un 6 natural siempre tiene éxito, también al esquivar.
//  - Un impacto que la armadura reduce a 0 también gasta Durabilidad.
using System;
using System.Collections.Generic;

public class Perfil {
    public string nombre;
    public int golpe, parada, esquiva, dano, reduccion, durabilidad, velocidad, vida;
    // Reglas especiales: Doble parada (escudos), Doble golpe (dagas),
    // Rompearmaduras (hachas).
    public bool dobleParada, dobleGolpe, rompeArmadura;
    public Perfil(string n, int g, int p, int e, int da, int red, int dur, int vel, int vida) {
        nombre = n; golpe = g; parada = p; esquiva = e; dano = da;
        reduccion = red; durabilidad = dur; velocidad = vel; this.vida = Math.Min(vida, 15);
    }
    // Copia con otra armadura (Reducción, Durabilidad, Esquiva) y/o vida.
    public Perfil Con(string n, int red, int dur, int esqArmadura, int vida) {
        Perfil p = new Perfil(n, golpe, parada, esquiva + esqArmadura, dano, red, dur, velocidad, vida);
        p.dobleParada = dobleParada; p.dobleGolpe = dobleGolpe; p.rompeArmadura = rompeArmadura;
        return p;
    }
    // Activa reglas especiales: "P" doble parada, "G" doble golpe, "R" rompearmaduras.
    public Perfil Especial(string e) {
        dobleParada = e.Contains("P"); dobleGolpe = e.Contains("G"); rompeArmadura = e.Contains("R");
        return this;
    }
}

public class Resultado {
    public double danoSinReaccion, muereSinReaccion;
    public double[] dano = new double[2], muere = new double[2];
    // golpe, parada, esquiva, descarte, encaja, (pasa), parada reactiva, esquiva reactiva
    public double[,] uso = new double[2, 8];
    // Decisiones con elección real, cuántas fueron ajustadas (< 1 punto de
    // diferencia) y suma de lo que cuesta elegir la otra categoría.
    public double[] decisiones = new double[2], ajustadas = new double[2], coste = new double[2];
    // Combate a muerte: gana pl0, gana pl1, nadie muere, media de intercambios,
    // y en qué intercambio muere alguien: 1.º, 2.º, 3.º, 4.º o más.
    public double[] duelo = new double[9];
}

public class CombateMutuo {
    const double BONO_MUERTE = 10;
    Perfil[] pl = new Perfil[2];
    bool gasolina;
    // Variante a probar: al declarar un golpe, el defensor puede gastar al
    // momento un dado para pararlo o esquivarlo, sin perder su turno.
    public bool reactiva;
    Dictionary<long, double> memo = new Dictionary<long, double>();
    Random rng = new Random(12345);

    class Estado {
        public int[,] c = new int[2, 7];
        // pend / pend2: dados de golpes declarados a los que el defensor puede reaccionar.
        public int turno, pend, pend2;
        public int[] d = new int[2], hp = new int[2];
        public Estado Copia() {
            Estado e = new Estado();
            Array.Copy(c, e.c, c.Length);
            e.turno = turno; e.pend = pend; e.pend2 = pend2;
            e.d[0] = d[0]; e.d[1] = d[1]; e.hp[0] = hp[0]; e.hp[1] = hp[1];
            return e;
        }
        public int Total(int p) { int s = 0; for (int f = 1; f <= 6; f++) s += c[p, f]; return s; }
        public long Clave() {
            long k = 0;
            for (int p = 0; p < 2; p++) for (int f = 1; f <= 6; f++) k = k * 8 + c[p, f];
            k = k * 2 + turno; k = k * 8 + d[0]; k = k * 8 + d[1];
            k = k * 16 + pend; k = k * 8 + pend2; k = k * 16 + hp[0]; k = k * 16 + hp[1];
            return k;
        }
    }

    class Mov { public Estado sig; public double premio; public int actor; public int tipo; }
    const int GOLPE = 0, PARADA = 1, ESQUIVA = 2, DESCARTE = 3, ENCAJA = 4, PASA = 5,
              PARADA_R = 6, ESQUIVA_R = 7;
    // Jugadores que siempre golpean y nunca se defienden (para comparar).
    public bool[] ingenuo = new bool[2];
    // Dados que tira cada uno (3 + 1 por cada aliado que ayuda, regla 5.5).
    public int[] dados = { 3, 3 };
    // Apoyo de aliados (regla 5.5): 1 aliado = repetir un dado; 2 aliados = repetir + 1 dado.
    // Para 2 aliados: dados = 4 y repetir = true.
    public bool[] repetir = new bool[2];

    public CombateMutuo(Perfil a, Perfil b, bool gas) { pl[0] = a; pl[1] = b; gasolina = gas; }

    public static bool Exito(int dado, int mod, int umbral) {
        if (dado == 1) return false;
        if (dado == 6) return true;
        return dado + mod >= umbral;
    }

    // Aplica un impacto de 'atk' a 'def' en el estado t. Devuelve el premio
    // desde el punto de vista del jugador 0.
    double Impacto(Estado t, int atk, int def) {
        if (t.hp[def] == 0) return 0;
        int dm = pl[atk].dano;
        if (t.d[def] > 0) {
            dm = Math.Max(0, dm - pl[def].reduccion);
            t.d[def] = pl[atk].rompeArmadura ? 0 : t.d[def] - 1;
        }
        int real = Math.Min(dm, t.hp[def]);
        t.hp[def] -= real;
        double u = real + (t.hp[def] == 0 ? BONO_MUERTE : 0);
        return def == 1 ? u : -u;
    }

    // Tras resolver la reacción a un golpe, pasa al siguiente golpe pendiente.
    static void SiguientePendiente(Estado e) { e.pend = e.pend2; e.pend2 = 0; }

    List<Mov> Hijos(Estado s) {
        List<Mov> r = new List<Mov>();
        if (s.hp[0] == 0 || s.hp[1] == 0) return r;
        int yo = s.turno, op = 1 - yo;
        if (s.pend > 0) {
            // Defensa reactiva: 'yo' recibe un golpe hecho con un dado de valor
            // s.pend por 'op' y puede pararlo o esquivarlo con un dado.
            int v = s.pend;
            for (int w = 1; w <= 6; w++) {
                if (s.c[yo, w] == 0) continue;
                bool para = Exito(w, pl[yo].parada, 6) && (v != 6 || w == 6);
                bool esquiva = w != 1 && (w == 6 || w + pl[yo].esquiva >= v + pl[op].golpe);
                if (!para && !esquiva) continue;
                Estado e = s.Copia(); e.c[yo, w]--; SiguientePendiente(e);
                r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = para ? PARADA_R : ESQUIVA_R });
                // Doble parada: además del golpe, elimina otro dado sin usar del rival.
                if (para && pl[yo].dobleParada) {
                    for (int u = 1; u <= 6; u++) {
                        if (e.c[op, u] == 0 || (u == 6 && w != 6)) continue;
                        Estado e2 = e.Copia(); e2.c[op, u]--;
                        r.Add(new Mov { sig = e2, premio = 0, actor = yo, tipo = PARADA_R });
                    }
                }
            }
            Estado t = s.Copia(); SiguientePendiente(t);
            double pr = Impacto(t, op, yo);
            r.Add(new Mov { sig = t, premio = pr, actor = yo, tipo = ENCAJA });
            return r;
        }
        if (s.Total(yo) == 0) {
            if (s.Total(op) == 0) return r;
            Estado e = s.Copia(); e.turno = op;
            r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = PASA });
            return r;
        }
        for (int v = 1; v <= 6; v++) {
            if (s.c[yo, v] == 0) continue;
            if (Exito(v, pl[yo].golpe, 6) && reactiva && s.Total(op) > 0) {
                Estado e = s.Copia(); e.c[yo, v]--; e.turno = op; e.pend = v;
                r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = GOLPE });
            } else if (Exito(v, pl[yo].golpe, 6)) {
                Estado t = s.Copia(); t.c[yo, v]--; t.turno = op;
                double pr = Impacto(t, yo, op);
                r.Add(new Mov { sig = t, premio = pr, actor = yo, tipo = GOLPE });
            }
            // Doble golpe: dos dados a golpear a la vez (v2 >= v para no repetir).
            if (pl[yo].dobleGolpe && Exito(v, pl[yo].golpe, 6)) {
                for (int v2 = v; v2 <= 6; v2++) {
                    if (s.c[yo, v2] - (v2 == v ? 1 : 0) <= 0 || !Exito(v2, pl[yo].golpe, 6)) continue;
                    Estado e = s.Copia(); e.c[yo, v]--; e.c[yo, v2]--; e.turno = op;
                    if (reactiva && s.Total(op) > 0) {
                        e.pend = v2; e.pend2 = v;
                        r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = GOLPE });
                    } else {
                        double pr = Impacto(e, yo, op) + Impacto(e, yo, op);
                        r.Add(new Mov { sig = e, premio = pr, actor = yo, tipo = GOLPE });
                    }
                }
            }
            for (int u = 1; u <= 6; u++) {
                if (s.c[op, u] == 0) continue;
                if (!(v != 1 && (v == 6 || v + pl[yo].esquiva >= u + pl[op].golpe))) continue;
                Estado e = s.Copia(); e.c[yo, v]--; e.c[op, u]--; e.turno = op;
                if (gasolina) {
                    for (int f = 1; f <= 6; f++) {
                        if (e.c[yo, f] == 0) continue;
                        Estado e2 = e.Copia(); e2.c[yo, f]--;
                        r.Add(new Mov { sig = e2, premio = 0, actor = yo, tipo = ESQUIVA });
                    }
                } else r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = ESQUIVA });
            }
            if (Exito(v, pl[yo].parada, 6)) {
                for (int u = 1; u <= 6; u++) {
                    if (s.c[op, u] == 0 || (u == 6 && v != 6)) continue;
                    Estado e = s.Copia(); e.c[yo, v]--; e.c[op, u]--; e.turno = op;
                    r.Add(new Mov { sig = e, premio = 0, actor = yo, tipo = PARADA });
                    // Doble parada: un dado elimina dos dados del rival (u2 >= u).
                    if (pl[yo].dobleParada) {
                        for (int u2 = u; u2 <= 6; u2++) {
                            if (e.c[op, u2] == 0 || (u2 == 6 && v != 6)) continue;
                            Estado e2 = e.Copia(); e2.c[op, u2]--;
                            r.Add(new Mov { sig = e2, premio = 0, actor = yo, tipo = PARADA });
                        }
                    }
                }
            }
            Estado x = s.Copia(); x.c[yo, v]--; x.turno = op;
            r.Add(new Mov { sig = x, premio = 0, actor = yo, tipo = DESCARTE });
        }
        return r;
    }

    double V(Estado s) {
        long k = s.Clave(); double res;
        if (memo.TryGetValue(k, out res)) return res;
        List<Mov> h = Hijos(s);
        if (h.Count == 0) { memo[k] = 0; return 0; }
        bool max = h[0].actor == 0;
        double best = max ? double.NegativeInfinity : double.PositiveInfinity;
        foreach (Mov m in h) {
            double x = m.premio + V(m.sig);
            if (max ? x > best : x < best) best = x;
        }
        memo[k] = best; return best;
    }

    // Categoría de una opción: 0 = golpear, 1 = defender (parar o esquivar),
    // 2 = no hacer nada (descartar o encajar el golpe), 3 = pasar.
    static int Categoria(int tipo) {
        if (tipo == GOLPE) return 0;
        if (tipo == PARADA || tipo == ESQUIVA || tipo == PARADA_R || tipo == ESQUIVA_R) return 1;
        if (tipo == PASA) return 3;
        return 2;
    }

    // Jugador que siempre golpea si puede y nunca se defiende.
    static Mov Ingenuo(List<Mov> h) {
        Mov golpe = null, descarte = null;
        foreach (Mov m in h) {
            if (m.tipo == ENCAJA) return m;
            if (m.tipo == GOLPE) golpe = m;
            if (m.tipo == DESCARTE && descarte == null) descarte = m;
        }
        if (golpe != null) return golpe;
        if (descarte != null) return descarte;
        return h[0];
    }

    // Sigue la línea óptima (o la ingenua), cuenta qué opciones se usan y
    // mide las decisiones: hay elección real cuando se puede defender y también
    // golpear (o encajar, si es una reacción). Devuelve el estado final.
    Estado Jugar(Estado s, Resultado r) {
        while (true) {
            List<Mov> h = Hijos(s);
            if (h.Count == 0) return s;
            int actor = h[0].actor;
            double sg = actor == 0 ? 1 : -1;
            Mov mejor = null; double best = double.NegativeInfinity;
            double[] porCat = { double.NegativeInfinity, double.NegativeInfinity, double.NegativeInfinity, double.NegativeInfinity };
            foreach (Mov m in h) {
                double x = sg * (m.premio + V(m.sig));
                int c = Categoria(m.tipo);
                if (x > porCat[c]) porCat[c] = x;
                if (x > best + 1e-9) { best = x; mejor = m; }
            }
            bool reaccion = s.pend > 0;
            double otra = reaccion ? porCat[2] : porCat[0];
            if (!ingenuo[actor] && porCat[1] > double.NegativeInfinity && otra > double.NegativeInfinity) {
                double dif = Math.Abs(porCat[1] - otra);
                r.decisiones[actor]++;
                if (dif < 1.0) r.ajustadas[actor]++;
                r.coste[actor] += dif;
            }
            if (ingenuo[actor]) mejor = Ingenuo(h);
            if (mejor.tipo != PASA) r.uso[actor, mejor.tipo]++;
            s = mejor.sig;
        }
    }

    int[] Tirada(int n) { return Tirada(n, false); }

    // Con 'repetir' (apoyo de un aliado) se vuelve a tirar el dado más bajo si
    // es un 3 o menos (aproximación: un dado más alto nunca es peor para
    // golpear, parar ni esquivar). Los 6 dan un dado extra que no vuelve a
    // explotar.
    int[] Tirada(int n, bool repetir) {
        int[] c = new int[7];
        for (int i = 0; i < n; i++) c[rng.Next(1, 7)]++;
        if (repetir) {
            for (int f = 1; f <= 3; f++) if (c[f] > 0) { c[f]--; c[rng.Next(1, 7)]++; break; }
        }
        int extras = Math.Min(c[6], 7 - n); // máximo 7 dados (límite del simulador)
        for (int i = 0; i < extras; i++) c[rng.Next(1, 7)]++;
        return c;
    }

    // Combate a muerte: intercambios seguidos conservando vida y Durabilidad.
    // Los intercambios pares los empieza pl[0] y los impares pl[1] (cada uno
    // ataca en su activación y el otro reacciona). Cada intercambio se juega de
    // forma óptima, pero sin planificar los siguientes.
    // Devuelve Resultado.duelo (ver Resultado); el resto de estadísticas del
    // combate (uso, decisiones) quedan en ultimoDuelo.
    public Resultado ultimoDuelo;
    public double[] Duelo(int pruebas, int maxIntercambios) {
        Resultado basura = new Resultado();
        double[] r = basura.duelo;
        ultimoDuelo = basura;
        for (int t = 0; t < pruebas; t++) {
            int[] hp = { pl[0].vida, pl[1].vida }, d = { pl[0].durabilidad, pl[1].durabilidad };
            int k = 0;
            while (k < maxIntercambios && hp[0] > 0 && hp[1] > 0) {
                Estado s = new Estado();
                int[] a = Tirada(dados[0], repetir[0]), b = Tirada(dados[1], repetir[1]);
                for (int f = 1; f <= 6; f++) { s.c[0, f] = a[f]; s.c[1, f] = b[f]; }
                s.turno = k % 2;
                for (int p = 0; p < 2; p++) { s.d[p] = d[p]; s.hp[p] = hp[p]; }
                Estado fin = Jugar(s, basura);
                for (int p = 0; p < 2; p++) { d[p] = fin.d[p]; hp[p] = fin.hp[p]; }
                k++;
            }
            if (hp[1] == 0) r[0]++; else if (hp[0] == 0) r[1]++; else r[2]++;
            r[3] += k;
            if (hp[0] == 0 || hp[1] == 0) r[3 + Math.Min(k, 4)]++;
        }
        for (int i = 0; i < 9; i++) r[i] /= pruebas;
        return r;
    }

    // pl[0] = atacante (jugador activo), pl[1] = defensor que reacciona.
    // inicia: -1 = por Velocidad (empate: atacante); 0 = atacante; 1 = defensor.
    public Resultado Ejecutar(int pruebas, int inicia, int dadosAtacante) {
        if (inicia < 0) inicia = pl[1].velocidad > pl[0].velocidad ? 1 : 0;
        Resultado r = new Resultado();
        for (int t = 0; t < pruebas; t++) {
            Estado s = new Estado();
            int[] a = Tirada(dadosAtacante), b = Tirada(dados[1]);
            for (int f = 1; f <= 6; f++) { s.c[0, f] = a[f]; s.c[1, f] = b[f]; }
            s.turno = inicia;
            for (int p = 0; p < 2; p++) { s.d[p] = pl[p].durabilidad; s.hp[p] = pl[p].vida; }
            Estado fin = Jugar(s, r);
            for (int p = 0; p < 2; p++) {
                r.dano[p] += pl[p].vida - fin.hp[p];
                if (fin.hp[p] == 0) r.muere[p]++;
            }
            // Referencia: el defensor no reacciona y el atacante tira para golpear.
            int dur = pl[1].durabilidad, total = 0;
            for (int f = 1; f <= 6; f++)
                for (int i = 0; i < a[f]; i++)
                    if (Exito(f, pl[0].golpe, 6)) {
                        int dm = pl[0].dano;
                        if (dur > 0) { dm = Math.Max(0, dm - pl[1].reduccion); dur--; }
                        total += dm;
                    }
            r.danoSinReaccion += Math.Min(total, pl[1].vida);
            if (total >= pl[1].vida) r.muereSinReaccion++;
        }
        r.danoSinReaccion /= pruebas; r.muereSinReaccion /= pruebas;
        for (int p = 0; p < 2; p++) {
            r.dano[p] /= pruebas; r.muere[p] /= pruebas;
            double tot = 0; for (int k = 0; k < 8; k++) if (k != PASA) tot += r.uso[p, k];
            for (int k = 0; k < 8; k++) r.uso[p, k] /= Math.Max(1, tot);
        }
        return r;
    }
}
