
        // atributos del vértice (cada uno se alimenta de un buffer de distinto)

        attribute vec3 aPosition;   //x,y,z
        attribute vec3 aNormal;     //x,y,z
        attribute vec2 aUv;         //x,y

        // variables Uniform (son globales a todos los vértices y de solo-lectura)

        uniform mat4 uMMatrix;     // matriz de modelo 
        uniform mat4 uVMatrix;     // matriz de vista
        uniform mat4 uPMatrix;      // matriz de proyección
        uniform mat3 uNMatrix;      // matriz de normales
        

                
        uniform float time;                 // tiempo en segundos
        
        uniform sampler2D uSampler;         // sampler de textura de la tierra

        // variables varying (comunican valores entre el vertex-shader y el fragment-shader)

        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;                           
        

        // constantes
        
        const float PI=3.141592653;

        void main(void) {
                    
            vec3 position = aPosition;		
            vec3 normal = aNormal;	
            vec2 uv = aUv;
                                   	
            vec4 textureColor = texture2D(uSampler, vec2(uv.x, uv.y));            
            
            // ************************************************************************

            float radio=1.0;
            if (uv.y==1.0) radio=0.5;
            if (uv.y==0.0) radio=0.5;

            position.x=radio*sin(uv.x*PI*2.0)*0.5;
            position.z=radio*cos(uv.x*PI*2.0)*0.5;

            position.y=(uv.y-0.5)*2.0;
            
            // ************************************************************************

            vec4 worldPos = uMMatrix*vec4(position, 1.0);                        

            gl_Position = uPMatrix*uVMatrix*worldPos;
            vWorldPosition=worldPos.xyz;              

            vNormal=normalize(uNMatrix * aNormal);
            vUv=uv;	
        }