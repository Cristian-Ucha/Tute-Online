// ==============================
// CONFIGURACIÓN
// ==============================

const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;
const DORSO = { fila: 4, columna: 1 };

// ==============================
// CONSTANTES
// ==============================

const ASIENTOS = [0, 1, 2, 3];
const PAREJA = { 0: 0, 2: 0, 1: 1, 3: 1 };

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
// ESTADO
// ==============================

let jugadores = [];
let turnoActual = 0;
let bazaActual = [];

let triunfo = null;
let cartaTriunfo = null;

let repartidor = null;
let primeraMano = true;

let bazasJugadas = 0;
let manoTerminada = false;

// 👇 CLAVE: control por pareja
let parejaHaGanadoBaza = [false, false];

let puntosPareja = [0, 0];
let puntosCanticos = [0, 0];

// ==============================
// DATOS CARTAS
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
// PODER
// ==============================

function poder(c) {
    return ORDEN_PODER.indexOf(c.valor);
}

function cartaGana(a, b) {
    if (a.palo === triunfo && b.palo !== triunfo) return true;
    if (a.palo !== triunfo && b.palo === triunfo) return false;
    if (a.palo !== b.palo) return false;
    return poder(a) > poder(b);
}

// ==============================
// ORDENAR MANO
// ==============================

function ordenarMano(j) {
    j.mano.sort((a, b) => {
        if (a.palo === triunfo && b.palo !== triunfo) return -1;
        if (a.palo !== triunfo && b.palo === triunfo) return 1;
        if (a.palo !== b.palo) return a.palo.localeCompare(b.palo);
        return poder(a) - poder(b);
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
        haCantadoEstaBaza: false
    }));

    parejaHaGanadoBaza = [false, false];
    puntosPareja = [0, 0];
    puntosCanticos = [0, 0];

    const baraja = crearBaraja().sort(() => Math.random() - 0.5);

    if (primeraMano) {
        repartidor = Math.floor(Math.random() * 4);
        primeraMano = false;
    } else {
        repartidor = (repartidor + 1) % 4;
    }

    for (let i = 0; i < 10; i++) {
        jugadores.forEach(j => j.mano.push(baraja.pop()));
    }

    cartaTriunfo = jugadores[repartidor].mano[
        Math.floor(Math.random() * jugadores[repartidor].mano.length)
    ];
    triunfo = cartaTriunfo.palo;

    jugadores.forEach(ordenarMano);

    turnoActual = (repartidor + 1) % 4;
    bazaActual = [];
    bazasJugadas = 0;
    manoTerminada = false;

    recalcularCanticos();
    render();
    turnoIA();
}

// ==============================
// CÁNTICOS
// ==============================

function recalcularCanticos() {
    jugadores.forEach(j => {
        j.posiblesCanticos = [];
        PALOS.forEach(p => {
            const rey = j.mano.some(c => c.palo === p.nombre && c.valor === "rey");
            const caballo = j.mano.some(c => c.palo === p.nombre && c.valor === "caballo");
            const ya = j.canticosRealizados.some(c => c.palo === p.nombre);
            if (rey && caballo && !ya) {
                j.posiblesCanticos.push({
                    palo: p.nombre,
                    puntos: p.nombre === triunfo ? 40 : 20
                });
            }
        });
    });
}

function puedeCantar(j) {
    const pareja = PAREJA[j.asiento];
    return (
        parejaHaGanadoBaza[pareja] &&
        j.posiblesCanticos.length > 0 &&
        !j.haCantadoEstaBaza &&
        bazaActual.length === 0 &&
        turnoActual === j.asiento
    );
}

function ejecutarCantico() {
    const j = jugadores[0];
    if (!puedeCantar(j)) return;

    const cantico = j.posiblesCanticos[0];
    j.canticosRealizados.push(cantico);
    j.haCantadoEstaBaza = true;

    puntosCanticos[PAREJA[j.asiento]] += cantico.puntos;
    recalcularCanticos();
    render();
}

// ==============================
// CARTAS LEGALES
// ==============================

function cartasLegales(j) {
    if (bazaActual.length === 0) return j.mano;

    const dominante = bazaActual.reduce((g, x) =>
        cartaGana(x.carta, g.carta) ? x : g
    ).carta;

    const paloSalida = bazaActual[0].carta.palo;

    const delPalo = j.mano.filter(c => c.palo === paloSalida);
    if (delPalo.length) {
        const superiores = delPalo.filter(c => cartaGana(c, dominante));
        return superiores.length ? superiores : delPalo;
    }

    const triunfos = j.mano.filter(c => c.palo === triunfo);
    if (triunfos.length) {
        const superiores = triunfos.filter(c => cartaGana(c, dominante));
        return superiores.length ? superiores : triunfos;
    }

    return j.mano;
}

// ==============================
// JUGAR CARTA
// ==============================

