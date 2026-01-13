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
// REPARTIR (MANO)
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

    // 👉 REPARTIDOR CORRECTO
    if (primeraMano) {
        asientoQueDa = Math.floor(Math.random() * 4);
        primeraMano = false;
    } else {
        asientoQueDa = (asientoQueDa + 1) % 4;
    }

    // Reparto completo
    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    // Carta de triunfo (sale de la mano del repartidor)
    const manoRepartidor = jugadores[asientoQueDa].mano;
    cartaTriunfo = manoRepartidor[Math.floor(Math.random() * manoRepartidor.length)];
    triunfo = cartaTriunfo.palo;

    // 👉 Empieza el siguiente al repartidor
    turnoActual = (asientoQueDa + 1) % 4;

    bazaActual = [];
    bazasJugadas = 0;
    manoTerminada = false;

    recalcularTodosLosCanticos();
    render();
    gestionarTurno();
}

// ==============================
// CÁNTICOS (LÓGICA)
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

function ejecutarCantico(jugador) {
    if (!puedeCantar(jugador)) return;

    const cantico =
        jugador.posiblesCanticos.find(c => c.tipo === 40) ||
        jugador.posiblesCanticos[0];

    jugador.canticosRealizados.push(cantico);
    jugador.haCantadoEnEstaBaza = true;

    const pareja = PAREJAS_POR_ASIENTO[jugador.asiento];
    puntosCanticosPareja[pareja] += cantico.tipo;

    recalcularTodosLosCanticos();
    render();
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
        jugarCarta(turnoActual, jugador.mano.indexOf(carta));
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

    bazaActual.forEach(j => {
        puntosPareja[parejaGanadora] +=
            PUNTOS_CARTA[j.carta.valor] || 0;
    });

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
        mostrarResultadoFinal();
        return;
    }

    recalcularTodosLosCanticos();
    render();
    gestionarTurno();
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
        div.style.padding = "20px 30px";
        div.style.borderRadius = "12px";
        div.style.fontSize = "18px";
        div.style.textAlign = "center";
        div.style.zIndex = "9999";
        document.body.appendChild(div);
    }

    div.style.display = "block";
    div.innerHTML = `
        <strong>Fin de la mano</strong><br><br>

        Pareja 0 (asientos 0 y 2)<br>
        Bazas: ${puntosPareja[0]}<br>
        Cánticos: ${puntosCanticosPareja[0]}<br>
        <strong>Total: ${puntosPareja[0] + puntosCanticosPareja[0]}</strong>
        <br><br>

        Pareja 1 (asientos 1 y 3)<br>
        Bazas: ${puntosPareja[1]}<br>
        Cánticos: ${puntosCanticosPareja[1]}<br>
        <strong>Total: ${puntosPareja[1] + puntosCanticosPareja[1]}</strong>
    `;
}

// ==============================
// RENDER
// ==============================

function render() {
    renderMesaJugador();
    renderRivales();
    renderBaza();
    renderTriunfo();
    renderBotonCantico();

    document.getElementById("turno").textContent =
        "Turno del asiento " + turnoActual;
}

// ==============================
// BOTÓN CÁNTICO
// ==============================

function renderBotonCantico() {
    let btn = document.getElementById("btnCantico");
    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btnCantico";
        btn.textContent = "Cantar";
        btn.style.position = "absolute";
        btn.style.bottom = "100px";
        btn.style.left = "50%";
        btn.style.transform = "translateX(-50%)";
        document.body.appendChild(btn);
    }

    const jugador = jugadores[0];
    btn.style.display = puedeCantar(jugador) ? "block" : "none";
    btn.onclick = () => ejecutarCantico(jugador);
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
// BOTÓN REPARTIR
// ==============================

document.getElementById("btnRepartir").onclick = repartir;
