class Material {
    constructor(nombre_textura, shininess) {
        this.shininess = shininess;
        this.textura = new Textura(nombre_textura);
    }

    setearUniforms() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textura.gl_tex);

        gl.uniform1f(Planeta.MAIN_SHADER.unifs.shininess, this.shininess);
    }
}
