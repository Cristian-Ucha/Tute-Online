const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

const ASIENTOS = [0, 1, 2, 3];
const PAREJAS_POR_ASIENTO = { 0: 0, 2: 0, 1: 1, 3: 1 };

const PUNTOS_CARTA = {
    as: 11,
    tres: 10,
    rey: 4,
    caballo: 3,
    sota: 2
};

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];
let triunfo = null;
let cartaTriunfo = null;
let asientoQueDa = null;

let bazasJugadas = 0;
let manoTerminada = false;
let puntosPareja = [0, 0];

let esperandoIA = false;
let inicioDeMano = true; // 🔴 NUEVO: controla la salida real

// ==============================
// DATOS DEL TUTE
// ==============================

const PALOS = [
    { nombre: "oros", fila: 0 },
    { nombre: "copas", fila: 1 },
    { nombre: "espadas", fila: 2 },
    { nombre: "bastos", fila: 3 }
];

const ORDEN_VALORES = [
    "dos", "cuatro", "cinco", "seis", "siete",
    "sota", "caballo", "rey", "tres", "as"
];

const VALORES = [
    { nombre: "as", columna: 0 },
    { nombre: "dos", columna: 1 },
    { nombre: "tres", columna: 2 },
    { nombre: "cuatro", columna: 3 },
    { nombre: "cinco", columna: 4 },
    { nombre: "seis", columna: 5 },
    { nombre: "siete", columna: 6 },
    { nombre: "sota", columna: 9 },
    { nombre: "caballo", columna: 10 },
    { nombre: "rey", columna: 11 }
];

// ==============================
// BARAJA
// ==============================

function crearBaraja() {
    const baraja = [];
    PALOS.forEach(p =>
        VALORES.forEach(v =>
            baraja.push({
                palo: p.nombre,
                valor: v.nombre,
                fila: p.fila,
                columna: v.columna
            })
        )
    );
    return baraja;
}

// ==============================
// REPARTO
// ==============================

function repartir() {
    jugadores = ASIENTOS.map(a => ({ asiento: a, mano: [] }));
    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    if (asientoQueDa === null) {
        asientoQueDa = Math.floor(Math.random() * 4);
    }

    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    const mano = jugadores[asientoQueDa].mano;
    cartaTriunfo = mano[Math.floor(Math.random() * mano.length)];
    triunfo = cartaTriunfo.palo;

    turnoActual = (asientoQueDa + 1) % 4; // ✔ correcto
    inicioDeMano = true;                  // 🔴 clave

    bazaActual = [];
    bazasJugadas = 0;
    manoTerminada = false;
    puntosPareja = [0, 0];
    esperandoIA = false;

    document.getElementById("fin-mano").style.display = "none";
    render();
}

// ==============================
// CARTAS LEGALES
// ==============================

function cartasLegales(j) {
    if (bazaActual.length === 0) return j.mano;

    const paloSalida = bazaActual[0].carta.palo;

    const delPalo = j.mano.filter(c => c.palo === paloSalida);
    if (delPalo.length) return delPalo;

    const triunfos = j.mano.filter(c => c.palo === triunfo);
    if (triunfos.length) return triunfos;

    return j.mano;
}

// ==============================
// JUGAR CARTA
// ==============================

function jugarCarta(asiento, index) {
    if (manoTerminada) return;

    const jugador = jugadores[asiento];
    const carta = jugador.mano.splice(index, 1)[0];

    bazaActual.push({ asiento, carta });
    esperandoIA = false;
    inicioDeMano = false; // 🔴 ya se ha salido

    if (bazaActual.length === 4) {
        setTimeout(resolverBaza, 1200);
    } else {
        turnoActual = (turnoActual + 1) % 4;
    }

    render();
}

// ==============================
// IA (CORREGIDA)
// ==============================

function jugarAutomatico() {
    if (manoTerminada) return;
    if (turnoActual === 0) return;
    if (esperandoIA) return;
    if (bazaActual.length === 4) return;

    // 🔴 NO ejecutar IA automáticamente al inicio de mano
    if (inicioDeMano) return;

    esperandoIA = true;

    setTimeout(() => {
        const jugador = jugadores[turnoActual];
        const legales = cartasLegales(jugador);
        const carta = legales[0];
        const index = jugador.mano.indexOf(carta);
        jugarCarta(turnoActual, index);
    }, 600);
}

