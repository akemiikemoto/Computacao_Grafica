// Vertex shader
const vertexShaderSource = `
    attribute vec2 a_position;
    uniform float pointSize;

    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = pointSize;
    }
`;

// Fragment shader
const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 v_color;

    void main() {
        gl_FragColor = vec4(v_color, 1.0);
    }
`;

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

function main(){
    const canvas = document.getElementById("myCanvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    // Criar shaders e programa
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Localizações
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const pointSizeUniformLocation = gl.getUniformLocation(program, "pointSize");
    const colorUniformLocation = gl.getUniformLocation(program, "v_color");

    // Buffer de posições
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Tamanho do ponto
    gl.uniform1f(pointSizeUniformLocation, 20.0);

    // Cor inicial (vermelho)
    let colorVector = [0.8, 0.0, 0.0];
    gl.uniform3fv(colorUniformLocation, colorVector);

    // Lista de pontos
    let points = [];

    // Clique do mouse
    canvas.addEventListener("mousedown", (event) => {
        let x = (2 / canvas.width) * event.offsetX - 1;
        let y = (-2 / canvas.height) * event.offsetY + 1;
        points.push(x, y);
        drawPoints();
    });

    // Teclado
    window.addEventListener("keydown", (event) => {
        if(event.key === 'c'){
            colorVector = [Math.random(), Math.random(), Math.random()];
            gl.uniform3fv(colorUniformLocation, colorVector);
            drawPoints();
        }
    });

    function drawPoints(){
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, points.length / 2);
    }

    // Fundo branco
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

main();
