class Helicoptero {
    constructor() {

            var cabina = ComponenteHelicoptero.crearCabina();
            var helice = ComponenteHelicoptero.crearHelice();

            this.contenedor = new Objeto3D();
            this.contenedor.agregarHijos(cabina, helice);

            this.controlHelicoptero = new ControlHelicoptero();
    }

    actualizar() {
        var numeroCamara = this.controlHelicoptero.update();

        var p = this.posicion;
        var {roll, yaw, pitch} = this.controlHelicoptero.getRotaciones();
 
        this.mover(p.x, p.y, p.z);
        this.rotar(roll,yaw,pitch);

        return numeroCamara;
    }

    get posicion() {
        return Object.assign({}, this.controlHelicoptero.getPosition(), this.controlHelicoptero.getRotaciones());
    }

    dibujar(matriz) {
        this.contenedor.dibujar(matriz);
    }

    mover(x,y,z) {
        this.contenedor.setPosicion(x,y,z);
    }

    rotar(radX, radY, radZ) {
        this.contenedor.setRotacion(radX, radY, radZ);
    }

    infoHeli() {
        this.controlHelicoptero.getInfo();
    }
}

class ComponenteHelicoptero {
    static crearCabina() {
        var color = [0.8, 0.8, 0.8];

        var controlF = [[0,-2,0], [-1,-2,0], [-1,2,0], [0,2,0]];
        var controlR = [[4,1,0], [-1,1,0], [-4,1,0], [-4,-1,0]];

        var cabinaSup = new Objeto3D(crearGeometria(controlF, controlR), color);
        
        controlF = [[0,-2,0], [-1,-2,0], [-1,2,0], [0,2,0]];
        var controlR = [[-4,-1,0], [1,-1,0], [4,-1,0], [4,1,0]];


        var cabinaInf = new Objeto3D(crearGeometria(controlF, controlR), color);

        //TODO: construir uniones con sup de revolucion!

        controlF = [[0,-2,0], [-1,-2,0], [-1,2,0], [0,2,0]];
        controlR = [[4.001,1,0], [4.001,1.001,0], [4.001,1.001,0], [4,1.001,0]];

        var unionSup = new Objeto3D(crearGeometria(controlF, controlR), color);


        controlF = [[0,-2,0], [-1,-2,0], [-1,2,0], [0,2,0]];
        controlR = [[-4.001,-1,0], [-4.001,-1.001,0], [-4.001,-1.001,0], [-4,-1.001,0]];

        var unionInf = new Objeto3D(crearGeometria(controlF, controlR), color);

        cabinaSup.setRotacion(0,Math.PI,0);
        cabinaInf.setRotacion(0,Math.PI,0);
        unionInf.setRotacion(0,Math.PI,0);
        unionSup.setRotacion(0,Math.PI,0);

        var cabina = new Objeto3D();
        cabina.agregarHijos(cabinaSup, cabinaInf, unionInf, unionSup);

        return cabina;
    }

    static crearHelice() {
        var aletaD = ComponenteHelicoptero.crearAleta();
        var aletaI = ComponenteHelicoptero.crearAleta();
        // aletaD.setPosicion(-0.5,0,0);
        aletaD.setRotacion(0,1,0);

        // aletaI.setPosicion(-6,0,0);
        // aletaI.setRotacion(-1,0,0);

        var controlFsup = [[0,-1,0], [1.25,-1,0], [1.25,1,0], [0,1,0]];
        var controlFinf = [[0,1,0], [-1.25,1,0], [-1.25,-1,0], [0,-1,0]];
        var controlR = [[0,-1,0], [0,0,0], [0,0,0], [0,1,0]];

        var ejeSup = new Objeto3D(crearGeometria(controlFsup, controlR));
        var ejeInf = new Objeto3D(crearGeometria(controlFinf, controlR));
        var eje = new Objeto3D();
        eje.agregarHijos(ejeSup, ejeInf);
        eje.setPosicion(0,3,0);

        return eje;
    }

    static crearAleta() {

        var color = [0.8, 0.8, 0.8];

        var controlF = [[0,-0.5,0], [0,0,0], [0,0,0], [0,.5,0]];
        var controlR = [[3,0,0], [2,0,0], [1,0,0], [0,0,0]];

        var aleta = new Objeto3D(crearGeometria(controlF, controlR), color);

        return aleta;
    }
}