class Planeta {
    constructor() {
        this.heli = new Helicoptero();

        this.mountains = new TexturedSphere(128, 128);
        this.mountains.initBuffers();
        this.mountains.initTexture("img/heightmap.png");

        this.numCamaraActual = 1;
        this.camara = Camara.crearConNumero(this.numCamaraActual);

    }

    _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    dibujar(matrizModelado, main_shader, terrain_shader) {
        main_shader.setearParametros();
        this.heli.dibujar(matrizModelado);

        terrain_shader.setearParametros(matrizModelado);
        this.mountains.draw();
    }

    generarVista(alturaCamara, distanciaCamara) {

        return this.camara.generarVista(alturaCamara, distanciaCamara, this.heli.posicion);

    }

    actualizar() {
        var numeroCamara = this.heli.actualizar();

        if (numeroCamara != this.numCamaraActual) {
            this.camara = Camara.crearConNumero(numeroCamara);
            this.numCamaraActual = numeroCamara;
        }

        this.camara.actualizar();
    }
}