class Textura {
    constructor(texture_file) {

        this.gl_tex = null;

        this.initTexture(texture_file);
    }

    initTexture(texture_file) {

        this.gl_tex = gl.createTexture();
        this.gl_tex.image = new Image();

        this.gl_tex.image.onload = () => this.onTextureLoaded(this.gl_tex);
        this.gl_tex.image.src = texture_file;
    };

    onTextureLoaded(tex) {

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
    };

}