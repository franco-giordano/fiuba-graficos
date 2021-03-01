precision highp float;

// atributos del vértice (cada uno se alimenta de un ARRAY_BUFFER distinto)

attribute vec3 aPosition;   //posicion (x,y,z)
attribute vec2 aUv;         //coordenadas de texture (x,y)  x e y (en este caso) van de 0 a 1

// variables Uniform (son globales a todos los vértices y de solo-lectura)

uniform mat4 uMMatrix;     // matriz de modelado
uniform mat4 uVMatrix;     // matriz de vista
uniform mat4 uPMatrix;     // matriz de proyección
uniform sampler2D uSamplerHeightmap;         // sampler de textura de la tierra

// variables varying (comunican valores entre el vertex-shader y el fragment-shader)
// Es importante remarcar que no hay una relacion 1 a 1 entre un programa de vertices y uno de fragmentos
// ya que por ejemplo 1 triangulo puede generar millones de pixeles (dependiendo de su tamaño en pantalla)
// por cada vertice se genera un valor de salida en cada varying.
// Luego cada programa de fragmentos recibe un valor interpolado de cada varying en funcion de la distancia
// del pixel a cada uno de los 3 vértices. Se realiza un promedio ponderado

varying vec3 vWorldPosition;
varying vec3 vFromPointToCameraNormalized;
varying vec3 vNormal;
varying vec2 vUv;


// constantes

const float epsilon=0.01;

const float amplitud=4.0;

void main(void) {
            
    vec3 position = aPosition;		
    vec2 uv = aUv;

    // heightmap es blanco y negro, importa solo una componente                           
    float center = texture2D(uSamplerHeightmap, vec2(uv.s, uv.t)).x;
    float masU = texture2D(uSamplerHeightmap, vec2(uv.s+epsilon, uv.t)).x;
    float masV = texture2D(uSamplerHeightmap, vec2(uv.s, uv.t+epsilon)).x;

    float menosU = texture2D(uSamplerHeightmap, vec2(uv.s-epsilon, uv.t)).x;
    float menosV = texture2D(uSamplerHeightmap, vec2(uv.s, uv.t-epsilon)).x;

    // elevamos la coordenada Y
    position.y+=center*amplitud;

    vec4 worldPos = uMMatrix*vec4(position, 1.0);
    vec4 viewProd = uVMatrix*worldPos;
    gl_Position = uPMatrix*viewProd;

    
    // usando angulos producia muchas normales nulas erroneas
    // float angU=atan((masU-center)*amplitud,epsilon);
    // float angV=atan((masV-center)*amplitud,epsilon);
    // angU=atan((center-menosU)*amplitud,epsilon);
    // angV=atan((center-menosV)*amplitud,epsilon);

    // lo reemplazo por promediar la normal directo

    // tangentes en U y en V
    vec3 gradU1=vec3(epsilon, (masU-center)*amplitud, 0.);//vec3(cos(angU),sin(angU),0.0);
    vec3 gradV1=vec3(0., (masV - center)*amplitud, epsilon);//vec3(0.0,sin(angV),cos(angV));

    // segundo conjunto de tangentes en U y en V
    vec3 gradU2=vec3(-epsilon, (menosU-center)*amplitud, 0.);//vec3(cos(angU),sin(angU),0.0);
    vec3 gradV2=vec3(0., (menosV - center)*amplitud, -epsilon);//vec3(0.0,sin(angV),cos(angV));
    
    // // calculo el producto vectorial
    // vec3 tan1=(gradV1+gradV2)/2.0;
    // vec3 tan2=(gradU1+gradU2)/2.0;
    vec3 nMas = normalize(cross(gradV1,gradU1));
    vec3 nMenos = normalize(cross(gradV2,gradU2));

    vFromPointToCameraNormalized = normalize(-vec3(viewProd) / viewProd.w);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize((nMas + nMenos) / 2.0);
    vUv = aUv;
}