const ColorRGB = {
    ROJO: [1, 0, 0],
    AZUL: [0, 0, 1],
    VERDE: [0, 1, 0],
    BLANCO: [1, 1, 1],
    GRIS_CLARO: [.8, .8, .8],
    GRIS_OSCURO: [.5, .5, .5],
    BEIGE: [204 / 256, 185 / 256, 171 / 256],
    NEGRO: [0, 0, 0]
};

class Objeto3D {

    static MODEL_MATRIX_UNIFORM = null;
    static COLOR_UNIFORM = null;
    static NORMAL_MATRIX_UNIFORM = null;

    constructor(bufferWebGL, colorArray) {
        this.mallaTriangulos = bufferWebGL;
        this.matrizModelado = mat4.create();
        this.posicion = vec3.fromValues(0, 0, 0);
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.escala = vec3.fromValues(1, 1, 1);
        this.hijos = [];
        this.color = colorArray ? colorArray : ColorRGB.AZUL;
    }

    // método privado, usa posición, rotación y escala
    _actualizarMatrizModelado() {
        mat4.translate(this.matrizModelado, this.matrizModelado, this.posicion);
        mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotY, [0, 1, 0]);
        mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotZ, [0, 0, 1]);
        mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotX, [1, 0, 0]);
        mat4.scale(this.matrizModelado, this.matrizModelado, this.escala);
    };

    dibujar(matPadre) {
        this.matrizModelado = mat4.create();
        var mat = mat4.create();
        this._actualizarMatrizModelado();

        mat4.multiply(mat, matPadre, this.matrizModelado);

        if (this.mallaTriangulos) {
            gl.uniformMatrix4fv(Objeto3D.MODEL_MATRIX_UNIFORM, false, mat);
            gl.uniform3fv(Objeto3D.COLOR_UNIFORM, this.color);

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

    setEscala(x, y, z) {
        this.escala = vec3.fromValues(x, y, z);
    }

    escalarPor(x, y, z) {
        this.escala = vec3.fromValues(x * this.escala[0], y * this.escala[1], z * this.escala[2]);
    }
}