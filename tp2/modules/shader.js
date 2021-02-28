class ShaderProgram {
    constructor(vertexSrc, fragmentSrc) {
        var vertexShader = buildShader(gl, vertexSrc, "vertex");

        // agregar utils a frag shader
        fragmentSrc = UTILS_SHADER_SRC + fragmentSrc;
        var fragmentShader = buildShader(gl, fragmentSrc, "fragment");

        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        // console.log(vertexSrc, this.program, vertexShader, fragmentShader);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        this.attribs = {};
        this.unifs = {};

        gl.useProgram(this.program);

        // definir attribs y unifs comunes a todos los shaders

        this.attribs.vertexPos = gl.getAttribLocation(this.program, "aPosition");
        gl.enableVertexAttribArray(this.attribs.vertexPos);

        this.unifs.proyMatrix = gl.getUniformLocation(this.program, "uPMatrix");
        this.unifs.modelMatrix = gl.getUniformLocation(this.program, "uMMatrix");
        this.unifs.viewMatrix = gl.getUniformLocation(this.program, "uVMatrix");

        this.attribs.texCoord = gl.getAttribLocation(this.program, "aUv");
        gl.enableVertexAttribArray(this.attribs.texCoord);

        this.unifs.shininess = gl.getUniformLocation(this.program, "uShininess");
    }

    setearParametros() {

        gl.useProgram(this.program);

        gl.uniformMatrix4fv(this.unifs.viewMatrix, false, matrizVista);
        gl.uniformMatrix4fv(this.unifs.proyMatrix, false, matrizProyeccion);
    }
}


class MainProgram extends ShaderProgram {
    constructor() {
        super(MAIN_VRTXSHADER_SRC, FRAGMENT_SHADER_SRC);

        // setear attribs y unifs particulares de este shader
        this.attribs.normal = gl.getAttribLocation(this.program, "aNormal");
        gl.enableVertexAttribArray(this.attribs.normal);

        this.unifs.normalMatrix = gl.getUniformLocation(this.program, "uNMatrix");
        this.unifs.color = gl.getUniformLocation(this.program, "uColor");
        this.unifs.sampler = gl.getUniformLocation(this.program, "uSampler");

    }
}


class TerrainProgram extends ShaderProgram {
    constructor() {
        super(TERRAIN_VRTXSHADER_SRC, TERRAIN_FRAGMENT_SHADER_SRC);

        this.unifs.samplerHeightmap = gl.getUniformLocation(this.program, "uSamplerHeightmap");
        this.unifs.samplerPasto = gl.getUniformLocation(this.program, "uSamplerPasto");
        this.texturaPasto = new Textura("assets/textures/pasto.jpg");

        this.unifs.samplerRoca = gl.getUniformLocation(this.program, "uSamplerRoca");
        this.texturaRoca = new Textura("assets/textures/roca2.jpg");

        this.unifs.samplerTierra = gl.getUniformLocation(this.program, "uSamplerTierra");
        this.texturaTierra = new Textura("assets/textures/tierra3.jpg");
    }

    setearParametros() {

        gl.useProgram(this.program);

        gl.uniformMatrix4fv(this.unifs.viewMatrix, false, matrizVista);
        gl.uniformMatrix4fv(this.unifs.proyMatrix, false, matrizProyeccion);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.texturaPasto.gl_tex);
        gl.uniform1i(Planeta.TERRAIN_SHADER.unifs.samplerPasto, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.texturaRoca.gl_tex);
        gl.uniform1i(Planeta.TERRAIN_SHADER.unifs.samplerRoca, 2);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.texturaTierra.gl_tex);
        gl.uniform1i(Planeta.TERRAIN_SHADER.unifs.samplerTierra, 3);
    }
}