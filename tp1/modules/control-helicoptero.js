function ControlHelicoptero(long_terreno, yInicial) {

    $body = $("body");

    var xArrow = 0;
    var yArrow = 0;
    var zArrow = 0;


    var altitudeInertia = 0.01;
    var speedInertia = 1;
    var angleInertia = 0.08;

    var deltaAltitude = 1;
    var deltaSpeed = 0.01;
    var deltaAngle = 0.03;


    var maxSpeed = 2;
    var maxAltitude = 300;
    var minAltitude = 0;

    var positionX = long_terreno / 2 + 5;
    var positionY = 0;
    var positionZ = long_terreno / 2;

    //var umbral=0.01;

    var speed = 0;
    var altitude = yInicial;
    var angle = 0;

    var pitch = 0;
    var roll = 0;

    var angleTarget = 0;
    var altitudeTarget = yInicial;
    var speedTarget = 0;

    var NUMERO_CAMARA = 1;
    var H_ACTIVADA = false;
    var TUTO_ACTIVADO = false;
    var HUD = $("#hud");

    var JOYSTICK = null;

    // var BOTONES_TOUCH = 'createTouch' in document ? new BotonesTouch() : null;

    const BIENVENIDA = "<i>Presiona M para mostrar ayuda y creditos.</i>"
    HUD.html(BIENVENIDA);

    const TUTORIAL_PC = `
    <b>Controles en PC:</b><br>
    Usa WASD para desplazarte, E y Q para ascender/descender, y H para retraer/extender las helices. <br>
    Presiona los numeros 1 a 7 para probar las distintas camaras disponibles. La camara 1 responde a arrastres del raton. <br>
    <br>
    <b>Comportamiento:</b><br>
    - El Helicoptero no respondera a los controles cuando tenga las helices retraidas ('motores apagados').<br>
    - El terreno se repite infinitamente en todas las direcciones, cargando un area visible en forma de parcelas ('chunks').<br>
    - En <b>pantallas tactiles</b> se presentan controles y joysticks virtuales para poder interactuar con la simulacion. <br>
    <br>
    <b>Sobre el Proyecto:</b><br>
    Realizado por Franco Giordano para la materia Sistemas Graficos, FIUBA, 2C2020.<br>
    <br>
    `

    const TUTORIAL_MOBILE = `
    Controles en Dispositivos Moviles:
    Usa el joystick izquierdo para desplazarte y el derecho para orientar la primer camara. Presionando en SUBIR y BAJAR podras ascender y descender el helicoptero, y con BRAZOS cambiaras la posicion de las helices. Usando el boton CAMARA podras ir cambiando entre las 7 camaras disponibles. Solo la primer camara respondera a movimientos del joystick derecho.
    
    Comportamiento:
    - El Helicoptero no respondera a los controles cuando tenga las helices retraidas ('motores apagados').
    - El terreno se repite infinitamente en todas las direcciones, cargando un area visible en forma de parcelas ('chunks').
    - Solo en pantallas tactiles se presentan estos controles y joysticks virtuales.
    - Recomendacion: ver la simulacion en orientacion landscape, no vertical.
    
    Sobre el Proyecto:
    Realizado por Franco Giordano para la materia Sistemas Graficos, FIUBA, 2C2020.
    
    `

    var enableTouchControlsIfNeeded = function () {
        var touchable = 'ontouchstart' in window;

        if (!touchable) {
            $("#subir").hide();
            $("#bajar").hide();
            $("#camara").hide();
            $("#brazos").hide();
            return;
        }

        JOYSTICK = new JoyStick('joyMov', {
            "internalFillColor": "grey",
            "internalStrokeColor": "black",
            "externalStrokeColor": "black"
        });

        $("#hud").removeClass("hud-desktop");
        $("#hud").addClass("hud-mobile");
        $("#hud").html("AYUDA");

    }

    $("body").keydown(function (e) {
        switch (e.key) {
            case "w":
                xArrow = 1;
                break;
            case "s":
                xArrow = -1;
                break;
            case "a":
                zArrow = 1;
                break;
            case "d":
                zArrow = -1;
                break;
            case "e":
                yArrow = 1;
                break;
            case "q":
                yArrow = -1;
                break;
            case "h":
                H_ACTIVADA = !H_ACTIVADA;
                break;
            case "m":
                TUTO_ACTIVADO = !TUTO_ACTIVADO;
                toggleTutorial();
                break;
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "0":
                NUMERO_CAMARA = e.key * 1;
                break;
        }
    });

    $("body").keyup(function (e) {
        switch (e.key) {
            case "w":
            case "s":
                xArrow = 0;
                break;
            case "a":
            case "d":
                zArrow = 0;
                break;
            case "q":
            case "e":
                yArrow = 0;
                break;
        }
    });

    $("#subir").on("touchstart", () => {
        yArrow = 1;
        $("#subir").addClass("on");
    });

    $("#subir").on("touchend", () => {
        yArrow = 0;
        $("#subir").removeClass("on");
    });

    $("#bajar").on("touchstart", () => {
        yArrow = -1;
        $("#bajar").addClass("on");

    });

    $("#bajar").on("touchend", () => {
        yArrow = 0;
        $("#bajar").removeClass("on");
    });

    $("#camara").on("touchstart", () => {
        NUMERO_CAMARA %= 7;
        NUMERO_CAMARA++;
        $("#camara").addClass("on");
    });
    
    $("#camara").on("touchend", () => {
        $("#camara").removeClass("on");
    });

    $("#hud").on("touchstart", () => {
        alert(TUTORIAL_MOBILE);
    });
    
    $("#brazos").on("touchstart", () => {
        H_ACTIVADA = !H_ACTIVADA;
        $("#brazos").addClass("on");
    });

    $("#brazos").on("touchend", () => {
        $("#brazos").removeClass("on");
    });

    enableTouchControlsIfNeeded();

    this.update = function () {

        if (JOYSTICK) {
            updateJoystick();
        }

        if (H_ACTIVADA) {
            // si aprete H, apagar motores
            xArrow = 0;
            yArrow = 0;
            zArrow = 0;
        }

        if (xArrow != 0) {
            speedTarget += xArrow * deltaSpeed;
        } else {
            speedTarget += (0 - speedTarget) * deltaSpeed;
        }

        speedTarget = Math.max(-maxAltitude, Math.min(maxSpeed, speedTarget));

        var speedSign = 1;
        if (speed < 0) {
            speedSign = -1;
        }

        if (zArrow != 0) {
            angleTarget += zArrow * deltaAngle * speedSign;
        }

        if (yArrow != 0) {
            altitudeTarget += yArrow * deltaAltitude;
            altitudeTarget = Math.max(minAltitude, Math.min(maxAltitude, altitudeTarget));
        }

        roll = -(angleTarget - angle) * 1.6;
        pitch = -Math.max(-0.3, Math.min(0.3, speed));

        speed += (speedTarget - speed) * speedInertia;
        altitude += (altitudeTarget - altitude) * altitudeInertia;
        angle += (angleTarget - angle) * angleInertia;

        var directionX = Math.cos(-angle) * speed;
        var directionZ = Math.sin(-angle) * speed;

        positionX += +directionX;
        positionZ += +directionZ;
        positionY = altitude;

        return [NUMERO_CAMARA, H_ACTIVADA];
    }

    this.getPosition = function () {
        return {
            x: positionX,
            y: positionY,
            z: positionZ,
        };
    }

    this.getYaw = function () {
        return angle;
    }

    this.getRoll = function () {
        return roll;
    }

    this.getPitch = function () {
        return pitch;
    }

    this.getRotaciones = function () {
        return {
            roll: roll,
            yaw: angle,
            pitch: pitch
        };
    }

    this.getSpeed = function () {
        return speed;
    }

    var toggleTutorial = function () {

        if (TUTO_ACTIVADO) {
            HUD.html(TUTORIAL_PC);
        } else {
            HUD.html(BIENVENIDA);
        }
    }

    var updateJoystick = function () {
        zArrow = -JOYSTICK.GetX() / 100;
        xArrow = JOYSTICK.GetY() / 100;
    }
}