// Bloco 1: Shaders (permanecem os mesmos)
const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    uniform mat3 u_matrix; // Matriz para transformação

    void main() {
        gl_Position = vec4((u_matrix * vec3(a_position.xy, 1)).xy, 0.0, 1.0);
        v_color = a_color;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

// Bloco 2: Funções Auxiliares
function createShaderCar(gl, type, source) { /* ...código inalterado... */ 
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

function createProgramCar(gl, vertexShader, fragmentShader) { /* ...código inalterado... */ 
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

// ---- NOVA FUNÇÃO para criar um trapézio ----
function setTrapezoidVertices(x, y, baseWidth, topWidth, height) {
    // Calcula o recuo (quanto o topo é menor que a base em cada lado)
    const inset = (baseWidth - topWidth) / 2;

    const x1 = x;             // Base esquerda
    const x2 = x + baseWidth; // Base direita
    const x3 = x + inset;     // Topo esquerdo
    const x4 = x2 - inset;    // Topo direito

    const y1 = y;             // Nível da base
    const y2 = y + height;    // Nível do topo

    // Retorna 6 vértices que formam 2 triângulos
    return new Float32Array([
        // Primeiro triângulo
        x1, y1, // inferior esquerdo
        x2, y1, // inferior direito
        x3, y2, // superior esquerdo

        // Segundo triângulo
        x3, y2, // superior esquerdo
        x2, y1, // inferior direito
        x4, y2, // superior direito
    ]);
}


function createSolidColor(numVertices, color) { /* ...código inalterado... */ 
    const colors = [];
    for (let i = 0; i < numVertices; i++) {
        colors.push(...color);
    }
    return new Float32Array(colors);
}

function circleVertices(xc, yc, radius, numSides) { /* ...código inalterado... */ 
    const vertices = [];
    vertices.push(xc, yc);
    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = xc + radius * Math.cos(angle);
        const y = yc + radius * Math.sin(angle);
        vertices.push(x, y);
    }
    return new Float32Array(vertices);
}

function circleColor(numSides, color) { /* ...código inalterado... */ 
    const colors = [];
    for (let i = 0; i < numSides + 2; i++) {
        colors.push(...color);
    }
    return new Float32Array(colors);
}


// Bloco 3: Função Principal
function mainCar() {
    const canvas = document.getElementById('glCanvasCar');
    const gl = canvas.getContext('webgl');
    if (!gl) { return; }

    const vertexShader = createShaderCar(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShaderCar(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgramCar(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    const vertexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);

    
    // --- VARIÁVEIS DE ANIMAÇÃO ---
    let carPositionX = -1.5;
    let wheelRotation = 0;

    function drawScene() {
        // --- ATUALIZAR ESTADO ---
        carPositionX += 0.005;
        if (carPositionX > 1.5) {
            carPositionX = -1.5; // Reinicia a posição
        }
        wheelRotation -= 0.05; // Gira as rodas

        // --- DESENHAR ---
        gl.clearColor(0.8, 0.9, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Cenário (estático)
        let matrix = m3.identity();
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        // ... (código para desenhar o chão e a grama) ...
        const chaoVertices = setTrapezoidVertices(-1.0, -0.45, 2.0, 2.0, 0.3); // baseWidth == topWidth
        const chaoColors = createSolidColor(6, [0.5, 0.5, 0.5]);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, chaoVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, chaoColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        const gramaVertices = setTrapezoidVertices(-1.0, -1.0, 4.0, 4.0, 0.6); // baseWidth == topWidth
        const gramaColors = createSolidColor(6, [0.0, 0.8, 0.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gramaVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gramaColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // --- CARRO (ANIMADO) ---
        // Matriz de translação para todo o carro
        let carMatrix = m3.translation(carPositionX, 0);
        
        // Chassi e cabine (apenas se movem)
        gl.uniformMatrix3fv(matrixLocation, false, carMatrix)
  
        const chassiVertices = setTrapezoidVertices(-0.6, -0.2, 1.2, 1.2, 0.3); // baseWidth == topWidth
        const chassiColors = createSolidColor(6, [1.0, 0.0, 0.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, chassiVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, chassiColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // ---- DESENHAR CABINE (retangulo) ----
        const cabineVertices = setTrapezoidVertices(-0.4, 0.1, 0.7, 0.7, 0.3); 
        const cabineColors = createSolidColor(6, [1.0, 0.0, 0.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, cabineVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, cabineColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // ---- DESENHAR VIDRO (retangulo) ----
        const vidroVertices = setTrapezoidVertices(-0.15, 0.1, 0.4, 0.4, 0.25); 
        const vidroColors = createSolidColor(6, [0.2, 0.5, 1.0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vidroVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vidroColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        // ---- DESENHAR RODAS (Círculos) ----
        const numSidesRoda = 20;
        const raioRoda = 0.15;
        const corRoda = [0.1, 0.1, 0.1];

        const rodaEsqVertices = circleVertices(-0.4, -0.2, raioRoda, numSidesRoda);
        const rodaEsqColors = circleColor(numSidesRoda, corRoda);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, rodaEsqVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, rodaEsqColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSidesRoda + 2);

        const rodaDirVertices = circleVertices(0.4, -0.2, raioRoda, numSidesRoda);
        const rodaDirColors = circleColor(numSidesRoda, corRoda);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, rodaDirVertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, rodaDirColors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSidesRoda + 2);

        requestAnimationFrame(drawScene);
    }

    drawScene();
}

window.addEventListener('load', mainCar);