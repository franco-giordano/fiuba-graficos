precision mediump float;

// VARYINGS Y CONSTS

// ya definidos en utils.glsl:
// varying vec3 vNormal;
// varying vec3 vWorldPosition;
// varying vec3 vFromPointToCameraNormalized;
varying vec2 vUv;

uniform sampler2D uSamplerHeightmap;
uniform sampler2D uSamplerPasto;
uniform float uShininess;

void main(void) {
    vec3 kd;
    vec3 ks;

    kd = texture2D(uSamplerPasto, vUv*50.3).xyz;
    ks = texture2D(uSamplerPasto, vUv*50.3).xyz + vec3(.15);

    Luz luces[NUM_LUCES];
    luces[0] = luz_puntual;
    luces[1] = luz_sol;

    vec3 color = vec3(0.);

    for (int i=0; i < NUM_LUCES; i++) {
        color += calcular_una_intensidad(luces[i], kd, ks, uShininess);
    }

    gl_FragColor = vec4(color,1.0);
}
