function discretizadorDeCurvas(curva, cantPasos) {
	var curvaDiscreta = [];
	for (var i = 0; i <= cantPasos; i += 1) {
		curvaDiscreta.push(new Vector(curva.posicionEn(i/cantPasos)));
	}
	return curvaDiscreta;
}

function discretizarMatrizNormales(curva, cantPasos) {
	var arrayMatrices = [];
	for (var i = 0; i <= cantPasos; i += 1) {
		arrayMatrices.push(curva.matrizNormal(i/cantPasos));
	}
	return arrayMatrices;
}

// function discretizadorNormal(curva, deltaU) {
// 	var normales = [];
// 	for (var i = 0; i <= 1; i += deltaU) {
// 		normales.push(curva.normal(i));
// 	}
// 	return normales;
// }

class SuperficieDiscretizada {
	constructor(controlForma, controlRecorrido) {
				
		var forma = new CurvaBezier(controlForma);

		this.formaDiscreta = discretizadorDeCurvas(forma, CANT_VERTICES);

		var recorrido = new CurvaBezier(controlRecorrido);

		this.recorridoDiscreto = discretizadorDeCurvas(recorrido, CANT_NIVELES);

		for (let w = 0; w < this.recorridoDiscreto.length; w++) {
			this.recorridoDiscreto[w] = Vector.extender3Da4H(this.recorridoDiscreto[w]);
		};

		this.matricesDiscretas = discretizarMatrizNormales(recorrido, CANT_NIVELES);

	}

	get forma() {
		return this.formaDiscreta;
	}

	get recorrido() {
		return [this.recorridoDiscreto, this.matricesDiscretas];
	}
}

class CurvaBezier {

	constructor(puntos) {
		this.puntos = puntos;
		this.n = puntos.length;
		this.CACHE_TNGT = {};
		this.normalAnterior = vec3.fromValues(0,0,0);
	}

	_binomial(m, k) {
	    var coeff = 1;
	    for (var x = m-k+1; x <= m; x++) coeff *= x;
	    for (x = 1; x <= k; x++) coeff /= x;
	    return coeff;
	}

	_baseBern(i, t, m)  {
		return this._binomial(m, i) * Math.pow(1 - t, m - i) * Math.pow(t, i);
	}

    _prodVectorial(vecA, vecB) {
        var x = vecA[1] * vecB[2] - vecA[2] * vecB[1];
        var y = vecA[2] * vecB[0] - vecA[0] * vecB[2];
        var z = vecA[0] * vecB[1] - vecA[1] * vecB[0];
        return [x,y,z];
	}
	
	_prodVectorialNormal(vecA, vecB) {
		var vecC = this._prodVectorial(vecA, vecB);
		var norm = this._norma(vecC);
		norm = norm == 0 ? 1 : norm;		// TODO: ???????????????????????????
		return vecC.flatMap(x=>x/norm);
	}

	_norma(vecA) {
		var x = vecA[0];
        var y = vecA[1];
        var z = vecA[2];
		var norm = Math.sqrt([x,y,z].flatMap(x=>Math.pow(x,2)).reduce((a,b) => a+b, 0));

		return norm;
	}

	_obtenerPerpendicular(vector) {
		var punto = [1,0,0];
		var resultado = this._prodVectorial(punto, vector);
		if (this._norma(resultado) == 0) {
			return [0,1,0];
		}
		return punto;
	}

	normal(t) {
		var punto1 = this.tangente(t);
		var punto2 = this.tangente(t + 0.01);
		var aux = this._prodVectorial(punto1, punto2);
		
		aux = this._prodVectorialNormal(aux, punto1);

		// si estoy en una recta...
		if (this._norma(aux) == 0) {
			aux = this._obtenerPerpendicular(punto1);
		}

		aux = vec3.fromValues(...aux);

		// fix por si cambia la concavidad
		if (vec3.squaredLength(this.normalAnterior) != 0){
            var a = vec3.angle(this.normalAnterior, aux);
            var err = Math.abs(1*Math.PI - a);
            if (err <= 0.5*Math.PI){
                vec3.scale(aux,aux,-1);
            }
		}

		this.normalAnterior = aux;
		
		return [aux[0], aux[1], aux[2]];
	}

	tangente(t) {
		if (this.CACHE_TNGT[t] != null) {
			return this.CACHE_TNGT[t];
		}

		var sum = new Vector([0, 0, 0]);
		var elem = sum.elementos;
		for (var i = 0; i < this.n - 1; i++) {
			elem[0] += (this.n-1) * this._baseBern(i, t, this.n - 2) * (this.puntos[i+1][0] - this.puntos[i][0]);
			elem[1] += (this.n-1) * this._baseBern(i, t, this.n - 2) * (this.puntos[i+1][1] - this.puntos[i][1]);
			elem[2] += (this.n-1) * this._baseBern(i, t, this.n - 2) * (this.puntos[i+1][2] - this.puntos[i][2]);
		}

		sum = Vector.normalizar(sum);
		this.CACHE_TNGT[t] = sum.elementos;
		return sum.elementos;
	}

	posicionEn(t) {
		var sum = [0, 0, 0];
		for (var i = 0; i < this.n; i++) {
			sum[0] += this._baseBern(i, t, this.n-1) * this.puntos[i][0];
			sum[1] += this._baseBern(i, t, this.n-1) * this.puntos[i][1];
			sum[2] += this._baseBern(i, t, this.n-1) * this.puntos[i][2];
		}
		return sum;
	}

	binormal(t) {
		var normal = this.normal(t);
		var tangente = this.tangente(t);

		return this._prodVectorialNormal(normal, tangente);
	}

	matrizNormal(t) {

		var tgn = this.tangente(t);
		var normal = this.normal(t);
		var binormal = this.binormal(t);

		normal.push(0);
		binormal.push(0);
		tgn.push(0);

		var ultimaCol = [0,0,0,1];

		var matriz4D = mat4.fromValues(...normal, ...binormal, ...tgn, ...ultimaCol);

		return matriz4D;
	}

}
