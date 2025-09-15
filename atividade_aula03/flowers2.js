// (Mantenha os shaders e as funções createShaderFlower, createProgramFlower,
// circleVertices, e circleColor do código anterior)

function desenharForma(gl, program, vertices, colors, primitiveType) {
    // --- Posições ---
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // --- Cores ---
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    const colorLocation = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    // --- Desenhar ---
    // O número de vértices é o total de números no array dividido por 2 (pois cada vértice tem x, y)
    gl.drawArrays(primitiveType, 0, vertices.length / 2);
}

function desenharFlor(gl, program, xc, yc, corCentro, corPetalas, raioCentro, raioPetalas, numPetalas) {
    const numLados = 20; // Qualidade dos círculos
    const distanciaPetalas = raioCentro + raioPetalas * 0.7;

    // 1. Desenha o centro da flor
    let verticesCentro = circleVertices(xc, yc, raioCentro, numLados);
    let coresCentro = circleColor(numLados, corCentro);
    desenharForma(gl, program, verticesCentro, coresCentro, gl.TRIANGLE_FAN);

    // 2. Desenha as pétalas em um loop
    for (let i = 0; i < numPetalas; i++) {
        const angulo = i * 2 * Math.PI / numPetalas;
        
        // Calcula a posição de cada pétala ao redor do centro
        const petalaX = xc + Math.cos(angulo) * distanciaPetalas;
        const petalaY = yc + Math.sin(angulo) * distanciaPetalas;

        let verticesPetala = circleVertices(petalaX, petalaY, raioPetalas, numLados);
        let coresPetala = circleColor(numLados, corPetalas);
        desenharForma(gl, program, verticesPetala, coresPetala, gl.TRIANGLE_FAN);
    }
}

function mainFloresVariadas() {
    const canvas = document.getElementById('glCanvas5'); // Use o ID do canvas glCanvasFlower para glCanvas5
    const gl = canvas.getContext('webgl');
    if (!gl) { return; }

    const vertexShader = createShaderFlower(gl, gl.VERTEX_SHADER, vertexShaderFlower);
    const fragmentShader = createShaderFlower(gl, gl.FRAGMENT_SHADER, fragmentShaderFlower);
    const program = createProgramFlower(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Fundo cor preto
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Flor 1: Margarida Clássica (branca e amarela)
    desenharFlor(gl, program, -0.5, 0.5, [1.0, 1.0, 0.0], [1.0, 1.0, 1.0], 0.1, 0.15, 8);

    // Flor 2: Cravo Vermelho (muitas pétalas)
    desenharFlor(gl, program, 0.5, 0.5, [0.8, 0.0, 0.0], [1.0, 0.0, 0.0], 0.08, 0.12, 12);

    // Flor 3: Flor Fantasia (azul e ciano)
    desenharFlor(gl, program, 0.0, -0.4, [0.0, 1.0, 1.0], [0.2, 0.5, 1.0], 0.1, 0.2, 5);
}

// Chame a nova função principal
window.addEventListener('load', mainFloresVariadas);