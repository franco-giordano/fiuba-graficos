class Helicoptero {
    constructor(long_terreno) {

        // me guardo estos dos componentes porque tienen interaccion especial
        this.cola = new ColaHelicoptero();
        this.brazos = new ColeccionDeBrazosHelice();

        var cabina = ComponenteHelicoptero.crearCabina();
        var trenAterrizaje = ComponenteHelicoptero.crearTrenAterrizaje();
        trenAterrizaje.setPosicion(0, -3, 0);

        this.contenedor = new Objeto3D();
        this.contenedor.agregarHijos(cabina, this.brazos, trenAterrizaje, this.cola);

        // spawnear heli en el centro del terreno
        this.controlHelicoptero = new ControlHelicoptero(long_terreno);
    }

    actualizar() {
        var [numeroCamara, brazosRetraidos] = this.controlHelicoptero.update();

        var p = this.posicion;

        this.brazos.actualizar(p, brazosRetraidos);
        this.cola.actualizar(p);

        this.mover(p.x, p.y, p.z);
        this.rotar(p.roll, p.yaw, p.pitch);

        return numeroCamara;
    }

    get posicion() {
        return Object.assign({}, this.controlHelicoptero.getPosition(), this.controlHelicoptero.getRotaciones());
    }

    dibujar(matriz) {
        this.contenedor.dibujar(matriz);
    }

    mover(x, y, z) {
        this.contenedor.setPosicion(x, y, z);
    }

    rotar(radX, radY, radZ) {
        this.contenedor.setRotacion(radX, radY, radZ);
    }

}

class ColeccionDeBrazosHelice extends IDibujable {
    constructor() {
        super();
        this.brazos = new Objeto3D();

        var brazoFder = new BrazoHelice(Helice.LADO.DERECHO);
        brazoFder.setPosicion(1, 1.15, 1.85);

        var brazoFizq = new BrazoHelice(Helice.LADO.IZQUIERDO);
        brazoFizq.setPosicion(1, 1.15, -1.85);
        brazoFizq.setRotacion(0, Math.PI, 0);

        var brazoDder = new BrazoHelice(Helice.LADO.DERECHO);
        brazoDder.setPosicion(-2.5, 1.15, 1.85);

        var brazoDizq = new BrazoHelice(Helice.LADO.IZQUIERDO);
        brazoDizq.setPosicion(-2.5, 1.15, -1.85);
        brazoDizq.setRotacion(0, Math.PI, 0);

        this.brazos.agregarHijos(brazoFder, brazoFizq, brazoDder, brazoDizq);
    }

    dibujar(matrizPadre) {
        this.brazos.dibujar(matrizPadre);
    }

    actualizar(posHeli, brazosRetraidos) {
        this.brazos.hijos.forEach(b => b.actualizar(posHeli, brazosRetraidos));
    }
}

class BrazoHelice extends IDibujable {

    static VELOCIDAD_RETRACCION = 0.06;

