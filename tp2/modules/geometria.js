var mat4 = glMatrix.mat4;
var vec4 = glMatrix.vec4;
var vec3 = glMatrix.vec3;


const CANT_NIVELES_GEO = 30;
const CANT_VERTICES_GEO = 30;

function crearGeometria(controlF, controlR, conTapas = false, cantNiveles = CANT_NIVELES_GEO, cantVertices = CANT_VERTICES_GEO, escalado = null) {

    var supp = new SuperficieDiscretizada(controlF, controlR, cantNiveles, cantVertices, escalado);
    var superficie3D = new SuperficieBarrido(supp.forma, supp.recorrido, conTapas);
    return generarSuperficie(superficie3D);

}

function crearGeometriaPlano(ancho, largo, cantNiveles = CANT_NIVELES_GEO, cantVertices = CANT_VERTICES_GEO) {

    var plano = new Plano(Math.round(ancho), Math.round(largo));
    return generarSuperficie(plano);

}


function crearGeometriaCubo(largo, conTapas = false, cantNiveles = CANT_NIVELES_GEO, cantVertices = CANT_VERTICES_GEO) {

    var cubo = new Cubo(Math.round(largo), conTapas);
    return generarSuperficie(cubo);

}

function SuperficieBarrido(forma, recorrido, conTapas) {

    /* 
     * Parametros a recibir de la forma:
     * forma = [Vector(x1,y1,0), Vector(x2,y2,0), ...]
     * recorrido = [[modelado1, modelado2, ...], [matNormal1, ...]]
     */

    this.cantNiveles = recorrido[0].length - 1;
    this.cantVertices = forma.length - 1;

    this.getPosicion = function (u, v) {

        var vectorModelado = vec4.clone(recorrido[0][(v * this.cantNiveles).toFixed()].elementos);
        // console.log(vectorModelado);

        // colapsar ppio y final en el origen si quiero tapas
        if (conTapas && (v == 0 || v == 1)) {
            return vectorModelado;
        }

        var matrizNormal = recorrido[1][(v * this.cantNiveles).toFixed()];
        // console.log(matrizNormal);

        var vec = forma[(u * this.cantVertices).toFixed()];
        // if(v * this.cantNiveles!=(v * this.cantNiveles).toFixed()) {
        //     console.log(u,v);
        // }
        var vertice = vec4.clone(Vector.extender3Da4H(vec).elementos);
        // console.log(vertice);

        var nuevoVertice = vec4.create();
        mat4.multiply(nuevoVertice, matrizNormal, vertice);
        vec4.add(nuevoVertice, nuevoVertice, vectorModelado);

        return nuevoVertice;
    }

    this.getNormal = function (u, v, deltaU, deltaV) {

        var normal = vec3.create();

        var indiceV = (v * this.cantNiveles).toFixed();

        if ((indiceV <= 1 || indiceV >= this.cantNiveles - 1) && conTapas) {
            // si es con tapas y estoy en los primeros o ultimos niveles
            normal = recorrido[1][indiceV].subarray(8, 11).slice(); // agarrar solo la tangente, recordar que la matriz es NBT+(0,0,0,1)
            // una tapa tiene normal como la tngnt, la otra apunta al otro lado
            if (indiceV <= 1) {
                vec3.negate(normal, normal);
            }
        } else {
            var orig = this.getPosicion(u, v);
            deltaU = (u + deltaU >= 1) ? -deltaU : deltaU;
            deltaV = (v + deltaV >= 1) ? -deltaV : deltaV;

            // si es conTapas y estoy en el antepenultimo nivel, no puedo usar un delta que pase a la tapa
            deltaV = (conTapas && indiceV == this.cantNiveles - 2) ? -deltaV : deltaV;

            var delta1 = this.getPosicion(u + deltaU, v + deltaV);
            var delta2 = this.getPosicion(u, v + deltaV);

            var sup1 = vec3.create();
            var sup2 = vec3.create();
            vec3.sub(sup1, delta1, orig);
            vec3.sub(sup2, delta2, orig);

            // if (vec3.equals(delta2,orig) || vec3.equals(delta1,orig)) {
            //     console.log(deltaU, deltaV, sup1, sup2);
            //     console.log(delta1, delta2, orig);
            // }
            vec3.cross(normal, sup2, sup1);

            // cambia el sentido si movi algun delta en negativo
            if ((deltaU < 0 && deltaV > 0) || (deltaU > 0 && deltaV < 0)) {
                vec3.scale(normal, normal, -1);
            }
        }

        vec3.normalize(normal, normal);
        return normal;
    }

    this.getCoordenadasTextura = function (u, v) {

        var indiceV = (v * this.cantNiveles).toFixed();

        if ((indiceV <= 1 || indiceV >= this.cantNiveles - 1) && conTapas) {

            var verticeFigura = forma[(u * this.cantVertices).toFixed()];
            var propU = (verticeFigura.elementos[0] - this.mapaTapasForma.xMin) / (this.mapaTapasForma.xMax - this.mapaTapasForma.xMin);
            var propV = (verticeFigura.elementos[1] - this.mapaTapasForma.yMin) / (this.mapaTapasForma.yMax - this.mapaTapasForma.yMin);

            // // si es con tapas y estoy en los primeros o ultimos niveles
            if (v == 0 || v == 1) {
                return [.5, .5];
            }

            return [propU, propV];
            // return [u, 0];
        }

        var totalU = this.mapaLongitudesU.total;
        var proporcionU = this.mapaLongitudesU[(u * this.cantVertices).toFixed()] / totalU;

        var totalV = this.mapaLongitudesV.total;
        var proporcionV = this.mapaLongitudesV[indiceV] / totalV;

        return [proporcionU, proporcionV];
    }

    this._obtenerMapaLongitudes = function (arrayVectores, vecs3D = false) {
        var mapa = {};
        var distAccum = 0;

        for (let i = 0; i < arrayVectores.length; i++) {
            var idxAnterior = i == 0 ? 0 : (i - 1) % arrayVectores.length;
            distAccum += vecs3D ? Vector.distancia3D(arrayVectores[i], arrayVectores[idxAnterior]) : Vector.distancia2D(arrayVectores[i], arrayVectores[idxAnterior]);

            mapa[i] = distAccum;
        }

        mapa["total"] = distAccum;

        return mapa;
    }

    this._obtenerMapaTapas = function (forma) {
        var mapa = {};
        mapa.xMin = 0;
        mapa.xMax = 0;
        mapa.yMin = 0;
        mapa.yMax = 0;

        for (const f of forma) {
            mapa.xMin = Math.min(mapa.xMin, f.elementos[0]);
            mapa.xMax = Math.max(mapa.xMax, f.elementos[0]);
            mapa.yMin = Math.min(mapa.yMin, f.elementos[1]);
            mapa.yMax = Math.max(mapa.yMax, f.elementos[1]);
        }

        return mapa;
    }

    this._extenderSuperficieSiConTapas = function (recorrido) {

        if (!conTapas) {
            return;
        }

        // duplicar extremos del recorrido, en posicion y matrix NBT

        recorrido[0].splice(0, 0, recorrido[0][0]);
        recorrido[0].splice(0, 0, recorrido[0][0]);
        recorrido[0].splice(recorrido[0].length - 1, 0, recorrido[0][recorrido[0].length - 1]);
        recorrido[0].splice(recorrido[0].length - 1, 0, recorrido[0][recorrido[0].length - 1]);

        recorrido[1].splice(0, 0, recorrido[1][0]);
        recorrido[1].splice(0, 0, recorrido[1][0]);
        recorrido[1].splice(recorrido[1].length - 1, 0, recorrido[1][recorrido[1].length - 1]);
        recorrido[1].splice(recorrido[1].length - 1, 0, recorrido[1][recorrido[1].length - 1]);

        // // centrar cierre en promedio de forma, no en eje de recorrido

        // recorrido[0][0] = ;

        this.cantNiveles = recorrido[0].length - 1;
        this.cantVertices = forma.length - 1;
    }

    this._extenderSuperficieSiConTapas(recorrido);
    this.mapaLongitudesU = this._obtenerMapaLongitudes(forma);
    this.mapaLongitudesV = this._obtenerMapaLongitudes(recorrido[0], true);

    this.mapaTapasForma = this._obtenerMapaTapas(forma);

}


