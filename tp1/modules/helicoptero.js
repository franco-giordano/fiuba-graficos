class Helicoptero {
    constructor() {

        var cabina = ComponenteHelicoptero.crearCabina();
        var brazos = ComponenteHelicoptero.crearBrazosHelices();
        var trenAterrizaje = ComponenteHelicoptero.crearTrenAterrizaje();
        trenAterrizaje.setPosicion(0, -3, 0);

        this.contenedor = new Objeto3D();
        this.contenedor.agregarHijos(cabina, brazos, trenAterrizaje);
        
        this.controlHelicoptero = new ControlHelicoptero();
    }

    actualizar() {
        var numeroCamara = this.controlHelicoptero.update();

        var p = this.posicion;
        var {
            roll,
            yaw,
            pitch
        } = this.controlHelicoptero.getRotaciones();

        this.mover(p.x, p.y, p.z);
        this.rotar(roll, yaw, pitch);

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

class ComponenteHelicoptero {

    // static crearTapaCabina() {
    //     var tapa = new Objeto3D();

    //     var color = ColorRGB.BEIGE;

    //     var controlF = [[.8,0,0], [.1,0,0], [.1,0,0], [0,0,0]];
    //     var controlR = [[4,1,0], [-1,1,0], [-4,1,0], [-4,-1,0]];

    //     var tapaSup = new Objeto3D(crearGeometria(controlF, controlR), color);
    //     tapaSup.setRotacion(0,Math.PI,0);

    //     var controlF = [[.8,0,0], [.1,0,0], [.1,0,0], [0,0,0]];
    //     var controlR = [[-4,-1,0], [1,-1,0], [4,-1,0], [4,1,0]];

    //     var tapaInf = new Objeto3D(crearGeometria(controlF, controlR), color);
    //     tapaInf.setRotacion(0,Math.PI,0);

    //     tapa.agregarHijos(tapaInf,tapaSup);

    //     return tapa;
    // }

    static crearCabina() {
        // var tapaDer = ComponenteHelicoptero.crearTapaCabina(); 
        // tapaDer.setPosicion(0,0,2);

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
            [0, 0, -2],
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 2]
        ];

        var cabinaCompletaInf = new Objeto3D(crearGeometria(controlF, controlR, true, cant_niveles, cant_vert), color);

        // var cabinaCompletaSup = new Objeto3D(crearGeometria(controlF, controlR, true, cant_niveles, cant_vert), color);

        var cabina = new Objeto3D();
        cabina.agregarHijos(cabinaCompletaInf); //Sup, cabinaInf, unionInf, unionSup); //, tapaDer);

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

    static crearBrazoHelice() {
        var brazo = new Objeto3D();
        var helice = ComponenteHelicoptero.crearHelice();
        var protector = ComponenteHelicoptero.crearProtector();
        protector.escalarPor(0.5, 0.5, 0.5);
        helice.escalarPor(0.5, 0.5, 0.5);

        protector.setPosicion(0, 0, 6);
        helice.setPosicion(0, 0, 6);

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

        brazo.agregarHijos(soporte, protector, helice);
        brazo.setEscala(0.7, 0.7, 0.7);

        return brazo;
    }

    static crearBrazosHelices() {
        var brazos = new Objeto3D();

        var brazoFder = ComponenteHelicoptero.crearBrazoHelice()
        brazoFder.setPosicion(1, 1.15, 1.85);

        var brazoFizq = ComponenteHelicoptero.crearBrazoHelice()
        brazoFizq.setPosicion(1, 1.15, -1.85);
        brazoFizq.setRotacion(0, Math.PI, 0);

        var brazoDder = ComponenteHelicoptero.crearBrazoHelice()
        brazoDder.setPosicion(-2.5, 1.15, 1.85);

        var brazoDizq = ComponenteHelicoptero.crearBrazoHelice()
        brazoDizq.setPosicion(-2.5, 1.15, -1.85);
        brazoDizq.setRotacion(0, Math.PI, 0);

        brazos.agregarHijos(brazoFder, brazoFizq, brazoDder, brazoDizq);

        return brazos;
    }
}