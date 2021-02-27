const ColorRGB = {
    ROJO: new ColorLiso([1, 0, 0]),
    AZUL: new ColorLiso([0, 0, 1]),
    VIOLETA: new ColorLiso([0, 1, 1]),
    VERDE: new ColorLiso([0, 1, 0]),
    BLANCO: new ColorLiso([1, 1, 1]),
    GRIS_CLARO: new ColorLiso([.8, .8, .8]),
    GRIS_OSCURO: new ColorLiso([.5, .5, .5]),
    BEIGE: new ColorLiso([204 / 256, 185 / 256, 171 / 256]),
    NEGRO: new ColorLiso([0.01, 0.01, 0.01])
};


class IDibujable {
    dibujar(matrizModelado) {
        throw new Error("Esto es una interfaz, debe ser implementada!");
    }
}

class Objeto3D extends IDibujable {

    static MODEL_MATRIX_UNIFORM = null;
    static COLOR_UNIFORM = null;
    static NORMAL_MATRIX_UNIFORM = null;

    constructor(bufferWebGL, imaterial = undefined) {
        super();
        this.mallaTriangulos = bufferWebGL;
        this.matrizModelado = mat4.create();
        this.posicion = vec3.fromValues(0, 0, 0);
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.escala = vec3.fromValues(1, 1, 1);
        this.hijos = [];
        // this.color = colorArray ? colorArray : ColorRGB.AZUL;
        this.material = imaterial ? imaterial : ColorRGB.VIOLETA;
    }

    // método privado, usa posición, rotación y escala
    _actualizarMatrizModelado() {
        mat4.translate(this.matrizModelado, this.matrizModelado, this.posicion);
        mat4.rotateY(this.matrizModelado, this.matrizModelado, this.rotY);
        mat4.rotateZ(this.matrizModelado, this.matrizModelado, this.rotZ);
        mat4.rotateX(this.matrizModelado, this.matrizModelado, this.rotX);
        mat4.scale(this.matrizModelado, this.matrizModelado, this.escala);
    };

    async dibujar(matPadre) {
        this.matrizModelado = mat4.create();
        var mat = mat4.create();
        this._actualizarMatrizModelado();

        mat4.multiply(mat, matPadre, this.matrizModelado);

        if (this.mallaTriangulos) {
            gl.uniformMatrix4fv(Objeto3D.MODEL_MATRIX_UNIFORM, false, mat);
            // gl.uniform3fv(Objeto3D.COLOR_UNIFORM, this.color);

            this.material.setearUniforms();

            var normalMatrix = mat3.create();
            mat3.fromMat4(normalMatrix, mat); // normalMatrix= (inversa(traspuesta(matrizModelado)));

            mat3.invert(normalMatrix, normalMatrix);
            mat3.transpose(normalMatrix, normalMatrix);

            gl.uniformMatrix3fv(Objeto3D.NORMAL_MATRIX_UNIFORM, false, normalMatrix);

            dibujarMalla(this.mallaTriangulos);
        }

        for (const hijo of this.hijos) {
            hijo.dibujar(mat);
        }

    }

    agregarHijos(...hs) {
        // cada hijo implementa IDibujable
        hs.forEach(h => this.hijos.push(h));
    }

    // this.quitarHijo=function(h) { ... }

    setPosicion(x, y, z) {
        this.posicion = vec3.fromValues(x, y, z);
    }

    setRotacion(radX, radY, radZ) {
        this.rotX = radX;
        this.rotY = radY;
        this.rotZ = radZ;
    }

    setRotacionZ(radZ) {
        this.rotZ = radZ;
    }

    setRotacionX(radX) {
        this.rotX = radX;
    }


    setEscala(x, y, z) {
        this.escala = vec3.fromValues(x, y, z);
    }

    escalarPor(x, y, z) {
        this.escala = vec3.fromValues(x * this.escala[0], y * this.escala[1], z * this.escala[2]);
    }
}