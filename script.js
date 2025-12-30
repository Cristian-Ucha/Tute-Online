function repartir() {
    const mesa = document.getElementById("mesa");
    mesa.innerHTML = "";

    const div = document.createElement("div");
    div.style.width = "208px";
    div.style.height = "319px";
    div.style.backgroundColor = "blue";

    mesa.appendChild(div);
}
