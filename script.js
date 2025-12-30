const ANCHO_CARTA = 208;
const ALTO_CARTA = 319;

function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    // FORZAMOS EL LAYOUT DESDE JS (CLAVE)
    mesa.style.display = "flex";
    mesa.style.gap = "10px";
    mesa.style.overflowX = "auto";
    mesa.style.padding = "10px";
    mesa.style.border = "2px solid red"; // solo para ver el área

    const cartas = [
        { fila: 0, columna: 0 },
        { fila: 0, columna: 3 },
        { fila: 1, columna: 1 },
        { fila: 2, columna: 5 },
        { fila: 4, columna: 10 }
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


