class IMaterial {
    setearUniforms() {}
}

class MaterialTexturado extends IMaterial {
    constructor(nombre_textura, shininess) {
        super();
        this.shininess = shininess;
        this.textura = new Textura(nombre_textura);
    }

    setearUniforms() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textura.gl_tex);

        gl.uniform3fv(Objeto3D.COLOR_UNIFORM, [0,0,0]);

        gl.uniform1f(Planeta.MAIN_SHADER.unifs.shininess, this.shininess);
    }

    static CABINA_HELI() {
        return new MaterialTexturado("assets/textures/uv.jpg", 20.);
    }

    static HELIPAD() {
        return new MaterialTexturado("assets/textures/helipad.jpg", 20.);
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