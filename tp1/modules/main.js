var modo="smooth"; // wireframe, smooth, edges
var shaderProgram;
var terrain_shaderProgram;
var time=0;

var gl;
var mat4=glMatrix.mat4;
var mat3=glMatrix.mat3;
var vec3=glMatrix.vec3;   
            

var distanciaCamara=15;
var alturaCamara=2;

var matrizProyeccion = mat4.create();            
var matrizVista = mat4.create();            
var matrizModelado = mat4.create();

var planeta = null;
var mountains = null;

function onResize(){
    gl.canvas.width=$canvas.width();
    gl.canvas.height=$canvas.height();
    aspect=$canvas.width()/$canvas.height();
}


function setMatrixUniforms(prog) {
    
    // gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, matrizModelado);
    gl.uniformMatrix4fv(prog.unifs.viewMatrix, false, matrizVista);
    gl.uniformMatrix4fv(prog.unifs.proyMatrix, false, matrizProyeccion);

    var normalMatrix = mat3.create();
    mat3.fromMat4(normalMatrix,matrizModelado); // normalMatrix= (inversa(traspuesta(matrizModelado)));

    mat3.invert(normalMatrix, normalMatrix);
    mat3.transpose(normalMatrix, normalMatrix);

    gl.uniformMatrix3fv(prog.unifs.normalMatrix, false, normalMatrix);

}
      
