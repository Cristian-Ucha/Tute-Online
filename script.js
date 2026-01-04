alert("script.js cargado");

// ==============================
// CONFIGURACIÓN
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

// ==============================
// MODELO DE MESA
// ==============================

const ASIENTOS = [0, 1, 2, 3];

const PAREJAS_POR_ASIENTO = {
    0: 0,
    2: 0,
    1: 1,
    3: 1
};

const PUNTOS_CARTA = {
    as: 11,
    tres: 10,
    rey: 4,
    caballo: 3,
    sota: 2
};

// ==============================
// ESTADO DEL JUEGO
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];
let esperandoAutomatico = false;

let triunfo = null;
let cartaTriunfo = null;
let asientoQueDa = null;

let bazasJugadas = 0;
let manoTerminada = false;

let puntosPareja = [0, 0];

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
    PALOS.forEach(palo => {
        VALORES.forEach(valor => {
            baraja.push({
                palo: palo.nombre,
                valor: valor.nombre,
                fila: palo.fila,
                columna: valor.columna
            });
        });
    });
    return baraja;
}

// ==============================
// REPARTO + TRIUNFO
// ==============================

function repartir() {
    jugadores = ASIENTOS.map(asiento => ({
        asiento,
        mano: [],
        bazas: []
    }));

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    if (asientoQueDa === null) {
        asientoQueDa = Math.floor(Math.random() * 4);
    }

    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    const manoDelQueDa = jugadores[asientoQueDa].mano;
    cartaTriunfo = manoDelQueDa[Math.floor(Math.random() * manoDelQueDa.length)];
    triunfo = cartaTriunfo.palo;

    turnoActual = (asientoQueDa + 1) % 4;

    bazaActual = [];
    esperandoAutomatico = false;
    bazasJugadas = 0;
    manoTerminada = false;
    puntosPareja = [0, 0];

    render();
}

// ==============================
// CARTAS LEGALES
// ==============================

function cartasLegales(jugador) {
    if (bazaActual.length === 0) return jugador.mano;

    const paloSalida = bazaActual[0].carta.palo;

    const delPalo = jugador.mano.filter(c => c.palo === paloSalida);
    if (delPalo.length > 0) return delPalo;

    const triunfos = jugador.mano.filter(c => c.palo === triunfo);
    if (triunfos.length > 0) return triunfos;

    return jugador.mano;
}

// ==============================
// JUGAR CARTA
// ==============================

function jugarCarta(asiento, indiceReal) {
    if (manoTerminada) return;

    const jugador = jugadores[asiento];
    const carta = jugador.mano.splice(indiceReal, 1)[0];

    bazaActual.push({ asiento, carta });

    if (bazaActual.length === 4) {
        render();
        setTimeout(resolverBaza, 1200);
        return;
    }

    turnoActual = (turnoActual + 1) % 4;
    esperandoAutomatico = false;
    render();
}

// ==============================
// JUGADOR AUTOMÁTICO
// ==============================

function jugarAutomatico() {
    if (manoTerminada) return;
    if (turnoActual === 0) return;

    const jugador = jugadores[turnoActual];
    const legales = cartasLegales(jugador);
    const carta = legales[0];

    jugarCarta(turnoActual, jugador.mano.indexOf(carta));
}

// ==============================
// RESOLVER BAZA + PUNTOS
// ==============================

function resolverBaza() {
    let ganadora = bazaActual[0];

    bazaActual.forEach(jugada => {
        const c = jugada.carta;
        const g = ganadora.carta;

        if (c.palo === triunfo && g.palo !== triunfo) {
            ganadora = jugada;
            return;
        }

        if (c.palo === g.palo) {
            const v1 = ORDEN_VALORES.indexOf(c.valor);
            const v2 = ORDEN_VALORES.indexOf(g.valor);
            if (v1 > v2) ganadora = jugada;
        }
    });

    const parejaGanadora = PAREJAS_POR_ASIENTO[ganadora.asiento];

    bazaActual.forEach(jugada => {
        puntosPareja[parejaGanadora] += PUNTOS_CARTA[jugada.carta.valor] || 0;
    });

    turnoActual = ganadora.asiento;
    bazaActual = [];
    esperandoAutomatico = false;

    bazasJugadas++;
    if (bazasJugadas === 10) {
        manoTerminada = true;
    }

    render();
}

// ==============================
// RENDER GENERAL
// ==============================

function render() {
    renderMesaJugador();
    renderRivales();
    renderBaza();
    renderTurno();
    renderTriunfo();
    renderFinDeMano();

    if (!manoTerminada && turnoActual !== 0 && bazaActual.length < 4 && !esperandoAutomatico) {
        esperandoAutomatico = true;
        setTimeout(jugarAutomatico, 600);
    }
}

// ==============================
// FIN DE MANO (🔴 CLAVE AQUÍ)
// ==============================

function renderFinDeMano() {
    const div = document.getElementById("fin-mano");

    if (!manoTerminada) {
        div.style.display = "none";
        return;
    }

    div.style.display = "block";
    div.innerHTML = `
        <strong>Fin de la mano</strong><br><br>
        Pareja 0 (asientos 0 y 2): ${puntosPareja[0]} puntos<br>
        Pareja 1 (asientos 1 y 3): ${puntosPareja[1]} puntos
    `;
}

// ==============================
// RESTO DE RENDER (SIN CAMBIOS)
// ==============================

function renderMesaJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const jugador = jugadores[0];
    const legales = cartasLegales(jugador);

    jugador.mano.forEach((carta, index) => {
        const div = crearCartaDiv(carta);
        const esLegal = legales.includes(carta);

        div.style.opacity = esLegal ? "1" : "0.4";
        div.style.marginLeft = index === 0 ? "0px" : "-120px";

        if (esLegal && !manoTerminada) {
            div.onclick = () => turnoActual === 0 && jugarCarta(0, index);
        }

        mesa.appendChild(div);
    });
}

function renderTriunfo() {
    const cont = document.getElementById("triunfo");
    cont.innerHTML = "Triunfo<br>";
    cont.appendChild(crearCartaDiv(cartaTriunfo));
}

function renderTurno() {
    document.getElementById("turno").textContent =
        "Turno del asiento " + turnoActual;
}

function renderRivales() {
    [1, 2, 3].forEach(id => {
        const cont = document.getElementById("rival-" + id);
        cont.innerHTML = "";
        jugadores[id].mano.forEach(() => cont.appendChild(crearDorsoDiv()));
    });
}

function renderBaza() {
    const baza = document.getElementById("baza");
    baza.innerHTML = "";
    bazaActual.forEach(j => baza.appendChild(crearCartaDiv(j.carta)));
}

// ==============================
// CARTAS
// ==============================

function crearCartaDiv(carta) {
    const div = document.createElement("div");
    div.style.width = ANCHO_CARTA + "px";
    div.style.height = ALTO_CARTA + "px";
    div.style.backgroundImage = "url('cartas/baraja.png')";
    div.style.backgroundPosition =
        `-${carta.columna * ANCHO_CARTA}px -${carta.fila * ALTO_CARTA}px`;
    return div;
}

function crearDorsoDiv() {
    const div = document.createElement("div");
    div.style.width = ANCHO_CARTA + "px";
    div.style.height = ALTO_CARTA + "px";
    div.style.backgroundImage = "url('cartas/baraja.png')";
    div.style.backgroundPosition =
        `-${DORSO.columna * ANCHO_CARTA}px -${DORSO.fila * ALTO_CARTA}px`;
    return div;
}

// ==============================
// BOTÓN
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnRepartir").addEventListener("click", repartir);
});
