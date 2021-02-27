function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

class Vector {

    constructor(elementos) {
        this.elementos = elementos.slice();
    }

    static extender3Da4H(vector) {
        assert(vector.elementos.length == 3, "longitud es: " + vector.elementos.length);

        return new Vector(vector.elementos.concat(1));
    }

    static recortar3Da2D(vector) {
        assert(vector.elementos.length == 3);

        return new Vector(vector.elementos.slice(0, -1));
    }

    static normalizar(vector) {
        var x = vector.elementos[0];
        var y = vector.elementos[1];
        var z = vector.elementos[2];
        var norm = Math.sqrt([x, y, z].flatMap(x => Math.pow(x, 2)).reduce((a, b) => a + b, 0));
        norm = norm == 0 ? 1 : norm; // TODO: ???????????????????????????
        return new Vector([x / norm, y / norm, z / norm]);
    }

    static distancia2D(vecA, vecB) {
        assert(vecA.elementos.length == 3);
        assert(vecA.elementos.length == 3);
        assert(vecA.elementos[2] == 0);
        assert(vecB.elementos[2] == 0);
        var x = vecA.elementos[0] - vecB.elementos[0];
        var y = vecA.elementos[1] - vecB.elementos[1];
        
        return Math.sqrt([x, y].flatMap(x => Math.pow(x, 2)).reduce((a, b) => a + b, 0));
    }

    static distancia3D(vecA, vecB) {
        assert(vecA.elementos.length == 4);
        assert(vecA.elementos.length == 4);
        assert(vecA.elementos[3] == 1);
        assert(vecB.elementos[3] == 1);

        var x = vecA.elementos[0] - vecB.elementos[0];
        var y = vecA.elementos[1] - vecB.elementos[1];
        var z = vecA.elementos[2] - vecB.elementos[2];
        
        return Math.sqrt([x, y, z].flatMap(x => Math.pow(x, 2)).reduce((a, b) => a + b, 0));
    }
}