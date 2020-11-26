class Objeto3D {

    constructor(vertexBuffer, indexBuffer) {
        this.vertexBuffer=vertexBuffer;
        this.indexBuffer=indexBuffer;
        this.matrizModelado=mat4.create();
        this.posicion=vec3.create();
        this.rotacion=vec3.create();
        this.escala=vec3.create();
        this.hijos=[];
    }

    // método privado, usa posición, rotación y escala
    actualizarMatrizModelado() {

    };
    
    dibujar(matPadre) {
        var mat=mat4.create();
        actualizarMatrizModelado();
        
        mat4.multiply(mat,matPadre,this.matrizModelado);
        
        if(vertexBuffer && indexBuffer){
            // dibujamos la malla de triángulos con WebGL
            // si el objeto tiene geometría asociada

        }
            
        for(vari=0;i<hijos.length;i++) {
            hijos[i].dibujar(mat);
        }
    }
    
    agregarHijo(h) { 
        this.hijos.push(h);
    }

    // this.quitarHijo=function(h) { ... }
    setPosicion=function(x,y,z) { 
        this.posicion = vec3.fromValues(x,y,z);
    }
    
    this.setRotacion=function(x,y,z) { ... }
    
    this.setEscala=function(x,y,z) { ... }
}