// ==============================
// RESOLVER BAZA
// ==============================

function resolverBaza() {
    let ganadora = bazaActual[0];

    bazaActual.forEach(j => {
        const c = j.carta;
        const g = ganadora.carta;

        if (c.palo === triunfo && g.palo !== triunfo) {
            ganadora = j;
        } else if (
            c.palo === g.palo &&
            ORDEN_VALORES.indexOf(c.valor) > ORDEN_VALORES.indexOf(g.valor)
        ) {
            ganadora = j;
        }
    });

    const pareja = PAREJAS_POR_ASIENTO[ganadora.asiento];
    bazaActual.forEach(j => {
        puntosPareja[pareja] += PUNTOS_CARTA[j.carta.valor] || 0;
    });

    turnoActual = ganadora.asiento;
    bazaActual = [];
    bazasJugadas++;

    if (bazasJugadas === 10) {
        manoTerminada = true;
    }

    inicioDeMano = true; // 🔴 nueva baza → nueva salida
    render();
}

// ==============================
// RENDER GENERAL
// ==============================

function render() {
    renderMesa();
    renderBaza();
    renderTriunfo();
    renderRivales();

    document.getElementById("turno").textContent =
        "Turno del asiento " + turnoActual;

    if (manoTerminada) {
        const f = document.getElementById("fin-mano");
        f.style.display = "block";
        f.innerHTML = `
            <strong>Fin de la mano</strong><br><br>
            Pareja 0 (0 y 2): ${puntosPareja[0]} puntos<br>
            Pareja 1 (1 y 3): ${puntosPareja[1]} puntos
        `;
    } else {
        jugarAutomatico();
    }
}

// ==============================
// RENDER MESA (Z-INDEX FIJO)
// ==============================

function renderMesa() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const jugador = jugadores[0];
    const legales = cartasLegales(jugador);

    jugador.mano.forEach((c, i) => {
        const d = crearCarta(c);
        d.classList.add("carta");

        d.style.zIndex = i; // 🔴 CLAVE
        const esLegal = legales.includes(c);
        d.style.opacity = esLegal ? "1" : "0.4";

        if (esLegal && turnoActual === 0 && !manoTerminada) {
            d.onclick = () => jugarCarta(0, i);
        }

        mesa.appendChild(d);
    });
}

// ==============================
// RESTO DE RENDER
// ==============================

function renderBaza() {
    const b = document.getElementById("baza");
    b.innerHTML = "";
    bazaActual.forEach(j => b.appendChild(crearCarta(j.carta)));
}

function renderTriunfo() {
    const t = document.getElementById("triunfo");
    t.innerHTML = "Triunfo<br>";
    t.appendChild(crearCarta(cartaTriunfo));
}

function renderRivales() {
    [1, 2, 3].forEach(id => {
        const c = document.getElementById("rival-" + id);
        c.innerHTML = "";
        jugadores[id].mano.forEach(() => c.appendChild(crearDorso()));
    });
}

// ==============================
// CARTAS
// ==============================

function crearCarta(c) {
    const d = document.createElement("div");
    d.style.width = ANCHO_CARTA + "px";
    d.style.height = ALTO_CARTA + "px";
    d.style.backgroundImage = "url('cartas/baraja.png')";
    d.style.backgroundPosition =
        `-${c.columna * ANCHO_CARTA}px -${c.fila * ALTO_CARTA}px`;
    return d;
}

function crearDorso() {
    const d = document.createElement("div");
    d.style.width = ANCHO_CARTA + "px";
    d.style.height = ALTO_CARTA + "px";
    d.style.backgroundImage = "url('cartas/baraja.png')";
    d.style.backgroundPosition =
        `-${DORSO.columna * ANCHO_CARTA}px -${DORSO.fila * ALTO_CARTA}px`;
    return d;
}

// ==============================
// BOTÓN
// ==============================

document.getElementById("btnRepartir").onclick = repartir;
