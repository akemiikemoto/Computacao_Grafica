// Vertex shader source code
const vertexShaderSource4 = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    uniform mat3 u_matrix; // Matriz para transformação

    void main() {
        gl_Position = vec4((u_matrix * vec3(a_position.xy, 1)).xy, 0.0, 1.0);
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderSource4 = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

function createShader4(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram4(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function setSquareVertices4(x, y, weight, height) {
    return new Float32Array([
        x, y + height,
        x + weight, y + height,
        x + weight, y,
        x, y,
        x + weight, y,
        x, y + height
    ]);
}

function setSquareColors4() {
    let color = [0.4, 0.4, 0.4]; // Cinza
    let colorValues = [];
    for (let i = 0; i < 6; i++)
        colorValues.push(...color);
    return new Float32Array(colorValues);
}

function circleColor(numSides, color) {
    const colors = [];
    colors.push(...color);
    for (let i = 0; i <= numSides; i++) {
        colors.push(...color);
    }
    return new Float32Array(colors);
} 

function circleVertices2(xc, yc, radius, numSides) {
    const vertices = [];
    vertices.push(xc, yc); // O ponto central é o centro do círculo
    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = xc + radius * Math.cos(angle);
        const y = yc + radius * Math.sin(angle);
        vertices.push(x, y);
    }
    return new Float32Array(vertices);
}

function circleColor2(numSides, color) {
    const colors = [];
    for (let i = 0; i < numSides + 2; i++) {
        colors.push(...color);
    }
    return new Float32Array(colors);
}


function main4() {
    const canvas = document.getElementById('glCanvas3');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShader4(gl, gl.VERTEX_SHADER, vertexShaderSource4);
    const fragmentShader = createShader4(gl, gl.FRAGMENT_SHADER, fragmentShaderSource4);
    const program = createProgram4(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    // Localização da nossa nova matriz uniforme
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    const vertexBuffer = gl.createBuffer();
    let vertices = [];
    const colorBuffer = gl.createBuffer();
    let colors = [];

    // --- VARIÁVEIS DE ANIMAÇÃO ---
    let armAngle = 0;
    let legAngle = 0;
    let armDirection = 1;
    let legDirection = 1;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    function drawScene() {
        // --- ATUALIZAR ESTADO DA ANIMAÇÃO ---
        // Atualiza o ângulo dos braços e inverte a direção nos limites
        armAngle += 0.015 * armDirection;
        if (armAngle > 0.3 || armAngle < -0.3) {
            armDirection *= -1;
        }

        // Atualiza o ângulo das pernas e inverte a direção nos limites
        legAngle += 0.01 * legDirection;
        if (legAngle > 0.1 || legAngle < -0.1) {
            legDirection *= -1;
        }


        // --- DESENHAR CENA ---
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Matriz identidade para partes estáticas
        let matrix = m3.identity();
        gl.uniformMatrix3fv(matrixLocation, false, matrix);

        // ---- corpo ----
        // desenhar o quadrado maior
        gl.enableVertexAttribArray(positionLocation);
        vertices = setSquareVertices4(-0.4, -0.5, 0.8, 0.6);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = setSquareColors4();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // desenhar o quadrado menor
        gl.enableVertexAttribArray(positionLocation);
        vertices = setSquareVertices4(-0.25, 0.1, 0.5, 0.4);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = setSquareColors4();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        //cabeça
        const numSidesRoda = 20;
        const raioRoda = 0.15;
        const corRoda = [0.8, 0.8, 0.0];

        const rodaEsqVertices = circleVertices2(0.0, 0.3, raioRoda, numSidesRoda); // Ajustei a posição para ficar mais como uma cabeça
        const rodaEsqColors = circleColor2(numSidesRoda, corRoda);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, rodaEsqVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, rodaEsqColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSidesRoda + 2);

        // ----  braços ----
        let numSides = 6;
        let radius = 0.15;


        // --- BRAÇO DIREITO (ANIMADO) ---
        let armMatrixR = m3.identity();
        armMatrixR = m3.translate(armMatrixR, 0.5, 0.0); // Move para a posição do ombro
        armMatrixR = m3.rotate(armMatrixR, armAngle); // Gira
        armMatrixR = m3.translate(armMatrixR, -0.5, 0.0); // Move de volta para o pivô
        gl.uniformMatrix3fv(matrixLocation, false, armMatrixR);
        // ... (código para desenhar o braço direito)
        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices2(0.5, 0.0, radius, numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor2(numSides, [0.5, 0.5, 0.5]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides + 2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = setSquareVertices4(0.45, -0.53, 0.1, 0.4);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = setSquareColors4();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // --- BRAÇO ESQUERDO (ANIMADO) ---
        let armMatrixL = m3.identity();
        armMatrixL = m3.translate(armMatrixL, -0.5, 0.0);
        armMatrixL = m3.rotate(armMatrixL, armAngle); // Gira na direção oposta
        armMatrixL = m3.translate(armMatrixL, 0.5, 0.0);
        gl.uniformMatrix3fv(matrixLocation, false, armMatrixL);
        // ... (código para desenhar o braço esquerdo)
        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices2(-0.5, 0.0, radius, numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor2(numSides, [0.5, 0.5, 0.5]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides + 2);
        
        gl.enableVertexAttribArray(positionLocation);
        vertices = setSquareVertices4(-0.55, -0.53, 0.1, 0.4);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.enableVertexAttribArray(colorLocation);
        colors = setSquareColors4();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // ----  pernas ----
        let legMatrixR = m3.identity();
        legMatrixR = m3.translate(legMatrixR, 0.1, -0.55); // Move para a posição do quadril
        legMatrixR = m3.rotate(legMatrixR, legAngle); // Gira
        legMatrixR = m3.translate(legMatrixR, -0.1, 0.55); // Move de volta para o pivô
        gl.uniformMatrix3fv(matrixLocation, false, legMatrixR);
    
        //perna direita
        gl.enableVertexAttribArray(positionLocation);
        vertices = setSquareVertices4(0.1, -0.95, 0.2, 0.5);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = setSquareColors4();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.enableVertexAttribArray(positionLocation);
        vertices = setSquareVertices4(-0.3, -0.95, 0.2, 0.5);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = setSquareColors4();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        //perna esquerda
        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices2(-0.2, -1, radius, numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor2(numSides, [0.5, 0.5, 0.5]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides + 2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices2(0.2, -1, radius, numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor2(numSides, [0.5, 0.5, 0.5]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides + 2);

    // Solicita o próximo quadro
        requestAnimationFrame(drawScene);
    }

    // Inicia o loop de animação
    drawScene();

}
window.addEventListener('load', main4);