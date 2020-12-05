class TexturedSphere {
    constructor(latitude_bands, longitude_bands) {

        this.latitudeBands = latitude_bands;
        this.longitudeBands = longitude_bands ? longitude_bands : latitude_bands;

        this.position_buffer = null;
        this.texture_coord_buffer = null;
        this.index_buffer = null;

        this.webgl_position_buffer = null;
        this.webgl_texture_coord_buffer = null;
        this.webgl_index_buffer = null;

        this.texture = null;

        this.modelMatrix = mat4.create();
        const SCALE = 50;
        mat4.scale(this.modelMatrix, this.modelMatrix, vec3.fromValues(SCALE, SCALE, SCALE));
    }

    initTexture(texture_file) {

        this.texture = gl.createTexture();
        this.texture.image = new Image();

        this.texture.image.onload = () => this.onTextureLoaded(this.texture);
        this.texture.image.src = texture_file;
    };

    initBuffers() {

        this.position_buffer = [];
        this.texture_coord_buffer = [];

        var lado = 30;

        for (var latNumber = 0; latNumber <= this.latitudeBands; latNumber += 1) {
            for (var longNumber = 0; longNumber <= this.longitudeBands; longNumber += 1) {

                var x = (-0.5 + (latNumber / this.latitudeBands)) * lado;
                var z = (-0.5 + (longNumber / this.longitudeBands)) * lado;
                var y = 0;

                var u = (longNumber / this.longitudeBands);
                var v = (latNumber / this.latitudeBands);

                this.texture_coord_buffer.push(u);
                this.texture_coord_buffer.push(v);

                this.position_buffer.push(x);
                this.position_buffer.push(y);
                this.position_buffer.push(z);
            }
        }

        // Buffer de indices de los triangulos
        this.index_buffer = [];

        for (var latNumber = 0; latNumber < this.latitudeBands; latNumber += 1) {
            for (var longNumber = 0; longNumber < this.longitudeBands; longNumber += 1) {

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
    };

    dibujar(program) {

        // Se configuran los buffers que alimentaron el pipeline
        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
        gl.vertexAttribPointer(program.attribs.vertexPos, this.webgl_position_buffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_texture_coord_buffer);
        gl.vertexAttribPointer(program.attribs.texCoord, this.webgl_texture_coord_buffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(program.unifs.sampler, 0);

        gl.uniformMatrix4fv(program.unifs.modelMatrix, false, this.modelMatrix);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);

        if (modo != "wireframe") {
            gl.drawElements(gl.TRIANGLES, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

        if (modo != "smooth") {
            gl.drawElements(gl.LINE_STRIP, this.webgl_index_buffer.numItems, gl.UNSIGNED_SHORT, 0);
        }

    };


    onTextureLoaded(tex) {

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.bindTexture(gl.TEXTURE_2D, null);
    };

}