class Terreno {
    static CANTIDAD_PARCELAS = 9;
    static ESCALA = null;
    static ALTURA_TERRENO = -70;

    constructor(long_lado_total) {
        this.textura = new Textura("img/heightmap-aconcagua.png");

        this.long_lado_total = long_lado_total;
        Terreno.ESCALA = long_lado_total / 20;

        this.parcelas = this._crearParcelas(long_lado_total);

        var parcelaCentro = Math.floor(Terreno.CANTIDAD_PARCELAS * Terreno.CANTIDAD_PARCELAS / 2);

        var base = ComponenteFactory.crearBaseDespegue(long_lado_total/2, 62.22, long_lado_total/2);
        this.parcelas[parcelaCentro].agregarObjeto(base);

        this._crearMatrizModeladoEn(0, Terreno.ALTURA_TERRENO, 0);
    }

    _crearParcelas(long_lado_total) {
        var parcelas = [];
        var long_parcela = long_lado_total / Terreno.CANTIDAD_PARCELAS;

        for (let i = 0; i < Terreno.CANTIDAD_PARCELAS; i++) {
            for (let j = 0; j < Terreno.CANTIDAD_PARCELAS; j++) {
                parcelas.push(new Parcela(i, j, long_parcela, Terreno.CANTIDAD_PARCELAS));
            }
        }

        return parcelas;
    }

    dibujar(posHeli) {
        this._reposicionarMatrizModelado(posHeli);

        for (const parcela of this.parcelas) {
            parcela.dibujarSiEnRango(posHeli, this.textura, this.matrizModelado);
        }
    }

    _reposicionarMatrizModelado(posHeli) {
        var deltaX = Math.floor(posHeli.x / this.long_lado_total) * this.long_lado_total;
        var deltaZ = Math.floor(posHeli.z / this.long_lado_total) * this.long_lado_total;

        this._crearMatrizModeladoEn(deltaX, Terreno.ALTURA_TERRENO, deltaZ);
    }


    _crearMatrizModeladoEn(x, y, z) {
        this.matrizModelado = mat4.create();

        mat4.translate(this.matrizModelado, this.matrizModelado, vec3.fromValues(x, y, z));
        mat4.scale(this.matrizModelado, this.matrizModelado, vec3.fromValues(1, Terreno.ESCALA, 1));
    }
}


class Parcela {

    static CANT_BANDAS = 64;
    static TERRAIN_SHADER = null;

    constructor(numeroX, numeroZ, long_parcela, cant_parcelas) {
        this.posX = numeroX;
        this.posZ = numeroZ;

        this.cant_parcelas = cant_parcelas;
        this.long_parcela = long_parcela;

        this.webgl_texture_coord_buffer = null;
        this.webgl_position_buffer = null;
        this.webgl_texture_coord_buffer = null;

        this.objetos3Dextra = [];

        this.crearBuffers();
    }

    crearBuffers() {

        var position_buffer = [];
        var texture_coord_buffer = [];

        for (var latNumber = 0; latNumber <= Parcela.CANT_BANDAS; latNumber += 1) {
            for (var longNumber = 0; longNumber <= Parcela.CANT_BANDAS; longNumber += 1) {

                var x = (this.posX + (latNumber / Parcela.CANT_BANDAS)) * this.long_parcela;
                var z = (this.posZ + (longNumber / Parcela.CANT_BANDAS)) * this.long_parcela;
                var y = 0;

                var u = ((latNumber / Parcela.CANT_BANDAS) + this.posX) / this.cant_parcelas;
                var v = ((longNumber / Parcela.CANT_BANDAS) + this.posZ) / this.cant_parcelas;

                texture_coord_buffer.push(u);
                texture_coord_buffer.push(v);

                position_buffer.push(x);
                position_buffer.push(y);
                position_buffer.push(z);
            }
        }

        // Buffer de indices de los triangulos
        var index_buffer = [];

        for (var latNumber = 0; latNumber < Parcela.CANT_BANDAS; latNumber += 1) {
            for (var longNumber = 0; longNumber < Parcela.CANT_BANDAS; longNumber += 1) {

                var first = (latNumber * (Parcela.CANT_BANDAS + 1)) + longNumber;
                var second = first + Parcela.CANT_BANDAS + 1;

                index_buffer.push(first);
                index_buffer.push(second);
                index_buffer.push(first + 1);

                index_buffer.push(second);
                index_buffer.push(second + 1);
                index_buffer.push(first + 1);

            }
        }


        this.webgl_texture_coord_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texture_coord_buffer), gl.STATIC_DRAW);
        this.webgl_texture_coord_buffer.itemSize = 2;
        this.webgl_texture_coord_buffer.numItems = texture_coord_buffer.length / 2;

        this.webgl_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position_buffer), gl.STATIC_DRAW);
        this.webgl_position_buffer.itemSize = 3;
        this.webgl_position_buffer.numItems = position_buffer.length / 3;

        this.webgl_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index_buffer), gl.STATIC_DRAW);
        this.webgl_index_buffer.itemSize = 1;
        this.webgl_index_buffer.numItems = index_buffer.length;
    };


    dibujarSiEnRango(posHeli, texturaTerreno, matrizModelado) {
        if (this.estaEnRango(posHeli)) {
            this.dibujar(texturaTerreno, matrizModelado);
        }
    }

    estaEnRango(posHeli) {
        var x = posHeli.x % (this.long_parcela * this.cant_parcelas);
        var z = posHeli.z % (this.long_parcela * this.cant_parcelas);

        x = x < 0 ? (this.long_parcela * this.cant_parcelas + x) : x;
        z = z < 0 ? (this.long_parcela * this.cant_parcelas + z) : z;


        var xInicio = (this.posX - 1) * this.long_parcela;
        var xFinal = (this.posX + 2) * this.long_parcela;

        var zInicio = (this.posZ - 1) * this.long_parcela;
        var zFinal = (this.posZ + 2) * this.long_parcela;

        return (x >= xInicio && x < xFinal) && (z >= zInicio && z < zFinal);
    }

    async dibujar(textura, matrizModelado) {

        Planeta.MAIN_SHADER.setearParametros();
        var identidad = mat4.create();
        mat4.scale(identidad, matrizModelado, [1, 1 / Terreno.ESCALA, 1]);
        mat4.translate(identidad, identidad, [0, -Terreno.ALTURA_TERRENO, 0]);
        for (const objeto of this.objetos3Dextra) {
            objeto.dibujar(identidad);
        }

        Planeta.TERRAIN_SHADER.setearParametros();

        // Se configuran los buffers que alimentaron el pipeline
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
        gl.vertexAttribPointer(Parcela.TERRAIN_SHADER.attribs.vertexPos, this.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
        gl.vertexAttribPointer(Parcela.TERRAIN_SHADER.attribs.texCoord, this.webgl_texture_coord_buffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textura.gl_tex);
        gl.uniform1i(Parcela.TERRAIN_SHADER.unifs.sampler, 0);

        gl.uniformMatrix4fv(Parcela.TERRAIN_SHADER.unifs.modelMatrix, false, matrizModelado);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);

        gl.drawElements(gl.TRIANGLES, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
    };

    agregarObjeto(obj) {
        this.objetos3Dextra.push(obj);
    }

}
