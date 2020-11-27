class Planeta {
    constructor() {
        this.heli = new Helicoptero();
        this.objetosEscena = [];

        // var controlF = [[-0.5,0,0], [-0.5,1,0], [0.5,1,0], [0.5,0,0]];
        var controlF = [[0,-0.5,0], [-1,1,0], [1,1,0], [0,-0.5,0]];
        
        // var controlR = [[0,0,0], [0,0,3], [3,0,3], [3,0,0]];
        var controlR = [[3,0,0], [3,0,3], [0,0,3], [0,0,0]];
        
        for (let i = 0; i < 30; i++) {
            var curvita = new Objeto3D(crearGeometria(controlF, controlR));
            var posx = this._getRandomIntInclusive(-100, 100);
            var posz = this._getRandomIntInclusive(-100, 100);
            curvita.setPosicion(posx, 0, posz);
            this.objetosEscena.push(curvita);
        }

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

        for (const obj of this.objetosEscena) {
            obj.dibujar(matrizModelado);
        }
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

    infoHeli() {
        return this.heli.infoHeli();
    }

}