precision highp float;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vColor;

void main(void) {

    vec3 ambientColor = vec3(0.5,0.5,0.5);
    vec3 directionalColor = vec3(1., 1., 1.);
    vec3 lightVec=normalize(vec3(0.0,400.0,0.0)-vWorldPosition);

    vec3 color=(ambientColor+directionalColor*max(dot(vNormal,lightVec), 0.0))*vColor.xyz;

    gl_FragColor = vec4(color,1.0);
}