    constructor(lado) {
        super();

        this.contenedorBrazo = new Objeto3D();
        this.helice = new Helice(lado);

        this.estaRetraido = false;
        this.anguloRotacion = 0;

        var controlF = [
            [0, -1, 0],
            [1.25, -1, 0],
            [1.25, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [-1.25, 1, 0],
            [-1.25, -1, 0],
            [0, -1, 0]
        ];
        var controlR = [
            [-1.5, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
            [1.5, 0, 0]
        ];
        var soporte = new Objeto3D(crearGeometria(controlF, controlR, true), ColorRGB.GRIS_OSCURO);
        soporte.setEscala(0.7, 0.7, 0.7);

        var controlF = [
            [0, -1, 0],
            [1.25, -1, 0],
            [1.25, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [-1.25, 1, 0],
            [-1.25, -1, 0],
            [0, -1, 0]
        ];
        var controlR = [
            [0, 0, 0],
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 6]
        ];

        var escalado = new Escalado([
            [0, 0.75, 0],
            [1, 0.4, 0]
        ]);

        var conector = new Objeto3D(crearGeometria(controlF, controlR, false, 10, 30, escalado), ColorRGB.BLANCO);
        conector.setEscala(1, .7, .7);

        this.contenedorBrazo.agregarHijos(soporte, this.helice, conector);
        this.contenedorBrazo.setEscala(0.7, 0.7, 0.7);

    }

    actualizar(posHeli, brazoRetraido) {
        this.estaRetraido = brazoRetraido;

        this.helice.actualizar(posHeli, this.estaRetraido);

        this._actualizarRetraccion();
    }

    _actualizarRetraccion() {

        var delta = this.estaRetraido ? -BrazoHelice.VELOCIDAD_RETRACCION : BrazoHelice.VELOCIDAD_RETRACCION;
        if (this.anguloRotacion + delta <= 0 && this.anguloRotacion + delta >= -Math.PI / 2) {
            this.anguloRotacion += delta;
        }

        this.contenedorBrazo.setRotacionX(this.anguloRotacion);
    }

    // para ubicar brazo der, izq etc
    setPosicion(x, y, z) {
        this.contenedorBrazo.setPosicion(x, y, z);
    }

    // para ubicar brazo der, izq etc
    setRotacion(x, y, z) {
        this.contenedorBrazo.setRotacion(x, y, z);
    }

    dibujar(matrizPadre) {
        this.contenedorBrazo.dibujar(matrizPadre);
    }
}

class Helice extends IDibujable {

    static VEL_ROT_HELICE = 0.09;
    static LADO = {
        DERECHO: 1,
        IZQUIERDO: -1
    }

    constructor(lado) {
        super();

        this.signo = lado * 1.5;

        this.conjunto = new Objeto3D();

        this.helice = ComponenteHelicoptero.crearHelice();
        this.protector = ComponenteHelicoptero.crearProtector();

        this.conjunto.escalarPor(0.5, 0.5, 0.5);
        this.conjunto.setPosicion(0, 0, 6);

        this.conjunto.agregarHijos(this.helice, this.protector);

        this.rotacionHelice = 0;
    }

    actualizar(posHeli, estaRetraido) {
        if (estaRetraido) {
            this.helice.setRotacion(0, 0, 0);

            this.conjunto.setRotacionZ(0);

            return;
        }

        this.rotacionHelice -= Helice.VEL_ROT_HELICE;

        this.helice.setRotacion(0, this.rotacionHelice, 0);

        this.conjunto.setRotacionZ(this.signo * posHeli.pitch);
    }

    dibujar(matrizPadre) {
        this.conjunto.dibujar(matrizPadre);
    }
}

class ColaHelicoptero extends IDibujable {
    constructor() {
        super();
        this.contenedor = new Objeto3D();

        this.soporteCola = ComponenteHelicoptero.crearSoporteCola();
        this.aletas = new ColeccionAletas();

        this.contenedor.agregarHijos(this.soporteCola, this.aletas);
        this.contenedor.setPosicion(-3.5, 0, 0);
    }

    dibujar(matrizModelado) {
        this.contenedor.dibujar(matrizModelado);
    }

    actualizar(posHeli) {
        this.aletas.actualizar(posHeli);
    }
}

class ColeccionAletas extends IDibujable {
    constructor() {
        super();

        this.aletaI = ComponenteHelicoptero.crearAletaCola();
        this.aletaD = ComponenteHelicoptero.crearAletaCola();
        this.aletaI.setPosicion(-7.7, 1.65, -1.7);
        this.aletaD.setPosicion(-7.7, 1.65, 1.7);
    }

    dibujar(matrizModelado) {
        this.aletaD.dibujar(matrizModelado);
        this.aletaI.dibujar(matrizModelado);
    }

    actualizar(posHeli) {
        this.aletaI.setRotacion(0, posHeli.roll, 0);
        this.aletaD.setRotacion(0, posHeli.roll, 0);
    }
}

class ComponenteHelicoptero {

    static crearCabina() {

        const cant_niveles = 7;
        const cant_vert = 30;

        var color = ColorRGB.BEIGE;

        var controlF = [
            [4, 1.5, 0],
            [-1, 1.5, 0],
            [-4, 1.5, 0],
            [-4, -1.5, 0]
        ];

        controlF.push(
            [-4, -1.5, 0],
            [-4, -1.5, 0],
            [-4, -1.5, 0],
            [1, -1.5, 0],
            [4, -1.5, 0],
            [4, 1.5, 0]
        );

        var controlR = [
            [0, 0, -2.25],
            [0, 0, -1],
            [0, 0, 1],
            [0, 0, 2.25]
        ];

        var escalado = new Escalado([
            [0, 1.35, 0],
            [0.5, 1.7, 0],
            [1, 1.35, 0]
        ]);

        var cabina = new Objeto3D(crearGeometria(controlF, controlR, true, cant_niveles, cant_vert, escalado), color);

        return cabina;
    }

    static crearHelice() {

        var aletas = [];
        for (let i = 0; i < 12; i += 1) {
            aletas[i] = ComponenteHelicoptero.crearAleta();
            aletas[i].setRotacion(1, 2 * Math.PI / 10 * i, 0);
        }

        var controlFsup = [
            [0, -1, 0],
            [1.25, -1, 0],
            [1.25, 1, 0],
            [0, 1, 0]
        ];
        var controlFinf = [
            [0, 1, 0],
            [-1.25, 1, 0],
            [-1.25, -1, 0],
            [0, -1, 0]
        ];
        var controlR = [
            [0, -1, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 1, 0]
        ];

        var ejeSup = new Objeto3D(crearGeometria(controlFsup, controlR, true), ColorRGB.BLANCO);
        ejeSup.setEscala(0.7, 1, 0.7);
        var ejeInf = new Objeto3D(crearGeometria(controlFinf, controlR, true), ColorRGB.BLANCO);
        ejeInf.setEscala(0.7, 1, 0.7);
        var eje = new Objeto3D();
        eje.agregarHijos(ejeSup, ejeInf);

        eje.agregarHijos(...aletas);

        return eje;
    }

    static crearUnSoporteAterrizaje() {

        var unTren = new Objeto3D();

        var controlF = [
            [0, -1, 0],
            [1.25, -1, 0],
            [1.25, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [-1.25, 1, 0],
            [-1.25, -1, 0],
            [0, -1, 0]
        ];
        var controlR = [
            [27, 2, 0],
            [25, 0, 0],
            [26, 0, 0],
            [-26, 0, 0],
            [-25, 0, 0],
            [-27, 2, 0]
        ];

        var base = new Objeto3D(crearGeometria(controlF, controlR), ColorRGB.NEGRO);


        var controlF = [
            [0, -1, 0],
            [1.25, -1, 0],
            [1.25, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [-1.25, 1, 0],
            [-1.25, -1, 0],
            [0, -1, 0]
        ];
        var controlR = [
            [14, 0, 0],
            [14, 1, 0],
            [14, 2, 0],
            [14, 20, 0]
        ];
        var soporteFrente = new Objeto3D(crearGeometria(controlF, controlR), ColorRGB.NEGRO);
        soporteFrente.setRotacion(Math.PI / 12, 0, 0);

        var controlF = [
            [0, -1, 0],
            [1.25, -1, 0],
            [1.25, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [-1.25, 1, 0],
            [-1.25, -1, 0],
            [0, -1, 0]
        ];
        var controlR = [
            [-14, 0, 0],
            [-14, 1, 0],
            [-14, 2, 0],
            [-14, 20, 0]
        ];
        var soporteDetras = new Objeto3D(crearGeometria(controlF, controlR), ColorRGB.NEGRO);
        soporteDetras.setRotacion(Math.PI / 12, 0, 0);

        soporteFrente.setEscala(0.3, 0.3, 0.3);
        soporteDetras.setEscala(0.3, 0.3, 0.3);
        base.setEscala(0.3, 0.3, 0.3);
        unTren.agregarHijos(soporteFrente, base, soporteDetras);

        return unTren;
    }

    static crearTrenAterrizaje() {
        var tren = new Objeto3D();
        const SCALE = 0.4;

        var trenDer = ComponenteHelicoptero.crearUnSoporteAterrizaje();
        trenDer.setPosicion(0, 0, -2);
        trenDer.setEscala(SCALE, SCALE, SCALE);

        var trenIzq = ComponenteHelicoptero.crearUnSoporteAterrizaje();
        trenIzq.setPosicion(0, 0, 2);
        trenIzq.setRotacion(0, Math.PI, 0);
        trenIzq.setEscala(SCALE, SCALE, SCALE);

        tren.agregarHijos(trenIzq, trenDer);

        return tren;
    }

    static crearProtector() {

        var protector = new Objeto3D();

        var controlFsup = [
            [-0.7, 0, 0],
            [-0.7, 5, 0],
            [-0.7, 4, 0],
            [0.7, 4, 0],
            [0.7, 5, 0],
            [0.7, 0, 0]
        ];
        var controlFinf = [
            [0.7, 0, 0],
            [0.7, -5, 0],
            [0.7, -4, 0],
            [-0.7, -4, 0],
            [-0.7, -5, 0],
            [-0.7, 0, 0]
        ];
        var controlRIzq = [
            [0, -5, 0],
            [6.25, -5, 0],
            [6.25, 5, 0],
            [0, 5, 0]
        ];
        var controlRDer = [
            [0, 5, 0],
            [-6.25, 5, 0],
            [-6.25, -5, 0],
            [0, -5, 0]
        ];

        var protectorSupIzq = new Objeto3D(crearGeometria(controlFsup, controlRIzq), ColorRGB.ROJO);
        var protectorInfIzq = new Objeto3D(crearGeometria(controlFinf, controlRIzq), ColorRGB.ROJO);

        var protectorSupDer = new Objeto3D(crearGeometria(controlFsup, controlRDer), ColorRGB.ROJO);
        var protectorInfDer = new Objeto3D(crearGeometria(controlFinf, controlRDer), ColorRGB.ROJO);

        protector.agregarHijos(protectorSupIzq, protectorInfIzq, protectorSupDer, protectorInfDer);

        protector.setRotacion(Math.PI / 2, 0, 0);
        protector.setEscala(0.7, 0.7, 0.3);

        return protector;
    }

    static crearAleta() {

        var controlF = [
            [0, -0.5, 0],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0.5, 0]
        ];
        var controlR = [
            [3, 0, 0],
            [2, 0, 0],
            [1, 0, 0],
            [0, 0, 0]
        ];

        var aleta = new Objeto3D(crearGeometria(controlF, controlR), ColorRGB.GRIS_OSCURO);

        return aleta;
    }
    
    static crearAletaCola() {

        var controlF = [
            [0, -1, 0],
            [5, -1, 0],
            [0, 0, 0],
            [5, 1, 0],
            [0, 1, 0]
        ];

        var controlR = [
            [0, 0, .3],
            [0, 0, -.3]
        ];

        var aletaS = new Objeto3D(crearGeometria(controlF, controlR, true, 10, 30), ColorRGB.ROJO);
        aletaS.setRotacion(0, 0, Math.PI / 2);
        aletaS.setPosicion(-.8, 0, 0);

        var controlF = [
            [0, -1, 0],
            [5, -1, 0],
            [0, 0, 0],
            [5, 1, 0],
            [0, 1, 0]
        ];

        var controlR = [
            [0, 0, .3],
            [0, 0, -.3]
        ];

        var aletaInf = new Objeto3D(crearGeometria(controlF, controlR, true, 10, 30), ColorRGB.ROJO);
        aletaInf.setRotacion(0, 0, -Math.PI / 2);
        aletaInf.setPosicion(-.8, 0, 0);

        var aleta = new Objeto3D();
        aleta.agregarHijos(aletaInf, aletaS);
        aleta.setEscala(1, 1, 0.25);
        aleta.setRotacion(0, 0, Math.PI / 10);


        return aleta;
    }

    static crearConectorCola() {
        var controlF = [
            [0, -1, 0],
            [1.25, -1, 0],
            [1.25, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [-1.25, 1, 0],
            [-1.25, -1, 0],
            [0, -1, 0]
        ];

        var controlR = [
            [0, 0, 0],
            [-8, 0, 0]
        ];

        var escalado = new Escalado([
            [0, 0.75, 0],
            [1, 0.25, 0]
        ]);

        var conector = new Objeto3D(crearGeometria(controlF, controlR, false, 10, 30, escalado), ColorRGB.BEIGE);
        conector.setEscala(1, 1, .15);
        conector.setRotacion(0, 0, -Math.PI / 15);

        return conector;
    }

    static crearSoporteCola() {

        var todo = new Objeto3D();

        var conectorI = ComponenteHelicoptero.crearConectorCola();
        conectorI.setPosicion(0, 0, -1);
        var conectorD = ComponenteHelicoptero.crearConectorCola()
        conectorD.setPosicion(0, 0, 1);

        var controlF = [
            [0, -1, 0],
            [1.25, -1, 0],
            [1.25, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
            [-1.25, 1, 0],
            [-1.25, -1, 0],
            [0, -1, 0]
        ];

        var controlR = [
            [0, 0, 2],
            [0, 0, -2]
        ];

        var union = new Objeto3D(crearGeometria(controlF, controlR, true, 10, 30), ColorRGB.BEIGE);
        union.setEscala(.2, .2, 1);
        union.setPosicion(-7.7, 1.65, 0);

        todo.agregarHijos(union, conectorD, conectorI);

        return todo;
    }
}