precision mediump float;

// VARYINGS Y CONSTS

// ya definidos en utils.glsl:
// varying vec3 vNormal;
// varying vec3 vWorldPosition;
// varying vec3 vFromPointToCameraNormalized;
varying vec2 vUv;

uniform sampler2D uSamplerHeightmap;
uniform sampler2D uSamplerPasto;
uniform sampler2D uSamplerRoca;
uniform sampler2D uSamplerRocaBaja;
uniform sampler2D uSamplerTierra;
uniform float uShininess;

const vec3 UP = vec3(0.0,1.0,0.0);

const float INICIO_ROCA_BAJA = -20.;
const float DELTA_FIN_ROCA_BAJA = 25.;
const float INICIO_NIEVE = 55.;
const float DELTA_FIN_NIEVE = 70.;

vec3 samplear_varias_escalas(sampler2D sampler, float escala1, float escala2, float escala3) {

    vec3 color1 = texture2D(sampler,vUv*escala1).xyz;
    vec3 color2 = texture2D(sampler,vUv*escala2).xyz;
    vec3 color3 = texture2D(sampler,vUv*escala3).xyz;
			   
    return mix(mix(color1, color2, 0.5),color3,0.3);
}

vec3 generar_kd() {

    // si upFactor==1 ambos vectores coinciden, si es 0 son ortogonales
    float upFactor=max(0.0,dot(UP,vNormal));

    // remapeo upFactor para que suba de 0 a 1 entre 0.7 y 0.8 

    // ejemplo de smoothstep: https://thebookofshaders.com/05/?lan=es
    float a=smoothstep(0.,0.3,upFactor);

    // sampleo las texturas y colores de base
    
    vec3 pasto = samplear_varias_escalas(uSamplerPasto, 30., 60., 10.);
    vec3 rocas = samplear_varias_escalas(uSamplerRoca, 60., 80., 10.);
    vec3 tierra = samplear_varias_escalas(uSamplerTierra, 5., 15., 22.);
    vec3 rocasBajas = samplear_varias_escalas(uSamplerRocaBaja, 60., 100., 10.);
    vec3 colorNieve=vec3(0.9,0.9,0.91);

    // la nieve se acumula a partir de cierta altura y en las zonas planas

    float agujerosNieve=smoothstep(-1.0,0.2,cnoise(vWorldPosition*1.87))+smoothstep(-1.0,0.3,cnoise(32.23+vWorldPosition*0.21));
    // float mixNieve=min(1.0,smoothstep(h2,h3,vWorldPosition.y)*a*agujerosNieve);
    float mixNieve = clamp(map(vWorldPosition.y, INICIO_NIEVE, INICIO_NIEVE+DELTA_FIN_NIEVE, 0., 1.) * agujerosNieve, 0.,1.);


    // ruido perlin para mezclar pasto y tierra
    float noise1=cnoise(vUv.xyx*80.23+23.11);
    float noise2=cnoise(vUv.xyx*10.77+9.45);
    float noise3=cnoise(vUv.xyx*30.8+21.2);

    float mask1=mix(mix(noise1,noise2,0.5),noise3,0.3);		
    mask1=smoothstep(-0.1,0.2,mask1);

    float mixTierraPasto=smoothstep(0.,0.5,cnoise(vWorldPosition*0.17));

    vec3 colorTerrenoPlano=mix(pasto,tierra,mask1);
    vec3 colorTerrenoVertical = mix(rocasBajas,rocas,clamp(map(vWorldPosition.y, INICIO_ROCA_BAJA, INICIO_ROCA_BAJA+DELTA_FIN_ROCA_BAJA, 0., 1.), 0.,1.));

    // mezclo colores de terreno segun "verticalidad"

    vec3 colorTerreno=mix(colorTerrenoVertical,colorTerrenoPlano,a);

    return mix(colorTerreno,colorNieve,mixNieve);
    // return tierra;
}

void main(void) {
    vec3 kd;
    vec3 ks;

    kd = generar_kd();
    ks = vec3(0.9);

    Luz luces[NUM_LUCES];
    luces[0] = luz_puntual;
    luces[1] = luz_sol;

    vec3 color = vec3(0.);

    for (int i=0; i < NUM_LUCES; i++) {
        color += calcular_una_intensidad(luces[i], kd, ks, uShininess, 0.5);
    }
    
    // gl_FragColor = vec4(max(color, vec3(0.1)),1.0);
    
   // zonas planas y verticales
//    gl_FragColor = vec4(a,1.0-a,0.0,1.0);

   //gl_FragColor = vec4(a,1.0-a,0.0,1.0);

   // ver el valor de las normales
   gl_FragColor = vec4(color,1.0);

   //gl_FragColor=vec4(mixTierraPasto,0.0,0.0,1.0);

}
