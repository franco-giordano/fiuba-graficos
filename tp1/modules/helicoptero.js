class Helicoptero {
    constructor(long_terreno) {

        // me guardo estos dos componentes porque tienen interaccion especial
        this.cola = new ColaHelicoptero();
        this.brazos = new ColeccionDeBrazosHelice();

        var cabina = ComponenteFactory.crearCabina();
        var trenAterrizaje = ComponenteFactory.crearTrenAterrizaje();
        trenAterrizaje.setPosicion(0, -3, 0);

        this.contenedor = new Objeto3D();
        this.contenedor.agregarHijos(cabina, this.brazos, trenAterrizaje, this.cola);

        // spawnear heli en el centro del terreno
        this.controlHelicoptero = new ControlHelicoptero(long_terreno, 65);
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
        Planeta.MAIN_SHADER.setearParametros();
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

        this.helice = ComponenteFactory.crearHelice();
        this.protector = ComponenteFactory.crearProtector();

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

        this.soporteCola = ComponenteFactory.crearSoporteCola();
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

        this.aletaI = ComponenteFactory.crearAletaCola();
        this.aletaD = ComponenteFactory.crearAletaCola();
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