function jugarCarta(asiento, indice) {
    if (manoTerminada) return;

    const j = jugadores[asiento];
    const carta = j.mano.splice(indice, 1)[0];
    bazaActual.push({ asiento, carta });

    ordenarMano(j);
    recalcularCanticos();

    if (bazaActual.length === 4) {
        render();
        setTimeout(resolverBaza, 1200);
        return;
    }

    turnoActual = (turnoActual + 1) % 4;
    render();
    turnoIA();
}

// ==============================
// IA
// ==============================

function turnoIA() {
    if (manoTerminada || turnoActual === 0) return;

    setTimeout(() => {
        const j = jugadores[turnoActual];
        const legales = cartasLegales(j);
        jugarCarta(turnoActual, j.mano.indexOf(legales[0]));
    }, 600);
}

// ==============================
// RESOLVER BAZA
// ==============================

function resolverBaza() {
    let ganadora = bazaActual[0];
    bazaActual.forEach(j => {
        if (cartaGana(j.carta, ganadora.carta)) ganadora = j;
    });

    const pareja = PAREJA[ganadora.asiento];
    parejaHaGanadoBaza[pareja] = true;

    bazaActual.forEach(j => {
        puntosPareja[pareja] += PUNTOS_CARTA[j.carta.valor] || 0;
    });

    jugadores.forEach(j => j.haCantadoEstaBaza = false);

    turnoActual = ganadora.asiento;
    bazaActual = [];
    bazasJugadas++;

    if (bazasJugadas === 10) {
        manoTerminada = true;
        render();
        mostrarResultado();
        return;
    }

    render();
    turnoIA();
}

// ==============================
// RENDER
// ==============================

function render() {
    renderMesa();
    renderRivales();
    renderBaza();
    renderTriunfo();
    renderCantico();
    document.getElementById("turno").textContent = "Turno asiento " + turnoActual;
}

// ==============================
// RENDER MANO
// ==============================

function renderMesa() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const j = jugadores[0];
    const legales = cartasLegales(j);

    j.mano.forEach((c, i) => {
        const d = crearCartaDiv(c);
        d.style.marginLeft = i === 0 ? "0px" : "-120px";
        d.style.zIndex = i;
        d.style.opacity = legales.includes(c) ? "1" : "0.4";
        d.style.transition = "transform 0.15s";

        if (legales.includes(c) && turnoActual === 0 && !manoTerminada) {
            d.onmouseenter = () => d.style.transform = "translateY(-40px)";
            d.onmouseleave = () => d.style.transform = "translateY(0)";
            d.onclick = () => jugarCarta(0, i);
        }

        mesa.appendChild(d);
    });
}

// ==============================
// RENDER RESTO
// ==============================

function renderRivales() {
    [1, 2, 3].forEach(id => {
        const c = document.getElementById("rival-" + id);
        c.innerHTML = "";
        jugadores[id].mano.forEach(() => c.appendChild(crearDorsoDiv()));
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

function renderCantico() {
    let btn = document.getElementById("btnCantico");
    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btnCantico";
        btn.textContent = "Cantar";
        btn.onclick = ejecutarCantico;
        btn.style.position = "absolute";
        btn.style.bottom = "120px";
        btn.style.left = "50%";
        btn.style.transform = "translateX(-50%)";
        btn.style.zIndex = "9999";
        document.body.appendChild(btn);
    }
    btn.style.display = puedeCantar(jugadores[0]) ? "block" : "none";
}

// ==============================
// RESULTADO FINAL
// ==============================

function mostrarResultado() {
    let d = document.getElementById("fin-mano");
    if (!d) {
        d = document.createElement("div");
        d.id = "fin-mano";
        d.style.position = "absolute";
        d.style.top = "50%";
        d.style.left = "50%";
        d.style.transform = "translate(-50%, -50%)";
        d.style.background = "rgba(0,0,0,0.9)";
        d.style.color = "white";
        d.style.padding = "20px";
        d.style.borderRadius = "12px";
        d.style.zIndex = "99999";
        document.body.appendChild(d);
    }

    d.innerHTML = `
        <strong>Fin de la mano</strong><br><br>
        Pareja 0 (0-2): ${puntosPareja[0] + puntosCanticos[0]}<br>
        Pareja 1 (1-3): ${puntosPareja[1] + puntosCanticos[1]}
    `;
}

// ==============================
// CARTAS
// ==============================

function crearCartaDiv(c) {
    const d = document.createElement("div");
    d.style.width = ANCHO_CARTA + "px";
    d.style.height = ALTO_CARTA + "px";
    d.style.backgroundImage = "url('cartas/baraja.png')";
    d.style.backgroundPosition = `-${c.columna * ANCHO_CARTA}px -${c.fila * ALTO_CARTA}px`;
    return d;
}

function crearDorsoDiv() {
    const d = document.createElement("div");
    d.style.width = ANCHO_CARTA + "px";
    d.style.height = ALTO_CARTA + "px";
    d.style.backgroundImage = "url('cartas/baraja.png')";
    d.style.backgroundPosition = `-${DORSO.columna * ANCHO_CARTA}px -${DORSO.fila * ALTO_CARTA}px`;
    return d;
}

document.getElementById("btnRepartir").onclick = repartir;
