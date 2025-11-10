// Vertex shader
const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

    void main() {
        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
        v_color = a_color;
    }
`;

// Fragment shader
const fragmentShaderSource = `
    precision mediump float;
    varying vec3 v_color;
    void main() {
        gl_FragColor = vec4(v_color, 1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
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
        console.error('Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function createCubeVertices(size) {
    const s = size / 2;
    return new Float32Array([
        // Front
        s, s, s, s, -s, s, -s, s, s,
        -s, s, s, s, -s, s, -s, -s, s,
        // Back
        -s, s, -s, -s, -s, -s, s, s, -s,
        s, s, -s, -s, -s, -s, s, -s, -s,
        // Top
        s, s, s, s, s, -s, -s, s, s,
        -s, s, s, s, s, -s, -s, s, -s,
        // Bottom
        s, -s, s, -s, -s, s, s, -s, -s,
        -s, -s, s, -s, -s, -s, s, -s, -s,
        // Right
        s, s, -s, s, -s, -s, s, s, s,
        s, s, s, s, -s, -s, s, -s, s,
        // Left
        -s, s, s, -s, -s, s, -s, s, -s,
        -s, s, -s, -s, -s, s, -s, -s, -s
    ]);
}

function createCubeColors() {
    const colors = [];
    const faceColors = [
        [1.0, 0.0, 0.0], // Front - Red
        [0.0, 1.0, 0.0], // Back - Green
        [0.0, 0.0, 1.0], // Top - Blue
        [1.0, 1.0, 0.0], // Bottom - Yellow
        [1.0, 0.0, 1.0], // Right - Magenta
        [0.0, 1.0, 1.0]  // Left - Cyan
    ];
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
            colors.push(...faceColors[i]);
        }
    }
    return new Float32Array(colors);
}

function createGroundPlane() {
    const size = 10;
    const vertices = [];
    const colors = [];
    const divisions = 20;
    const step = size / divisions;
    
    for (let i = 0; i < divisions; i++) {
        for (let j = 0; j < divisions; j++) {
            const x1 = -size/2 + i * step;
            const x2 = -size/2 + (i + 1) * step;
            const z1 = -size/2 + j * step;
            const z2 = -size/2 + (j + 1) * step;
            
            const color = (i + j) % 2 === 0 ? [0.8, 0.8, 0.8] : [0.3, 0.3, 0.3];
            
            vertices.push(
                x1, 0, z1, x2, 0, z1, x1, 0, z2,
                x1, 0, z2, x2, 0, z1, x2, 0, z2
            );
            
            for (let k = 0; k < 6; k++) {
                colors.push(...color);
            }
        }
    }
    
    return {
        vertices: new Float32Array(vertices),
        colors: new Float32Array(colors)
    };
}

function createAxes() {
    return {
        vertices: new Float32Array([
            0, 0, 0, 5, 0, 0,  // X axis
            0, 0, 0, 0, 5, 0,  // Y axis
            0, 0, 0, 0, 0, 5   // Z axis
        ]),
        colors: new Float32Array([
            1, 0, 0, 1, 0, 0,  // Red
            0, 1, 0, 0, 1, 0,  // Green
            0, 0, 1, 0, 0, 1   // Blue
        ])
    };
}

