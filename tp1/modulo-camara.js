// clase base, abstracta
class Camara {
    constructor() {
        if (this.constructor == Camara) {
            throw new Error("No pueden instanciarse clases Abstractas.");
        }
    }

    generarVista(alturaCamara, distanciaCamara, posHeli) {}

    actualizar() {}
}

class CamaraGiratoria extends Camara {

    constructor() {
        super();
        this.rotAccum = 0;
        this.VELOCIDAD_ANGULAR = 0.009;
    }

    generarVista(alturaCamara, distanciaCamara, posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var centro = vec3.fromValues(posHeli.x,posHeli.y,posHeli.z);
        var ojo = vec3.fromValues(posHeli.x, posHeli.y + alturaCamara, posHeli.z + distanciaCamara);
        
        vec3.rotateY(ojo, ojo, centro, this.rotAccum);
        
        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0,1,0)
        );
            
        
        return matrizVista;
    }

    actualizar() {
        this.rotAccum += this.VELOCIDAD_ANGULAR;
    }
}

class CamaraTrasera extends Camara {

    generarVista(alturaCamara, distanciaCamara, posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var ojo = vec3.fromValues(posHeli.x-30, posHeli.y+30, posHeli.z);
        var centro = vec3.fromValues(posHeli.x,posHeli.y,posHeli.z);
        
        vec3.rotateY(ojo, ojo, centro, posHeli.yaw);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0,1,0)
        );
            
        
        return matrizVista;
    }
}

class CamaraSuperior extends Camara {

    generarVista(alturaCamara, distanciaCamara, posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var ojo = vec3.fromValues(posHeli.x-1, posHeli.y+60, posHeli.z);
        var centro = vec3.fromValues(posHeli.x,posHeli.y,posHeli.z);
        
        vec3.rotateY(ojo, ojo, centro, posHeli.yaw);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0,1,0)
        );
            
        
        return matrizVista;
    }
}


class CamaraFija extends Camara {

    generarVista(alturaCamara, distanciaCamara, posHeli) {

        var matrizVista = mat4.create();

        // mat4.rotate(matrizVista, matrizVista, this.rotAccum, [0,1,0]);
        var ojo = vec3.fromValues(posHeli.x-60, posHeli.y+60, posHeli.z-60);
        var centro = vec3.fromValues(posHeli.x,posHeli.y,posHeli.z);
        
        // vec3.rotateY(ojo, ojo, centro, posHeli.rotY);

        mat4.lookAt(matrizVista,
            ojo,
            centro,
            vec3.fromValues(0,1,0)
        );
            
        
        return matrizVista;
    }
}