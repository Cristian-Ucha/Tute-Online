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

const PUNTOS_CARTA = {
    as: 11,
    tres: 10,
    rey: 4,
    caballo: 3,
    sota: 2
};

const ORDEN_PODER = [
    "dos", "cuatro", "cinco", "seis", "siete",
    "sota", "caballo", "rey", "tres", "as"
];

// ==============================
// ESTADO GLOBAL
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];

let triunfo = null;
let cartaTriunfo = null;

let asientoQueDa = null;
let primeraMano = true;

let bazasJugadas = 0;
let manoTerminada = false;

let puntosPareja = [0, 0];
let puntosCanticosPareja = [0, 0];

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
// UTILIDADES DE PODER
// ==============================

function poderCarta(carta) {
    return ORDEN_PODER.indexOf(carta.valor);
}

function cartaGana(a, b) {
    if (a.palo === triunfo && b.palo !== triunfo) return true;
    if (a.palo !== triunfo && b.palo === triunfo) return false;
    if (a.palo !== b.palo) return false;
    return poderCarta(a) > poderCarta(b);
}

// ==============================
// ORDENAR MANO
// ==============================

function ordenarMano(jugador) {
    jugador.mano.sort((a, b) => {
        if (a.palo === triunfo && b.palo !== triunfo) return -1;
        if (a.palo !== triunfo && b.palo === triunfo) return 1;
        if (a.palo !== b.palo) return a.palo.localeCompare(b.palo);
        return poderCarta(a) - poderCarta(b);
    });
}

// ==============================
// REPARTIR
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

    puntosPareja = [0, 0];
    puntosCanticosPareja = [0, 0];

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    if (primeraMano) {
        asientoQueDa = Math.floor(Math.random() * 4);
        primeraMano = false;
    } else {
        asientoQueDa = (asientoQueDa + 1) % 4;
    }

    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    cartaTriunfo = jugadores[asientoQueDa].mano[
        Math.floor(Math.random() * jugadores[asientoQueDa].mano.length)
    ];
    triunfo = cartaTriunfo.palo;

    jugadores.forEach(ordenarMano);

    turnoActual = (asientoQueDa + 1) % 4;
    bazaActual = [];
    bazasJugadas = 0;
    manoTerminada = false;

    render();
    gestionarTurno();
}

// ==============================
// CARTAS LEGALES (ASISTIR + SUBIR)
// ==============================

function cartasLegales(jugador) {
    if (bazaActual.length === 0) return jugador.mano;

    const dominante = bazaActual.reduce((g, j) =>
        cartaGana(j.carta, g.carta) ? j : g
    ).carta;

    const paloSalida = bazaActual[0].carta.palo;

    const delPalo = jugador.mano.filter(c => c.palo === paloSalida);
    if (delPalo.length) {
        const superiores = delPalo.filter(c => cartaGana(c, dominante));
        return superiores.length ? superiores : delPalo;
    }

    const triunfos = jugador.mano.filter(c => c.palo === triunfo);
    if (triunfos.length) {
        const superiores = triunfos.filter(c => cartaGana(c, dominante));
        return superiores.length ? superiores : triunfos;
    }

    return jugador.mano;
}

// ==============================
// TURNO AUTOMÁTICO
// ==============================

function gestionarTurno() {
    if (manoTerminada || turnoActual === 0) return;

    setTimeout(() => {
        const j = jugadores[turnoActual];
        const legales = cartasLegales(j);
        jugarCarta(turnoActual, j.mano.indexOf(legales[0]));
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
    ordenarMano(jugador);

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
        if (cartaGana(j.carta, ganadora.carta)) ganadora = j;
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
        render();
        mostrarResultadoFinal();
        return;
    }

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
// RENDER MANO JUGADOR (ABANICO)
// ==============================

function renderMesaJugador() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const jugador = jugadores[0];
    const legales = cartasLegales(jugador);

    jugador.mano.forEach((carta, i) => {
        const div = crearCartaDiv(carta);
        div.style.marginLeft = i === 0 ? "0px" : "-120px";
        div.style.zIndex = i;
        div.style.transition = "transform 0.15s ease";
        div.style.opacity = legales.includes(carta) ? "1" : "0.4";

        if (legales.includes(carta) && turnoActual === 0 && !manoTerminada) {
            div.onmouseenter = () => {
                div.style.transform = "translateY(-40px)";
                div.style.zIndex = 1000;
            };
            div.onmouseleave = () => {
                div.style.transform = "translateY(0)";
                div.style.zIndex = i;
            };
            div.onclick = () => jugarCarta(0, i);
        }

        mesa.appendChild(div);
    });
}

// ==============================
// RENDER RESTO (SIN CAMBIOS)
// ==============================

function renderRivales() {
    [1, 2, 3].forEach(id => {
        const cont = document.getElementById("rival-" + id);
        cont.innerHTML = "";
        jugadores[id].mano.forEach(() => cont.appendChild(crearDorsoDiv()));
    });
}

function renderBaza() {
    const b = document.getElementById("baza");
    b.innerHTML = "";
    bazaActual.forEach(j => b.appendChild(crearCartaDiv(j.carta)));
}

function renderTriunfo() {
    const t = document.getElementById("triunfo");
    t.innerHTML = "Triunfo<br>";
    t.appendChild(crearCartaDiv(cartaTriunfo));
}

// ==============================
// RESULTADO FINAL
// ==============================

function mostrarResultadoFinal() {
    let div = document.getElementById("fin-mano");
    if (!div) {
        div = document.createElement("div");
        div.id = "fin-mano";
        div.style.position = "absolute";
        div.style.top = "50%";
        div.style.left = "50%";
        div.style.transform = "translate(-50%, -50%)";
        div.style.background = "rgba(0,0,0,0.85)";
        div.style.color = "white";
        div.style.padding = "20px";
        div.style.borderRadius = "12px";
        document.body.appendChild(div);
    }

    div.innerHTML = `
        <strong>Fin de la mano</strong><br><br>
        Pareja 0: ${puntosPareja[0]}<br>
        Pareja 1: ${puntosPareja[1]}
    `;
}

// ==============================
// CARTAS
// ==============================

function crearCartaDiv(carta) {
    const d = document.createElement("div");
    d.style.width = ANCHO_CARTA + "px";
    d.style.height = ALTO_CARTA + "px";
    d.style.backgroundImage = "url('cartas/baraja.png')";
    d.style.backgroundPosition =
        `-${carta.columna * ANCHO_CARTA}px -${carta.fila * ALTO_CARTA}px`;
    return d;
}

function crearDorsoDiv() {
    const d = document.createElement("div");
    d.style.width = ANCHO_CARTA + "px";
    d.style.height = ALTO_CARTA + "px";
    d.style.backgroundImage = "url('cartas/baraja.png')";
    d.style.backgroundPosition =
        `-${DORSO.columna * ANCHO_CARTA}px -${DORSO.fila * ALTO_CARTA}px`;
    return d;
}

document.getElementById("btnRepartir").onclick = repartir;
