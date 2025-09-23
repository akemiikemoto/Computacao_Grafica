
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
    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // preto
    }
`;

function createShader(gl, type, src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
    console.error("Shader error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}
function createProgram(gl, vs, fs){
  const prg = gl.createProgram();
  gl.attachShader(prg, vs);
  gl.attachShader(prg, fs);
  gl.linkProgram(prg);
  if(!gl.getProgramParameter(prg, gl.LINK_STATUS)){
    console.error("Program link error:", gl.getProgramInfoLog(prg));
    gl.deleteProgram(prg);
    return null;
  }
  return prg;
}
function pixelToNDC(x, y, canvas){
  const nx = (x / (canvas.width - 1)) * 2 - 1;
  const ny = -((y / (canvas.height - 1)) * 2 - 1);
  return [nx, ny];
}

// Bresenham  circunferência
function bresenhamCircle(xc, yc, R){
  R = Math.max(0, Math.round(R));
  let x = 0, y = R;
  let p = 1 - R;
  const pts = [];

  function plot8(xc, yc, x, y){
    pts.push([xc + x, yc + y]);
    pts.push([xc - x, yc + y]);
    pts.push([xc + x, yc - y]);
    pts.push([xc - x, yc - y]);
    pts.push([xc + y, yc + x]);
    pts.push([xc - y, yc + x]);
    pts.push([xc + y, yc - x]);
    pts.push([xc - y, yc - x]);
  }

  plot8(xc, yc, x, y);
  while (x < y){
    x += 1;
    if (p < 0){
      p += 2 * x + 1;          // Leste
    } else {
      y -= 1;
      p += 2 * x + 1 - 2 * y;  // Sudeste
    }
    plot8(xc, yc, x, y);
  }
  return pts;
}

function main(){
  const canvas = document.getElementById("myCanvas");
  const gl = canvas.getContext("webgl");
  if(!gl){ console.error("WebGL não suportado"); return; }

  const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vs, fs);
  gl.useProgram(program);

  const posLoc  = gl.getAttribLocation(program, "a_position");
  const sizeLoc = gl.getUniformLocation(program, "pointSize");

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // Aparência
  gl.clearColor(1,1,1,1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform1f(sizeLoc, 2.0); // espessura do “pixel”

  // Estado
  let center = null;

  function drawCircleBresenham(xc, yc, R){
    const ptsPix = bresenhamCircle(xc, yc, R);
    const data = [];
    for(const [px, py] of ptsPix){
      const [nx, ny] = pixelToNDC(px, py, canvas);
      data.push(nx, ny);
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.drawArrays(gl.POINTS, 0, data.length / 2);

    console.info(`Centro=(${xc},${yc}) Raio=${Math.round(R)} Pontos=${ptsPix.length}`);
    console.log("Pontos (pixel):", ptsPix);
  }

  // 1º clique: centro | 2º clique: ponto na borda
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (!center){
      center = {x, y};
      drawCircleBresenham(center.x, center.y, 0);
    } else {
      const dx = x - center.x;
      const dy = y - center.y;
      const R = Math.hypot(dx, dy);
      drawCircleBresenham(center.x, center.y, R);
      center = null;
    }
  });

  drawCircleBresenham(0, 0, 0);
}

main();
