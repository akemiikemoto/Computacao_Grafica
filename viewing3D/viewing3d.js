// Vertex shader source code
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_viewingMatrix;
    uniform mat4 u_projectionMatrix;

    void main() {
        gl_Position = u_projectionMatrix * u_viewingMatrix * u_modelViewMatrix * vec4(a_position,1.0);
        v_color = a_color;
    }
`;

// Fragment shader source code
const fragmentShaderSource = `
    precision mediump float;
    varying vec3 v_color;
    void main() {
        gl_FragColor = vec4(v_color,1.0);
    }
`;

let cameraX = 2.0, cameraY = 2.0, cameraZ = 2.0;
let prefX = 0.0, prefY = 0.0, prefZ = 0.0;

function createShader(gl, type, source) {
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

function createProgram(gl, vertexShader, fragmentShader) {
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

function setCubeVertices(side) {
  let v = side / 2;
  return new Float32Array([
    // Front
    v, v, v,
    v, -v, v,
    -v, v, v,
    -v, v, v,
    v, -v, v,
    -v, -v, v,

    // Left
    -v, v, v,
    -v, -v, v,
    -v, v, -v,
    -v, v, -v,
    -v, -v, v,
    -v, -v, -v,

    // Back
    -v, v, -v,
    -v, -v, -v,
    v, v, -v,
    v, v, -v,
    -v, -v, -v,
    v, -v, -v,

    // Right
    v, v, -v,
    v, -v, -v,
    v, v, v,
    v, v, v,
    v, -v, v,
    v, -v, -v,

    // Top
    v, v, v,
    v, v, -v,
    -v, v, v,
    -v, v, v,
    v, v, -v,
    -v, v, -v,

    // Bottom
    v, -v, v,
    v, -v, -v,
    -v, -v, v,
    -v, -v, v,
    v, -v, -v,
    -v, -v, -v,
  ]);
}

function setCubeColors() {
  let colors = [];
  let color = [];
  for (let i = 0; i < 6; i++) {
    color = [Math.random(), Math.random(), Math.random()];
    for (let j = 0; j < 6; j++)
      colors.push(...color);
  }

  return new Float32Array(colors);
}

function defineCoordinateAxes() {
  return new Float32Array([
    // X axis
    -1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    // Y axis
    0.0, -1.0, 0.0,
    0.0, 1.0, 0.0,
    // Z axis
    0.0, 0.0, -1.0,
    0.0, 0.0, 1.0,
  ]);
}

function defineCoordinateAxesColors() {
  return new Float32Array([
    // X axis
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    // Y axis
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    // Z axis
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
  ]);
}

function main() {
  const canvas = document.getElementById('glCanvas');
  const gl = canvas.getContext('webgl');

  if (!gl) {
    console.error('WebGL not supported');
    return;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  const program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getAttribLocation(program, 'a_color');

  const VertexBuffer = gl.createBuffer();
  let cubeVertices = [];

  const ColorBuffer = gl.createBuffer();
  let cubeColors = [];

  const modelViewMatrixUniformLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
  const viewingMatrixUniformLocation = gl.getUniformLocation(program, 'u_viewingMatrix');
  const projectionMatrixUniformLocation = gl.getUniformLocation(program, 'u_projectionMatrix');

  let coordinateAxes = defineCoordinateAxes();
  let coordinateAxesColors = defineCoordinateAxesColors();

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let modelViewMatrix = m4.identity();

  let P0 = [2.0, 2.0, 2.0];
  let Pref = [0.0, 0.0, 0.0];
  let V = [0.0, 1.0, 0.0];
  let viewingMatrix = m4.setViewingMatrix(P0, Pref, V);

  let xw_min = -1.0;
  let xw_max = 1.0;
  let yw_min = -1.0;
  let yw_max = 1.0;
  let z_near = -1.0;
  let z_far = -8.0;
  let projectionMatrix = m4.setOrthographicProjectionMatrix(xw_min, xw_max, yw_min, yw_max, z_near, z_far);

  let theta = 0.0;
  let tx = 0.0;
  let ty = 0.0;
  let tz = 0.0;
  let tx_offset = 0.05;

  cubeColors = setCubeColors();
  cubeVertices = setCubeVertices(0.5);

  function drawCube() {
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    modelViewMatrix = m4.identity();
    modelViewMatrix = m4.yRotate(modelViewMatrix, degToRad(theta));
    modelViewMatrix = m4.translate(modelViewMatrix, tx, ty, tz);

    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(viewingMatrixUniformLocation, false, viewingMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
  }

  function drawCoordinateAxes() {
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coordinateAxes, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coordinateAxesColors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    modelViewMatrix = m4.identity();

    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(viewingMatrixUniformLocation, false, viewingMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

    gl.drawArrays(gl.LINES, 0, 6);
  }

  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Importante limpar o buffer de profundidade também

    theta += 1;

    let cameraAngle = degToRad(theta); // Converte o ângulo para radianos

    // --- 1. Viewport da Esquerda (Efeito Slide 20: "Girar a Cabeça") ---
    // Posição da câmera (P0) fixa, Ponto de Referência (Pref) animado.
    gl.viewport(0, 0, gl.canvas.width / 2, gl.canvas.height);

    // P0 fica fixo, um pouco para trás e para cima
    P0 = [0.0, 1.0, 4.0];
    // Pref vai "olhar" de um lado para o outro no eixo X
    Pref = [Math.sin(cameraAngle) * 2.0, 0.0, 0.0];
    V = [0.0, 1.0, 0.0]; // Vetor 'up' continua sendo o Y
    viewingMatrix = m4.setViewingMatrix(P0, Pref, V);

    drawCube(); // Desenha o cubo (que continua girando em torno de si)
    drawCoordinateAxes(); // Desenha os eixos (que ficam parados)

    // --- 2. Viewport da Direita (Efeito Slide 21: "Orbitar") ---
    // Posição da câmera (P0) animada, Ponto de Referência (Pref) fixo.
    gl.viewport(gl.canvas.width / 2, 0, gl.canvas.width / 2, gl.canvas.height);

    let orbitRadius = 4.0;
    // P0 agora orbita em círculo no plano XZ, a uma altura fixa de 2.0
    P0 = [cameraX, cameraY, cameraZ];
    Pref = [prefX, prefY, prefZ];
    viewingMatrix = m4.setViewingMatrix(P0, Pref, V);

    drawCube();
    drawCoordinateAxes();

    requestAnimationFrame(drawScene);
  }

  drawScene();
}

function unitVector(v) {
  let vModulus = vectorModulus(v);
  return v.map(function (x) { return x / vModulus; });
}

function vectorModulus(v) {
  return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2));
}

function radToDeg(r) {
  return r * 180 / Math.PI;
}

function degToRad(d) {
  return d * Math.PI / 180;
}

// --- SUGESTÃO DE MELHORIA ---
// Vamos completar os controles do teclado
window.addEventListener('keydown', function (event) {
  const step = 0.1; // Define a "velocidade" do movimento da câmera

  switch (event.key) {
    case 'ArrowLeft':
      cameraX -= step; // Move câmera para a esquerda
      break;
    case 'ArrowRight':
      cameraX += step; // Move câmera para a direita
      break;
    case 'ArrowUp':
      cameraY += step; // Move câmera para cima
      break;
    case 'ArrowDown':
      cameraY -= step; // Move câmera para baixo
      break;
    case 'w': // Use 'w' para mover "para frente"
      cameraZ -= step;
      break;
    case 's': // Use 's' para mover "para trás"
      cameraZ += step;
      break;
  }
  // Como o 'requestAnimationFrame' está rodando,
  // não precisamos chamar o drawScene() aqui.
});

window.addEventListener('load', main);