function drawScene() {

    // Se configura el viewport dentro del "canvas". 
    // En este caso se utiliza toda el área disponible
    gl.viewport(0, 0, $canvas.width(), $canvas.height());
    
    // Se habilita el color de borrado para la pantalla (Color Buffer) y otros buffers
    gl.clearColor(0.53,0.81,0.92,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Se configura la matriz de proyección
    mat4.identity(matrizProyeccion);
    mat4.perspective(matrizProyeccion, 45, aspect, 0.1, 100000.0);

    
    gl.useProgram(terrain_shaderProgram.program);
    setMatrixUniforms(terrain_shaderProgram);
    gl.uniformMatrix4fv(terrain_shaderProgram.unifs.modelMatrix, false, matrizModelado);
    mountains.draw();

    gl.useProgram(shaderProgram.program);
    setMatrixUniforms(shaderProgram);
    planeta.dibujar(matrizModelado);
    
}

function tick() {
    requestAnimFrame(tick);
    time+=1/60;

    planeta.actualizar();

    matrizVista = planeta.generarVista(alturaCamara, distanciaCamara);

    drawScene();
}
    
function initMenu(){
    var gui = new dat.GUI();
    gui.add(window, "distanciaCamara",1,20).step(0.01);
    gui.add(window, "alturaCamara",-10,10).step(0.01);;
    gui.add(window, "modo",["wireframe","smooth","edges"]);
    // gui.add(window, "velocidadAngular",0, 1).step(0.01);
    
}

function webGLStart() {

    var canvas = document.getElementById("myCanvas");
    initGL(canvas);

    shaderProgram = ShaderProgram.crearMain();
    terrain_shaderProgram = ShaderProgram.crearTerrain();

    Objeto3D.MODEL_MATRIX_UNIFORM = shaderProgram.unifs.modelMatrix;
    Objeto3D.COLOR_UNIFORM = shaderProgram.unifs.color;


    planeta = new Planeta();

    mountains = new TexturedSphere(128, 128);
    mountains.initBuffers();
    mountains.initTexture("img/heightmap.png");

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    $(window).on("resize",onResize);
    initMenu();
    tick();
}

function main() {
    loadShaders(webGLStart);
}


function TexturedSphere(latitude_bands, longitude_bands){

    this.latitudeBands = latitude_bands;
    this.longitudeBands = longitude_bands;
    
    this.position_buffer = null;
    this.normal_buffer = null;
    this.texture_coord_buffer = null;
    this.index_buffer = null;

    this.webgl_position_buffer = null;
    this.webgl_normal_buffer = null;
    this.webgl_texture_coord_buffer = null;
    this.webgl_index_buffer = null;
    
    this.texture = null;

    this.initTexture = function(texture_file){
        
        this.texture = gl.createTexture();
        this.texture.image = new Image();

        this.texture.image.onload = function () {
               onTextureLoaded()
        }
        this.texture.image.src = texture_file;
    }


    // Se generan los vertices para la esfera, calculando los datos para una esfera de radio 1
    // Y también la información de las normales y coordenadas de textura para cada vertice de la esfera
    // La esfera se renderizara utilizando triangulos, para ello se arma un buffer de índices 
    // a todos los triángulos de la esfera
    
    this.initBuffers = function(){

        this.position_buffer = [];
        this.normal_buffer = [];
        this.texture_coord_buffer = [];

        var latNumber;
        var longNumber;
        var lado=15;

        for (latNumber=0; latNumber <= this.latitudeBands; latNumber++) {



            for (longNumber=0; longNumber <= this.longitudeBands; longNumber++) {




                var x = (-0.5+(latNumber/this.latitudeBands))*lado;
                var z = (-0.5+(longNumber/this.longitudeBands))*lado;
                var y = 0;

                var u =  (longNumber / this.longitudeBands);
                var v = 1-(latNumber / this.latitudeBands);

                this.normal_buffer.push(0);
                this.normal_buffer.push(1);
                this.normal_buffer.push(0);

                this.texture_coord_buffer.push(u);
                this.texture_coord_buffer.push(v);
                
                this.position_buffer.push(x);
                this.position_buffer.push(y);
                this.position_buffer.push(z);
            }
        }

        // Buffer de indices de los triangulos
        this.index_buffer = [];
      
        for (latNumber=0; latNumber < this.latitudeBands; latNumber++) {
            for (longNumber=0; longNumber < this.longitudeBands; longNumber++) {

                var first = (latNumber * (this.longitudeBands + 1)) + longNumber;
                var second = first + this.longitudeBands + 1;

                this.index_buffer.push(first);
                this.index_buffer.push(second);
                this.index_buffer.push(first + 1);

                this.index_buffer.push(second);
                this.index_buffer.push(second + 1);
                this.index_buffer.push(first + 1);
                
            }
        }

        // Creación e Inicialización de los buffers a nivel de OpenGL
        this.webgl_normal_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normal_buffer), gl.STATIC_DRAW);
        this.webgl_normal_buffer.itemSize = 3;
        this.webgl_normal_buffer.numItems = this.normal_buffer.length / 3;

        this.webgl_texture_coord_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texture_coord_buffer), gl.STATIC_DRAW);
        this.webgl_texture_coord_buffer.itemSize = 2;
        this.webgl_texture_coord_buffer.numItems = this.texture_coord_buffer.length / 2;

        this.webgl_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position_buffer), gl.STATIC_DRAW);
        this.webgl_position_buffer.itemSize = 3;
        this.webgl_position_buffer.numItems = this.position_buffer.length / 3;

        this.webgl_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index_buffer), gl.STATIC_DRAW);
        this.webgl_index_buffer.itemSize = 1;
        this.webgl_index_buffer.numItems = this.index_buffer.length;
    }

    this.draw = function(){

        // Se configuran los buffers que alimentaron el pipeline
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
        gl.vertexAttribPointer(terrain_shaderProgram.attribs.vertexPos, this.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
        gl.vertexAttribPointer(terrain_shaderProgram.attribs.texCoord, this.webgl_texture_coord_buffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(terrain_shaderProgram.unifs.sampler, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);

        if (modo!="wireframe"){
            gl.drawElements(gl.TRIANGLES, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
        
        if (modo!="smooth") {
            gl.drawElements(gl.LINE_STRIP, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
        
        
        /////////////////////////////////
    }
    
}

function onTextureLoaded() {

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, mountains.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mountains.texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}