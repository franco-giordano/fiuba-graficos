class Objeto3D {

    static MODEL_MATRIX_SHADER_UNIFORM = null;

    constructor(bufferWebGL) {
        this.vertexBuffer=bufferWebGL.webgl_position_buffer;
        this.indexBuffer=bufferWebGL.webgl_index_buffer;
        this.mallaTriangulos = bufferWebGL;
        this.matrizModelado=mat4.create();
        this.posicion=vec3.fromValues(0,0,0);
        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
        this.escala=vec3.fromValues(1,1,1);
        this.hijos=[];
    }

    // método privado, usa posición, rotación y escala
    _actualizarMatrizModelado() {
        mat4.translate(this.matrizModelado, this.matrizModelado, this.posicion);
        mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotX, [1,0,0]);
        mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotY, [0,1,0]);
        mat4.rotate(this.matrizModelado, this.matrizModelado, this.rotZ, [0,0,1]);
        mat4.scale(this.matrizModelado, this.matrizModelado, this.escala);
    };
    
    dibujar(matPadre) {
        this.matrizModelado = mat4.create();
        var mat=mat4.create();
        this._actualizarMatrizModelado();
        
        mat4.multiply(mat,matPadre,this.matrizModelado);
        
        if(this.mallaTriangulos){
            // dibujamos la malla de triángulos con WebGL
            // si el objeto tiene geometría asociada

            gl.uniformMatrix4fv(Objeto3D.MODEL_MATRIX_SHADER_UNIFORM, false, mat);
            dibujarMalla(this.mallaTriangulos);
        }
            
        for(var i=0;i<this.hijos.length;i++) {
            this.hijos[i].dibujar(mat);
        }
    }
    
    agregarHijo(h) {
        this.hijos.push(h);
    }

    // this.quitarHijo=function(h) { ... }

    setPosicion(x,y,z) { 
        this.posicion = vec3.fromValues(x,y,z);
    }
    
    setRotacion(radX,radY,radZ) { 
        this.rotX = radX;
        this.rotY = radY;
        this.rotZ = radZ;
     }
    
    setEscala(x,y,z) { 
        this.escala = vec3.fromValues(x,y,z);
    }
}