// Vertex shader source code
const vertexShaderFlower = `
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
const fragmentShaderFlower = `
    precision mediump float;
    varying vec4 v_color;
    void main() {
        gl_FragColor = v_color;
    }
`;

function createShaderFlower(gl, type, source) {
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

function createProgramFlower(gl, vertexShader, fragmentShader) {
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

function circleVertices(xc,yc,radius,numSides) {
    const vertices = [];

    // Center point of the pentagon
    vertices.push(0.0+xc, 0.0+yc);

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push(x+xc, y+yc);
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

function mainFlower() {
    const canvas = document.getElementById('glCanvasFlower');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const vertexShader = createShaderFlower(gl, gl.VERTEX_SHADER, vertexShaderFlower);
    const fragmentShader = createShaderFlower(gl, gl.FRAGMENT_SHADER, fragmentShaderFlower);

    const program = createProgramFlower(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const matrixLocation = gl.getUniformLocation(program, "u_matrix")

    let vertices = [];
    let colors = [];

    const vertexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');

    gl.clearColor(0.4, 0.7, 0.2, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let numSides = 20;
    let radius = 0.1;

    // --- VARIÁVEL DE ANIMAÇÃO ---
    let time = 0;

    function drawScene() {
        // --- ATUALIZAR ESTADO ---
        time += 0.05;

        // Calcula um fator de escala que oscila entre 0.9 e 1.1
        let scale = 1.0 + Math.sin(time) * 0.1;

        // --- DESENHAR ---
        gl.clearColor(0.4, 0.7, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let petalMatrix = m3.translation(0.0, 0.0);
        petalMatrix = m3.scale(petalMatrix, scale, scale);
        gl.uniformMatrix3fv(matrixLocation, false, petalMatrix);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(0.15,0.2,0.15,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[0.25,0.5,0.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(0.2,0.0,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[1.0, 1.0, 1.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(-0.2,0.0,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[1.0, 1.0, 1.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(0.0,0.2,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[1.0, 1.0, 1.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(0.0,-0.2,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[1.0, 1.0, 1.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(0.1,-0.1,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[0.80,0.80,0.80]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(-0.1,-0.1,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[0.8,0.80,0.80]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(0.1,0.1,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[0.8,0.80,0.80]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(-0.1,0.1,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[0.8,0.80,0.80]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);

        gl.enableVertexAttribArray(positionLocation);
        vertices = circleVertices(0.0,0.0,radius,numSides);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Centro (estático)
        let matrix = m3.identity();
        gl.uniformMatrix3fv(matrixLocation, false, matrix);

        gl.enableVertexAttribArray(colorLocation);
        colors = circleColor(numSides,[1.0,1.0,0.0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, numSides+2);


        requestAnimationFrame(drawScene);
    }
    drawScene();
}

window.addEventListener('load', mainFlower);