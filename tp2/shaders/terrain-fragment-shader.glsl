precision mediump float;

// VARYINGS Y CONSTS

// ya definidos en utils.glsl:
// varying vec3 vNormal;
// varying vec3 vWorldPosition;
// varying vec3 vFromPointToCameraNormalized;
varying vec2 vUv;

uniform vec3 uColor;
uniform sampler2D uSamplerHeightmap;
uniform sampler2D uSamplerPasto;
uniform float uShininess;

void main(void) {
    vec3 kd;
    vec3 ks;
    
    if (uColor != vec3(0.,0.,0.)) {
        kd = uColor;
        ks = uColor + vec3(.4);
    } else {
        kd = texture2D(uSamplerHeightmap, vec2(vUv.t, vUv.s)).xyz;
        ks = texture2D(uSamplerHeightmap, vec2(vUv.t, vUv.s)).xyz + vec3(.15);
    }


    Luz luces[NUM_LUCES];
    luces[0] = luz_puntual;
    luces[1] = luz_sol;

    vec3 color = vec3(0.);

    for (int i=0; i < NUM_LUCES; i++) {
        color += calcular_una_intensidad(luces[i], kd, ks, uShininess);
    }

    gl_FragColor = vec4(texture2D(uSamplerPasto, vec2(vUv.s, vUv.t)).xyz,1.0);
}
