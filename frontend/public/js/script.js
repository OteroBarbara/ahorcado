function cargarPalabra(){
    let palabra = document.getElementById('palabra').value.toUpperCase(); 

    if (palabra != "") {
        console.log(palabra);
        fetch("/ahorcado/newgame", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({pal: palabra}),
        })
        .then(res => res.json())
        .then(data => {
            console.log(data.idpartida);
            document.getElementById('compartir-link').innerHTML = "Reta a un jugador a adivinar la palabra compartiéndole el siguiente link:<br>" + location.href + "2?idPartida=" + data.idpartida;
        });
    }else{
        alert("El campo palabra está vacío");
    }
}

function cargarPlayer2() {
    fetch(`/ahorcado2/newgame${location.search}`)
    .then(res => res.json())
    .then(data => {
        iniciarJuego(data.palabraOculta, data.intentos, data.historial);
    });
}

function iniciarJuego(palabra, intentos, historial) {
    document.getElementById('palabraOculta').innerHTML = palabra;
    document.getElementById('intentos').innerHTML = intentos;
    document.getElementById('historial').innerHTML = historial;
}

function probarLetra() {
    let letra = document.getElementById("letra").value.toUpperCase();
    if ((letra.length == 1)&&(letra >= 'A')&&(letra <= 'Z')){
        fetch(`/ahorcado2/newgame${location.search}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({letter: letra}),
        })
        .then(res =>  res.json())
        .then(data => {
            if (data != undefined){
                document.getElementById('historial').innerHTML = data.historial;
                document.getElementById('palabraOculta').innerHTML = data.palabraOculta;
                document.getElementById('intentos').innerHTML = data.intentos;
                if (data.adivino === true){
                    alert("Ganaste el juego");
                }else if (data.intentos === 0){
                    alert("Perdiste el juego");
                }
            }else{
                throw Error();
            }
        })
        .catch(err => alert("Se agotaron los intentos"));
    }else{
        alert('Debe ingresar una letra');
    }
    
}