function Cubo(largoLado, conTapas) {

    this.cantNiveles = 40;
    this.cantVertices = 40;

    this.CARAS = {
        FRENTE: 0,
        DERECHA: 1,
        DETRAS: 2,
        IZQUIERDA: 3,
    }

    this.getPosicion = function (u, v) {

        if (conTapas && v == 0) {
            return [0, -largoLado / 2, 0];
        }

        if (conTapas && v == 1) {
            return [0, largoLado / 2, 0];
        }

        var cara = this._seleccionarCara(u);

        var x = 0;
        var z = 0;
        var y = (v - 0.5) * largoLado;

        u = this._remapearSegunCara(u);

        if (cara == this.CARAS.FRENTE) {
            x = largoLado / 2;
            z = (u - 0.5) * largoLado;
        } else if (cara == this.CARAS.DERECHA) {
            x = (-u + 0.5) * largoLado;
            z = largoLado / 2;
        } else if (cara == this.CARAS.DETRAS) {
            x = -largoLado / 2;
            z = (-u + 0.5) * largoLado;
        } else if (cara == this.CARAS.IZQUIERDA) {
            x = (u - 0.5) * largoLado;
            z = -largoLado / 2;
        }

        return [x, y, z];
    }

    this.getNormal = function (u, v) {

        if (conTapas && v == 0) {
            return [0, -1, 0];
        }

        if (conTapas && v == 1) {
            return [0, 1, 0];
        }

        var cara = this._seleccionarCara(u);

        if (cara == this.CARAS.FRENTE) {
            return [1, 0, 0];
        } else if (cara == this.CARAS.DERECHA) {
            return [0, 0, 1];
        } else if (cara == this.CARAS.DETRAS) {
            return [-1, 0, 0];
        } else if (cara == this.CARAS.IZQUIERDA) {
            return [0, 0, -1];
        }

        return [0, 0, 0];
    }

    this.getCoordenadasTextura = function (u, v) {
        var cara = this._seleccionarCara(u);

        // si no es la cara principal, hardcodear uv
        if (cara == this.CARAS.FRENTE) {
            u = this._remapearSegunCara(u);
            return [u, v];
        } else {
            return [.999,v];
        }

    }

    this._seleccionarCara = function (u) {
        if (u <= 0.25) {
            return this.CARAS.FRENTE;
        } else if (u <= 0.5) {
            return this.CARAS.DERECHA;
        } else if (u <= 0.75) {
            return this.CARAS.DETRAS;
        } else if (u <= 1) {
            return this.CARAS.IZQUIERDA;
        } else {
            return undefined;
        }
    }

    this._remapearSegunCara = function (u) {
        var cara = this._seleccionarCara(u);

        return (u - 0.25 * cara) / 0.25;
    }
}



