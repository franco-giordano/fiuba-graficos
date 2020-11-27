precision highp float;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec3 vColor;

void main(void) {

    vec3 lightVec=normalize(vec3(0.0,30.0,0.0)-vWorldPosition);
    vec3 diffColor=mix(vColor,vNormal,0.4);
    vec3 ilumintion=dot(lightVec,vNormal)*diffColor+vec3(0.2,0.2,0.2);

    gl_FragColor = vec4(mix(vColor,ilumintion, 0.5),1.0);
}