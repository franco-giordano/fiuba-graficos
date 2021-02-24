class Planeta {
    static MAIN_SHADER = null;
    static TERRAIN_SHADER = null;

    constructor() {
        const LONG_TERRENO = 1500;

        this.heli = new Helicoptero(LONG_TERRENO);

        this.terreno = new Terreno(LONG_TERRENO);

        this.numCamaraActual = 1;
        this.camara = Camara.crearConNumero(this.numCamaraActual);

    }

    _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    dibujar(matrizModelado) {
        this.heli.dibujar(matrizModelado);
        this.terreno.dibujar(this.heli.posicion);
    }

    generarVista() {

        return this.camara.generarVista(this.heli.posicion);

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