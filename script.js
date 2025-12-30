function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const carta = document.createElement("div");

    carta.style.width = "208px";
    carta.style.height = "319px";

    carta.style.backgroundImage = "url('cartas/baraja.png')";
    carta.style.backgroundRepeat = "no-repeat";
    carta.style.backgroundPosition = "0px 0px";

    carta.style.border = "3px solid red";

    mesa.appendChild(carta);
}
