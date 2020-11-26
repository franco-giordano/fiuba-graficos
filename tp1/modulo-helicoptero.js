class Helicoptero {
    constructor() {
            var controlF = [[0,-0.5,0], [-1,1,0], [1,1,0], [0,-0.5,0]];
            var controlR = [[0,0,0], [1,0,0], [2,0,0], [3,0,0]];
            
            this.obj = new Objeto3D(crearGeometria(controlF, controlR));
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
        this.obj.dibujar(matriz);
    }

    mover(x,y,z) {
        this.obj.setPosicion(x,y,z);
    }

    rotar(radX, radY, radZ) {
        this.obj.setRotacion(radX, radY, radZ);
    }
}