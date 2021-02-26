class ShaderProgram {
    constructor(vertexSrc, fragmentSrc) {
        var vertexShader = buildShader(gl, vertexSrc, "vertex");
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

        this.unifs.sampler = gl.getUniformLocation(this.program, "uSampler");

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
    }
}


class TerrainProgram extends ShaderProgram {
    constructor() {
        super(TERRAIN_VRTXSHADER_SRC, FRAGMENT_SHADER_SRC);
    }
}