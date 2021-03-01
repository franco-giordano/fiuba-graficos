class IMaterial {
    setearUniforms() {}
}

class MaterialTexturado extends IMaterial {
    constructor(nombre_textura, shininess, usar_varios_sampleos = false, nombre_mapa_reflexion = null) {
        super();
        this.shininess = shininess;
        this.textura = new Textura(nombre_textura);
        this.usar_varios_sampleos = usar_varios_sampleos;

        if (nombre_mapa_reflexion) {
            this.mapa_reflexion = new Textura(nombre_mapa_reflexion);
        }
    }

    setearUniforms() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textura.gl_tex);
        gl.uniform1i(Planeta.MAIN_SHADER.unifs.sampler, 0);

        gl.uniform3fv(Objeto3D.COLOR_UNIFORM, [0,0,0]);

        gl.uniform1f(Planeta.MAIN_SHADER.unifs.shininess, this.shininess);
        gl.uniform1f(Planeta.MAIN_SHADER.unifs.usarVariosSampleos, this.usar_varios_sampleos);

        if (this.mapa_reflexion) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.mapa_reflexion.gl_tex);
            gl.uniform1i(Planeta.MAIN_SHADER.unifs.samplerMapaReflexion, 1);
        }
    }

    static CABINA_HELI() {
        return new MaterialTexturado("assets/textures/cabina.png", 5., false, "assets/textures/cielo2-refmap.jpg");
    }

    static HELIPAD() {
        return new MaterialTexturado("assets/textures/helipad.jpg", 20.);
    }

    static AGUA() {
        return new MaterialTexturado("assets/textures/agua.jpg", 10., true);
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
