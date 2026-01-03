alert("script.js cargado");

// ==============================
// CONFIGURACIÓN
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;

const DORSO = { fila: 4, columna: 1 };

// ==============================
// ESTADO DEL JUEGO
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];
let esperandoAutomatico = false;

// ==============================
// DATOS DEL TUTE
// ==============================

const PALOS = [
    { nombre: "oros", fila: 0 },
    { nombre: "copas", fila: 1 },
    { nombre: "espadas", fila: 2 },
    { nombre: "bastos", fila: 3 }
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
// REPARTO
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

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    turnoActual = 0;
    bazaActual = [];
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

    // 🔑 aquí decidimos si toca automático
    if (turnoActual !== 0 && bazaActual.length < 4 && !esperandoAutomatico) {
        esperandoAutomatico = true;
        setTimeout(jugarAutomatico, 600);
    }
}

// ==============================
// MANO JUGADOR 0
// ==============================

function renderMesaJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    mesa.style.display = "flex";
    mesa.style.justifyContent = "center";
    mesa.style.alignItems = "flex-end";
    mesa.style.padding = "20px";

    jugadores[0].mano.forEach((carta, index) => {
        const div = crearCartaDiv(carta);

        div.style.marginLeft = index === 0 ? "0px" : "-120px";
        div.style.zIndex = index;
        div.style.transition = "transform 0.15s ease";

        div.addEventListener("mouseenter", () => {
            div.style.transform = "translateY(-40px)";
            div.style.zIndex = 1000;
        });

        div.addEventListener("mouseleave", () => {
            div.style.transform = "translateY(0)";
            div.style.zIndex = index;
        });

        div.addEventListener("click", () => {
            if (turnoActual !== 0) return;
            jugarCarta(0, index);
        });

        mesa.appendChild(div);
    });
}

// ==============================
// JUGAR CARTA
// ==============================

function jugarCarta(idJugador, indice) {
    const carta = jugadores[idJugador].mano.splice(indice, 1)[0];
    bazaActual.push({ jugador: idJugador, carta });

    turnoActual = (turnoActual + 1) % 4;
    esperandoAutomatico = false;

    render();
}

// ==============================
// JUGADOR AUTOMÁTICO
// ==============================

function jugarAutomatico() {
    if (turnoActual === 0) return;

    const jugador = jugadores[turnoActual];
    if (!jugador || jugador.mano.length === 0) return;

    jugarCarta(turnoActual, 0);
}

// ==============================
// RIVALES
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

    if (posicion === "arriba") {
        cont.style.top = "20px";
        cont.style.left = "50%";
        cont.style.transform = "translateX(-50%)";
        cont.style.display = "flex";
    }
    if (posicion === "izquierda") {
        cont.style.left = "20px";
        cont.style.top = "50%";
        cont.style.transform = "translateY(-50%)";
        cont.style.display = "flex";
        cont.style.flexDirection = "column";
    }
    if (posicion === "derecha") {
        cont.style.right = "20px";
        cont.style.top = "50%";
        cont.style.transform = "translateY(-50%)";
        cont.style.display = "flex";
        cont.style.flexDirection = "column";
    }

    cont.innerHTML = "";
    jugadores[id].mano.forEach(() => cont.appendChild(crearDorsoDiv()));
}

// ==============================
// BAZA
// ==============================

function renderBaza() {
    const baza = document.getElementById("baza");
    baza.innerHTML = "";

    baza.style.display = "flex";
    baza.style.justifyContent = "center";
    baza.style.marginTop = "20px";

    bazaActual.forEach(jugada => {
        const div = crearCartaDiv(jugada.carta);
        div.style.margin = "0 10px";
        baza.appendChild(div);
    });
}

// ==============================
// TURNO
// ==============================

function renderTurno() {
    let info = document.getElementById("turno");
    if (!info) {
        info = document.createElement("div");
        info.id = "turno";
        info.style.color = "white";
        info.style.textAlign = "center";
        document.body.appendChild(info);
    }
    info.textContent = "Turno del jugador " + turnoActual;
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

    const x = carta.columna * ANCHO_CARTA;
    const y = carta.fila * ALTO_CARTA;
    div.style.backgroundPosition = `-${x}px -${y}px`;

    return div;
}

function crearDorsoDiv() {
    const div = document.createElement("div");
    div.style.width = ANCHO_CARTA + "px";
    div.style.height = ALTO_CARTA + "px";
    div.style.backgroundImage = "url('cartas/baraja.png')";
    div.style.backgroundRepeat = "no-repeat";

    const x = DORSO.columna * ANCHO_CARTA;
    const y = DORSO.fila * ALTO_CARTA;
    div.style.backgroundPosition = `-${x}px -${y}px`;

    return div;
}

// ==============================
// BOTÓN
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("btnRepartir")
        .addEventListener("click", repartir);
});
