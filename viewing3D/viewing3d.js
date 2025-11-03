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

// Camera and reference point initial positions
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

function setSphereVertices(radius, latitudeBands, longitudeBands) {
    const vertexPositionData = [];

    for (let latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        const theta = latNumber * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            const phi = longNumber * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }

    const sphereVertices = [];
    for (let latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (let longNumber = 0; longNumber < longitudeBands; longNumber++) {
            const first = (latNumber * (longitudeBands + 1)) + longNumber;
            const second = first + longitudeBands + 1;

            const v1_idx = first * 3;
            const v2_idx = (first + 1) * 3;
            const v3_idx = second * 3;
            const v4_idx = (second + 1) * 3;

            const v1 = [vertexPositionData[v1_idx], vertexPositionData[v1_idx+1], vertexPositionData[v1_idx+2]];
            const v2 = [vertexPositionData[v2_idx], vertexPositionData[v2_idx+1], vertexPositionData[v2_idx+2]];
            const v3 = [vertexPositionData[v3_idx], vertexPositionData[v3_idx+1], vertexPositionData[v3_idx+2]];
            const v4 = [vertexPositionData[v4_idx], vertexPositionData[v4_idx+1], vertexPositionData[v4_idx+2]];

            // Triangle 1
            sphereVertices.push(...v1);
            sphereVertices.push(...v3);
            sphereVertices.push(...v2);

            // Triangle 2
            sphereVertices.push(...v3);
            sphereVertices.push(...v4);
            sphereVertices.push(...v2);
        }
    }
    return new Float32Array(sphereVertices);
}

function setSphereColors(latitudeBands, longitudeBands) {
  let colors = [];
  for (let i = 0; i < latitudeBands * longitudeBands; i++) {
    let color = [Math.random(), Math.random(), Math.random()];
    for (let j = 0; j < 6; j++) { // 6 vertices per quad
      colors.push(...color);
    }
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
  let sphereVertices = [];

  const ColorBuffer = gl.createBuffer();
  let sphereColors = [];

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

  // Pega a proporção real do canvas (ex: 1000 / 500 = 2.0)
  let aspect = gl.canvas.width / gl.canvas.height;
  let yw_min = -0.5;
  let yw_max = 0.5;

  // Ajusta a LARGURA do volume para bater com a proporção
  let xw_min = yw_min * aspect; // (ex: -1.0 * 2.0 = -2.0)
  let xw_max = yw_max * aspect; // (ex:  1.0 * 2.0 =  2.0)

  let z_near = -1.0;
  let z_far = -8.0;

  // Agora a projeção (2:1) bate com o canvas (2:1)
  let projectionMatrix = m4.setOrthographicProjectionMatrix(xw_min, xw_max, yw_min, yw_max, z_near, z_far);

  let theta = 0.0;
  let tx = 0.0;
  let ty = 0.0;
  let tz = 0.0;
  let tx_offset = 0.05;

  const latitudeBands = 30;
  const longitudeBands = 30;
  sphereColors = setSphereColors(latitudeBands, longitudeBands);
  sphereVertices = setSphereVertices(0.5, latitudeBands, longitudeBands);

  function drawSphere() {
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, VertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphereVertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphereColors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

    modelViewMatrix = m4.identity();
    modelViewMatrix = m4.yRotate(modelViewMatrix, degToRad(theta));
    modelViewMatrix = m4.translate(modelViewMatrix, tx, ty, tz);

    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(viewingMatrixUniformLocation, false, viewingMatrix);
    gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, latitudeBands * longitudeBands * 6);
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

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    P0 = [0.0, 1.0, 4.0];
    Pref = [Math.sin(cameraAngle) * 0.5, Math.cos(cameraAngle) * 0.5, 0.0];
    V = [0.0, 1.0, 0.0]; // Vetor 'up' continua sendo o Y
    viewingMatrix = m4.setViewingMatrix(P0, Pref, V);

    drawSphere();
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

window.addEventListener('load', main);