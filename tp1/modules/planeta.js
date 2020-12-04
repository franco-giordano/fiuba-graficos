class Planeta {
    static MAIN_SHADER = null;
    static TERRAIN_SHADER = null;

    constructor() {
        this.heli = new Helicoptero();

        this.mountains = new TexturedSphere(128, 128);
        this.mountains.initBuffers();
        this.mountains.initTexture("img/heightmap3.png");

        this.numCamaraActual = 1;
        this.camara = Camara.crearConNumero(this.numCamaraActual);

    }

    _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    dibujar(matrizModelado) {
        Planeta.MAIN_SHADER.setearParametros();
        this.heli.dibujar(matrizModelado);

        Planeta.TERRAIN_SHADER.setearParametros(matrizModelado);
        this.mountains.dibujar(Planeta.TERRAIN_SHADER);
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