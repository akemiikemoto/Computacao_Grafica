
const vertexShaderSource = `
    attribute vec2 a_position;
    uniform float pointSize;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = pointSize;
    }
`;

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
        console.error("Erro compilando shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Erro linkando programa:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function pixelToNDC(x, y, canvas) {
    const ndcX = (x / (canvas.width - 1)) * 2 - 1;
    const ndcY = -((y / (canvas.height - 1)) * 2 - 1);
    return [ndcX, ndcY];
}

// Bresenham (reta)
function bresenhamLine(x0, y0, x1, y1) {
    x0 = Math.round(x0); y0 = Math.round(y0);
    x1 = Math.round(x1); y1 = Math.round(y1);

    const pts = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        pts.push([x0, y0]);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 <  dx) { err += dx; y0 += sy; }
    }
    return pts;
}

function main() {
    const canvas = document.getElementById("myCanvas");
    const gl = canvas.getContext("webgl");
    if (!gl) { console.error("WebGL não suportado"); return; }

    
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vs, fs);
    gl.useProgram(program);

    const posLoc   = gl.getAttribLocation(program, "a_position");
    const sizeLoc  = gl.getUniformLocation(program, "pointSize");
    const colorLoc = gl.getUniformLocation(program, "v_color");

    // Buffer p/ posições
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Aparência
    gl.uniform1f(sizeLoc, 2.0); // "espessura" por pontos
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    const palette = [
        [0.0, 0.0, 1.0], // 0 azul
        [1.0, 0.0, 0.0], // 1 vermelho
        [0.0, 1.0, 0.0], // 2 verde
        [1.0, 1.0, 0.0], // 3 amarelo
        [1.0, 0.0, 1.0], // 4 magenta
        [0.0, 1.0, 1.0], // 5 ciano
        [0.5, 0.5, 0.5], // 6 cinza
        [1.0, 0.5, 0.0], // 7 laranja
        [0.5, 0.0, 0.5], // 8 roxo
        [0.0, 0.0, 0.0]  // 9 preto
    ];
    let currentColor = palette[0];
    gl.uniform3fv(colorLoc, currentColor);

    function setColorByIndex(idx) {
        if (idx >= 0 && idx < palette.length) {
            currentColor = palette[idx];
            gl.uniform3fv(colorLoc, currentColor);
        }
    }

    function drawLineBresenham(x0, y0, x1, y1) {
        const ptsPix = bresenhamLine(x0, y0, x1, y1);
        const data = [];
        for (const [px, py] of ptsPix) {
            const [nx, ny] = pixelToNDC(px, py, canvas);
            data.push(nx, ny);
        }
        gl.clear(gl.COLOR_BUFFER_BIT);             
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.uniform3fv(colorLoc, currentColor);
        gl.drawArrays(gl.POINTS, 0, data.length / 2);
    }

    function drawTriangleBresenham(ax, ay, bx, by, cx, cy) {
        // Triângulo = 3 retas
        const seg1 = bresenhamLine(ax, ay, bx, by);
        const seg2 = bresenhamLine(bx, by, cx, cy);
        const seg3 = bresenhamLine(cx, cy, ax, ay);

        const allPts = [...seg1, ...seg2, ...seg3];
        const data = [];
        for (const [px, py] of allPts) {
            const [nx, ny] = pixelToNDC(px, py, canvas);
            data.push(nx, ny);
        }
        gl.clear(gl.COLOR_BUFFER_BIT);                
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.uniform3fv(colorLoc, currentColor);
        gl.drawArrays(gl.POINTS, 0, data.length / 2);
    }

    let mode = "line"; // "line" | "triangle"
    let clickStage = 0;
    let p1 = null, p2 = null, p3 = null;

    // Linha inicial (0,0)-(0,0) azul
    drawLineBresenham(0, 0, 0, 0);

    // Mouse
    canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (mode === "line") {
            if (clickStage === 0) {
                p1 = { x, y };
                clickStage = 1;
            } else {
                p2 = { x, y };
                drawLineBresenham(p1.x, p1.y, p2.x, p2.y);
                clickStage = 0;
            }
        } else { // triangle
            if (clickStage === 0) {
                p1 = { x, y };
                clickStage = 1;
            } else if (clickStage === 1) {
                p2 = { x, y };
                clickStage = 2;
            } else {
                p3 = { x, y };
                drawTriangleBresenham(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                clickStage = 0;
            }
        }
    });

    // Teclado
    window.addEventListener("keydown", (e) => {
        const k = e.key;

        // Modo: Reta (r/R) ou Triângulo (t/T)
        if (k === 'r' || k === 'R') {
            mode = "line";
            clickStage = 0;
            drawLineBresenham(0, 0, 0, 0);
            return;
        }
        if (k === 't' || k === 'T') {
            mode = "triangle";
            clickStage = 0;
            gl.clear(gl.COLOR_BUFFER_BIT); // aguardando 3 cliques
            return;
        }

        // Cores: 0–9 ou 'c' (aleatória)
        if (k >= '0' && k <= '9') {
            setColorByIndex(parseInt(k, 10));
        } else if (k.toLowerCase() === 'c') {
            currentColor = [Math.random(), Math.random(), Math.random()];
            gl.uniform3fv(colorLoc, currentColor);
        } else {
            return; 
        }

        if (mode === "line") {
            if (p1 && p2 && clickStage === 0) {
                drawLineBresenham(p1.x, p1.y, p2.x, p2.y);
            } else {
                drawLineBresenham(0, 0, 0, 0);
            }
        } else {
            if (p1 && p2 && p3 && clickStage === 0) {
                drawTriangleBresenham(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
            } else {
                gl.clear(gl.COLOR_BUFFER_BIT); 
            }
        }
    });
}

main();
