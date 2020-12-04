var modo = "smooth"; // wireframe, smooth, edges
var MAIN_SHADER_PROGRAM;
var TERRAIN_SHADER_PROGRAM;
var time = 0;

var gl;
var mat4 = glMatrix.mat4;
var mat3 = glMatrix.mat3;
var vec3 = glMatrix.vec3;


var distanciaCamara = 15;
var alturaCamara = 2;

var matrizProyeccion = mat4.create();
var matrizVista = mat4.create();
var matrizModelado = mat4.create();

var planeta = null;

function onResize() {
    gl.canvas.width = $canvas.width();
    gl.canvas.height = $canvas.height();
    aspect = $canvas.width() / $canvas.height();
}

function drawScene() {

    // Se configura el viewport dentro del "canvas". 
    // En este caso se utiliza toda el área disponible
    gl.viewport(0, 0, $canvas.width(), $canvas.height());

    // Se habilita el color de borrado para la pantalla (Color Buffer) y otros buffers
    gl.clearColor(0.53, 0.81, 0.92, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Se configura la matriz de proyección
    mat4.identity(matrizProyeccion);
    mat4.perspective(matrizProyeccion, 45, aspect, 0.1, 100000.0);

    planeta.dibujar(matrizModelado, MAIN_SHADER_PROGRAM, TERRAIN_SHADER_PROGRAM);

}

function tick() {
    requestAnimFrame(tick);
    time += 1 / 60;

    planeta.actualizar();

    matrizVista = planeta.generarVista(alturaCamara, distanciaCamara);

    drawScene();
}

function initMenu() {
    var gui = new dat.GUI();
    gui.add(window, "distanciaCamara", 1, 20).step(0.01);
    gui.add(window, "alturaCamara", -10, 10).step(0.01);
    // gui.add(window, "velocidadAngular",0, 1).step(0.01);
    gui.add(window, "modo", ["wireframe", "smooth", "edges"]);
}

function webGLStart() {

    var canvas = document.getElementById("myCanvas");
    initGL(canvas);

    MAIN_SHADER_PROGRAM = new MainProgram();
    TERRAIN_SHADER_PROGRAM = new TerrainProgram();

    Objeto3D.MODEL_MATRIX_UNIFORM = MAIN_SHADER_PROGRAM.unifs.modelMatrix;
    Objeto3D.NORMAL_MATRIX_UNIFORM = MAIN_SHADER_PROGRAM.unifs.normalMatrix;
    Objeto3D.COLOR_UNIFORM = MAIN_SHADER_PROGRAM.unifs.color;

    planeta = new Planeta();

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    $(window).on("resize", onResize);
    initMenu();
    tick();
}

function main() {
    loadShaders(webGLStart);
}