function Plano(ancho, largo) {

    this.cantNiveles = 1;
    this.cantVertices = largo;

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


function generarSuperficie(superficie) {

    var filas = superficie.cantNiveles;
    var columnas = superficie.cantVertices;

    positionBuffer = [];
    normalBuffer = [];
    uvBuffer = [];

    for (var i = 0; i <= filas; i += 1) {
        for (var j = 0; j <= columnas; j += 1) {

            var u = j / columnas;
            var v = i / filas;

            var pos = superficie.getPosicion(u, v);

            positionBuffer.push(pos[0]);
            positionBuffer.push(pos[1]);
            positionBuffer.push(pos[2]);

            var nrm = superficie.getNormal(u, v, 1 / columnas, 1 / filas);

            normalBuffer.push(nrm[0]);
            normalBuffer.push(nrm[1]);
            normalBuffer.push(nrm[2]);

            var uv = superficie.getCoordenadasTextura(u, v);

            uvBuffer.push(uv[0]);
            uvBuffer.push(uv[1]);
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

    webgl_uvs_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, webgl_uvs_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvBuffer), gl.STATIC_DRAW);
    webgl_uvs_buffer.itemSize = 2;
    webgl_uvs_buffer.numItems = uvBuffer.length / 2;

    webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexBuffer), gl.STATIC_DRAW);
    webgl_index_buffer.itemSize = 1;
    webgl_index_buffer.numItems = indexBuffer.length;

    return {
        webgl_position_buffer,
        webgl_normal_buffer,
        webgl_uvs_buffer,
        webgl_index_buffer
    }
}

async function dibujarMalla(mallaDeTriangulos) {

    // Se configuran los buffers que alimentaron el pipeline
    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_position_buffer);
    gl.vertexAttribPointer(dibujarMalla.MAIN_SHADER.attribs.vertexPos, mallaDeTriangulos.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_uvs_buffer);
    gl.vertexAttribPointer(dibujarMalla.MAIN_SHADER.attribs.texCoord, mallaDeTriangulos.webgl_uvs_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mallaDeTriangulos.webgl_normal_buffer);
    gl.vertexAttribPointer(dibujarMalla.MAIN_SHADER.attribs.normal, mallaDeTriangulos.webgl_normal_buffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mallaDeTriangulos.webgl_index_buffer);

    gl.drawElements(gl.TRIANGLE_STRIP, mallaDeTriangulos.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);

}