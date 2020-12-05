class Terreno {
    static CANTIDAD_PARCELAS = 10;
    static ESCALA = 1;

    constructor() {
        this.textura = new Textura("img/heightmap.png");

        const LONG_LADO_TOTAL = 1500;
        Terreno.ESCALA = LONG_LADO_TOTAL / 30;

        this.parcelas = this._crearParcelas(LONG_LADO_TOTAL);
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
        for (const parcela of this.parcelas) {
            parcela.dibujarSiEnRango(posHeli, this.textura.texture);
        }
    }
}


class Parcela {

    static CANT_BANDAS = 128;
    static TERRAIN_SHADER = null;

    constructor(numeroX, numeroZ, long_parcela, cant_parcelas) {
        this.posX = numeroX;
        this.posZ = numeroZ;

        this.cant_parcelas = cant_parcelas;
        this.long_parcela = long_parcela;

        this.webgl_texture_coord_buffer = null;
        this.webgl_position_buffer = null;
        this.webgl_texture_coord_buffer = null;

        this.modelMatrix = mat4.create();
        mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(0, 0, 0));
        mat4.scale(this.modelMatrix, this.modelMatrix, vec3.fromValues(1, Terreno.ESCALA, 1));

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


    dibujarSiEnRango(posHeli, texturaTerreno) {
        if (this.estaEnRango(posHeli)) {
            this.dibujar(texturaTerreno);
        }
    }

    estaEnRango(posHeli) {
        var x = posHeli.x;
        var z = posHeli.z;

        var xInicio = (this.posX - 1) * this.long_parcela;
        var xFinal = (this.posX + 2) * this.long_parcela;

        var zInicio = (this.posZ - 1) * this.long_parcela;
        var zFinal = (this.posZ + 2) * this.long_parcela;

        return (x >= xInicio && x < xFinal) && (z >= zInicio && z < zFinal);
    }

    dibujar(textura) {

        // Se configuran los buffers que alimentaron el pipeline
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
        gl.vertexAttribPointer(Parcela.TERRAIN_SHADER.attribs.vertexPos, this.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
        gl.vertexAttribPointer(Parcela.TERRAIN_SHADER.attribs.texCoord, this.webgl_texture_coord_buffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textura);
        gl.uniform1i(Parcela.TERRAIN_SHADER.unifs.sampler, 0);

        gl.uniformMatrix4fv(Parcela.TERRAIN_SHADER.unifs.modelMatrix, false, this.modelMatrix);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);

        if (modo != "wireframe") {
            gl.drawElements(gl.TRIANGLES, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

        if (modo != "smooth") {
            gl.drawElements(gl.LINE_STRIP, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

    };



}