function main() {
    const canvas = document.getElementById('glCanvas');
    // Ajusta o canvas ao tamanho da janela automaticamente
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('WebGL não suportado!');
        return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getAttribLocation(program, 'a_color');
    const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
    const viewMatrixLocation = gl.getUniformLocation(program, 'u_viewMatrix');
    const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');

    const vertexBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const cubeVertices = createCubeVertices(0.5);
    const cubeColors = createCubeColors();
    const ground = createGroundPlane();
    const axes = createAxes();

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);

    // Camera state
    let cameraPos = [0, 1, 4];
    let yaw = -Math.PI / 2; // Começa a olhar para -Z
    let pitch = 0;
    const moveSpeed = 0.05;
    const mouseSensitivity = 0.002;

    // Keyboard state
    const keys = {};
    window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

    // Mouse controls
    let mouseDown = false;
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        canvas.requestPointerLock(); // Trava o cursor
    });
    window.addEventListener('mouseup', () => {
        mouseDown = false;
        document.exitPointerLock(); // Libera o cursor
    });
    window.addEventListener('mousemove', (e) => {
        if (mouseDown) {
            const deltaX = e.movementX || 0;
            const deltaY = e.movementY || 0;
            
            yaw += deltaX * mouseSensitivity * 5; // Ajuste de sensibilidade
            pitch -= deltaY * mouseSensitivity * 5;
            pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, pitch));
        }
    });

    // Projection controls
    let fov = 60;
    let near = 0.1;
    let far = 100;
    let aspectRatio = canvas.width / canvas.height; // Valor inicial

    // Conecta os sliders às variáveis
    document.getElementById('fov').addEventListener('input', (e) => {
        fov = parseFloat(e.target.value);
        document.getElementById('fovValue').textContent = fov;
    });
    document.getElementById('near').addEventListener('input', (e) => {
        near = parseFloat(e.target.value);
        document.getElementById('nearValue').textContent = near.toFixed(2);
    });
    document.getElementById('far').addEventListener('input', (e) => {
        far = parseFloat(e.target.value);
        document.getElementById('farValue').textContent = far;
    });
    document.getElementById('aspect').addEventListener('input', (e) => {
        aspectRatio = parseFloat(e.target.value);
        document.getElementById('aspectValue').textContent = aspectRatio.toFixed(1);
    });

    // Atualiza o aspect ratio se a tela for redimensionada
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        aspectRatio = canvas.width / canvas.height;
        document.getElementById('aspect').value = aspectRatio.toFixed(1);
        document.getElementById('aspectValue').textContent = aspectRatio.toFixed(1);
    });
    // Dispara o evento de resize uma vez para acertar o valor inicial
    window.dispatchEvent(new Event('resize'));


    function updateCamera() {
        // Forward/backward (W/S)
        const forward = [
            Math.cos(pitch) * Math.sin(yaw),
            Math.sin(pitch),
            Math.cos(pitch) * Math.cos(yaw)
        ];
        
        // Right vector (A/D)
        const right = [ Math.cos(yaw), 0, -Math.sin(yaw) ];

        if (keys['w']) {
            cameraPos[0] += forward[0] * moveSpeed;
            cameraPos[1] += forward[1] * moveSpeed;
            cameraPos[2] += forward[2] * moveSpeed;
        }
        if (keys['s']) {
            cameraPos[0] -= forward[0] * moveSpeed;
            cameraPos[1] -= forward[1] * moveSpeed;
            cameraPos[2] -= forward[2] * moveSpeed;
        }
        if (keys['a']) {
            cameraPos[0] -= right[0] * moveSpeed;
            cameraPos[2] -= right[2] * moveSpeed;
        }
        if (keys['d']) {
            cameraPos[0] += right[0] * moveSpeed;
            cameraPos[2] += right[2] * moveSpeed;
        }
        if (keys['q']) cameraPos[1] += moveSpeed;
        if (keys['e']) cameraPos[1] -= moveSpeed;

        // Update UI
        document.getElementById('position').textContent = 
            `x: ${cameraPos[0].toFixed(2)}, y: ${cameraPos[1].toFixed(2)}, z: ${cameraPos[2].toFixed(2)}`;
        document.getElementById('rotation').textContent = 
            `Yaw: ${radToDeg(yaw).toFixed(1)}°, Pitch: ${radToDeg(pitch).toFixed(1)}°`;
    }

    function drawObject(vertices, colors, modelMatrix, drawMode = gl.TRIANGLES) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelMatrix);
        
        gl.drawArrays(drawMode, 0, vertices.length / 3);
    }

    let rotation = 0;

    function render() {
        updateCamera();
        rotation += 0.005; // Rotação do cubo mais lenta

        gl.viewport(0, 0, canvas.width, canvas.height);
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        // Projection matrix
        const projectionMatrix = m4.perspective(
            degToRad(fov),
            aspectRatio, // A proporção é usada aqui
            near,
            far
        );

        // View matrix
        const target = [
            cameraPos[0] + Math.cos(pitch) * Math.sin(yaw),
            cameraPos[1] + Math.sin(pitch),
            cameraPos[2] + Math.cos(pitch) * Math.cos(yaw)
        ];
        const viewMatrix = m4.inverse(m4.lookAt(cameraPos, target, [0, 1, 0]));

        gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

        // Draw ground
        drawObject(ground.vertices, ground.colors, m4.identity());

        // Draw cube at origin
        let cubeMatrix = m4.yRotate(m4.identity(), rotation);
        cubeMatrix = m4.translate(cubeMatrix, 0, 0.25, 0); // Levanta o cubo para ficar sobre o chão
        drawObject(cubeVertices, cubeColors, cubeMatrix);

        // Draw axes
        drawObject(axes.vertices, axes.colors, m4.identity(), gl.LINES);

        requestAnimationFrame(render);
    }

    render();
}

window.addEventListener('load', main);