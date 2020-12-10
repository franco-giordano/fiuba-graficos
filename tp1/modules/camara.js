// clase base, abstracta
class Camara {
    constructor() {
        if (this.constructor == Camara) {
            throw new Error("No pueden instanciarse clases Abstractas.");
        }
    }

    generarVista(posHeli) {}

    actualizar() {}

    static crearConNumero(num) {
        switch (num) {
            case 1:
                return new CamaraInteractuableArrastre();
            case 2:
                return new CamaraTrasera();
            case 3:
                return new CamaraLateral();
            case 4:
                return new CamaraSuperior();
            case 5:
                return new CamaraHombro();
            case 6:
                return new CamaraFija();

            default:
                return new CamaraGiratoria();
        }
    }
}

class CamaraGiratoria extends Camara {

    constructor() {
        super();
        this.rotAccum = 0;
        this.VELOCIDAD_ANGULAR = 0.009;
    }

    generarVista(posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var centro = vec3.fromValues(posHeli.x, posHeli.y, posHeli.z);
        var ojo = vec3.fromValues(posHeli.x, posHeli.y + 2, posHeli.z + 20);

        vec3.rotateY(ojo, ojo, centro, this.rotAccum);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0, 1, 0)
        );


        return matrizVista;
    }

    actualizar() {
        this.rotAccum += this.VELOCIDAD_ANGULAR;
    }
}



class CamaraInteractuableArrastre extends Camara {

    constructor() {
        super();
        var touchable = 'ontouchstart' in window
        this.control = touchable ? new ControlJoystick() : new ControlRaton();
    }

    generarVista(posHeli) {

        var posObserver = this.control.obtener_posicion();

        var matrizVista = mat4.create();

        var ojo = vec3.fromValues(posHeli.x + posObserver.x, posHeli.y + posObserver.y, posHeli.z + posObserver.z);
        var centro = vec3.fromValues(posHeli.x, posHeli.y, posHeli.z);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0, 1, 0)
        );

        return matrizVista;
    }

    actualizar() {
        this.control.actualizar();
    }
}

function ControlRaton() {

    var MOUSE = {
        x: 0,
        y: 0
    };
    var PREV_MOUSE = {
        x: 0,
        y: 0
    };

    var IS_MOUSE_DOWN = false;
    var ALFA = Math.PI / 4;
    var BETA = Math.PI / 2;

    const FACTOR_VELOCIDAD = 0.01;
    const RADIO = 20;


    // seteo handlers del raton
    $("body").mousemove(function (e) {
        MOUSE.x = e.clientX || e.pageX;
        MOUSE.y = e.clientY || e.pageY
    });

    $('body').mousedown(function (event) {
        IS_MOUSE_DOWN = true;
    });

    $('body').mouseup(function (event) {
        IS_MOUSE_DOWN = false;
    });

    this.obtener_posicion = function () {
        return {
            x: RADIO * Math.sin(ALFA) * Math.sin(BETA),
            y: RADIO * Math.cos(BETA),
            z: RADIO * Math.cos(ALFA) * Math.sin(BETA)
        }
    };

    this.actualizar = function () {
        if (!IS_MOUSE_DOWN) {
            return;
        }

        var deltaX = 0;
        var deltaY = 0;

        if (PREV_MOUSE.x) {
            deltaX = MOUSE.x - PREV_MOUSE.x;
        }
        if (PREV_MOUSE.y) {
            deltaY = MOUSE.y - PREV_MOUSE.y;
        }

        PREV_MOUSE.x = MOUSE.x;
        PREV_MOUSE.y = MOUSE.y;

        ALFA = ALFA + deltaX * FACTOR_VELOCIDAD;
        BETA = BETA + deltaY * FACTOR_VELOCIDAD;

        if (BETA <= 0) {
            BETA = 0.001;
        }
        if (BETA > Math.PI) {
            BETA = Math.PI - 0.001;
        }

    }

}


const FACTOR_VELOCIDAD = 0.01;
const RADIO = 20;
var JOYSTICK_CONTROLLER = null;

class ControlJoystick {

