const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;

function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const cartas = [
        { fila: 0, columna: 0 },   // carta 1
        { fila: 0, columna: 3 },   // carta 2
        { fila: 1, columna: 1 },   // carta 3
        { fila: 2, columna: 5 },   // carta 4
        { fila: 4, columna: 10 }   // carta 5
    ];

    cartas.forEach(c => {
        const carta = document.createElement("div");

        carta.style.width = ANCHO_CARTA + "px";
        carta.style.height = ALTO_CARTA + "px";

        carta.style.backgroundImage = "url('cartas/baraja.png')";
        carta.style.backgroundRepeat = "no-repeat";

        const x = c.columna * ANCHO_CARTA;
        const y = c.fila * ALTO_CARTA;

        carta.style.backgroundPosition = `-${x}px -${y}px`;

        carta.style.border = "2px solid white";

        mesa.appendChild(carta);
    });
}

