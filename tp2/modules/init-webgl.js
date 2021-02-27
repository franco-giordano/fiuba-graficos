const vertexShaderFile = "vertex-shader.glsl";
const fragmentShaderFile = "fragment-shader.glsl";
const terrainVertexShaderFile = "terrain-vertex-shader.glsl";
const terrainFragmentShaderFile = "terrain-fragment-shader.glsl";
const utilsShaderFile = "utils.glsl";



var MAIN_VRTXSHADER_SRC;
var FRAGMENT_SHADER_SRC;
var TERRAIN_VRTXSHADER_SRC;
var TERRAIN_FRAGMENT_SHADER_SRC;
var UTILS_SHADER_SRC;

function initGL(canvas) {

    try {
        gl = canvas.getContext("webgl");
        gl.canvas.width = $canvas.width();
        gl.canvas.height = $canvas.height();
    } catch (e) {
        console.error(e);
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShaderSource(url) {
    var req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    return (req.status == 200) ? req.responseText : null;
}

function loadShaders(onDone) {

    $.when(loadVS(), loadTerrainVS(), loadFS(), loadTerrainFS(), loadUtils()).done(function (...res) {
        //this code is executed when all ajax calls are done     
        onDone();
    });

    function loadVS() {
        return $.ajax({
            url: "shaders/" + vertexShaderFile,
            success: function (result) {
                MAIN_VRTXSHADER_SRC = result;
            }
        });
    }

    function loadTerrainVS() {
        return $.ajax({
            url: "shaders/" + terrainVertexShaderFile,
            success: function (result) {
                TERRAIN_VRTXSHADER_SRC = result;
            }
        });
    }

    function loadFS() {
        return $.ajax({
            url: "shaders/" + fragmentShaderFile,
            success: function (result) {
                FRAGMENT_SHADER_SRC = result;
            }
        });
    }

    function loadTerrainFS() {
        return $.ajax({
            url: "shaders/" + terrainFragmentShaderFile,
            success: function (result) {
                TERRAIN_FRAGMENT_SHADER_SRC = result;
            }
        });
    }

    function loadUtils() {
        return $.ajax({
            url: "shaders/" + utilsShaderFile,
            success: function (result) {
                UTILS_SHADER_SRC = result;
            }
        });
    }
}



function buildShader(gl, code, type) {

    var shader;

    if (type == "fragment") {
        // "vertex"
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        shader = gl.createShader(gl.VERTEX_SHADER);
    }

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}