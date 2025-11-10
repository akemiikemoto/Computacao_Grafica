// Matrix 4x4 Library
const m4 = {
    identity() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    
    multiply(a, b) {
        // Implementação da multiplicação de matrizes
        var a00 = a[0 * 4 + 0]; var a01 = a[1 * 4 + 0]; var a02 = a[2 * 4 + 0]; var a03 = a[3 * 4 + 0];
        var a10 = a[0 * 4 + 1]; var a11 = a[1 * 4 + 1]; var a12 = a[2 * 4 + 1]; var a13 = a[3 * 4 + 1];
        var a20 = a[0 * 4 + 2]; var a21 = a[1 * 4 + 2]; var a22 = a[2 * 4 + 2]; var a23 = a[3 * 4 + 2];
        var a30 = a[0 * 4 + 3]; var a31 = a[1 * 4 + 3]; var a32 = a[2 * 4 + 3]; var a33 = a[3 * 4 + 3];
        var b00 = b[0 * 4 + 0]; var b01 = b[1 * 4 + 0]; var b02 = b[2 * 4 + 0]; var b03 = b[3 * 4 + 0];
        var b10 = b[0 * 4 + 1]; var b11 = b[1 * 4 + 1]; var b12 = b[2 * 4 + 1]; var b13 = b[3 * 4 + 1];
        var b20 = b[0 * 4 + 2]; var b21 = b[1 * 4 + 2]; var b22 = b[2 * 4 + 2]; var b23 = b[3 * 4 + 2];
        var b30 = b[0 * 4 + 3]; var b31 = b[1 * 4 + 3]; var b32 = b[2 * 4 + 3]; var b33 = b[3 * 4 + 3];
        return [
          a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
          a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
          a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
          a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
          a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
          a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
          a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
          a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
          a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
          a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
          a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
          a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
          a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
          a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
          a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
          a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33,
        ];
    },
    
    translate(m, tx, ty, tz) {
        return m4.multiply(m, [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ]);
    },
    
    xRotate(m, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return m4.multiply(m, [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]);
    },
    
    yRotate(m, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return m4.multiply(m, [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ]);
    },
    
    zRotate(m, angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return m4.multiply(m, [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    },
    
    perspective(fov, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        const rangeInv = 1.0 / (near - far);
        
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },
    
    lookAt(cameraPos, target, up) {
        const zAxis = normalize([
            cameraPos[0] - target[0],
            cameraPos[1] - target[1],
            cameraPos[2] - target[2]
        ]);
        const xAxis = normalize(cross(up, zAxis));
        const yAxis = normalize(cross(zAxis, xAxis));
        
        return [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPos[0], cameraPos[1], cameraPos[2], 1
        ];
    },
    
    inverse(m) {
        // ... (cálculo complexo da inversa, como no seu ficheiro) ...
        const m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3];
        const m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7];
        const m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11];
        const m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];
        const tmp0 = m22 * m33; const tmp1 = m32 * m23; const tmp2 = m12 * m33;
        const tmp3 = m32 * m13; const tmp4 = m12 * m23; const tmp5 = m22 * m13;
        const tmp6 = m02 * m33; const tmp7 = m32 * m03; const tmp8 = m02 * m23;
        const tmp9 = m22 * m03; const tmp10 = m02 * m13; const tmp11 = m12 * m03;
        const tmp12 = m20 * m31; const tmp13 = m30 * m21; const tmp14 = m10 * m31;
        const tmp15 = m30 * m11; const tmp16 = m10 * m21; const tmp17 = m20 * m11;
        const tmp18 = m00 * m31; const tmp19 = m30 * m01; const tmp20 = m00 * m21;
        const tmp21 = m20 * m01; const tmp22 = m00 * m11; const tmp23 = m10 * m01;
        const t0 = (tmp0 * m11 + tmp3 * m21 + tmp4 * m31) - (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
        const t1 = (tmp1 * m01 + tmp6 * m21 + tmp9 * m31) - (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
        const t2 = (tmp2 * m01 + tmp7 * m11 + tmp10 * m31) - (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
        const t3 = (tmp5 * m01 + tmp8 * m11 + tmp11 * m21) - (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);
        const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
        return [
            d * t0, d * t1, d * t2, d * t3,
            d * ((tmp1 * m10 + tmp2 * m20 + tmp5 * m30) - (tmp0 * m10 + tmp3 * m20 + tmp4 * m30)),
            d * ((tmp0 * m00 + tmp7 * m20 + tmp8 * m30) - (tmp1 * m00 + tmp6 * m20 + tmp9 * m30)),
            d * ((tmp3 * m00 + tmp6 * m10 + tmp11 * m30) - (tmp2 * m00 + tmp7 * m10 + tmp10 * m30)),
            d * ((tmp4 * m00 + tmp9 * m10 + tmp10 * m20) - (tmp5 * m00 + tmp8 * m10 + tmp11 * m20)),
            d * ((tmp12 * m13 + tmp15 * m23 + tmp16 * m33) - (tmp13 * m13 + tmp14 * m23 + tmp17 * m33)),
            d * ((tmp13 * m03 + tmp18 * m23 + tmp21 * m33) - (tmp12 * m03 + tmp19 * m23 + tmp20 * m33)),
            d * ((tmp14 * m03 + tmp19 * m13 + tmp22 * m33) - (tmp15 * m03 + tmp18 * m13 + tmp23 * m33)),
            d * ((tmp17 * m03 + tmp20 * m13 + tmp23 * m23) - (tmp16 * m03 + tmp21 * m13 + tmp22 * m23)),
            d * ((tmp14 * m22 + tmp17 * m32 + tmp13 * m12) - (tmp16 * m32 + tmp12 * m12 + tmp15 * m22)),
            d * ((tmp20 * m32 + tmp12 * m02 + tmp19 * m22) - (tmp18 * m22 + tmp21 * m32 + tmp13 * m02)),
            d * ((tmp18 * m12 + tmp23 * m32 + tmp15 * m02) - (tmp22 * m32 + tmp14 * m02 + tmp19 * m12)),
            d * ((tmp22 * m22 + tmp16 * m02 + tmp21 * m12) - (tmp20 * m12 + tmp23 * m22 + tmp17 * m02))
        ];
    },

    // (setViewingMatrix e setOrthographicProjectionMatrix não existem neste ficheiro)
};

// Helper functions (do seu m4.js)
function normalize(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return length > 0.00001 ? [v[0] / length, v[1] / length, v[2] / length] : [0, 0, 0];
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function degToRad(d) {
    return d * Math.PI / 180;
}

function radToDeg(r) {
    return r * 180 / Math.PI;
}