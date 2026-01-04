alert("script.js cargado");

// ==============================
// CONFIGURACIÓN VISUAL
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

// ==============================
// PAREJAS Y PUNTOS
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
// ESTADO GLOBAL
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];
let esperandoAutomatico = false;

let jugadorQueDa = null;
let cartaTriunfo = null;
let triunfo = "";

let bazasJugadas = 0;
let manoTerminada = false;
let puntosParejas = [0, 0];

// ==============================
// DATOS DE CARTAS
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
// INICIO DE MANO
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
    bazaActual = [];
    bazasJugadas = 0;
    manoTerminada = false;
    esperandoAutomatico = false;

    if (jugadorQueDa === null) {
        jugadorQueDa = Math.floor(Math.random() * 4);
    }

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    // 🔒 TRIUNFO SIEMPRE DESDE LA MANO DEL QUE DA
    const mano = jugadores[jugadorQueDa].mano;
    cartaTriunfo = mano[Math.floor(Math.random() * mano.length)];
    triunfo = cartaTriunfo.palo;

    turnoActual = (jugadorQueDa + 1) % 4;

    console.log("Jugador que da:", jugadorQueDa);
    console.log("Triunfo:", triunfo);

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
// JUGADOR AUTOMÁTICO
// ==============================

function jugarAutomatico() {
    if (manoTerminada || turnoActual === 0) return;

    const jugador = jugadores[turnoActual];
    const legales = cartasLegales(jugador);
    const carta = legales[0];

    jugarCarta(turnoActual, jugador.mano.indexOf(carta));
}

// ==============================
// RESOLVER BAZA
// ==============================

function resolverBaza() {
    let ganadora = bazaActual[0];

    bazaActual.forEach(j => {
        const c = j.carta;
        const g = ganadora.carta;

        if (c.palo === triunfo && g.palo !== triunfo) ganadora = j;
        else if (
            c.palo === g.palo &&
            ORDEN_VALORES.indexOf(c.valor) > ORDEN_VALORES.indexOf(g.valor)
        ) ganadora = j;
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
// RENDER JUGADOR
// ==============================

function renderMesaJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";
    mesa.style.display = "flex";
    mesa.style.justifyContent = "center";
    mesa.style.alignItems = "flex-end";
    mesa.style.padding = "20px";

    const legales = cartasLegales(jugadores[0]);

    jugadores[0].mano.forEach((carta, i) => {
        const div = crearCartaDiv(carta);
        const legal = legales.includes(carta);

        div.style.opacity = legal ? "1" : "0.4";
        div.style.marginLeft = i === 0 ? "0" : "-120px";
        div.style.transition = "transform 0.15s";

        if (legal && !manoTerminada) {
            div.onmouseenter = () => div.style.transform = "translateY(-40px)";
            div.onmouseleave = () => div.style.transform = "translateY(0)";
            div.onclick = () => turnoActual === 0 && jugarCarta(0, i);
        }

        mesa.appendChild(div);
    });
}

// ==============================
// RIVALES
// ==============================

function renderRivales() {
    renderRival(1, "arriba");
    renderRival(2, "izquierda");
    renderRival(3, "derecha");
}

function renderRival(id, pos) {
    let div = document.getElementById("rival-" + id);
    if (!div) {
        div = document.createElement("div");
        div.id = "rival-" + id;
        div.style.position = "absolute";
        document.body.appendChild(div);
    }

    div.innerHTML = "";

    if (pos === "arriba") {
        div.style.top = "10px";
        div.style.left = "50%";
        div.style.transform = "translateX(-50%)";
        div.style.display = "flex";
    }
    if (pos === "izquierda") {
        div.style.left = "10px";
        div.style.top = "50%";
        div.style.transform = "translateY(-50%)";
        div.style.display = "flex";
        div.style.flexDirection = "column";
    }
    if (pos === "derecha") {
        div.style.right = "10px";
        div.style.top = "50%";
        div.style.transform = "translateY(-50%)";
        div.style.display = "flex";
        div.style.flexDirection = "column";
    }

    jugadores[id].mano.forEach(() => div.appendChild(crearDorsoDiv()));
}

// ==============================
// RENDER INFO
// ==============================

function renderBaza() {
    const div = document.getElementById("baza");
    div.innerHTML = "";
    div.style.display = "flex";
    div.style.justifyContent = "center";

    bazaActual.forEach(j => div.appendChild(crearCartaDiv(j.carta)));
}

function renderTurno() {
    const div = document.getElementById("turno");
    div.textContent = "Turno del jugador " + turnoActual;
}

function renderTriunfo() {
    const div = document.getElementById("triunfo");
    div.innerHTML = "Triunfo:<br>";
    div.appendChild(crearCartaDiv(cartaTriunfo));
}

function renderPuntuacion() {
    const div = document.getElementById("puntuacion");
    div.innerHTML = `
        Pareja 0 (0–2): ${puntosParejas[0]} puntos<br>
        Pareja 1 (1–3): ${puntosParejas[1]} puntos
    `;
}

function renderFinMano() {
    const div = document.getElementById("fin-mano");
    div.textContent = manoTerminada ? "Fin de la mano" : "";
}

// ==============================
// CARTAS
// ==============================

function crearCartaDiv(carta) {
    const d = document.createElement("div");
    d.style.width = ANCHO_CARTA + "px";
    d.style.height = ALTO_CARTA + "px";
    d.style.backgroundImage = "url('cartas/baraja.png')";
    d.style.backgroundRepeat = "no-repeat";
    d.style.backgroundPosition =
        `-${carta.columna * ANCHO_CARTA}px -${carta.fila * ALTO_CARTA}px`;
    return d;
}

function crearDorsoDiv() {
    const d = document.createElement("div");
    d.style.width = ANCHO_CARTA + "px";
    d.style.height = ALTO_CARTA + "px";
    d.style.backgroundImage = "url('cartas/baraja.png')";
    d.style.backgroundRepeat = "no-repeat";
    d.style.backgroundPosition =
        `-${DORSO.columna * ANCHO_CARTA}px -${DORSO.fila * ALTO_CARTA}px`;
    return d;
}

// ==============================
// BOTÓN
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnRepartir").onclick = repartir;
});
