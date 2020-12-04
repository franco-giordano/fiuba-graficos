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
    
    }

    static crearMain() {
        var prog = new ShaderProgram(MAIN_VRTXSHADER_SRC, FRAGMENT_SHADER_SRC);

        // setear attribs y unifs particulares de este shader
        prog.attribs.normal = gl.getAttribLocation(prog.program, "aNormal");
        gl.enableVertexAttribArray(prog.attribs.normal);

        prog.unifs.normalMatrix = gl.getUniformLocation(prog.program, "uNMatrix");
        prog.unifs.color = gl.getUniformLocation(prog.program, "uColor");

        return prog;
    }

    static crearTerrain() {
        var prog = new ShaderProgram(TERRAIN_VRTXSHADER_SRC, FRAGMENT_SHADER_SRC);

        // setear attribs y unifs particulares de este shader

        prog.attribs.texCoord = gl.getAttribLocation(prog.program, "aUv");
        gl.enableVertexAttribArray(prog.attribs.texCoord);

        prog.unifs.sampler = gl.getUniformLocation(prog.program, "uSampler");

        return prog;
    }


}
