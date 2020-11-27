class Helicoptero {
    constructor() {
            var controlF = [[0,-2,0], [-1,-2,0], [-1,2,0], [0,2,0]];
            var controlR = [[-4,-1,0], [-4,1,0], [-1,1,0], [4,1,0]];

            var cabinaSup = new Objeto3D(crearGeometria(controlF, controlR));
            
            controlF = [[0,-2,0], [-1,-2,0], [-1,2,0], [0,2,0]];
            controlR = [[4,1,0], [4,-1,0], [1,-1,0], [-4,-1,0]];

            var cabinaInf = new Objeto3D(crearGeometria(controlF, controlR));

            //TODO: construir uniones con sup de revolucion!

            controlF = [[0,-2,0], [-1,-2,0], [-1,2,0], [0,2,0]];
            controlR = [[4.001,1,0], [4.001,1.001,0], [4.001,1.001,0], [4,1.001,0]];

            var unionSup = new Objeto3D(crearGeometria(controlF, controlR));


            controlF = [[0,-2,0], [-1,-2,0], [-1,2,0], [0,2,0]];
            controlR = [[-4.001,-1,0], [-4.001,-1.001,0], [-4.001,-1.001,0], [-4,-1.001,0]];

            var unionInf = new Objeto3D(crearGeometria(controlF, controlR));

            this.contenedor = new Objeto3D();
            this.contenedor.agregarHijos(cabinaSup, cabinaInf, unionSup, unionInf);

            this.controlHelicoptero = new ControlHelicoptero();
    }

    actualizar() {
        this.controlHelicoptero.update();

        var p = this.controlHelicoptero.getPosition();
        var [rotX,rotY,rotZ] = this.controlHelicoptero.getRotaciones();
 
        this.mover(p.x, p.y, p.z);
        this.rotar(rotX,rotY,rotZ);

        return p;
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