// Vertex shader source code
const vertexShaderPinwheel = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
    uniform mat3 u_matrix;

    void main() {
        gl_Position = vec4((u_matrix * vec3(a_position.xy, 1)).xy, 0.0, 1.0);
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderPinwheel = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

function createShaderPinwheel(gl, type, source) {
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

function createProgramPinwheel(gl, vertexShader, fragmentShader) {
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

function circleVertices1(xc,yc,radius,numSides) {
    const vertices = [];

    // Center point of the pentagon
    vertices.push(0.0, 0.0); // Center at origin

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = radius * Math.cos(angle) + xc;
        const y = radius * Math.sin(angle) + yc;
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

function circleColor(numSides,color) {
  const colors = [];

  colors.push(...color);

  for (let i = 0; i <= numSides; i++) {
    colors.push(...color);
  }

  return new Float32Array(colors);
}

function squareVerticesPinwheel(){
    return new Float32Array([
        -0.2,  0.1, //cima esquerda
         0.2,  0.1, //cima direita
         0.4, -1.0, //baixo direita
        -0.4, -1.0, //baixo esquerda
         0.4, -1.0, //baixo direita
        -0.2,  0.1  //cima esquerda
    ]);
}

function squareColorsPinwheel(){
    let color = [0.0, 0.0, 0.6]; // Blue color
    let colorValues = [];
    for(let i=0;i<6;i++){
        colorValues.push(color[0], color[1], color[2]); // Push individual RGB values
    }
    return new Float32Array(colorValues);
}

function mainPinwheel() {
    const canvas = document.getElementById('glCanvas4');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShaderPinwheel(gl, gl.VERTEX_SHADER, vertexShaderPinwheel);
    const fragmentShader = createShaderPinwheel(gl, gl.FRAGMENT_SHADER, fragmentShaderPinwheel);

    const program = createProgramPinwheel(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    let vertices = [];
    let colors = [];

    const vertexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    gl.clearColor(0.8, 0.9, 1.0, 0.8); //esse é a cor do fundo
    gl.clear(gl.COLOR_BUFFER_BIT);

    let numSides = 4;
    let radius = 0.12;
    // --- VARIÁVEL DE ANIMAÇÃO ---
    let angle = 0;
    
    function drawScene() {
        // --- ATUALIZAR ESTADO ---
        angle += 0.02; // Incrementa o ângulo a cada quadro

        // --- DESENHAR ---
        gl.clearColor(0.8, 0.9, 1.0, 0.8);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Haste (estática)
        let matrix = m3.identity();
        gl.uniformMatrix3fv(matrixLocation, false, matrix);
        // corpo do pinwheel
        gl.enableVertexAttribArray(positionLocation);
        vertices = squareVerticesPinwheel();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = squareColorsPinwheel();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // --- PÁS (ANIMADAS) ---
        let rotationMatrix = m3.rotation(angle);
        gl.uniformMatrix3fv(matrixLocation, false, rotationMatrix);

        // pétalas do pinwheel
        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices1(0.5,0.0,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[0.5,0.5,0.5]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices1(-0.5,0.0,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[0.5,0.5,0.5]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 5, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices1(0.0,0.5,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[0.5,0.5,0.5]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 5, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices1(0.0,-0.5,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[0.5,0.5,0.5]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices1(0.0,0.0,0.1,10);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(10,[1.0,1.0,0.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 10+2);
        requestAnimationFrame(drawScene);
    }

    drawScene();
}

window.addEventListener('load', mainPinwheel);