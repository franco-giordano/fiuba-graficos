precision highp float;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main(void) {

    vec3 lightVec=normalize(vec3(30.0,0.0,0.0)-vWorldPosition);
    vec3 diffColor=mix(vec3(1.2, 0.1, 0.1),vNormal,0.4);
    vec3 color=dot(lightVec,vNormal)*diffColor+vec3(0.2,0.2,0.2);

    gl_FragColor = vec4(color,1.0);
}