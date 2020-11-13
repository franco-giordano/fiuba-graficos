
        // atributos del vértice (cada uno se alimenta de un ARRAY_BUFFER distinto)

        attribute vec3 aPosition;   //posicion (x,y,z)
        attribute vec3 aNormal;     //vector normal (x,y,z)
        attribute vec2 aUv;         //coordenadas de texture (x,y)  x e y (en este caso) van de 0 a 1

        // variables Uniform (son globales a todos los vértices y de solo-lectura)

        uniform mat4 uMMatrix;     // matriz de modelado
        uniform mat4 uVMatrix;     // matriz de vista
        uniform mat4 uPMatrix;     // matriz de proyección
        uniform mat3 uNMatrix;     // matriz de normales
                        
        uniform float time;                 // tiempo en segundos
        
        uniform sampler2D uSampler;         // sampler de textura de la tierra

        // variables varying (comunican valores entre el vertex-shader y el fragment-shader)
        // Es importante remarcar que no hay una relacion 1 a 1 entre un programa de vertices y uno de fragmentos
        // ya que por ejemplo 1 triangulo puede generar millones de pixeles (dependiendo de su tamaño en pantalla)
        // por cada vertice se genera un valor de salida en cada varying.
        // Luego cada programa de fragmentos recibe un valor interpolado de cada varying en funcion de la distancia
        // del pixel a cada uno de los 3 vértices. Se realiza un promedio ponderado

        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;                           
        
        // constantes
        
        const float PI=3.141592653;
        const float epsilon=0.01;

        const float amplitud=4.0;

        void main(void) {
                    
            vec3 position = aPosition;		
            vec3 normal = aNormal;	
            vec2 uv = aUv;
                                   	
            vec4 center = texture2D(uSampler, vec2(uv.s, uv.t));                     
            vec4 masU = texture2D(uSampler, vec2(uv.s+epsilon, uv.t));  
            vec4 masV = texture2D(uSampler, vec2(uv.s, uv.t+epsilon));  

            vec4 menosU = texture2D(uSampler, vec2(uv.s-epsilon, uv.t));  
            vec4 menosV = texture2D(uSampler, vec2(uv.s, uv.t-epsilon));  


            // elevamos la coordenada Y
            position.y+=center.x*amplitud;

            vec4 worldPos = uMMatrix*vec4(position, 1.0);                        

            gl_Position = uPMatrix*uVMatrix*worldPos;

            vWorldPosition=worldPos.xyz;              
            /*
             hay que calcular la normal ya que el valor original es la normal del plano
             pero luego de elevar Y, el valor original no tiene sentido

             La idea es calcular la diferencia de altura entre 2 muestras proximas
             y estimar el vector tangente.

             Haciendo lo mismo en el eje U y en el eje V tenemos 2 vectores tangentes a la superficie
             Luego calculamos el producto vectorial y obtenemos la normal

             Para tener un resultado con mayor precision, para cada eje U y V calculo 2 tangentes
             y las promedio
            */
            
            
            
            float angU=atan((masU.x-center.x)*amplitud,epsilon);
            float angV=atan((masV.x-center.x)*amplitud,epsilon);

            // tangentes en U y en V
            vec3 gradU1=vec3(cos(angU),sin(angU),0.0);
            vec3 gradV1=vec3(0.0      ,sin(angV),cos(angV));
            
            angU=atan((center.x-menosU.x)*amplitud,epsilon);
            angV=atan((center.x-menosV.x)*amplitud,epsilon);

            // segundo conjunto de tangentes en U y en V
            vec3 gradU2=vec3(cos(angU),sin(angU),0.0);
            vec3 gradV2=vec3(0.0      ,sin(angV),cos(angV));


            
            // calculo el producto vectorial
            vec3 tan1=(gradV1+gradV2)/2.0;
            vec3 tan2=(gradU1+gradU2)/2.0;
            vNormal=cross(tan1,tan2);
            vUv=uv;	
        }