class IMaterial {
    setearUniforms() {}
}

class MaterialTexturado extends IMaterial {
    constructor(nombre_textura, shininess, usar_varios_sampleos = false, nombre_mapa_reflexion = null, factor_reflexion = 1., delta_sampler=[1.,1.,0.,0.]) {
        super();
        this.shininess = shininess;
        this.textura = new Textura(nombre_textura);
        this.usar_varios_sampleos = usar_varios_sampleos;
        this.factor_reflexion = factor_reflexion;
        this.delta_sampler = delta_sampler;

        if (nombre_mapa_reflexion) {
            this.mapa_reflexion = new Textura(nombre_mapa_reflexion);
        }
    }

    setearUniforms() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textura.gl_tex);
        gl.uniform1i(Planeta.MAIN_SHADER.unifs.sampler, 0);
        gl.uniform4fv(Planeta.MAIN_SHADER.unifs.deltaSampler, this.delta_sampler);

        gl.uniform3fv(Objeto3D.COLOR_UNIFORM, [0, 0, 0]);

        gl.uniform1f(Planeta.MAIN_SHADER.unifs.shininess, this.shininess);
        gl.uniform1f(Planeta.MAIN_SHADER.unifs.usarVariosSampleos, this.usar_varios_sampleos);
        gl.uniform1f(Planeta.MAIN_SHADER.unifs.factorReflexion, this.factor_reflexion);

        if (this.mapa_reflexion) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.mapa_reflexion.gl_tex);
            gl.uniform1i(Planeta.MAIN_SHADER.unifs.samplerMapaReflexion, 1);
        }
    }

    static CABINA_HELI() {
                    // kd = texture2D(uSampler, vec2(1.13-vUv.s, 1.8-vUv.t)*vec2(0.9, .4)).xyz;
        var delta = [-0.9, -0.4, 1.017, 0.72];
        return new MaterialTexturado("assets/textures/cabina.png", 5., false, "assets/textures/cielo2-refmap.jpg", 1, delta);
    }

    static HELIPAD() {
        return new MaterialTexturado("assets/textures/helipad.jpg", 20., false, "assets/textures/cielo2-refmap.jpg", 0.15);
    }

    static AGUA() {
        return new MaterialTexturado("assets/textures/agua.jpg", 10., true, "assets/textures/cielo2-refmap.jpg", 0.5);
    }

    static UV_BASICO() {
        return new MaterialTexturado("assets/textures/uv.jpg", 5., false);
    }
}


class ColorLiso extends IMaterial {
    constructor(color, shininess = 20.) {
        super();
        this.color = color ? color : [0, 1, 1];
        this.shininess = shininess;
    }

    setearUniforms() {
        gl.uniform3fv(Objeto3D.COLOR_UNIFORM, this.color);

        gl.uniform1f(Planeta.MAIN_SHADER.unifs.shininess, this.shininess);
    }
}