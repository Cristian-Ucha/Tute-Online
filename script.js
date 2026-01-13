// ==============================
// CONFIGURACIÓN CARTAS
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

// ==============================
// MODELO GENERAL
// ==============================

const ASIENTOS = [0, 1, 2, 3];
const PAREJAS_POR_ASIENTO = { 0: 0, 2: 0, 1: 1, 3: 1 };

// ==============================
// ESTADO DEL JUEGO
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];

let triunfo = null;
let cartaTriunfo = null;
let asientoQueDa = null;

let bazasJugadas = 0;
let manoTerminada = false;

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
    jugadores = ASIENTOS.map(a => ({
        asiento: a,
        mano: [],
        posiblesCanticos: [],
        canticosRealizados: [],
        haCantadoEnEstaBaza: false,
        haGanadoBazaEnLaMano: false
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
    bazasJugadas = 0;
    manoTerminada = false;

    recalcularTodosLosCanticos();
    render();
    gestionarTurno();
}

// ==============================
// CÁLCULO DE CÁNTICOS
// ==============================

function calcularPosiblesCanticos(jugador) {
    const posibles = [];

    PALOS.forEach(palo => {
        const tieneRey = jugador.mano.some(
            c => c.valor === "rey" && c.palo === palo.nombre
        );
        const tieneCaballo = jugador.mano.some(
            c => c.valor === "caballo" && c.palo === palo.nombre
        );

        const yaCantado = jugador.canticosRealizados.some(
            c => c.palo === palo.nombre
        );

        if (tieneRey && tieneCaballo && !yaCantado) {
            posibles.push({
                palo: palo.nombre,
                tipo: palo.nombre === triunfo ? 40 : 20
            });
        }
    });

    return posibles;
}

function recalcularTodosLosCanticos() {
    jugadores.forEach(j => {
        j.posiblesCanticos = calcularPosiblesCanticos(j);
    });
}

function puedeCantar(jugador) {
    return (
        jugador.haGanadoBazaEnLaMano &&
        jugador.posiblesCanticos.length > 0 &&
        !jugador.haCantadoEnEstaBaza &&
        bazaActual.length === 0
    );
}

// ==============================
// CARTAS LEGALES
// ==============================

function cartasLegales(jugador) {
    if (bazaActual.length === 0) return jugador.mano;

    const paloSalida = bazaActual[0].carta.palo;

    const delPalo = jugador.mano.filter(c => c.palo === paloSalida);
    if (delPalo.length) return delPalo;

    const triunfos = jugador.mano.filter(c => c.palo === triunfo);
    if (triunfos.length) return triunfos;

    return jugador.mano;
}

// ==============================
// FLUJO DE TURNOS
// ==============================

function gestionarTurno() {
    if (manoTerminada) return;

    if (turnoActual === 0) return;

    setTimeout(() => {
        const jugador = jugadores[turnoActual];
        const legales = cartasLegales(jugador);
        const carta = legales[0];
        const indice = jugador.mano.indexOf(carta);
        jugarCarta(turnoActual, indice);
    }, 600);
}

// ==============================
// JUGAR CARTA
// ==============================

function jugarCarta(asiento, indice) {
    if (manoTerminada) return;

    const jugador = jugadores[asiento];
    const carta = jugador.mano.splice(indice, 1)[0];

    bazaActual.push({ asiento, carta });

    recalcularTodosLosCanticos();

    if (bazaActual.length === 4) {
        render();
        setTimeout(resolverBaza, 1200);
        return;
    }

    turnoActual = (turnoActual + 1) % 4;
    render();
    gestionarTurno();
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
            ORDEN_VALORES.indexOf(c.valor) >
                ORDEN_VALORES.indexOf(g.valor)
        ) {
            ganadora = j;
        }
    });

    const parejaGanadora = PAREJAS_POR_ASIENTO[ganadora.asiento];

    jugadores.forEach(j => {
        if (PAREJAS_POR_ASIENTO[j.asiento] === parejaGanadora) {
            j.haGanadoBazaEnLaMano = true;
            j.haCantadoEnEstaBaza = false;
        }
    });

    turnoActual = ganadora.asiento;
    bazaActual = [];
    bazasJugadas++;

    if (bazasJugadas === 10) {
        manoTerminada = true;
        render();
        return;
    }

    recalcularTodosLosCanticos();
    render();
    gestionarTurno();
}

// ==============================
// RENDER
// ==============================

function render() {
    renderMesaJugador();
    renderRivales();
    renderBaza();
    renderTriunfo();

    document.getElementById("turno").textContent =
        "Turno del asiento " + turnoActual;
}

// ==============================
// RENDER JUGADOR HUMANO
// ==============================

function renderMesaJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const jugador = jugadores[0];
    const legales = cartasLegales(jugador);

    jugador.mano.forEach((carta, i) => {
        const div = crearCartaDiv(carta);
        div.style.zIndex = i;

        const esLegal = legales.includes(carta);
        div.style.opacity = esLegal ? "1" : "0.4";

        if (esLegal && turnoActual === 0 && !manoTerminada) {
            div.onclick = () => jugarCarta(0, i);
        }

        mesa.appendChild(div);
    });
}

// ==============================
// RIVALES
// ==============================

function renderRivales() {
    [1, 2, 3].forEach(id => {
        const cont = document.getElementById("rival-" + id);
        cont.innerHTML = "";
        jugadores[id].mano.forEach(() =>
            cont.appendChild(crearDorsoDiv())
        );
    });
}

// ==============================
// BAZA
// ==============================

function renderBaza() {
    const baza = document.getElementById("baza");
    baza.innerHTML = "";
    bazaActual.forEach(j =>
        baza.appendChild(crearCartaDiv(j.carta))
    );
}

// ==============================
// TRIUNFO
// ==============================

function renderTriunfo() {
    const cont = document.getElementById("triunfo");
    cont.innerHTML = "Triunfo<br>";
    cont.appendChild(crearCartaDiv(cartaTriunfo));
}

// ==============================
// CARTAS
// ==============================

function crearCartaDiv(carta) {
    const div = document.createElement("div");
    div.style.width = ANCHO_CARTA + "px";
    div.style.height = ALTO_CARTA + "px";
    div.style.backgroundImage = "url('cartas/baraja.png')";
    div.style.backgroundRepeat = "no-repeat";
    div.style.backgroundPosition =
        `-${carta.columna * ANCHO_CARTA}px -${carta.fila * ALTO_CARTA}px`;
    return div;
}

function crearDorsoDiv() {
    const div = document.createElement("div");
    div.style.width = ANCHO_CARTA + "px";
    div.style.height = ALTO_CARTA + "px";
    div.style.backgroundImage = "url('cartas/baraja.png')";
    div.style.backgroundRepeat = "no-repeat";
    div.style.backgroundPosition =
        `-${DORSO.columna * ANCHO_CARTA}px -${DORSO.fila * ALTO_CARTA}px`;
    return div;
}

// ==============================
// BOTÓN
// ==============================

document.getElementById("btnRepartir").onclick = repartir;