    constructor() {
        var existe = $("#joyCamara").length;

        if (!existe) {
            jQuery('<div id="joyCamara" class="joystick" style="right: 0"></div>').appendTo("body");
            
            JOYSTICK_CONTROLLER = new JoyStick('joyCamara', {
                "internalFillColor": "grey",
                "internalStrokeColor": "black",
                "externalStrokeColor": "black"
            });
        }

        this.joystick = JOYSTICK_CONTROLLER;

        this.TOUCH = {
            x: 0,
            y: 0
        };
        this.PREV_TOUCH = {
            x: 0,
            y: 0
        };

        this.IS_PRESSING_JOYSTICK = false;
        this.ALFA = Math.PI / 4;
        this.BETA = Math.PI / 2;


    }

    obtener_posicion() {
        return {
            x: RADIO * Math.sin(this.ALFA) * Math.sin(this.BETA),
            y: RADIO * Math.cos(this.BETA),
            z: RADIO * Math.cos(this.ALFA) * Math.sin(this.BETA)
        }
    };

    actualizar() {
        this.IS_PRESSING_JOYSTICK = this.joystick.GetX() || this.joystick.GetY();
        this.TOUCH.x = this.joystick.GetX();
        this.TOUCH.y = this.joystick.GetY();

        if (!this.IS_PRESSING_JOYSTICK) {
            return;
        }

        var deltaX = this.TOUCH.x / 35;
        var deltaY = -this.TOUCH.y / 35;

        // if (this.PREV_TOUCH.x) {
        //     deltaX = this.TOUCH.x - this.PREV_TOUCH.x;
        // }
        // if (this.PREV_TOUCH.y) {
        //     deltaY = this.TOUCH.y - this.PREV_TOUCH.y;
        // }

        // if (Math.abs(this.TOUCH.x) != 100 || Math.abs(this.TOUCH.x) != 100) {
        //     this.PREV_TOUCH.x = this.TOUCH.x;
        //     this.PREV_TOUCH.y = this.TOUCH.y;
        // } else {


        this.ALFA = this.ALFA + deltaX * FACTOR_VELOCIDAD;
        this.BETA = this.BETA + deltaY * FACTOR_VELOCIDAD;

        if (this.BETA <= 0) {
            this.BETA = 0.001;
        }
        if (this.BETA > Math.PI) {
            this.BETA = Math.PI - 0.001;
        }

    }
}



class CamaraLateral extends Camara {

    generarVista(posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var ojo = vec3.fromValues(posHeli.x, posHeli.y, posHeli.z + 30);
        var centro = vec3.fromValues(posHeli.x, posHeli.y, posHeli.z);

        vec3.rotateY(ojo, ojo, centro, posHeli.yaw);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0, 1, 0)
        );


        return matrizVista;
    }
}

class CamaraTrasera extends Camara {

    generarVista(posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var ojo = vec3.fromValues(posHeli.x - 30, posHeli.y, posHeli.z);
        var centro = vec3.fromValues(posHeli.x, posHeli.y, posHeli.z);

        vec3.rotateY(ojo, ojo, centro, posHeli.yaw);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0, 1, 0)
        );


        return matrizVista;
    }
}

class CamaraSuperior extends Camara {

    generarVista(posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var ojo = vec3.fromValues(posHeli.x - 1, posHeli.y + 30, posHeli.z);
        var centro = vec3.fromValues(posHeli.x, posHeli.y, posHeli.z);

        vec3.rotateY(ojo, ojo, centro, posHeli.yaw);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0, 1, 0)
        );


        return matrizVista;
    }
}

class CamaraHombro extends Camara {

    generarVista(posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var ojo = vec3.fromValues(posHeli.x - 20, posHeli.y + 15, posHeli.z);
        var centro = vec3.fromValues(posHeli.x, posHeli.y + 7, posHeli.z);

        vec3.rotateY(ojo, ojo, centro, posHeli.yaw);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0, 1, 0)
        );


        return matrizVista;
    }
}



class CamaraFija extends Camara {

    generarVista(posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var ojo = vec3.fromValues(posHeli.x - 60, posHeli.y + 60, posHeli.z - 60);
        var centro = vec3.fromValues(posHeli.x, posHeli.y, posHeli.z);

        // vec3.rotateY(ojo, ojo, centro, posHeli.rotY);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0, 1, 0)
        );


        return matrizVista;
    }
}