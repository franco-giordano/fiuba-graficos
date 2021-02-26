precision mediump float;

// DEFINICIONES PARA LUCES

const int AMBIENTE    = 1;
const int PUNTUAL       = 2;
const int DIRECCIONAL  = 3;
const int DIRECTA  = 4;

struct Luz {
    int tipo;
    vec3 color;
    vec3 posicion;
    vec3 direccion;
};

// VARYINGS Y CONSTS

// TODO: recibir como varying, propia del material
const vec3 kd = vec3(0.9, 0.2, 0.2);
const vec3 ks = vec3(1.);
const float shininness = 2.;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vFromPointToCameraNormalized;
varying vec3 vColor;

const Luz luz_amb = Luz(AMBIENTE, vec3(.15,.15,.15), vec3(0), vec3(0));
const Luz luz_puntual = Luz(PUNTUAL, vec3(.9,.1,.15), vec3(0,100.,0), vec3(0));

const int NUM_LUCES = 12;

void main(void) {
    
    Luz luces[NUM_LUCES];
    luces[0] = luz_puntual;

    vec3 intensidad_ambiente = luz_amb.color;

    vec3 apunta_a_luz = normalize(luz_puntual.posicion - vWorldPosition);
    vec3 intensidad_difusa = kd * max(dot(apunta_a_luz, vNormal), 0.);
    

    // vec3 reflexion = 2 * dot(vNormal, apunta_a_luz) * vNormal - apunta_a_luz;
    vec3 reflexion = reflect(-apunta_a_luz, vNormal);      // Reflected light vector
    vec3 intensidad_especular = ks * pow(dot(reflexion, vFromPointToCameraNormalized), shininness);

    // vec3 ambientColor = vec3(0.5,0.5,0.5);
    // vec3 directionalColor = luz_amb.color;
    // vec3 lightVec=normalize(vec3(750.0,250.0,750.0)-vWorldPosition);

    // vec3 color=(ambientColor+directionalColor*max(dot(vNormal,lightVec), 0.0))*vColor.xyz;

    vec3 color = intensidad_ambiente + intensidad_difusa + intensidad_especular;
    color = color * luz_puntual.color;

    gl_FragColor = vec4(color,1.0);
}


