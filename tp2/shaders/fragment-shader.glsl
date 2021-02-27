precision mediump float;

// VARYINGS Y CONSTS

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vFromPointToCameraNormalized;
// varying vec3 vColor;
varying vec2 vUv;

uniform vec3 uColor;
uniform sampler2D uSampler;
uniform float uShininess;

// DEFINICIONES PARA LUCES

const int AMBIENTE = 1;
const int PUNTUAL = 2;
const int SPOT = 3;
const int DIRECCIONAL = 4;

struct Luz {
    int tipo;
    vec3 color;
    vec3 posicion;
    vec3 direccion;
};

const vec3 VECTOR_NULO = vec3(0.);


// TODO: recibir como varying, propia del material
// vec3 kd = vec3(1.);
vec3 ks = vec3(.75);

const Luz LUZ_AMBIENTE = Luz(AMBIENTE, vec3(.025), VECTOR_NULO, VECTOR_NULO);
const Luz luz_puntual = Luz(PUNTUAL, vec3(.5), vec3(0,100.,0), VECTOR_NULO);
const Luz luz_sol = Luz(DIRECCIONAL, vec3(1.), VECTOR_NULO, vec3(-100.,-100.,-100.));

const int NUM_LUCES = 2;

vec3 vector_hacia_luz(Luz luz) {
    vec3 res;
    
    if (luz.tipo == AMBIENTE) {
        res = VECTOR_NULO;
    } else if (luz.tipo == PUNTUAL) {
        res = luz.posicion - vWorldPosition;
    } else if (luz.tipo == SPOT) {
        res = luz.posicion - vWorldPosition;
    } else if (luz.tipo == DIRECCIONAL) {
        res = -luz.direccion;
    }

    return normalize(res);
}

vec3 calcular_intensidad_amb(Luz luz_amb) {
    return luz_amb.color;
}

vec3 calcular_intensidad_difusa(Luz luz, vec3 kd_material) {
    vec3 apunta_a_luz = vector_hacia_luz(luz);
    return kd_material * max(dot(apunta_a_luz, vNormal), 0.);
}

vec3 calcular_intensidad_especular(Luz luz, vec3 ks_material, float shininness) {
    vec3 apunta_a_luz = vector_hacia_luz(luz);
    vec3 reflexion = reflect(-apunta_a_luz, vNormal);
    return ks_material * pow(max(dot(reflexion, vFromPointToCameraNormalized),0.), shininness);
}

vec3 calcular_una_intensidad(Luz luz, vec3 kd_material, vec3 ks_material, float shininness) {

    vec3 intensidad = calcular_intensidad_amb(LUZ_AMBIENTE) + calcular_intensidad_difusa(luz, kd_material) + calcular_intensidad_especular(luz, ks_material, shininness);
    return intensidad * luz.color;
}

void main(void) {
    vec3 kd;
    vec3 ks;
    
    if (uColor != vec3(0.,0.,0.)) {
        kd = uColor;
        ks = uColor + vec3(.4);
    } else {
        kd = texture2D(uSampler, vec2(vUv.t, vUv.s)).xyz;
        ks = texture2D(uSampler, vec2(vUv.t, vUv.s)).xyz + vec3(.15);
    }


    Luz luces[NUM_LUCES];
    luces[0] = luz_puntual;
    luces[1] = luz_sol;

    // vec3 intensidad_ambiente = luz_amb.color;

    // vec3 apunta_a_luz = normalize(luz_puntual.posicion - vWorldPosition);
    // vec3 intensidad_difusa = kd * max(dot(apunta_a_luz, vNormal), 0.);
    

    // vec3 reflexion = 2. * dot(vNormal, apunta_a_luz) * vNormal - apunta_a_luz;
    // vec3 reflexion = reflect(-apunta_a_luz, vNormal);
    // vec3 intensidad_especular = ks * pow(max(dot(reflexion, vFromPointToCameraNormalized),0.), shininness);

    // vec3 ambientColor = vec3(0.5,0.5,0.5);
    // vec3 directionalColor = luz_amb.color;
    // vec3 lightVec=normalize(vec3(750.0,250.0,750.0)-vWorldPosition);

    // vec3 color = intensidad_ambiente + intensidad_difusa + intensidad_especular;

    vec3 color = vec3(0.);

    for (int i=0; i < NUM_LUCES; i++) {
        color += calcular_una_intensidad(luces[i], kd, ks, uShininess);
    }

    gl_FragColor = vec4(color,1.0);
}
