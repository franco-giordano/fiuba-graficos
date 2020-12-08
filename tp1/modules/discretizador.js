function discretizadorDeCurvas(curva, cantPasos) {
	var curvaDiscreta = [];
	for (var i = 0; i <= cantPasos; i += 1) {
		curvaDiscreta.push(new Vector(curva.posicionEn(i / cantPasos)));
	}
	return curvaDiscreta;
}

function discretizarMatrizNormales(curva, cantPasos, escalado = null) {
	var arrayMatrices = [];
	for (var i = 0; i <= cantPasos; i += 1) {
		arrayMatrices.push(curva.matrizNormal(i / cantPasos, escalado));
	}
	return arrayMatrices;
}


class SuperficieDiscretizada {
	constructor(controlForma, controlRecorrido, cantNiveles, cantVertices, escalado = null) {

		var forma = new CurvaBezier(controlForma);

		this.formaDiscreta = discretizadorDeCurvas(forma, cantVertices);

		var recorrido = new CurvaBezier(controlRecorrido);

		this.recorridoDiscreto = discretizadorDeCurvas(recorrido, cantNiveles);

		for (let w = 0; w < this.recorridoDiscreto.length; w++) {
			this.recorridoDiscreto[w] = Vector.extender3Da4H(this.recorridoDiscreto[w]);
		};

		this.matricesDiscretas = discretizarMatrizNormales(recorrido, cantNiveles, escalado);

	}

	get forma() {
		return this.formaDiscreta;
	}

	get recorrido() {
		return [this.recorridoDiscreto, this.matricesDiscretas];
	}
}