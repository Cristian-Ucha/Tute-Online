const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;

// Palos reales del Tute
const PALOS = ["oros", "copas", "espadas", "bastos"];

// Valores reales del Tute
const VALORES = [
    "as",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "sota",
    "caballo",
    "rey"
];

// Crear la baraja completa (40 cartas)
function crearBaraja() {
    const baraja = [];

    PALOS.forEach((palo, fila) => {
        VALORES.forEach((valor, columna) => {
            baraja.push({
                palo,
                valor,
                fila,
                columna
            });
        });
    });

    return baraja;
}
function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    // Forzamos layout estable desde JS
    mesa.style.display = "flex";
    mesa.style.gap = "10px";
    mesa.style.overflowX = "auto";
    mesa.style.padding = "10px";

    const baraja = crearBaraja();

    // Barajar la baraja
    baraja.sort(() => Math.random() - 0.5);

    // Coger 5 cartas
    const mano = baraja.slice(0, 5);

    mano.forEach(carta => {
        const div = document.createElement("div");

        div.style.width = ANCHO_CARTA + "px";
        div.style.height = ALTO_CARTA + "px";

        div.style.backgroundImage = "url('cartas/baraja.png')";
        div.style.backgroundRepeat = "no-repeat";

        const x = carta.columna * ANCHO_CARTA;
        const y = carta.fila * ALTO_CARTA;

        div.style.backgroundPosition = `-${x}px -${y}px`;

        mesa.appendChild(div);
    });
}


