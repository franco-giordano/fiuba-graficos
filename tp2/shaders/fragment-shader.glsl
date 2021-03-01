precision mediump float;

// VARYINGS Y CONSTS

// ya definidos en utils.glsl:
// varying vec3 vNormal;
// varying vec3 vWorldPosition;
// varying vec3 vFromPointToCameraNormalized;
varying vec2 vUv;

uniform vec3 uColor;
uniform sampler2D uSampler;
uniform float uShininess;
uniform bool uUsarVariosSampleos;

uniform sampler2D uSamplerMapaReflexion;

void main(void) {
    vec3 kd;
    vec3 ks;

    vec3 color_final = vec3(0.);
    
    if (uColor != vec3(0.,0.,0.)) {
        kd = uColor;
        ks = uColor + vec3(.4);
    } else {
        if (uUsarVariosSampleos) {
            kd = samplear_varias_escalas(uSampler, 5., 7., 1., vUv);
        }
        else {
            kd = texture2D(uSampler, vec2(vUv.t-.3, vUv.s)).xyz;
        }

        ks = kd + vec3(.15);

        vec3 reflexion = reflect(-vFromPointToCameraNormalized, vNormal);
        float m = length(reflexion);
        float alfa = map(atan(reflexion.y, reflexion.x), -PI, PI, 0., 1.);
        float beta = map(acos(reflexion.z / m), 0., PI, 0., 1.);
        // alfa = reflexion.x / m + 0.5;
        // beta = reflexion.z / m + 0.5;
        color_final += texture2D(uSamplerMapaReflexion, vec2(alfa,beta)).xyz*0.3;    // ya le agrego lo del mapa de reflexion
    }


    Luz luces[NUM_LUCES];
    luces[0] = luz_puntual;
    luces[1] = luz_sol;
    luces[2] = luz_reflejo;

    for (int i=0; i < NUM_LUCES; i++) {
        color_final += calcular_una_intensidad(luces[i], kd, ks, uShininess);
    }

    gl_FragColor = vec4(color_final,1.0);
}
