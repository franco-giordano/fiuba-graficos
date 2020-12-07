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