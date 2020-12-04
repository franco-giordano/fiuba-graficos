var mat4 = glMatrix.mat4;
var vec4 = glMatrix.vec4;
var vec3 = glMatrix.vec3;


const CANT_NIVELES_GEO = 60;
const CANT_VERTICES_GEO = 60;

function crearGeometria(controlF, controlR, conTapas = false, cantNiveles = CANT_NIVELES_GEO, cantVertices = CANT_VERTICES_GEO) {

    var supp = new SuperficieDiscretizada(controlF, controlR, cantNiveles, cantVertices);
    var superficie3D = new SuperficieBarrido(supp.forma, supp.recorrido, conTapas);
    return generarSuperficie(superficie3D, cantNiveles, cantVertices);

}


function SuperficieBarrido(forma, recorrido, conTapas) {

    /* 
     * Parametros a recibir de la forma:
     * forma = [Vector(x1,y1,0), Vector(x2,y2,0), ...]
     * recorrido = [[modelado1, modelado2, ...], [matNormal1, ...]]
     */

    this.cantNiveles = recorrido[0].length - 1;
    this.cantVertices = forma.length - 1;

    // peor precision si tengo pocas dimensiones, sino aproxima mal
    this.deltaNorm = (this.cantNiveles < 40 || this.cantVertices < 40) ? 0.1 : 0.01;

    this.getPosicion = function (u, v) {
        if (u >= 1) {
            u = 1;
        }
        if (v >= 1) {
            v = 1;
        }

        var vectorModelado = vec4.clone(recorrido[0][Math.round(v * this.cantNiveles)].elementos);
        // console.log(vectorModelado);

        // colapsar ppio y final en el origen si quiero tapas
        if (conTapas && (v == 0 || v == 1)) {
            return vectorModelado;
        }

        var matrizNormal = recorrido[1][Math.round(v * this.cantNiveles)];
        // console.log(matrizNormal);

        var vertice = vec4.clone(Vector.extender3Da4H(forma[Math.round(u * this.cantVertices)]).elementos);
        // console.log(vertice);

        var nuevoVertice = vec4.create();
        mat4.multiply(nuevoVertice, matrizNormal, vertice);
        vec4.add(nuevoVertice, nuevoVertice, vectorModelado);

        return nuevoVertice;

        // forma[u]
        // recorrido[v]
    }

    this.getNormal = function (u, v) {
        var orig = this.getPosicion(u, v);
        var deltaU = (u == 1) ? -this.deltaNorm : this.deltaNorm;
        var deltaV = (v == 1) ? -this.deltaNorm : this.deltaNorm;
        var delta1 = this.getPosicion(u + deltaU, v);
        var delta2 = this.getPosicion(u, v + deltaV);

        var sup1 = vec3.create();
        var sup2 = vec3.create();
        vec3.sub(sup1, delta1, orig);
        vec3.sub(sup2, delta2, orig);

        // if (vec3.equals(delta1,orig)) console.log(delta1);
        var normal = vec3.create();
        vec3.cross(normal, sup1, sup2);

        // cambia el sentido si movi algun delta en negativo
        if ((deltaU < 0 && deltaV > 0) || (deltaU > 0 && deltaV < 0)) {
            vec3.scale(normal, normal, -1);
        }


        return normal;
    }

    // this.getCoordenadasTextura=function(u,v){
    //     return [u,v];
    // }
}


function Plano(ancho, largo) {

    this.getPosicion = function (u, v) {

        var x = (u - 0.5) * ancho;
        var z = (v - 0.5) * largo;
        return [x, 0, z];
    }

    this.getNormal = function (u, v) {
        return [0, 1, 0];
    }

    this.getCoordenadasTextura = function (u, v) {
        return [u, v];
    }
}


function Esfera(radio) {

    this.getPosicion = function (u, v) {
        var x = radio * Math.cos(2 * Math.PI * u) * Math.sin(Math.PI * v);
        var z = radio * Math.sin(2 * Math.PI * u) * Math.sin(Math.PI * v);
        var y = radio * Math.cos(Math.PI * v);
        return [x, y, z];
    }

    this.getNormal = function (u, v) {
        var coords = this.getPosicion(u, v);
        var x = coords[0];
        var y = coords[1];
        var z = coords[2];
        var norm = Math.sqrt([x, y, z].flatMap(x => Math.pow(x, 2)).reduce((a, b) => a + b, 0));
        return [x / norm, y / norm, z / norm];
    }

    this.getCoordenadasTextura = function (u, v) {
        return [u, v];
    }
}


function generarSuperficie(superficie, filas, columnas) {

    positionBuffer = [];
    normalBuffer = [];
    // uvBuffer = [];

    for (var i = 0; i <= filas; i += 1) {
        for (var j = 0; j <= columnas; j += 1) {

            var u = j / columnas;
            var v = i / filas;

            var pos = superficie.getPosicion(u, v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm = superficie.getNormal(u, v);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            // var uvs=superficie.getCoordenadasTextura(u,v);

            // uvBuffer.push(uvs[0]);
            // uvBuffer.push(uvs[1]);

        }
    }

    // Buffer de indices de los triángulos

    var filasReales = filas + 1;
    var columnasReales = columnas + 1;

    indexBuffer = [];

    for (i = 0; i < filas; i += 1) {
        for (j = 0; j < columnas; j += 1) {
            indexBuffer.push(i * columnasReales + j);
            indexBuffer.push((i + 1) * columnasReales + j);
        }

        // agrego los ultimos dos vertices de la ultima columna
        indexBuffer.push(i * columnasReales + j);
        indexBuffer.push((i + 1) * columnasReales + j);

        // agrego el ultimo vertice y el siguiente para generar el triangulo degenerado
        // solo si no llegue al ultimo quad
        if (i != filas - 1) {
            indexBuffer.push((i + 1) * columnasReales + j);
            indexBuffer.push(i * columnasReales + j + 1);
        }
    }

    // Creación e Inicialización de los buffers

    webgl_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionBuffer), gl.STATIC_DRAW);
    webgl_position_buffer.itemSize = 3;
    webgl_position_buffer.numItems = positionBuffer.length / 3;

    webgl_normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalBuffer), gl.STATIC_DRAW);
    webgl_normal_buffer.itemSize = 3;
    webgl_normal_buffer.numItems = normalBuffer.length / 3;

    // webgl_uvs_buffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    // webgl_uvs_buffer.itemSize = 2;
    // webgl_uvs_buffer.numItems = uvBuffer.length / 2;

    webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    webgl_index_buffer.itemSize = 1;
    webgl_index_buffer.numItems = indexBuffer.length;

    return {
        webgl_position_buffer,
        webgl_normal_buffer,
        webgl_index_buffer
    }
}

function dibujarMalla(mallaDeTriangulos) {

    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(shaderProgram.attribs.vertexPos, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    // gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    // gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(shaderProgram.attribs.normal, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);


    if (modo != "wireframe") {
        gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

    if (modo != "smooth") {
        gl.drawElements(gl.LINE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    }

}