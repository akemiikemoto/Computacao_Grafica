
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
    const sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
    }
    return sh;
}
function createProgram(gl, vs, fs) {
    const prg = gl.createProgram();
    gl.attachShader(prg, vs);
    gl.attachShader(prg, fs);
    gl.linkProgram(prg);
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(prg));
        gl.deleteProgram(prg);
        return null;
    }
    return prg;
}

function pixelToNDC(x, y, canvas) {
    const nx = (x / (canvas.width - 1)) * 2 - 1;
    const ny = -((y / (canvas.height - 1)) * 2 - 1);
    return [nx, ny];
}

// Bresenham (reta) 
function bresenhamLine(x0, y0, x1, y1) {
    x0 = Math.round(x0); y0 = Math.round(y0);
    x1 = Math.round(x1); y1 = Math.round(y1);
    const pts = [];
    let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
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

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

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
    let currentThickness = 2.0;
    gl.uniform3fv(colorLoc, currentColor);
    gl.uniform1f(sizeLoc, currentThickness);

    function setColorByIndex(idx) {
        if (idx >= 0 && idx < palette.length) {
            currentColor = palette[idx];
            gl.uniform3fv(colorLoc, currentColor);
        }
    }
    function setThickness(n) {
        const v = Math.max(1, Math.min(9, n|0));
        currentThickness = v;
        gl.uniform1f(sizeLoc, currentThickness);
    }
    function drawLineBresenham(x0, y0, x1, y1) {
        const pts = bresenhamLine(x0, y0, x1, y1);
        const data = [];
        for (const [px, py] of pts) {
            const [nx, ny] = pixelToNDC(px, py, canvas);
            data.push(nx, ny);
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.uniform3fv(colorLoc, currentColor);
        gl.uniform1f(sizeLoc, currentThickness);
        gl.drawArrays(gl.POINTS, 0, data.length / 2);
    }
    function drawTriangleBresenham(ax, ay, bx, by, cx, cy) {
        const s1 = bresenhamLine(ax, ay, bx, by);
        const s2 = bresenhamLine(bx, by, cx, cy);
        const s3 = bresenhamLine(cx, cy, ax, ay);
        const data = [];
        for (const [px, py] of [...s1, ...s2, ...s3]) {
            const [nx, ny] = pixelToNDC(px, py, canvas);
            data.push(nx, ny);
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.uniform3fv(colorLoc, currentColor);
        gl.uniform1f(sizeLoc, currentThickness);
        gl.drawArrays(gl.POINTS, 0, data.length / 2);
    }

    let drawMode = "line";            
    let toolMode = null;                
    let clickStage = 0;
    let p1 = null, p2 = null, p3 = null;

    drawLineBresenham(0, 0, 0, 0);

    canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (drawMode === "line") {
            if (clickStage === 0) {
                p1 = {x,y}; clickStage = 1;
            } else {
                p2 = {x,y}; clickStage = 0;
                drawLineBresenham(p1.x, p1.y, p2.x, p2.y);
            }
        } else { 
            if (clickStage === 0) {
                p1 = {x,y}; clickStage = 1;
            } else if (clickStage === 1) {
                p2 = {x,y}; clickStage = 2;
            } else {
                p3 = {x,y}; clickStage = 0;
                drawTriangleBresenham(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
            }
        }
    });

    window.addEventListener("keydown", (e) => {
        const k = e.key;

        if (k === 'r' || k === 'R') {
            drawMode = "line";
            clickStage = 0;
            toolMode = null;
            drawLineBresenham(0, 0, 0, 0); 
            return;
        }
        if (k === 't' || k === 'T') {
            drawMode = "triangle";
            clickStage = 0;
            toolMode = null;
            gl.clear(gl.COLOR_BUFFER_BIT); // aguarda 3 cliques
            return;
        }

        // ativa ferramentas
        if (k === 'k' || k === 'K') {
            toolMode = "colorSelect";
            return;
        }
        if (k === 'e' || k === 'E') {
            toolMode = "thicknessSelect";
            return;
        }

        if (toolMode === "colorSelect" && k >= '0' && k <= '9') {
            setColorByIndex(parseInt(k, 10));
        } else if (toolMode === "thicknessSelect" && k >= '1' && k <= '9') {
            setThickness(parseInt(k, 10));
        } else {
            return; 
        }

        if (drawMode === "line") {
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
