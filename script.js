alert("script.js cargado");

// ==============================
// CONFIGURACIÓN
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

// ==============================
// PAREJAS Y PUNTUACIÓN
// ==============================

const PAREJAS = { 0: 0, 1: 1, 2: 0, 3: 1 };

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

let jugadorQueDa = null;
let cartaTriunfo = null;
let triunfo = null;

let bazasJugadas = 0;
let manoTerminada = false;
let puntosParejas = [0, 0];

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
    document.body.style.backgroundColor = "#0b5c3b";
    document.body.style.margin = "0";

    jugadores = [
        { id: 0, mano: [], bazas: [] },
        { id: 1, mano: [], bazas: [] },
        { id: 2, mano: [], bazas: [] },
        { id: 3, mano: [], bazas: [] }
    ];

    puntosParejas = [0, 0];
    bazasJugadas = 0;
    manoTerminada = false;
    bazaActual = [];
    esperandoAutomatico = false;

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    if (jugadorQueDa === null) {
        jugadorQueDa = Math.floor(Math.random() * 4);
    }

    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    const manoQueDa = jugadores[jugadorQueDa].mano;
    cartaTriunfo = manoQueDa[Math.floor(Math.random() * manoQueDa.length)];
    triunfo = cartaTriunfo.palo;

    turnoActual = (jugadorQueDa + 1) % 4;

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

function jugarCarta(idJugador, indice) {
    if (manoTerminada) return;

    const carta = jugadores[idJugador].mano.splice(indice, 1)[0];
    bazaActual.push({ jugador: idJugador, carta });

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
// AUTOMÁTICO
// ==============================

function jugarAutomatico() {
    if (manoTerminada || turnoActual === 0) return;

    const jugador = jugadores[turnoActual];
    const legales = cartasLegales(jugador);
    jugarCarta(turnoActual, jugador.mano.indexOf(legales[0]));
}

// ==============================
// RESOLVER BAZA + PUNTOS
// ==============================

function resolverBaza() {
    let ganadora = bazaActual[0];

    bazaActual.forEach(j => {
        const c = j.carta;
        const g = ganadora.carta;

        if (c.palo === triunfo && g.palo !== triunfo) ganadora = j;
        else if (c.palo === g.palo &&
            ORDEN_VALORES.indexOf(c.valor) > ORDEN_VALORES.indexOf(g.valor)) {
            ganadora = j;
        }
    });

    const pareja = PAREJAS[ganadora.jugador];

    bazaActual.forEach(j => {
        puntosParejas[pareja] += PUNTOS_CARTA[j.carta.valor] || 0;
    });

    turnoActual = ganadora.jugador;
    bazaActual = [];
    bazasJugadas++;

    if (bazasJugadas === 10) manoTerminada = true;

    esperandoAutomatico = false;
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
    renderPuntuacion();
    renderFinMano();

    if (!manoTerminada && turnoActual !== 0 && bazaActual.length < 4 && !esperandoAutomatico) {
        esperandoAutomatico = true;
        setTimeout(jugarAutomatico, 600);
    }
}

// ==============================
// MESA JUGADOR
// ==============================

function renderMesaJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    mesa.style.display = "flex";
    mesa.style.justifyContent = "center";
    mesa.style.alignItems = "flex-end";
    mesa.style.padding = "20px";

    const legales = cartasLegales(jugadores[0]);

    jugadores[0].mano.forEach((carta, index) => {
        const div = crearCartaDiv(carta);
        const esLegal = legales.includes(carta);

        div.style.opacity = esLegal ? "1" : "0.4";
        div.style.marginLeft = index === 0 ? "0" : "-120px";
        div.style.zIndex = index;
        div.style.transition = "transform 0.15s";

        if (esLegal && !manoTerminada) {
            div.onmouseenter = () => div.style.transform = "translateY(-40px)";
            div.onmouseleave = () => div.style.transform = "translateY(0)";
            div.onclick = () => turnoActual === 0 && jugarCarta(0, index);
        }

        mesa.appendChild(div);
    });
}

// ==============================
// RIVALES (CORREGIDO)
// ==============================

function renderRivales() {
    renderRival(1, "arriba");
    renderRival(2, "izquierda");
    renderRival(3, "derecha");
}

function renderRival(id, posicion) {
    let cont = document.getElementById("rival-" + id);
    if (!cont) {
        cont = document.createElement("div");
        cont.id = "rival-" + id;
        cont.style.position = "absolute";
        document.body.appendChild(cont);
    }

    cont.innerHTML = "";

    if (posicion === "arriba") {
        cont.style.top = "10px";
        cont.style.left = "50%";
        cont.style.transform = "translateX(-50%)";
        cont.style.display = "flex";
    }

    if (posicion === "izquierda") {
        cont.style.left = "10px";
        cont.style.top = "50%";
        cont.style.transform = "translateY(-50%)";
        cont.style.display = "flex";
        cont.style.flexDirection = "column";
    }

    if (posicion === "derecha") {
        cont.style.right = "10px";
        cont.style.top = "50%";
        cont.style.transform = "translateY(-50%)";
        cont.style.display = "flex";
        cont.style.flexDirection = "column";
    }

    jugadores[id].mano.forEach(() => cont.appendChild(crearDorsoDiv()));
}

// ==============================
// BAZA Y INFO
// ==============================

function renderBaza() {
    const baza = document.getElementById("baza");
    baza.innerHTML = "";
    baza.style.display = "flex";
    baza.style.justifyContent = "center";

    bazaActual.forEach(j => baza.appendChild(crearCartaDiv(j.carta)));
}

function renderTurno() {
    let div = document.getElementById("turno");
    if (!div) {
        div = document.createElement("div");
        div.id = "turno";
        div.style.color = "white";
        div.style.textAlign = "center";
        document.body.appendChild(div);
    }
    div.textContent = "Turno del jugador " + turnoActual;
}

function renderTriunfo() {
    let div = document.getElementById("triunfo");
    if (!div) {
        div = document.createElement("div");
        div.id = "triunfo";
        div.style.color = "white";
        div.style.textAlign = "center";
        document.body.appendChild(div);
    }

    div.innerHTML = "Triunfo:<br>";
    if (cartaTriunfo) div.appendChild(crearCartaDiv(cartaTriunfo));
}

function renderPuntuacion() {
    let div = document.getElementById("puntuacion");
    if (!div) {
        div = document.createElement("div");
        div.id = "puntuacion";
        div.style.color = "white";
        div.style.textAlign = "center";
        document.body.appendChild(div);
    }

    div.innerHTML = `
        Pareja 0 (0 & 2): ${puntosParejas[0]} puntos<br>
        Pareja 1 (1 & 3): ${puntosParejas[1]} puntos
    `;
}

function renderFinMano() {
    let div = document.getElementById("fin-mano");
    if (!div) {
        div = document.createElement("div");
        div.id = "fin-mano";
        div.style.color = "white";
        div.style.textAlign = "center";
        document.body.appendChild(div);
    }

    div.textContent = manoTerminada ? "Fin de la mano" : "";
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

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnRepartir").addEventListener("click", repartir);
});
