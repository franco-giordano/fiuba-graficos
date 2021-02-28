precision mediump float;


varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vFromPointToCameraNormalized;

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