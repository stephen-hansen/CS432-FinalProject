class ParticleSystem {
    constructor() {
        this.positions = [];
        this.velocities = [];
        this.masses = [];
        this.time = 0;
        this.MAX_NUM_PARTICLES = 1000;
        this.initializeSystem();

        this.program = initShaders(
            gl,
            "vshader_particles.glsl",
            "fshader_particles.glsl"
        );

        this.vID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.positions), gl.STATIC_DRAW);
        this.aPosition = gl.getAttribLocation(this.program, "aPosition");

        this.modelMatrix = mat4();

        this.modelMatrixID = gl.getUniformLocation(this.program, "modelMatrix");
        this.cameraMatrixID = gl.getUniformLocation(
            this.program,
            "cameraMatrix"
        );
        this.projMatrixID = gl.getUniformLocation(this.program, "projMatrix");
        this.colorID = gl.getUniformLocation(this.program, "uColor");
    }

    initializeSystem() {
        for (var i = 0; i < this.MAX_NUM_PARTICLES; i++) {
            var mass = 1.0;
            var position = vec3();
            var velocity = vec3();
            for (var j = 0; j < 3; j++) {
                position[j] = Math.random() * 20 - 10;
                velocity[j] = j == 1 ? Math.random() * -1 - 1.0 : 0;
                mass = Math.random();
            }

            this.positions.push(position);
            this.velocities.push(velocity);
            this.masses.push(mass);
        }
    }

    updateSystem() {
        for (var i = 0; i < this.MAX_NUM_PARTICLES; i++) {
            for (var j = 0; j < 3; j++) {
                this.positions[i][j] += 0.1 * this.velocities[i][j];
            }
            this.gravity(i);
            var pyrX = 0.5 + 0.5 * 4;
            var pyrY = 2.6;
            var pyrZ = 0 + 0.5 * 8.5;
            var pyrXSc = 2.35;
            var pyrZSc = 2 * 2.35;
            if (
                this.positions[i][1] < 0 ||
                (Math.abs(this.positions[i][0] - pyrX) <= pyrXSc &&
                    Math.abs(this.positions[i][2] - pyrZ) <= pyrZSc &&
                    this.positions[i][1] < pyrY)
            ) {
                this.positions[i][1] = 10;
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.positions), gl.STATIC_DRAW);
    }

    collision(n) {
        var coef = 0.5; //how strong it bounces back
        for (var i = 0; i < 3; i++) {
            if (this.positions[n][i] > 1.0) {
                this.velocities[n][i] *= -coef;
                this.positions[n][i] =
                    1.0 - coef * (this.positions[n][i] - 1.0);
            }
            if (this.positions[n][i] < -1.0) {
                this.velocities[n][i] *= -coef;
                this.positions[n][i] =
                    -1.0 - coef * (this.positions[n][i] + 1.0);
            }
        }
    }

    gravity(n) {
        this.velocities[n][1] -= 0.0001 / this.masses[n];
    }

    flock() {
        var cm = vec3();
        for (var j = 0; j < 3; j++) {
            for (var i = 0; i < this.MAX_NUM_PARTICLES; i++) {
                cm[j] += this.positions[i][j];
            }
            cm[j] /= this.MAX_NUM_PARTICLES;
        }

        const PERCENT_FLOCK = 0.001;
        for (var n = 0; n < this.MAX_NUM_PARTICLES; n++) {
            var flockVec = subtract(cm, this.positions[n]);
            for (var j = 0; j < 3; j++) {
                this.velocities[n][j] =
                    (1.0 - PERCENT_FLOCK) * this.velocities[n][j] +
                    PERCENT_FLOCK * flockVec[j];
            }
        }
    }

    draw(camera, projection) {
        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vID);
        gl.vertexAttribPointer(this.aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(
            this.modelMatrixID,
            false,
            flatten(this.modelMatrix)
        );
        gl.uniformMatrix4fv(this.cameraMatrixID, false, flatten(camera));
        gl.uniformMatrix4fv(this.projMatrixID, false, flatten(projection));
        gl.uniform4fv(this.colorID, vec4(0, 0, 1, 1));

        gl.enableVertexAttribArray(this.aPosition);
        gl.drawArrays(gl.POINTS, 0, this.positions.length);
        gl.disableVertexAttribArray(this.aPosition);
    }
}
