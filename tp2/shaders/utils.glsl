precision mediump float;

const float PI = 3.14159265358979;

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

const Luz LUZ_AMBIENTE = Luz(AMBIENTE, vec3(.05), VECTOR_NULO, VECTOR_NULO);
// const Luz luz_puntual = Luz(PUNTUAL, vec3(.5), vec3(0,100.,0), VECTOR_NULO);
const Luz luz_sol = Luz(DIRECCIONAL, vec3(1.), VECTOR_NULO, vec3(-100.,-100.,-100.));
const Luz luz_reflejo = Luz(DIRECCIONAL, vec3(164./256., 113./256., 92./256.)*0.6, VECTOR_NULO, vec3(0.,1.,0.));

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

vec3 calcular_intensidad_difusa(Luz luz, vec3 kd_material, float minValor) {
    vec3 apunta_a_luz = vector_hacia_luz(luz);
    return kd_material * max(dot(apunta_a_luz, vNormal), minValor);
}

vec3 calcular_intensidad_especular(Luz luz, vec3 ks_material, float shininness) {
    vec3 apunta_a_luz = vector_hacia_luz(luz);
    vec3 reflexion = reflect(-apunta_a_luz, vNormal);
    return ks_material * pow(max(dot(reflexion, vFromPointToCameraNormalized),0.), shininness);
}

vec3 calcular_una_intensidad(Luz luz, vec3 kd_material, vec3 ks_material, float shininness) {

    vec3 intensidad = calcular_intensidad_amb(LUZ_AMBIENTE) + calcular_intensidad_difusa(luz, kd_material, 0.) + calcular_intensidad_especular(luz, ks_material, shininness);
    return intensidad * luz.color;
}

vec3 calcular_una_intensidad(Luz luz, vec3 kd_material, vec3 ks_material, float shininness, float minValor) {

    vec3 intensidad = calcular_intensidad_amb(LUZ_AMBIENTE) + calcular_intensidad_difusa(luz, kd_material, minValor) + calcular_intensidad_especular(luz, ks_material, shininness);
    return intensidad * luz.color;
}

// --- Perlin Noise						

vec3 mod289(vec3 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P)
{
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
}


// funcion map de utilidad
// ver https://github.com/msfeldstein/glsl-map

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

vec2 map(vec2 value, vec2 inMin, vec2 inMax, vec2 outMin, vec2 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

vec3 map(vec3 value, vec3 inMin, vec3 inMax, vec3 outMin, vec3 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

vec4 map(vec4 value, vec4 inMin, vec4 inMax, vec4 outMin, vec4 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

// para sampleos

vec3 samplear_varias_escalas(sampler2D sampler, float escala1, float escala2, float escala3, vec2 uvs) {

    vec3 color1 = texture2D(sampler,uvs*escala1).xyz;
    vec3 color2 = texture2D(sampler,uvs*escala2).xyz;
    vec3 color3 = texture2D(sampler,uvs*escala3).xyz;
			   
    return mix(mix(color1, color2, 0.5),color3,0.3);
}
