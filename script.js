function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const bloque = document.createElement("div");
    bloque.style.width = "200px";
    bloque.style.height = "300px";
    bloque.style.backgroundColor = "blue";

    mesa.appendChild(bloque);
}
