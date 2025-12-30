function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const carta = document.createElement("div");
    carta.className = "carta";

    carta.style.backgroundImage = "url('cartas/baraja.png')";
    carta.style.backgroundPosition = "0px 0px";

    mesa.appendChild(carta);
}
