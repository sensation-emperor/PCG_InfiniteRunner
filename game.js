/**
 * Math Runner - Comprehensive Procedural 3D Infinite Runner
 * All geometry, shaders, particle systems, and audio synthesized via mathematics.
 */

// ============================================
// 1. MATHEMATICAL UTILITIES & NOISE
// ============================================

class MathUtils {
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    static smoothstep(edge0, edge1, x) {
        const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }

    static lerpColor(c1, c2, t) {
        const color1 = new THREE.Color(c1);
        const color2 = new THREE.Color(c2);
        return color1.lerp(color2, t);
    }
    
    static perlinNoise(x, y = 0, z = 0) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        
        const u = MathUtils.fade(x);
        const v = MathUtils.fade(y);
        const w = MathUtils.fade(z);
        
        const A = MathUtils.perm[X] + Y;
        const AA = MathUtils.perm[A] + Z;
        const AB = MathUtils.perm[A + 1] + Z;
        const B = MathUtils.perm[X + 1] + Y;
        const BA = MathUtils.perm[B] + Z;
        const BB = MathUtils.perm[B + 1] + Z;
        
        return MathUtils.lerp(
            MathUtils.lerp(
                MathUtils.lerp(MathUtils.grad(MathUtils.perm[AA], x, y, z),
                              MathUtils.grad(MathUtils.perm[BA], x - 1, y, z), u),
                MathUtils.lerp(MathUtils.grad(MathUtils.perm[AB], x, y - 1, z),
                              MathUtils.grad(MathUtils.perm[BB], x - 1, y - 1, z), u),
                v),
            MathUtils.lerp(
                MathUtils.lerp(MathUtils.grad(MathUtils.perm[AA + 1], x, y, z - 1),
                              MathUtils.grad(MathUtils.perm[BA + 1], x - 1, y, z - 1), u),
                MathUtils.lerp(MathUtils.grad(MathUtils.perm[AB + 1], x, y - 1, z - 1),
                              MathUtils.grad(MathUtils.perm[BB + 1], x - 1, y - 1, z - 1), u),
                v),
            w
        );
    }
    
    static fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    static grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}

MathUtils.perm = new Uint8Array(512);
for (let i = 0; i < 256; i++) {
    MathUtils.perm[i] = Math.floor(Math.random() * 256);
    MathUtils.perm[i + 256] = MathUtils.perm[i];
}

// ============================================
// 2. SEED ENGINE (Deterministic Pseudo-Random)
// ============================================

class SeedEngine {
    constructor(seed = 123456) {
        this.seed = seed;
        this.initialSeed = seed;
    }
    
    initialize(seed) {
        this.seed = seed;
        this.initialSeed = seed;
    }
    
    next() {
        this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
        return this.seed / 0x7fffffff;
    }
    
    randRange(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    
    randRangeFloat(min, max) {
        return this.next() * (max - min) + min;
    }
    
    reset() {
        this.seed = this.initialSeed;
    }
}

// ============================================
// 3. THEME & BIOME ENGINE
// ============================================

const THEMES = {
    cyberpunk: {
        name: 'Neon Cyberpunk',
        fogColor: 0x030314,
        bgColor: 0x030314,
        platformColor: 0x0088ff,
        gridColor: 0x00ffff,
        accentColor: 0xff00ff,
        obstacleColor: 0xff0055,
        hazardLaserColor: 0xff0044,
        dotColor: '#00F5FF'
    },
    synthwave: {
        name: 'Synthwave Sunset',
        fogColor: 0x180728,
        bgColor: 0x180728,
        platformColor: 0xff6b9d,
        gridColor: 0xff9a56,
        accentColor: 0xffcc00,
        obstacleColor: 0x8a2be2,
        hazardLaserColor: 0xff007f,
        dotColor: '#FF6B9D'
    },
    matrix: {
        name: 'Matrix Wireframe',
        fogColor: 0x001206,
        bgColor: 0x001206,
        platformColor: 0x005522,
        gridColor: 0x00ff66,
        accentColor: 0x39ff14,
        obstacleColor: 0x00ffaa,
        hazardLaserColor: 0x00ff88,
        dotColor: '#00FF88'
    },
    void: {
        name: 'Deep Void',
        fogColor: 0x05010d,
        bgColor: 0x05010d,
        platformColor: 0x241147,
        gridColor: 0x7b2cbf,
        accentColor: 0xffd700,
        obstacleColor: 0x9d4edd,
        hazardLaserColor: 0xffaa00,
        dotColor: '#FFD700'
    }
};

const THEME_KEYS = ['cyberpunk', 'synthwave', 'matrix', 'void'];

class ThemeEngine {
    constructor(scene) {
        this.scene = scene;
        this.currentThemeKey = 'cyberpunk';
        this.targetThemeKey = 'cyberpunk';
        this.transitionProgress = 1.0;
        this.biomeDistanceStep = 500; // Shift biome every 500m
        this.dynamicBiomes = true;
    }

    setTheme(key, immediate = false) {
        if (!THEMES[key]) return;
        this.targetThemeKey = key;
        if (immediate) {
            this.currentThemeKey = key;
            this.transitionProgress = 1.0;
            this.applyTheme(THEMES[key]);
            this.updateBiomeUI(THEMES[key]);
        } else {
            this.transitionProgress = 0.0;
        }
    }

    update(distance, deltaTime) {
        if (this.dynamicBiomes) {
            const biomeIndex = Math.floor(distance / this.biomeDistanceStep) % THEME_KEYS.length;
            const expectedThemeKey = THEME_KEYS[biomeIndex];
            if (expectedThemeKey !== this.targetThemeKey) {
                this.targetThemeKey = expectedThemeKey;
                this.transitionProgress = 0.0;
            }
        }

        if (this.transitionProgress < 1.0) {
            this.transitionProgress += deltaTime * 0.5; // Smooth 2-second transition
            if (this.transitionProgress >= 1.0) {
                this.transitionProgress = 1.0;
                this.currentThemeKey = this.targetThemeKey;
            }

            const current = THEMES[this.currentThemeKey];
            const target = THEMES[this.targetThemeKey];
            const t = this.transitionProgress;

            const blended = {
                name: target.name,
                fogColor: MathUtils.lerpColor(current.fogColor, target.fogColor, t),
                bgColor: MathUtils.lerpColor(current.bgColor, target.bgColor, t),
                platformColor: MathUtils.lerpColor(current.platformColor, target.platformColor, t),
                gridColor: MathUtils.lerpColor(current.gridColor, target.gridColor, t),
                accentColor: MathUtils.lerpColor(current.accentColor, target.accentColor, t),
                obstacleColor: MathUtils.lerpColor(current.obstacleColor, target.obstacleColor, t),
                hazardLaserColor: MathUtils.lerpColor(current.hazardLaserColor, target.hazardLaserColor, t),
                dotColor: target.dotColor
            };

            this.applyTheme(blended);
            this.updateBiomeUI(blended);
        }
    }

    applyTheme(theme) {
        this.scene.background = new THREE.Color(theme.bgColor);
        if (this.scene.fog) {
            this.scene.fog.color = new THREE.Color(theme.fogColor);
        }
    }

    updateBiomeUI(theme) {
        const nameEl = document.getElementById('biomeName');
        const dotEl = document.getElementById('biomeDot');
        if (nameEl) nameEl.textContent = theme.name;
        if (dotEl && theme.dotColor) {
            dotEl.style.backgroundColor = theme.dotColor;
            dotEl.style.boxShadow = `0 0 10px ${theme.dotColor}`;
        }
    }

    getCurrentColors() {
        return THEMES[this.targetThemeKey] || THEMES.cyberpunk;
    }
}

// ============================================
// 4. PROCEDURAL SHADERS & MATERIALS
// ============================================

class MaterialGenerator {
    static createNeonMaterial(color, emissiveIntensity = 0.6) {
        return new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: emissiveIntensity,
            metalness: 0.7,
            roughness: 0.25,
            wireframe: false
        });
    }

    static createGlowMaterial(color, pulseSpeed = 3.0) {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(color) },
                pulseSpeed: { value: pulseSpeed }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                uniform float pulseSpeed;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    float pulse = sin(time * pulseSpeed) * 0.35 + 0.65;
                    gl_FragColor = vec4(color * (intensity + pulse * 0.4), 0.9);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
    }

    static createGridMaterial(color, gridSize = 2.0) {
        return new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(color) },
                gridSize: { value: gridSize },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 color;
                uniform float gridSize;
                uniform float time;
                varying vec2 vUv;
                void main() {
                    vec2 grid = abs(fract(vUv * gridSize) - 0.5);
                    float line = 0.025;
                    float pattern = step(grid.x, line) + step(grid.y, line);
                    float pulse = sin(time * 2.0) * 0.2 + 0.8;
                    gl_FragColor = vec4(color * pattern * pulse, clamp(pattern, 0.0, 0.95));
                }
            `,
            transparent: true
        });
    }

    static createShieldMaterial() {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0x00f5ff) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
                    float hex = sin(vPosition.x * 12.0 + time * 4.0) * sin(vPosition.y * 12.0) * sin(vPosition.z * 12.0);
                    float glow = pow(rim, 2.5) + smoothstep(0.7, 0.9, hex) * 0.4;
                    gl_FragColor = vec4(color * 1.3, glow * 0.85);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
    }

    static createLaserMaterial(color = 0xff0055) {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(color) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                varying vec2 vUv;
                void main() {
                    float core = 1.0 - abs(vUv.y - 0.5) * 2.0;
                    core = pow(core, 3.0);
                    float flicker = sin(time * 35.0 + vUv.x * 20.0) * 0.15 + 0.85;
                    gl_FragColor = vec4((color + vec3(0.4)) * core * flicker, core);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide
        });
    }
}

// ============================================
// 5. PROCEDURAL MESH GENERATORS
// ============================================

class MeshGenerator {
    static createPlatform(width, length, height) {
        return new THREE.BoxGeometry(width, height, length);
    }

    static createSpikeObstacle(size, spikeCount = 4) {
        const shape = new THREE.Shape();
        const angleStep = (Math.PI * 2) / spikeCount;
        for (let i = 0; i <= spikeCount * 2; i++) {
            const angle = (i * angleStep) / 2;
            const radius = i % 2 === 0 ? size : size * 0.35;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        const extrudeSettings = {
            depth: size,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelSegments: 2
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.rotateX(-Math.PI / 2);
        return geometry;
    }

    static createArch(width, height, depth, thickness = 0.3) {
        const innerRadius = width / 2;
        const outerRadius = innerRadius + thickness;
        const geometry = new THREE.TorusGeometry(
            (innerRadius + outerRadius) / 2,
            (outerRadius - innerRadius) / 2,
            8,
            16,
            Math.PI
        );
        geometry.scale(width / 2, 1, depth / Math.PI);
        return geometry;
    }

    static createRamp(width, length, height) {
        const geometry = new THREE.BoxGeometry(width, height, length);
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            if (positions[i + 1] > 0) {
                const t = (positions[i + 2] + length / 2) / length;
                positions[i + 1] = t * height;
            }
        }
        geometry.computeVertexNormals();
        return geometry;
    }

    static createPillar(radius, height, segments = 8) {
        return new THREE.CylinderGeometry(radius * 0.8, radius, height, segments);
    }

    // Oscillating Laser Beam Hazard
    static createOscillatingLaser(width = 8.5) {
        const group = new THREE.Group();
        // Emitter posts
        const postGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.5, 8);
        const postMat = MaterialGenerator.createNeonMaterial(0x555566, 0.2);
        
        const leftPost = new THREE.Mesh(postGeo, postMat);
        leftPost.position.set(-width / 2, 1.25, 0);
        const rightPost = new THREE.Mesh(postGeo, postMat);
        rightPost.position.set(width / 2, 1.25, 0);
        group.add(leftPost, rightPost);

        // Laser beam
        const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, width, 8);
        beamGeo.rotateZ(Math.PI / 2);
        const beamMat = MaterialGenerator.createLaserMaterial(0xff0044);
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.set(0, 1.2, 0);
        group.add(beamMesh);

        group.userData = {
            isLaser: true,
            beamMesh: beamMesh,
            leftPost: leftPost,
            rightPost: rightPost,
            baseY: 1.2,
            amplitude: 0.8,
            speed: 3.5,
            timeOffset: Math.random() * Math.PI * 2
        };

        return group;
    }

    // Rotating Geometric Helix Barrier
    static createRotatingHelix(radius = 2.0, tube = 0.3) {
        const group = new THREE.Group();
        const torusGeo = new THREE.TorusGeometry(radius, tube, 8, 20, Math.PI * 1.35); // Partial arc leaving an open gap
        const torusMat = MaterialGenerator.createNeonMaterial(0xff9900, 0.8);
        const ring = new THREE.Mesh(torusGeo, torusMat);
        ring.position.set(0, 1.6, 0);
        group.add(ring);

        group.userData = {
            isRotatingHelix: true,
            ring: ring,
            rotationSpeed: 2.2 * (Math.random() > 0.5 ? 1 : -1)
        };
        return group;
    }

    // Slide-under High Overhead Gate
    static createHighSlideGate(width = 8.5) {
        const group = new THREE.Group();
        const frameGeo = new THREE.BoxGeometry(width, 0.4, 0.4);
        const frameMat = MaterialGenerator.createNeonMaterial(0x9d4edd, 0.5);
        const topBar = new THREE.Mesh(frameGeo, frameMat);
        topBar.position.set(0, 2.2, 0);
        group.add(topBar);

        // Side posts
        const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 2.2, 8);
        const leftPost = new THREE.Mesh(postGeo, frameMat);
        leftPost.position.set(-width / 2 + 0.2, 1.1, 0);
        const rightPost = new THREE.Mesh(postGeo, frameMat);
        rightPost.position.set(width / 2 - 0.2, 1.1, 0);
        group.add(leftPost, rightPost);

        // Hanging plasma curtain (requires sliding under)
        const plasmaGeo = new THREE.PlaneGeometry(width - 0.5, 1.1);
        const plasmaMat = MaterialGenerator.createLaserMaterial(0xaa00ff);
        const plasma = new THREE.Mesh(plasmaGeo, plasmaMat);
        plasma.position.set(0, 1.65, 0);
        group.add(plasma);

        group.userData = {
            isSlideGate: true,
            clearanceHeight: 1.0 // Height below which slide safely passes
        };
        return group;
    }

    // Collectibles & Power-Ups
    static createCoin() {
        const geo = new THREE.TorusGeometry(0.4, 0.12, 8, 16);
        const mat = MaterialGenerator.createGlowMaterial(0xffd700, 4.0);
        const coin = new THREE.Mesh(geo, mat);
        coin.userData = { isCollectible: true, type: 'coin', rotationSpeed: 2.5 };
        return coin;
    }

    static createChronoShard() {
        const geo = new THREE.OctahedronGeometry(0.45, 0);
        const mat = MaterialGenerator.createGlowMaterial(0x00ffff, 5.0);
        const shard = new THREE.Mesh(geo, mat);
        shard.userData = { isCollectible: true, type: 'chrono', rotationSpeed: 3.5 };
        return shard;
    }

    static createPowerUp(type) {
        let geo, mat, name, color;
        switch (type) {
            case 'shield':
                geo = new THREE.IcosahedronGeometry(0.45, 0);
                color = 0x00f5ff;
                name = 'Shield';
                break;
            case 'magnet':
                geo = new THREE.TorusGeometry(0.38, 0.15, 8, 16);
                color = 0xff00ff;
                name = 'Magnet';
                break;
            case 'multiplier':
                geo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
                color = 0xffd700;
                name = '2X Boost';
                break;
            case 'boost':
            default:
                geo = new THREE.ConeGeometry(0.35, 0.8, 8);
                geo.rotateX(Math.PI / 2);
                color = 0x00ff88;
                name = 'Hyperdrive';
                break;
        }
        mat = MaterialGenerator.createGlowMaterial(color, 6.0);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.userData = {
            isCollectible: true,
            isPowerUp: true,
            powerUpType: type,
            name: name,
            rotationSpeed: 3.0
        };
        return mesh;
    }

    static createParticleEmitter(count = 50, spread = 8) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * spread;
            positions[i * 3 + 1] = Math.random() * 5 + 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

            velocities[i * 3] = (Math.random() - 0.5) * 0.2;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return { geometry, velocities };
    }
}

// ============================================
// 6. PROCEDURAL REAL-TIME SYNTHESIZER (Web Audio API)
// ============================================

class ProceduralMusicSynth {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;
        this.isMuted = false;

        // Music Sequencer state
        this.isPlayingMusic = false;
        this.currentStep = 0;
        this.tempoBpm = 124;
        this.nextStepTime = 0;
        this.timerId = null;
        this.selectedTrack = 'synthwave'; // 'synthwave', 'darksynth', 'chiptune', 'zen'
        this.currentMode = 'classic';

        // Scales & Frequencies
        this.bassNotes = [55, 55, 65.41, 65.41, 49, 49, 58.27, 58.27]; // A1, C2, G1, D2
        this.chordRootFreqs = [220, 261.63, 196, 293.66]; // Am, C, G, Dm
        this.darksynthBass = [43.65, 43.65, 48.99, 48.99, 38.89, 38.89, 43.65, 51.91]; // F1, G1, D#1, F1, G#1
        this.chiptuneArp = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C Major Arp
        this.zenNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C Pentatonic
    }

    init() {
        if (this.initialized) {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            return;
        }

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.35;
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.55;
        this.sfxGain.connect(this.masterGain);

        this.initialized = true;
    }

    setMusicTrack(track) {
        this.selectedTrack = track;
        if (track === 'zen') {
            this.tempoBpm = 85;
        } else if (track === 'darksynth') {
            this.tempoBpm = 128;
        } else if (track === 'chiptune') {
            this.tempoBpm = 138;
        } else {
            this.tempoBpm = 124;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 0.4;
        }
        return !this.isMuted;
    }

    startMusic(mode = 'classic') {
        if (!this.initialized) this.init();
        this.isPlayingMusic = true;
        this.currentStep = 0;
        this.nextStepTime = this.ctx.currentTime + 0.1;
        this.currentMode = mode;
        if (mode === 'zen') {
            this.selectedTrack = 'zen';
        }
        this.scheduler();
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    setSpeed(speedFactor) {
        if (this.selectedTrack === 'zen') {
            this.tempoBpm = 85;
        } else {
            const baseBpm = this.selectedTrack === 'chiptune' ? 138 : (this.selectedTrack === 'darksynth' ? 128 : 124);
            this.tempoBpm = MathUtils.clamp(baseBpm * speedFactor, 110, 175);
        }
    }

    scheduler() {
        if (!this.isPlayingMusic) return;

        const lookAhead = 0.1;
        const stepInterval = (60.0 / this.tempoBpm) / 4; // 16th note interval

        while (this.nextStepTime < this.ctx.currentTime + lookAhead) {
            this.playStep(this.currentStep, this.nextStepTime);
            this.nextStepTime += stepInterval;
            this.currentStep = (this.currentStep + 1) % 32;
        }

        this.timerId = setTimeout(() => this.scheduler(), 35);
    }

    playStep(step, time) {
        if (this.isMuted || !this.initialized) return;

        if (this.selectedTrack === 'zen') {
            // Lush ambient chord pads
            if (step % 8 === 0) {
                const note = this.zenNotes[Math.floor(Math.random() * this.zenNotes.length)];
                this.playZenPad(note, time, 1.8);
            }
            return;
        }

        if (this.selectedTrack === 'darksynth') {
            // Heavy Darksynth industrial bass + kick pulse + snare burst
            if (step % 2 === 0) {
                const barIndex = Math.floor(step / 8);
                const baseFreq = this.darksynthBass[barIndex % this.darksynthBass.length];
                this.playDarksynthBass(baseFreq, time, 0.14);
            }
            // Kick drum on four-on-the-floor
            if (step % 4 === 0) {
                this.playDarksynthKick(time);
            }
            // Industrial snare
            if (step % 8 === 4) {
                this.playNoiseSnare(time, 0.12);
            }
            // Aggressive saw lead
            if (step === 2 || step === 8 || step === 14 || step === 22 || step === 28) {
                this.playDarksynthLead(174.61 * [1.0, 1.25, 1.5, 2.0][(step / 2) % 4], time, 0.2);
            }
            return;
        }

        if (this.selectedTrack === 'chiptune') {
            // Fast 8-bit pulse arpeggio
            const arpFreq = this.chiptuneArp[step % this.chiptuneArp.length];
            this.playChiptuneNote(arpFreq * (step % 8 < 4 ? 1.0 : 1.5), time, 0.08);

            // Retro chiptune noise snare
            if (step % 4 === 2) {
                this.playNoiseSnare(time, 0.06);
            }
            // Chiptune melody
            if (step % 8 === 0) {
                this.playChiptuneLead(523.25 * [1.0, 1.12, 1.25, 1.5][Math.floor(step / 8)], time, 0.25);
            }
            return;
        }

        // Default: Synthwave Horizon
        if (step % 2 === 0) {
            const barIndex = Math.floor(step / 8);
            const baseFreq = this.bassNotes[barIndex % this.bassNotes.length];
            const octave = step % 4 === 2 ? 2.0 : 1.0;
            this.playBassNote(baseFreq * octave, time, 0.12);
        }

        if (step === 0 || step === 6 || step === 10 || step === 14 || step === 20 || step === 26) {
            const chordIndex = Math.floor(step / 8);
            const root = this.chordRootFreqs[chordIndex % this.chordRootFreqs.length];
            const interval = [1.0, 1.2, 1.5, 1.77][(step / 2) % 4];
            this.playLeadNote(root * interval, time, 0.22);
        }
    }

    // Synthwave Instruments
    playBassNote(freq, time, duration) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + duration);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + duration);
    }

    playLeadNote(freq, time, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + duration);
    }

    // Darksynth Instruments
    playDarksynthBass(freq, time, duration) {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, time);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * 1.01, time); // Detuned saw

        filter.type = 'lowpass';
        filter.Q.value = 6.0; // High resonance
        filter.frequency.setValueAtTime(800, time);
        filter.frequency.exponentialRampToValueAtTime(80, time + duration);

        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + duration);
        osc2.stop(time + duration);
    }

    playDarksynthKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + 0.12);
    }

    playDarksynthLead(freq, time, duration) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);
        filter.type = 'bandpass';
        filter.Q.value = 3.0;
        filter.frequency.setValueAtTime(1200, time);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + duration);
    }

    // Chiptune Instruments
    playChiptuneNote(freq, time, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + duration);
    }

    playChiptuneLead(freq, time, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.16, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + duration);
    }

    playNoiseSnare(time, duration = 0.1) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        noise.start(time);
        noise.stop(time + duration);
    }

    playZenPad(freq, time, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.01, time);
        gain.gain.linearRampToValueAtTime(0.1, time + duration * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(this.musicGain);

        osc.start(time);
        osc.stop(time + duration);
    }

    // 3D Spatial Audio Panner
    createSpatialPanner(relX = 0) {
        if (!this.ctx) return this.sfxGain;
        if (this.ctx.createStereoPanner) {
            const panner = this.ctx.createStereoPanner();
            panner.pan.value = MathUtils.clamp(relX / 3.0, -0.9, 0.9);
            panner.connect(this.sfxGain);
            return panner;
        }
        return this.sfxGain;
    }

    playJumpSound() {
        if (!this.initialized || this.isMuted) return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, time);
        osc.frequency.exponentialRampToValueAtTime(750, time + 0.22);

        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(time);
        osc.stop(time + 0.22);
    }

    playCollectCoin(relX = 0) {
        if (!this.initialized || this.isMuted) return;
        const time = this.ctx.currentTime;
        const pentatonic = [523.25, 659.25, 783.99, 1046.5];
        const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const dest = this.createSpatialPanner(relX);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.32, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + 0.2);
    }

    playCollectChrono() {
        if (!this.initialized || this.isMuted) return;
        const time = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880 + i * 220, time + i * 0.05);

            gain.gain.setValueAtTime(0.25, time + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, time + i * 0.05 + 0.2);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(time + i * 0.05);
            osc.stop(time + i * 0.05 + 0.2);
        }
    }

    playPowerUpCollect() {
        if (!this.initialized || this.isMuted) return;
        const time = this.ctx.currentTime;
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time + idx * 0.06);

            gain.gain.setValueAtTime(0.3, time + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.01, time + idx * 0.06 + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(time + idx * 0.06);
            osc.stop(time + idx * 0.06 + 0.25);
        });
    }

    playShieldBreak() {
        if (!this.initialized || this.isMuted) return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, time);
        osc.frequency.exponentialRampToValueAtTime(150, time + 0.35);

        gain.gain.setValueAtTime(0.45, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(time);
        osc.stop(time + 0.35);
    }

    playCrashSound() {
        if (!this.initialized || this.isMuted) return;
        const time = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, time);
        filter.frequency.exponentialRampToValueAtTime(50, time + 0.4);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(time);
        noise.stop(time + 0.4);
    }

    playMathGatePositive() {
        if (!this.initialized || this.isMuted) return;
        const time = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time + idx * 0.04);

            gain.gain.setValueAtTime(0.32, time + idx * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.04 + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(time + idx * 0.04);
            osc.stop(time + idx * 0.04 + 0.3);
        });
    }

    playMathGateNegative() {
        if (!this.initialized || this.isMuted) return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.28);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.28);

        gain.gain.setValueAtTime(0.38, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(time);
        osc.stop(time + 0.28);
    }

    playClonePop() {
        if (!this.initialized || this.isMuted) return;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, time);
        osc.frequency.exponentialRampToValueAtTime(140, time + 0.12);

        gain.gain.setValueAtTime(0.28, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(time);
        osc.stop(time + 0.12);
    }
}

// ============================================
// 6.5 SCREEN SHAKE & POST-PROCESSING SHADERS
// ============================================

class ScreenShakeController {
    constructor() {
        this.trauma = 0.0;
        this.traumaDecay = 1.8;
        this.maxPitch = 0.04;
        this.maxYaw = 0.04;
        this.maxRoll = 0.06;
        this.maxOffsetX = 0.3;
        this.maxOffsetY = 0.3;
    }

    addTrauma(amount) {
        this.trauma = MathUtils.clamp(this.trauma + amount, 0.0, 1.0);
    }

    update(deltaTime, time) {
        if (this.trauma <= 0.001) {
            this.trauma = 0;
            return { posX: 0, posY: 0, posZ: 0, rotX: 0, rotY: 0, rotZ: 0 };
        }

        const shake = this.trauma * this.trauma;
        this.trauma = Math.max(0, this.trauma - this.traumaDecay * deltaTime);

        const freq = time * 36.0;
        return {
            posX: Math.sin(freq * 1.1) * this.maxOffsetX * shake,
            posY: Math.cos(freq * 1.3) * this.maxOffsetY * shake,
            posZ: 0,
            rotX: Math.sin(freq * 0.9) * this.maxPitch * shake,
            rotY: Math.cos(freq * 1.2) * this.maxYaw * shake,
            rotZ: Math.sin(freq * 1.4) * this.maxRoll * shake
        };
    }
}

const CyberWarpShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'uWarp': { value: 0.0 },
        'uChromatic': { value: 0.0 },
        'uTime': { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uWarp;
        uniform float uChromatic;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5, 0.5);
            vec2 toCenter = uv - center;
            float dist = length(toCenter);

            // Radial speed warp
            if (uWarp > 0.001) {
                float warpFactor = 1.0 - uWarp * dist * dist * 0.4;
                uv = center + toCenter * warpFactor;
            }

            // Chromatic Aberration
            float chromOffset = uChromatic * 0.025 + uWarp * 0.005 * dist;
            vec2 rUv = uv + toCenter * chromOffset;
            vec2 bUv = uv - toCenter * chromOffset;

            float r = texture2D(tDiffuse, rUv).r;
            float g = texture2D(tDiffuse, uv).g;
            float b = texture2D(tDiffuse, bUv).b;
            vec4 col = vec4(r, g, b, 1.0);

            // Speed rays & vignette during Boost
            if (uWarp > 0.01) {
                float angle = atan(toCenter.y, toCenter.x);
                float speedRays = sin(angle * 32.0 + uTime * 22.0) * 0.5 + 0.5;
                float edgeVignette = smoothstep(0.3, 0.8, dist);
                col.rgb += vec3(0.0, 0.9, 1.0) * speedRays * edgeVignette * uWarp * 0.35;
            }

            gl_FragColor = col;
        }
    `
};

// ============================================
// 7. PLAYER CHARACTER
// ============================================

class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.characterGroup = new THREE.Group();
        this.mesh.add(this.characterGroup);
        
        this.characters = {};
        this.mixers = {};
        this.actions = {};
        this.activeAction = null;
        this.activeCharacterKey = 'robot';
        this.currentActionName = 'idle';
        this.inMenuPreview = true;
        this.isDead = false;
        
        this.gltfLoader = (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined') ? new THREE.GLTFLoader() : null;

        // Visual power-up attachments
        this.createPowerUpAuras();
        
        // Physics & Controls state
        this.lane = 1; // 0: left (-3), 1: center (0), 2: right (+3)
        this.targetX = 0;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isJumping = false;
        this.isSliding = false;
        this.rollAngle = 0;

        // Initialize character models
        this.initCharacters();
        this.reset();
        
        this.scene.add(this.mesh);
    }
    
    createPowerUpAuras() {
        // Attached Shield Aura Sphere (translucent neon shield)
        const shieldGeo = new THREE.SphereGeometry(1.35, 24, 24);
        this.shieldMat = MaterialGenerator.createShieldMaterial();
        this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
        this.shieldMesh.position.y = 1.0;
        this.shieldMesh.visible = false;
        this.mesh.add(this.shieldMesh);

        // Hyperdrive Booster Plumes
        const trailGeo = new THREE.ConeGeometry(0.2, 1.5, 10);
        trailGeo.rotateX(-Math.PI / 2);
        this.boostMat = MaterialGenerator.createLaserMaterial(0xff9900);
        this.leftBooster = new THREE.Mesh(trailGeo, this.boostMat);
        this.leftBooster.position.set(-0.35, 1.05, 0.7);
        this.rightBooster = new THREE.Mesh(trailGeo, this.boostMat);
        this.rightBooster.position.set(0.35, 1.05, 0.7);
        this.leftBooster.visible = false;
        this.rightBooster.visible = false;
        this.mesh.add(this.leftBooster, this.rightBooster);
    }

    initCharacters() {
        // 1. Model configs with character-specific rotation offsets and scales
        this.modelConfigs = {
            robot: {
                key: 'robot',
                paths: [
                    'assets/models/robot.glb',
                    'public/models/robot.glb',
                    'models/robot.glb',
                    'https://raw.githubusercontent.com/mrdoob/three.js/r152/examples/models/gltf/RobotExpressive/RobotExpressive.glb'
                ],
                scale: 0.76,
                basePreviewRotY: 0,
                baseGameRotY: Math.PI,
                offsetY: 0
            },
            soldier: {
                key: 'soldier',
                paths: [
                    'assets/models/soldier.glb',
                    'public/models/soldier.glb',
                    'models/soldier.glb',
                    'https://raw.githubusercontent.com/mrdoob/three.js/r152/examples/models/gltf/Soldier.glb'
                ],
                scale: 1.35,
                basePreviewRotY: Math.PI, // Soldier.glb faces +Z by default; Math.PI faces the camera in menu
                baseGameRotY: 0,          // 0 faces -Z (forward running direction)
                offsetY: 0
            },
            xbot: {
                key: 'xbot',
                paths: [
                    'assets/models/xbot.glb',
                    'public/models/xbot.glb',
                    'models/xbot.glb',
                    'https://raw.githubusercontent.com/mrdoob/three.js/r152/examples/models/gltf/Xbot.glb'
                ],
                scale: 1.3,
                basePreviewRotY: 0,
                baseGameRotY: Math.PI,
                offsetY: 0
            },
            droid: {
                key: 'droid',
                scale: 1.0,
                basePreviewRotY: 0,
                baseGameRotY: Math.PI,
                offsetY: 0
            }
        };

        // 2. Create procedural geometric droid
        this.characters['droid'] = this.createProceduralDroid();

        // 3. Load GLTF models
        const glbConfigs = [
            this.modelConfigs.robot,
            this.modelConfigs.soldier,
            this.modelConfigs.xbot
        ];

        glbConfigs.forEach(cfg => {
            this.loadGLBModel(cfg);
        });

        // Default display
        this.displayCharacter(this.activeCharacterKey);
    }

    loadGLBModel(cfg) {
        if (!this.gltfLoader) return;

        const tryLoad = (idx) => {
            if (idx >= cfg.paths.length) {
                console.warn(`Could not load GLB for ${cfg.key}, fallback active.`);
                return;
            }
            const path = cfg.paths[idx];
            this.gltfLoader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;
                    model.scale.set(cfg.scale, cfg.scale, cfg.scale);
                    model.rotation.y = this.inMenuPreview ? cfg.basePreviewRotY : cfg.baseGameRotY;
                    model.position.y = cfg.offsetY;

                    model.traverse(child => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            if (child.material) {
                                child.material.roughness = 0.28;
                                child.material.metalness = 0.72;
                                
                                if (cfg.key === 'soldier') {
                                    child.material.color = new THREE.Color(0xaaccff);
                                    child.material.emissive = new THREE.Color(0x113366);
                                    child.material.emissiveIntensity = 0.6;
                                } else if (cfg.key === 'xbot') {
                                    child.material.color = new THREE.Color(0xddffff);
                                    child.material.emissive = new THREE.Color(0x004466);
                                    child.material.emissiveIntensity = 0.55;
                                }
                            }
                        }
                    });

                    // Build Animation Mixer & Action map
                    const mixer = new THREE.AnimationMixer(model);
                    const actions = {};

                    if (gltf.animations && gltf.animations.length > 0) {
                        gltf.animations.forEach(clip => {
                            const action = mixer.clipAction(clip);
                            actions[clip.name.toLowerCase()] = action;
                            actions[clip.name] = action;
                        });
                    }

                    this.characters[cfg.key] = model;
                    this.mixers[cfg.key] = mixer;
                    this.actions[cfg.key] = actions;

                    if (this.activeCharacterKey === cfg.key) {
                        this.displayCharacter(cfg.key);
                    }
                },
                undefined,
                () => {
                    tryLoad(idx + 1);
                }
            );
        };

        tryLoad(0);
    }

    createProceduralDroid() {
        const group = new THREE.Group();
        
        // Torso
        const bodyGeo = new THREE.BoxGeometry(0.65, 0.85, 0.45);
        this.droidBodyMat = MaterialGenerator.createNeonMaterial(0x00F5FF, 0.8);
        const body = new THREE.Mesh(bodyGeo, this.droidBodyMat);
        body.position.y = 0.95;
        group.add(body);

        // Core reactor
        const coreGeo = new THREE.OctahedronGeometry(0.18, 0);
        const coreMat = MaterialGenerator.createGlowMaterial(0xFF007F, 4.5);
        this.droidCore = new THREE.Mesh(coreGeo, coreMat);
        this.droidCore.position.set(0, 0.95, 0.25);
        group.add(this.droidCore);
        
        // Head
        const headGeo = new THREE.BoxGeometry(0.45, 0.42, 0.42);
        const headMat = MaterialGenerator.createNeonMaterial(0x00F5FF, 0.8);
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.58;
        group.add(head);
        
        // Visor
        const visorGeo = new THREE.BoxGeometry(0.36, 0.12, 0.1);
        const visorMat = MaterialGenerator.createGlowMaterial(0x00FF88, 4.0);
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.58, 0.22);
        group.add(visor);

        // Limbs for running oscillation
        const limbMat = MaterialGenerator.createNeonMaterial(0x7700ff, 0.6);
        const limbGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.65, 8);
        
        this.leftArm = new THREE.Mesh(limbGeo, limbMat);
        this.leftArm.position.set(-0.45, 0.95, 0);
        this.rightArm = new THREE.Mesh(limbGeo, limbMat);
        this.rightArm.position.set(0.45, 0.95, 0);
        
        this.leftLeg = new THREE.Mesh(limbGeo, limbMat);
        this.leftLeg.position.set(-0.2, 0.35, 0);
        this.rightLeg = new THREE.Mesh(limbGeo, limbMat);
        this.rightLeg.position.set(0.2, 0.35, 0);

        group.add(this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
        return group;
    }

    displayCharacter(key) {
        this.activeCharacterKey = key;
        
        while (this.characterGroup.children.length > 0) {
            this.characterGroup.remove(this.characterGroup.children[0]);
        }

        const model = this.characters[key] || this.characters['droid'];
        const cfg = this.modelConfigs[key] || { basePreviewRotY: 0, baseGameRotY: Math.PI };
        if (model) {
            model.rotation.y = this.inMenuPreview ? cfg.basePreviewRotY : cfg.baseGameRotY;
            this.characterGroup.add(model);
        }

        if (this.inMenuPreview) {
            this.playAction('idle', 0.2);
        } else {
            this.playAction('run', 0.2);
        }
    }

    setCharacter(key) {
        this.displayCharacter(key);
        if (this.inMenuPreview) {
            this.playMenuGreeting();
        }
    }

    playMenuGreeting() {
        const greeting = this.findAction(['wave', 'thumbsup', 'agree', 'dance', 'jump', 'walk']);
        if (greeting) {
            this.crossFadeToAction(greeting, 0.15, THREE.LoopOnce);
            setTimeout(() => {
                if (this.inMenuPreview) {
                    this.playAction('idle', 0.3);
                }
            }, 1800);
        }
    }

    findAction(nameOrList) {
        const actions = this.actions[this.activeCharacterKey];
        if (!actions) return null;

        const list = Array.isArray(nameOrList) ? nameOrList : [nameOrList];
        for (const item of list) {
            const lower = item.toLowerCase();
            for (const key in actions) {
                if (key.toLowerCase() === lower || key.toLowerCase().includes(lower)) {
                    return actions[key];
                }
            }
        }
        return null;
    }

    playAction(name, duration = 0.2, loopMode = THREE.LoopRepeat) {
        this.currentActionName = name;
        
        let targetAction = null;
        if (name === 'run') {
            targetAction = this.findAction(['running', 'run', 'walk']);
        } else if (name === 'idle') {
            targetAction = this.findAction(['idle', 'standing', 'tpose']);
        } else if (name === 'jump') {
            targetAction = this.findAction(['jump', 'walkjump']);
            if (!targetAction) targetAction = this.findAction(['run', 'running', 'walk']);
        } else if (name === 'slide') {
            targetAction = this.findAction(['sitting', 'sneak_pose', 'crouch']);
            if (!targetAction) targetAction = this.findAction(['walk', 'run', 'idle']);
        } else if (name === 'death') {
            targetAction = this.findAction(['death', 'sad_pose']);
        } else {
            targetAction = this.findAction(name);
        }

        if (targetAction) {
            this.crossFadeToAction(targetAction, duration, loopMode);
        }
    }

    crossFadeToAction(targetAction, duration = 0.2, loopMode = THREE.LoopRepeat) {
        if (!targetAction) return;

        const previousAction = this.activeAction;
        this.activeAction = targetAction;

        if (previousAction && previousAction !== targetAction) {
            previousAction.fadeOut(duration);
        }

        targetAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration);

        targetAction.setLoop(loopMode);
        if (loopMode === THREE.LoopOnce) {
            targetAction.clampWhenFinished = true;
        }
        targetAction.play();
    }
    
    reset() {
        this.mesh.position.set(0, 0, 0);
        this.characterGroup.position.set(0, 0, 0);
        this.characterGroup.rotation.set(0, 0, 0);
        this.characterGroup.scale.set(1, 1, 1);

        const currentModel = this.characters[this.activeCharacterKey] || this.characters['droid'];
        const cfg = this.modelConfigs[this.activeCharacterKey] || { basePreviewRotY: 0, baseGameRotY: Math.PI };
        if (currentModel) {
            currentModel.rotation.y = this.inMenuPreview ? cfg.basePreviewRotY : cfg.baseGameRotY;
        }

        this.velocity.set(0, 0, 0);
        this.isJumping = false;
        this.isSliding = false;
        this.isDead = false;
        this.lane = 1;
        this.targetX = 0;
        this.rollAngle = 0;
        this.setShieldVisible(false);
        this.setBoostVisible(false);

        if (this.inMenuPreview) {
            this.playAction('idle', 0.2);
        } else {
            this.playAction('run', 0.2);
        }
    }

    setShieldVisible(visible) {
        if (this.shieldMesh) this.shieldMesh.visible = visible;
    }

    setBoostVisible(visible) {
        if (this.leftBooster) this.leftBooster.visible = visible;
        if (this.rightBooster) this.rightBooster.visible = visible;
    }
    
    update(deltaTime, speed) {
        // 1. Update skeletal animation mixer
        const mixer = this.mixers[this.activeCharacterKey];
        if (mixer) {
            if (this.currentActionName === 'run' && this.activeAction) {
                this.activeAction.timeScale = Math.max(0.6, (speed / 18) * 1.35);
            }
            mixer.update(deltaTime);
        }

        // 2. Update procedural droid animation if active
        if (this.activeCharacterKey === 'droid') {
            if (this.inMenuPreview) {
                const t = Date.now() * 0.002;
                if (this.leftArm && this.rightArm) {
                    this.leftArm.rotation.x = Math.sin(t) * 0.15;
                    this.rightArm.rotation.x = -Math.sin(t) * 0.15;
                    this.leftLeg.rotation.x = 0;
                    this.rightLeg.rotation.x = 0;
                }
            } else if (this.isJumping) {
                if (this.leftArm && this.rightArm) {
                    this.leftArm.rotation.x = -1.2;
                    this.rightArm.rotation.x = -1.2;
                    this.leftLeg.rotation.x = 0.4;
                    this.rightLeg.rotation.x = 0.4;
                }
            } else if (this.isSliding) {
                if (this.leftArm && this.rightArm) {
                    this.leftArm.rotation.x = 1.4;
                    this.rightArm.rotation.x = 1.4;
                    this.leftLeg.rotation.x = -1.1;
                    this.rightLeg.rotation.x = -1.1;
                }
            } else {
                const t = Date.now() * 0.014 * speed;
                if (this.leftArm && this.rightArm) {
                    this.leftArm.rotation.x = Math.sin(t) * 0.75;
                    this.rightArm.rotation.x = -Math.sin(t) * 0.75;
                    this.leftLeg.rotation.x = -Math.sin(t) * 0.85;
                    this.rightLeg.rotation.x = Math.sin(t) * 0.85;
                }
            }
            if (this.droidCore) {
                this.droidCore.rotation.x += deltaTime * 2.5;
                this.droidCore.rotation.y += deltaTime * 3.5;
            }
        }

        // In menu preview mode, stay idle with gentle showcase rotation
        if (this.inMenuPreview) {
            return;
        }

        // 3. Crash tumble animation if dead
        if (this.isDead) {
            this.characterGroup.rotation.x = MathUtils.lerp(this.characterGroup.rotation.x, -Math.PI * 0.45, deltaTime * 12);
            this.characterGroup.rotation.z = MathUtils.lerp(this.characterGroup.rotation.z, 0.4, deltaTime * 8);
            this.characterGroup.position.y = MathUtils.lerp(this.characterGroup.position.y, 0.25, deltaTime * 10);
            return;
        }

        // 4. Lane switching interpolation
        this.mesh.position.x = MathUtils.lerp(
            this.mesh.position.x,
            this.targetX,
            deltaTime * 14
        );

        // 5. Procedural Lean / Banking on dodge
        const laneDiff = this.targetX - this.mesh.position.x;
        const targetRoll = MathUtils.clamp(laneDiff * 0.16, -0.32, 0.32);
        this.rollAngle = MathUtils.lerp(this.rollAngle, targetRoll, deltaTime * 12);
        this.characterGroup.rotation.z = this.rollAngle;
        this.characterGroup.rotation.y = -this.rollAngle * 0.45;

        // 6. Jump physics & dynamic aerial arc
        if (this.isJumping) {
            this.mesh.position.y += this.velocity.y * deltaTime;
            this.velocity.y -= 24 * deltaTime; // Gravity

            const jumpProgress = Math.max(0, this.mesh.position.y / 2.6);
            this.characterGroup.rotation.x = -Math.sin(jumpProgress * Math.PI) * 0.28;

            if (this.mesh.position.y <= 0) {
                this.mesh.position.y = 0;
                this.isJumping = false;
                this.characterGroup.rotation.x = 0;
                if (this.onLand) this.onLand();
                if (!this.isSliding && !this.isDead) {
                    this.playAction('run', 0.15);
                }
            }
        }

        // 7. Sliding height & dynamic forward pitch dive
        if (this.isSliding) {
            this.characterGroup.scale.y = MathUtils.lerp(this.characterGroup.scale.y, 0.42, deltaTime * 18);
            this.characterGroup.scale.z = MathUtils.lerp(this.characterGroup.scale.z, 1.25, deltaTime * 18);
            this.characterGroup.rotation.x = MathUtils.lerp(this.characterGroup.rotation.x, 0.55, deltaTime * 18);
            this.characterGroup.position.y = MathUtils.lerp(this.characterGroup.position.y, 0.15, deltaTime * 18);
        } else {
            this.characterGroup.scale.y = MathUtils.lerp(this.characterGroup.scale.y, 1.0, deltaTime * 18);
            this.characterGroup.scale.z = MathUtils.lerp(this.characterGroup.scale.z, 1.0, deltaTime * 18);
            if (!this.isJumping) {
                this.characterGroup.rotation.x = MathUtils.lerp(this.characterGroup.rotation.x, 0.0, deltaTime * 18);
            }
            this.characterGroup.position.y = MathUtils.lerp(this.characterGroup.position.y, 0.0, deltaTime * 18);
        }

        // 8. Running bobbing if running on ground
        if (!this.isJumping && !this.isSliding && !this.isDead) {
            this.characterGroup.position.y = Math.sin(Date.now() * 0.016 * speed) * 0.04;
        }

        // 9. Rotate active shield aura
        if (this.shieldMesh && this.shieldMesh.visible) {
            this.shieldMesh.rotation.y += deltaTime * 1.5;
            this.shieldMesh.rotation.x += deltaTime * 0.8;
            if (this.shieldMat.uniforms) {
                this.shieldMat.uniforms.time.value += deltaTime;
            }
        }
    }
    
    jump() {
        if (!this.isJumping && !this.isSliding && !this.isDead) {
            this.isJumping = true;
            this.velocity.y = 11.2;
            this.playAction('jump', 0.1, THREE.LoopOnce);
            return true;
        }
        return false;
    }
    
    slide() {
        if (!this.isJumping && !this.isSliding && !this.isDead) {
            this.isSliding = true;
            this.playAction('slide', 0.12, THREE.LoopOnce);
            setTimeout(() => {
                if (this.isSliding) {
                    this.isSliding = false;
                    if (!this.isJumping && !this.isDead) {
                        this.playAction('run', 0.2);
                    }
                }
            }, 750);
            return true;
        }
        return false;
    }
    
    moveLeft() {
        if (this.lane > 0 && !this.isDead) {
            this.lane--;
            this.targetX = (this.lane - 1) * 3;
            if (this.onDodge) this.onDodge();
            return true;
        }
        return false;
    }
    
    moveRight() {
        if (this.lane < 2 && !this.isDead) {
            this.lane++;
            this.targetX = (this.lane - 1) * 3;
            if (this.onDodge) this.onDodge();
            return true;
        }
        return false;
    }

    playDeath(callback) {
        this.isDead = true;
        this.playAction('death', 0.15, THREE.LoopOnce);
        setTimeout(() => {
            if (callback) callback();
        }, 950);
    }
}

// ============================================
// 8. POWER-UP & COLLECTIBLES MANAGER
// ============================================

class PowerUpManager {
    constructor(player, audioSynth) {
        this.player = player;
        this.audioSynth = audioSynth;
        this.activePowerUps = {};
        this.multiplier = 1.0;
        this.isHyperBoost = false;
        this.powerUpsUsedCount = 0;
        this.magnetRadius = 11.0;
    }

    reset() {
        this.activePowerUps = {};
        this.multiplier = 1.0;
        this.isHyperBoost = false;
        this.powerUpsUsedCount = 0;
        this.player.setShieldVisible(false);
        this.player.setBoostVisible(false);
        this.updateHUD();
    }

    activatePowerUp(type) {
        this.powerUpsUsedCount++;
        this.audioSynth.playPowerUpCollect();

        let duration = 12.0;
        let icon = '⚡';
        let color = '#FF6B9D';

        switch (type) {
            case 'shield':
                duration = 15.0;
                icon = '🛡️';
                color = '#00F5FF';
                this.player.setShieldVisible(true);
                break;
            case 'magnet':
                duration = 12.0;
                icon = '🧲';
                color = '#FF007F';
                break;
            case 'multiplier':
                duration = 12.0;
                icon = '✨';
                color = '#FFD700';
                this.multiplier = 2.0;
                break;
            case 'boost':
                duration = 6.0;
                icon = '🚀';
                color = '#00FF88';
                this.isHyperBoost = true;
                this.player.setBoostVisible(true);
                break;
        }

        this.activePowerUps[type] = {
            type,
            name: type.toUpperCase(),
            icon,
            color,
            maxDuration: duration,
            remaining: duration
        };

        this.updateHUD();
    }

    hasShield() {
        return !!this.activePowerUps['shield'];
    }

    consumeShield() {
        if (this.activePowerUps['shield']) {
            delete this.activePowerUps['shield'];
            this.player.setShieldVisible(false);
            this.audioSynth.playShieldBreak();
            this.updateHUD();
            return true;
        }
        return false;
    }

    hasMagnet() {
        return !!this.activePowerUps['magnet'];
    }

    update(deltaTime) {
        let changed = false;

        for (const type in this.activePowerUps) {
            const p = this.activePowerUps[type];
            p.remaining -= deltaTime;

            if (p.remaining <= 0) {
                delete this.activePowerUps[type];
                changed = true;

                if (type === 'shield') this.player.setShieldVisible(false);
                if (type === 'multiplier') this.multiplier = 1.0;
                if (type === 'boost') {
                    this.isHyperBoost = false;
                    this.player.setBoostVisible(false);
                }
            }
        }

        this.updateHUD();
    }

    updateHUD() {
        const container = document.getElementById('activePowerUpsContainer');
        const multPill = document.getElementById('multiplierPill');
        if (!container) return;

        if (multPill) {
            multPill.style.display = this.multiplier > 1 ? 'flex' : 'none';
        }

        let html = '';
        for (const type in this.activePowerUps) {
            const p = this.activePowerUps[type];
            const pct = Math.max(0, (p.remaining / p.maxDuration) * 100);
            html += `
                <div class="powerup-pill">
                    <div class="powerup-icon-circle" style="background: ${p.color};">${p.icon}</div>
                    <div class="powerup-meta">
                        <span class="powerup-name">${p.name}</span>
                        <div class="powerup-bar-bg">
                            <div class="powerup-bar-fill" style="width: ${pct}%; background: ${p.color};"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    }
}

// ============================================
// 8.5 INTERACTIVE MATH PORTALS & SWARM MANAGER
// ============================================

class MathPortalUtils {
    static generateTexture(text, isPositive, op) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 384;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 512, 384);

        // Rounded glass container background
        ctx.save();
        ctx.beginPath();
        const r = 36;
        if (ctx.roundRect) {
            ctx.roundRect(16, 16, 480, 352, r);
        } else {
            ctx.rect(16, 16, 480, 352);
        }
        
        // Gradient fill
        const grad = ctx.createLinearGradient(0, 0, 0, 384);
        if (isPositive) {
            grad.addColorStop(0, 'rgba(0, 245, 255, 0.55)');
            grad.addColorStop(1, 'rgba(0, 255, 136, 0.35)');
        } else {
            grad.addColorStop(0, 'rgba(255, 82, 82, 0.55)');
            grad.addColorStop(1, 'rgba(255, 154, 86, 0.35)');
        }
        ctx.fillStyle = grad;
        ctx.fill();

        // Glowing border
        ctx.lineWidth = 14;
        ctx.strokeStyle = isPositive ? 'rgba(0, 255, 200, 0.95)' : 'rgba(255, 80, 80, 0.95)';
        ctx.shadowColor = isPositive ? '#00FFFF' : '#FF5252';
        ctx.shadowBlur = 24;
        ctx.stroke();
        ctx.restore();

        // Inner holographic lines
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 3;
        for (let y = 50; y < 340; y += 24) {
            ctx.beginPath();
            ctx.moveTo(32, y);
            ctx.lineTo(480, y);
            ctx.stroke();
        }
        ctx.restore();

        // Big Main Equation Text
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '900 120px "Outfit", sans-serif';
        ctx.shadowColor = isPositive ? '#00FF88' : '#FF0055';
        ctx.shadowBlur = 32;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(text, 256, 175);

        // Subtitle badge
        ctx.font = '700 32px "Outfit", sans-serif';
        ctx.fillStyle = isPositive ? '#00FFFF' : '#FFAA88';
        ctx.shadowBlur = 12;
        const subtext = isPositive ? (op === '×' ? 'SQUAD MULTIPLIER' : 'RECRUIT CLONES') : (op === '÷' ? 'SQUAD DIVIDE' : 'SQUAD REDUCTION');
        ctx.fillText(subtext, 256, 280);
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    static generateBalancedPair(difficulty = 0) {
        const positiveOps = [
            { op: '+', val: 3, text: '+3', isPositive: true },
            { op: '+', val: 5, text: '+5', isPositive: true },
            { op: '+', val: 8, text: '+8', isPositive: true },
            { op: '+', val: 12, text: '+12', isPositive: true },
            { op: '×', val: 2, text: '×2', isPositive: true },
            { op: '×', val: 3, text: '×3', isPositive: true }
        ];

        const negativeOps = [
            { op: '-', val: 2, text: '-2', isPositive: false },
            { op: '-', val: 4, text: '-4', isPositive: false },
            { op: '-', val: 6, text: '-6', isPositive: false },
            { op: '÷', val: 2, text: '÷2', isPositive: false }
        ];

        const choiceType = Math.random();
        let gateA, gateB;

        if (choiceType < 0.45) {
            const addVal = 4 + Math.floor(Math.random() * 6);
            gateA = { op: '+', val: addVal, text: `+${addVal}`, isPositive: true };
            gateB = { op: '×', val: 2, text: '×2', isPositive: true };
        } else if (choiceType < 0.8) {
            gateA = positiveOps[Math.floor(Math.random() * positiveOps.length)];
            gateB = negativeOps[Math.floor(Math.random() * negativeOps.length)];
        } else {
            const v1 = 3 + Math.floor(Math.random() * 4);
            const v2 = 7 + Math.floor(Math.random() * 6);
            gateA = { op: '+', val: v1, text: `+${v1}`, isPositive: true };
            gateB = { op: '+', val: v2, text: `+${v2}`, isPositive: true };
        }

        return Math.random() < 0.5 ? [gateA, gateB] : [gateB, gateA];
    }
}

class MathPortal {
    constructor(lane, z, opData) {
        this.lane = lane; // 0 (Left: -3), 1 (Center: 0), 2 (Right: +3)
        this.x = (lane - 1) * 3;
        this.z = z;
        this.opData = opData;
        this.triggered = false;
        this.group = new THREE.Group();
        this.group.position.set(this.x, 0, this.z);

        this.initMesh();
    }

    initMesh() {
        const isPos = this.opData.isPositive;
        const mainColor = isPos ? 0x00F5FF : 0xFF3366;

        // Arch Frame
        const archMat = MaterialGenerator.createNeonMaterial(mainColor, 1.2);
        
        const colGeo = new THREE.BoxGeometry(0.2, 3.2, 0.2);
        const leftCol = new THREE.Mesh(colGeo, archMat);
        leftCol.position.set(-1.3, 1.6, 0);
        
        const rightCol = new THREE.Mesh(colGeo, archMat);
        rightCol.position.set(1.3, 1.6, 0);

        const topGeo = new THREE.BoxGeometry(2.8, 0.25, 0.25);
        const topBar = new THREE.Mesh(topGeo, archMat);
        topBar.position.set(0, 3.2, 0);

        this.group.add(leftCol, rightCol, topBar);

        // Forcefield Plane
        const texture = MathPortalUtils.generateTexture(this.opData.text, isPos, this.opData.op);
        const planeGeo = new THREE.PlaneGeometry(2.5, 3.0);
        this.planeMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeo, this.planeMat);
        plane.position.set(0, 1.65, 0);
        this.group.add(plane);

        this.box = new THREE.Box3();
    }

    update(deltaTime, elapsedTime) {
        if (this.planeMat) {
            this.planeMat.opacity = 0.85 + Math.sin(elapsedTime * 4.0 + this.lane) * 0.1;
        }
        this.box.setFromCenterAndSize(
            new THREE.Vector3(this.x, 1.6, this.z),
            new THREE.Vector3(2.6, 3.2, 1.5)
        );
    }
}

class SwarmManager {
    constructor(player, scene, audioSynth) {
        this.player = player;
        this.scene = scene;
        this.audioSynth = audioSynth;
        this.swarmCount = 1;
        this.maxSwarm = 30;
        this.clonePool = [];
        this.activeCharacterKey = 'robot';
        this.swarmGroup = new THREE.Group();
        this.scene.add(this.swarmGroup);

        this.initPool();
    }

    initPool() {
        for (let i = 0; i < this.maxSwarm; i++) {
            const clone = this.createCloneAvatar(i);
            clone.mesh.visible = false;
            this.swarmGroup.add(clone.mesh);
            this.clonePool.push(clone);
        }
    }

    createCloneAvatar(idx) {
        const group = new THREE.Group();

        // High-performance procedural cyber avatar for clone
        const bodyGeo = new THREE.BoxGeometry(0.48, 0.72, 0.35);
        const bodyMat = MaterialGenerator.createNeonMaterial(0xFFB800, 0.75);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.85;
        group.add(body);

        const visorGeo = new THREE.BoxGeometry(0.32, 0.12, 0.1);
        const visorMat = MaterialGenerator.createGlowMaterial(0x00FFFF, 4.0);
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.35, 0.18);
        group.add(visor);

        const headGeo = new THREE.BoxGeometry(0.38, 0.36, 0.36);
        const headMat = MaterialGenerator.createNeonMaterial(0xFFB800, 0.65);
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.35;
        group.add(head);

        const limbGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 6);
        const limbMat = MaterialGenerator.createNeonMaterial(0xFF007F, 0.6);

        const leftArm = new THREE.Mesh(limbGeo, limbMat);
        leftArm.position.set(-0.35, 0.85, 0);
        const rightArm = new THREE.Mesh(limbGeo, limbMat);
        rightArm.position.set(0.35, 0.85, 0);

        const leftLeg = new THREE.Mesh(limbGeo, limbMat);
        leftLeg.position.set(-0.16, 0.3, 0);
        const rightLeg = new THREE.Mesh(limbGeo, limbMat);
        rightLeg.position.set(0.16, 0.3, 0);

        group.add(leftArm, rightArm, leftLeg, rightLeg);

        return {
            mesh: group,
            body,
            head,
            visor,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            bodyMat,
            visorMat,
            limbMat,
            currentPos: new THREE.Vector3(),
            targetPos: new THREE.Vector3(),
            index: idx
        };
    }

    syncCharacter(charKey) {
        this.activeCharacterKey = charKey;
        const themes = {
            robot: { body: 0xFFB800, visor: 0x00FFFF, limb: 0xFF007F },
            soldier: { body: 0x4477AA, visor: 0x00FFCC, limb: 0x223355 },
            xbot: { body: 0x00FFFF, visor: 0xFF00AA, limb: 0x7700FF },
            droid: { body: 0x00FF88, visor: 0xFF007F, limb: 0x00F5FF }
        };
        const theme = themes[charKey] || themes.robot;

        this.clonePool.forEach(clone => {
            if (clone.bodyMat && clone.bodyMat.color) clone.bodyMat.color.setHex(theme.body);
            if (clone.visorMat && clone.visorMat.uniforms && clone.visorMat.uniforms.color) {
                clone.visorMat.uniforms.color.value.setHex(theme.visor);
            } else if (clone.visorMat && clone.visorMat.color) {
                clone.visorMat.color.setHex(theme.visor);
            }
            if (clone.limbMat && clone.limbMat.color) clone.limbMat.color.setHex(theme.limb);
        });
    }

    applyOperation(op, val) {
        const prevCount = this.swarmCount;
        let newCount = prevCount;

        if (op === '+') {
            newCount = prevCount + val;
        } else if (op === '-') {
            newCount = Math.max(1, prevCount - val);
        } else if (op === '×' || op === '*') {
            newCount = prevCount * val;
        } else if (op === '÷' || op === '/') {
            newCount = Math.max(1, Math.floor(prevCount / val));
        }

        this.swarmCount = MathUtils.clamp(newCount, 1, this.maxSwarm);

        const isPositive = this.swarmCount >= prevCount;
        if (isPositive) {
            this.audioSynth.playMathGatePositive();
        } else {
            this.audioSynth.playMathGateNegative();
        }

        const pill = document.getElementById('swarmPill');
        if (pill) {
            pill.classList.remove('pop-positive', 'pop-negative');
            void pill.offsetWidth;
            pill.classList.add(isPositive ? 'pop-positive' : 'pop-negative');
            setTimeout(() => {
                pill.classList.remove('pop-positive', 'pop-negative');
            }, 350);
        }

        this.updateCloneVisibility();
        return this.swarmCount - prevCount;
    }

    absorbHit() {
        if (this.swarmCount > 1) {
            const lost = Math.min(this.swarmCount - 1, Math.max(1, Math.floor(this.swarmCount * 0.4)));
            this.swarmCount -= lost;
            this.audioSynth.playClonePop();

            const pill = document.getElementById('swarmPill');
            if (pill) {
                pill.classList.add('pop-negative');
                setTimeout(() => pill.classList.remove('pop-negative'), 300);
            }

            this.updateCloneVisibility();
            return true;
        }
        return false;
    }

    updateCloneVisibility() {
        const activeClonesNeeded = this.swarmCount - 1;

        for (let i = 0; i < this.maxSwarm; i++) {
            const clone = this.clonePool[i];
            if (i < activeClonesNeeded) {
                if (!clone.mesh.visible) {
                    clone.mesh.visible = true;
                    clone.mesh.position.copy(this.player.mesh.position);
                    clone.currentPos.copy(this.player.mesh.position);
                }
            } else {
                clone.mesh.visible = false;
            }
        }
    }

    update(deltaTime, leaderPos, speed, isJumping, isSliding, rollAngle) {
        if (this.player.inMenuPreview || this.player.isDead) {
            this.clonePool.forEach(c => c.mesh.visible = false);
            return;
        }

        const activeClonesNeeded = this.swarmCount - 1;
        const t = Date.now() * 0.014 * speed;

        for (let i = 0; i < activeClonesNeeded; i++) {
            const clone = this.clonePool[i];
            clone.mesh.visible = true;

            // V-Formation wedge offsets
            const r = Math.floor(i / 2) + 1;
            const s = (i % 2 === 0) ? -1 : 1;
            const xOffset = s * (0.48 + r * 0.34);
            const zOffset = r * 0.95;

            clone.targetPos.set(
                leaderPos.x + xOffset,
                leaderPos.y,
                leaderPos.z + zOffset
            );

            clone.currentPos.x = MathUtils.lerp(clone.currentPos.x, clone.targetPos.x, deltaTime * 14);
            clone.currentPos.y = MathUtils.lerp(clone.currentPos.y, clone.targetPos.y, deltaTime * 18);
            clone.currentPos.z = MathUtils.lerp(clone.currentPos.z, clone.targetPos.z, deltaTime * 16);

            clone.mesh.position.copy(clone.currentPos);

            clone.mesh.rotation.z = rollAngle;
            clone.mesh.rotation.y = Math.PI - rollAngle * 0.4;

            if (isSliding) {
                clone.mesh.scale.y = MathUtils.lerp(clone.mesh.scale.y, 0.45, deltaTime * 18);
                clone.mesh.scale.z = MathUtils.lerp(clone.mesh.scale.z, 1.25, deltaTime * 18);
                clone.mesh.rotation.x = 0.5;
            } else {
                clone.mesh.scale.y = MathUtils.lerp(clone.mesh.scale.y, 1.0, deltaTime * 18);
                clone.mesh.scale.z = MathUtils.lerp(clone.mesh.scale.z, 1.0, deltaTime * 18);
                clone.mesh.rotation.x = isJumping ? -0.25 : 0;
            }

            if (!isJumping && !isSliding) {
                const phase = t + i * 0.5;
                clone.leftArm.rotation.x = Math.sin(phase) * 0.7;
                clone.rightArm.rotation.x = -Math.sin(phase) * 0.7;
                clone.leftLeg.rotation.x = -Math.sin(phase) * 0.8;
                clone.rightLeg.rotation.x = Math.sin(phase) * 0.8;
            }
        }
    }

    checkCoinVacuum(collectibles, deltaTime, onCollectCoin) {
        if (this.swarmCount <= 1) return;

        const activeClonesNeeded = this.swarmCount - 1;
        const vacuumRadius = 1.35;

        for (let i = 0; i < activeClonesNeeded; i++) {
            const clone = this.clonePool[i];
            if (!clone.mesh.visible) continue;

            const cPos = clone.currentPos;

            for (const item of collectibles) {
                if (!item.userData.isCollectible) continue;
                const dist = cPos.distanceTo(item.position);

                if (dist < vacuumRadius) {
                    item.parent.remove(item);
                    item.userData.isCollectible = false;

                    if (onCollectCoin) {
                        onCollectCoin(item.position.x);
                    }
                }
            }
        }
    }

    reset() {
        this.swarmCount = 1;
        this.clonePool.forEach(c => c.mesh.visible = false);
    }
}

// ============================================
// 9. TILE & HAZARD MANAGER
// ============================================

class TileManager {
    constructor(scene, seedEngine, themeEngine) {
        this.scene = scene;
        this.seedEngine = seedEngine;
        this.themeEngine = themeEngine;
        this.tiles = [];
        this.tileLength = 20;
        this.activeTileCount = 16;
        this.gameMode = 'classic';
        this.animatedObstacles = [];
        this.mathPortals = [];
    }

    setGameMode(mode) {
        this.gameMode = mode;
    }
    
    generateTile(zPosition, tileIndex) {
        const tileGroup = new THREE.Group();
        const difficulty = Math.min(tileIndex * 0.015, 1.0);
        const colors = this.themeEngine.getCurrentColors();
        
        // Base platform
        const platformGeo = MeshGenerator.createPlatform(9, this.tileLength, 0.5);
        const platformMat = MaterialGenerator.createNeonMaterial(colors.platformColor, 0.35);
        const platform = new THREE.Mesh(platformGeo, platformMat);
        platform.position.y = -0.25;
        tileGroup.add(platform);
        
        // Grid pattern
        const gridMat = MaterialGenerator.createGridMaterial(colors.gridColor, 2.0);
        const gridGeo = new THREE.PlaneGeometry(9, this.tileLength);
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = 0.01;
        tileGroup.add(grid);
        
        // Add obstacles (Zen mode has NO obstacles)
        let hasMathPortal = false;
        if (tileIndex > 2 && tileIndex % 3 === 0) {
            // Spawn Dual Math Gate Pair
            hasMathPortal = true;
            const lanes = Math.random() < 0.5 ? [0, 1] : [1, 2];
            const pair = MathPortalUtils.generateBalancedPair(difficulty);

            const portalA = new MathPortal(lanes[0], zPosition, pair[0]);
            const portalB = new MathPortal(lanes[1], zPosition, pair[1]);

            tileGroup.add(portalA.group);
            tileGroup.add(portalB.group);
            this.mathPortals.push(portalA, portalB);
        }

        if (this.gameMode !== 'zen' && tileIndex > 2 && !hasMathPortal) {
            const spawnChance = 0.35 + difficulty * 0.45;
            if (Math.random() < spawnChance) {
                this.addObstacles(tileGroup, difficulty);
            }
        }
        
        // Add collectibles & power-ups
        if (tileIndex > 1) {
            this.addCollectibles(tileGroup, tileIndex);
        }
        
        // Add decorations & ambient particles
        this.addDecorations(tileGroup, tileIndex);
        
        tileGroup.position.z = zPosition;
        this.scene.add(tileGroup);
        this.tiles.push(tileGroup);
        
        return tileGroup;
    }
    
    addObstacles(tileGroup, difficulty) {
        const colors = this.themeEngine.getCurrentColors();
        const obstacleType = this.seedEngine.randRange(0, 5);
        const lane = this.seedEngine.randRange(0, 2);
        const xPos = (lane - 1) * 3;
        const zOffset = this.seedEngine.randRangeFloat(-6, 6);
        
        switch (obstacleType) {
            case 0: { // Spikes
                const spikeGeo = MeshGenerator.createSpikeObstacle(0.55, 4);
                const spikeMat = MaterialGenerator.createNeonMaterial(colors.obstacleColor, 0.8);
                const spike = new THREE.Mesh(spikeGeo, spikeMat);
                spike.position.set(xPos, 0.5, zOffset);
                spike.userData.isObstacle = true;
                tileGroup.add(spike);
                break;
            }
            case 1: { // Arch decoration
                const archGeo = MeshGenerator.createArch(2.6, 2.2, 3);
                const archMat = MaterialGenerator.createNeonMaterial(colors.accentColor, 0.7);
                const arch = new THREE.Mesh(archGeo, archMat);
                arch.position.set(xPos, 1.5, zOffset);
                arch.rotation.y = Math.PI / 2;
                tileGroup.add(arch);
                break;
            }
            case 2: { // Ramp
                const rampGeo = MeshGenerator.createRamp(2.2, 4.5, 0.9);
                const rampMat = MaterialGenerator.createNeonMaterial(0xffcc00, 0.6);
                const ramp = new THREE.Mesh(rampGeo, rampMat);
                ramp.position.set(xPos, 0.45, zOffset);
                tileGroup.add(ramp);
                break;
            }
            case 3: { // Slide Gate
                const gate = MeshGenerator.createHighSlideGate(8.8);
                gate.position.set(0, 0, zOffset);
                gate.userData.isObstacle = true;
                tileGroup.add(gate);
                break;
            }
            case 4: { // Oscillating Laser Beam
                const laser = MeshGenerator.createOscillatingLaser(8.8);
                laser.position.set(0, 0, zOffset);
                laser.userData.isObstacle = true;
                tileGroup.add(laser);
                this.animatedObstacles.push(laser);
                break;
            }
            case 5: { // Rotating Helix Barrier
                const helix = MeshGenerator.createRotatingHelix(2.0, 0.28);
                helix.position.set(xPos, 0, zOffset);
                helix.userData.isObstacle = true;
                tileGroup.add(helix);
                this.animatedObstacles.push(helix);
                break;
            }
        }
    }
    
    addCollectibles(tileGroup, tileIndex) {
        const numItems = this.seedEngine.randRange(3, 5);
        const pattern = this.seedEngine.randRange(0, 2);
        const lane = (this.seedEngine.randRange(0, 2) - 1) * 3;

        const isTimeShard = this.gameMode === 'timeAttack' && Math.random() < 0.4;
        const isPowerUp = tileIndex % 4 === 0 && Math.random() < 0.55;

        for (let i = 0; i < numItems; i++) {
            let item;

            if (i === 0 && isPowerUp) {
                const types = ['shield', 'magnet', 'multiplier', 'boost'];
                const pType = types[this.seedEngine.randRange(0, types.length - 1)];
                item = MeshGenerator.createPowerUp(pType);
            } else if (isTimeShard && i === Math.floor(numItems / 2)) {
                item = MeshGenerator.createChronoShard();
            } else {
                item = MeshGenerator.createCoin();
            }
            
            switch (pattern) {
                case 0:
                    item.position.set(lane, 1.0, -8 + i * 2.5);
                    break;
                case 1:
                    item.position.set(lane, 1.0 + Math.sin((i / numItems) * Math.PI) * 2.2, -8 + i * 2.5);
                    break;
                case 2:
                    item.position.set((i % 2 === 0 ? 1 : -1) * 2.0, 1.0, -8 + i * 2.5);
                    break;
            }
            
            tileGroup.add(item);
        }
    }
    
    addDecorations(tileGroup, tileIndex) {
        if (tileIndex % 3 === 0) {
            const particleData = MeshGenerator.createParticleEmitter(24, 10);
            const particleMat = new THREE.PointsMaterial({
                color: 0x00f5ff,
                size: 0.12,
                transparent: true,
                opacity: 0.5
            });
            const particles = new THREE.Points(particleData.geometry, particleMat);
            particles.position.set(0, 2.5, 0);
            tileGroup.add(particles);
        }
    }
    
    update(playerZ, deltaTime, time) {
        // Update animated obstacles
        for (let i = this.animatedObstacles.length - 1; i >= 0; i--) {
            const obs = this.animatedObstacles[i];
            if (!obs.parent) {
                this.animatedObstacles.splice(i, 1);
                continue;
            }

            if (obs.userData.isLaser) {
                const sweep = Math.sin(time * obs.userData.speed + obs.userData.timeOffset) * obs.userData.amplitude;
                obs.userData.beamMesh.position.y = obs.userData.baseY + sweep;
            } else if (obs.userData.isRotatingHelix) {
                obs.userData.ring.rotation.z += obs.userData.rotationSpeed * deltaTime;
            }
        }

        // Update active Math Portals
        for (let i = this.mathPortals.length - 1; i >= 0; i--) {
            const portal = this.mathPortals[i];
            portal.update(deltaTime, time);
            if (portal.z > playerZ + 25) {
                this.mathPortals.splice(i, 1);
            }
        }

        // Remove old tiles behind player
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            if (this.tiles[i].position.z > playerZ + 25) {
                this.scene.remove(this.tiles[i]);
                this.tiles.splice(i, 1);
            }
        }
        
        // Spawn upcoming tiles
        const lastTile = this.tiles[this.tiles.length - 1];
        if (lastTile && lastTile.position.z > playerZ - this.activeTileCount * this.tileLength) {
            this.generateTile(
                lastTile.position.z - this.tileLength,
                Math.floor(Math.abs(lastTile.position.z) / this.tileLength) + 1
            );
        }
    }
    
    getCollidables() {
        const collidables = [];
        this.tiles.forEach(tile => {
            tile.children.forEach(child => {
                if (child.userData && child.userData.isObstacle) {
                    collidables.push(child);
                }
            });
        });
        return collidables;
    }
    
    getCollectibles() {
        const collectibles = [];
        this.tiles.forEach(tile => {
            tile.children.forEach(child => {
                if (child.userData && child.userData.isCollectible) {
                    collectibles.push(child);
                }
            });
        });
        return collectibles;
    }

    getMathPortals() {
        return this.mathPortals.filter(p => !p.triggered);
    }
}

// ============================================
// 10. MAIN GAME CONTROLLER
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.player = null;
        this.tileManager = null;
        this.seedEngine = null;
        this.themeEngine = null;
        this.audioSynth = null;
        this.powerUpManager = null;
        this.swarmManager = null;
        this.screenShake = new ScreenShakeController();
        
        // Post-processing
        this.composer = null;
        this.bloomPass = null;
        this.warpPass = null;
        this.bloomQuality = 'high'; // 'high', 'medium', 'off'
        this.selectedMusic = 'synthwave'; // 'synthwave', 'darksynth', 'chiptune', 'zen'
        
        // Game stats
        this.score = 0;
        this.distance = 0;
        this.speed = 1.0;
        this.baseSpeed = 16;
        this.isPlaying = false;
        this.isPaused = false;
        this.clock = new THREE.Clock();

        // Game mode & timer
        this.gameMode = 'classic'; // 'classic', 'timeAttack', 'zen'
        this.timeRemaining = 30.0;
        this.coinsCollected = 0;
        this.selectedCharacter = 'robot';

        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x030314);
        this.scene.fog = new THREE.FogExp2(0x030314, 0.016);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(-1.65, 1.15, 4.8);
        this.camera.lookAt(-1.65, 0.85, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.95);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x00ffff, 1.4, 16);
        pointLight.position.set(0, 2.5, 2.0);
        this.scene.add(pointLight);
        
        // Subsystems
        this.seedEngine = new SeedEngine(Math.floor(Math.random() * 1000000));
        this.themeEngine = new ThemeEngine(this.scene);
        this.audioSynth = new ProceduralMusicSynth();
        this.player = new Player(this.scene);
        this.powerUpManager = new PowerUpManager(this.player, this.audioSynth);
        this.swarmManager = new SwarmManager(this.player, this.scene, this.audioSynth);
        this.tileManager = new TileManager(this.scene, this.seedEngine, this.themeEngine);

        // Screen Shake Callbacks
        this.player.onLand = () => {
            this.screenShake.addTrauma(0.2);
        };
        this.player.onDodge = () => {
            this.screenShake.addTrauma(0.08);
        };
        
        // Initial tiles along forward track (-Z direction)
        for (let i = 0; i < 10; i++) {
            this.tileManager.generateTile(-i * this.tileManager.tileLength, i);
        }
        
        // Initialize Post-Processing Pipeline
        this.initPostProcessing();

        this.animate();
    }

    initPostProcessing() {
        if (typeof THREE.EffectComposer === 'undefined' || typeof THREE.UnrealBloomPass === 'undefined') {
            console.warn('Post-processing libraries not loaded, fallback to WebGLRenderer.');
            return;
        }

        try {
            const width = window.innerWidth;
            const height = window.innerHeight;

            this.composer = new THREE.EffectComposer(this.renderer);
            const renderPass = new THREE.RenderPass(this.scene, this.camera);
            this.composer.addPass(renderPass);

            // Unreal Bloom Pass
            this.bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(width, height),
                1.4,   // strength
                0.45,  // radius
                0.22   // threshold
            );
            this.composer.addPass(this.bloomPass);

            // Custom Cyber Warp & Chromatic Aberration Shader Pass
            this.warpPass = new THREE.ShaderPass(CyberWarpShader);
            this.warpPass.renderToScreen = true;
            this.composer.addPass(this.warpPass);

            this.setBloomQuality(this.bloomQuality);
        } catch (e) {
            console.warn('Could not initialize post-processing:', e);
            this.composer = null;
        }
    }

    setBloomQuality(quality) {
        this.bloomQuality = quality;
        const btn = document.getElementById('bloomToggleBtn');
        if (btn) {
            btn.textContent = quality === 'high' ? '✨ Bloom Ultra' : (quality === 'medium' ? '🌟 Bloom Med' : '⭕ Bloom Off');
        }

        document.querySelectorAll('#bloomTabs .pill-tab').forEach(tab => {
            if (tab.dataset.bloom === quality) tab.classList.add('active');
            else tab.classList.remove('active');
        });

        if (!this.bloomPass) return;

        if (quality === 'high') {
            this.bloomPass.enabled = true;
            this.bloomPass.strength = 0.92;
            this.bloomPass.radius = 0.42;
            this.bloomPass.threshold = 0.35;
        } else if (quality === 'medium') {
            this.bloomPass.enabled = true;
            this.bloomPass.strength = 0.55;
            this.bloomPass.radius = 0.3;
            this.bloomPass.threshold = 0.45;
        } else {
            this.bloomPass.enabled = false;
        }
    }

    setMusicTrack(track) {
        this.selectedMusic = track;
        this.audioSynth.setMusicTrack(track);

        const btn = document.getElementById('musicTrackBtn');
        const trackNames = {
            synthwave: '🎵 Horizon',
            darksynth: '⚡ Darksynth',
            chiptune: '👾 8-Bit',
            zen: '🌌 Ambient'
        };
        if (btn) btn.textContent = trackNames[track] || '🎵 Music';

        // Sync tab states across Start and Pause screens
        document.querySelectorAll('#musicTabs .pill-tab, #pauseMusicTabs .pill-tab').forEach(tab => {
            if (tab.dataset.music === track) tab.classList.add('active');
            else tab.classList.remove('active');
        });
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.isPaused) {
                if (e.code === 'KeyP' || e.code === 'Escape') this.togglePause();
                return;
            }
            
            switch (e.code) {
                case 'Space':
                case 'KeyW':
                case 'ArrowUp':
                    if (this.player.jump()) {
                        this.audioSynth.playJumpSound();
                    }
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.player.slide();
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.player.moveLeft();
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.player.moveRight();
                    break;
                case 'KeyP':
                case 'Escape':
                    this.togglePause();
                    break;
            }
        });

        // Touch swipe gestures for mobile
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        window.addEventListener('touchstart', (e) => {
            if (!this.isPlaying || this.isPaused) return;
            const touch = e.changedTouches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (!this.isPlaying || this.isPaused) return;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            const dt = Date.now() - touchStartTime;

            if (dt < 400) {
                const absDx = Math.abs(dx);
                const absDy = Math.abs(dy);

                if (Math.max(absDx, absDy) > 25) {
                    if (absDx > absDy) {
                        if (dx > 0) this.player.moveRight();
                        else this.player.moveLeft();
                    } else {
                        if (dy < 0) {
                            if (this.player.jump()) this.audioSynth.playJumpSound();
                        } else {
                            this.player.slide();
                        }
                    }
                }
            }
        }, { passive: true });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            if (this.composer) {
                this.composer.setSize(window.innerWidth, window.innerHeight);
            }
        });
        
        // Character Selection Tabs
        const characterBios = {
            robot: { name: 'Volt-7 Robot', desc: 'Expressive Rig · Emissive Visor · High Agility' },
            soldier: { name: 'Vanguard Commando', desc: 'Heavy Exo-Suit · Tactical · High Momentum' },
            xbot: { name: 'X-9 Cyber Android', desc: 'Athletic Synth Humanoid · Fast Reflexes' },
            droid: { name: 'Neo Procedural Droid', desc: 'Pure Mathematical Geometry · Quantum Core' }
        };

        document.querySelectorAll('#characterTabs .pill-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#characterTabs .pill-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const charKey = tab.dataset.character;
                this.selectedCharacter = charKey;
                this.player.setCharacter(charKey);
                if (this.swarmManager) this.swarmManager.syncCharacter(charKey);

                const bio = characterBios[charKey];
                if (bio) {
                    const bioName = document.getElementById('charBioName');
                    const bioDesc = document.getElementById('charBioDesc');
                    if (bioName) bioName.textContent = bio.name;
                    if (bioDesc) bioDesc.textContent = bio.desc;
                }
            });
        });

        // Mode & Theme selection tabs
        document.querySelectorAll('#modeTabs .pill-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#modeTabs .pill-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.gameMode = tab.dataset.mode;
            });
        });

        document.querySelectorAll('#themeTabs .pill-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#themeTabs .pill-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.themeEngine.setTheme(tab.dataset.theme, true);
            });
        });

        // Music selection tabs (Start Screen & Pause Screen)
        document.querySelectorAll('#musicTabs .pill-tab, #pauseMusicTabs .pill-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.setMusicTrack(tab.dataset.music);
            });
        });

        // Bloom quality tabs
        document.querySelectorAll('#bloomTabs .pill-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.setBloomQuality(tab.dataset.bloom);
            });
        });

        // HUD Quick Action Buttons
        const musicList = ['synthwave', 'darksynth', 'chiptune', 'zen'];
        const bloomList = ['high', 'medium', 'off'];

        const musicBtn = document.getElementById('musicTrackBtn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                const curIdx = musicList.indexOf(this.selectedMusic);
                const nextTrack = musicList[(curIdx + 1) % musicList.length];
                this.setMusicTrack(nextTrack);
            });
        }

        const bloomBtn = document.getElementById('bloomToggleBtn');
        if (bloomBtn) {
            bloomBtn.addEventListener('click', () => {
                const curIdx = bloomList.indexOf(this.bloomQuality);
                const nextBloom = bloomList[(curIdx + 1) % bloomList.length];
                this.setBloomQuality(nextBloom);
            });
        }

        // UI Buttons
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        document.getElementById('menuButton').addEventListener('click', () => this.showStartScreen());
        document.getElementById('resumeButton').addEventListener('click', () => this.togglePause());
        document.getElementById('pauseRestartButton').addEventListener('click', () => this.restartGame());
        
        document.getElementById('pauseToggleBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('audioToggleBtn').addEventListener('click', () => {
            const isUnmuted = this.audioSynth.toggleMute();
            document.getElementById('audioToggleBtn').textContent = isUnmuted ? '🔊' : '🔇';
        });
    }

    showStartScreen() {
        this.isPlaying = false;
        this.isPaused = false;
        this.audioSynth.stopMusic();
        this.player.inMenuPreview = true;
        this.player.reset();
        this.player.playAction('idle', 0.2);
        if (this.swarmManager) this.swarmManager.reset();

        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'flex';
    }

    togglePause() {
        if (!this.isPlaying) return;
        this.isPaused = !this.isPaused;
        const pauseScreen = document.getElementById('pauseScreen');
        pauseScreen.style.display = this.isPaused ? 'flex' : 'none';

        if (this.isPaused) {
            this.audioSynth.stopMusic();
        } else {
            this.clock.start();
            this.audioSynth.startMusic(this.gameMode);
        }
    }
    
    startGame() {
        this.audioSynth.init();
        this.tileManager.setGameMode(this.gameMode);
        this.timeRemaining = 30.0;
        this.coinsCollected = 0;
        
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';

        const timerPill = document.getElementById('timerPill');
        if (timerPill) {
            timerPill.style.display = this.gameMode === 'timeAttack' ? 'flex' : 'none';
        }

        this.player.inMenuPreview = false;
        this.player.reset();
        this.player.playAction('run', 0.2);
        if (this.swarmManager) this.swarmManager.reset();

        this.isPlaying = true;
        this.isPaused = false;
        this.clock.start();
        this.audioSynth.startMusic(this.gameMode);
    }
    
    restartGame() {
        this.score = 0;
        this.distance = 0;
        this.speed = 1.0;
        this.timeRemaining = 30.0;
        this.coinsCollected = 0;
        
        this.player.inMenuPreview = false;
        this.player.reset();
        this.player.playAction('run', 0.2);
        this.powerUpManager.reset();
        if (this.swarmManager) this.swarmManager.reset();
        
        this.tileManager.tiles.forEach(tile => this.scene.remove(tile));
        this.tileManager.tiles = [];
        this.tileManager.animatedObstacles = [];
        this.tileManager.mathPortals = [];
        this.tileManager.setGameMode(this.gameMode);
        
        for (let i = 0; i < 10; i++) {
            this.tileManager.generateTile(-i * this.tileManager.tileLength, i);
        }
        
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('pauseScreen').style.display = 'none';
        document.getElementById('startScreen').style.display = 'none';

        const timerPill = document.getElementById('timerPill');
        if (timerPill) {
            timerPill.style.display = this.gameMode === 'timeAttack' ? 'flex' : 'none';
        }

        this.isPlaying = true;
        this.isPaused = false;
        this.clock.start();
        this.audioSynth.startMusic(this.gameMode);
    }
    
    gameOver(reason = 'Obstacle Impact') {
        this.isPlaying = false;
        this.audioSynth.stopMusic();

        document.getElementById('gameOverReason').textContent = reason;
        document.getElementById('finalScoreVal').textContent = Math.floor(this.score);
        document.getElementById('finalDistanceVal').textContent = `${Math.floor(this.distance)}m`;
        document.getElementById('finalCoinsVal').textContent = this.coinsCollected;
        document.getElementById('finalPowerUpsVal').textContent = this.powerUpManager.powerUpsUsedCount;
        
        document.getElementById('gameOverScreen').style.display = 'flex';
    }

    checkMathPortals() {
        if (!this.swarmManager) return;
        const portals = this.tileManager.getMathPortals();
        const playerPos = this.player.mesh.position;
        const playerBox = new THREE.Box3(
            new THREE.Vector3(playerPos.x - 0.7, playerPos.y, playerPos.z - 0.7),
            new THREE.Vector3(playerPos.x + 0.7, playerPos.y + 2.0, playerPos.z + 0.7)
        );

        for (const portal of portals) {
            if (playerBox.intersectsBox(portal.box)) {
                portal.triggered = true;
                portal.group.visible = false;
                this.swarmManager.applyOperation(portal.opData.op, portal.opData.val);
                this.screenShake.addTrauma(0.25);
                this.score += (portal.opData.isPositive ? 150 : 50) * this.powerUpManager.multiplier;
            }
        }
    }
    
    checkCollisions() {
        // Zen mode has no fail state
        if (this.gameMode === 'zen') return false;

        // Invulnerable during Hyper Boost
        if (this.powerUpManager.isHyperBoost) return false;

        const playerPos = this.player.mesh.position;
        const playerBox = new THREE.Box3(
            new THREE.Vector3(playerPos.x - 0.35, playerPos.y + (this.player.isSliding ? 0.05 : 0.15), playerPos.z - 0.35),
            new THREE.Vector3(playerPos.x + 0.35, playerPos.y + (this.player.isSliding ? 0.55 : 1.65), playerPos.z + 0.35)
        );
        
        const collidables = this.tileManager.getCollidables();
        for (const item of collidables) {
            if (item.userData.isSlideGate) {
                // If sliding, safe to pass under
                if (this.player.isSliding) continue;
            }

            const itemBox = new THREE.Box3().setFromObject(item);
            if (playerBox.intersectsBox(itemBox)) {
                // 1. Shield absorbs collision
                if (this.powerUpManager.hasShield()) {
                    this.powerUpManager.consumeShield();
                    this.screenShake.addTrauma(0.5);
                    item.position.y -= 10;
                    return false;
                }

                // 2. Swarm absorbs collision (Extra Life)
                if (this.swarmManager && this.swarmManager.absorbHit()) {
                    this.screenShake.addTrauma(0.45);
                    item.position.y -= 10;
                    return false;
                }

                // 3. Fatal Impact: trigger screen shake & chromatic flash
                this.screenShake.addTrauma(0.95);
                if (this.warpPass) {
                    this.warpPass.uniforms.uChromatic.value = 1.0;
                }
                return true;
            }
        }
        
        return false;
    }
    
    checkCollectibles(deltaTime) {
        const collectibles = this.tileManager.getCollectibles();
        const playerPos = this.player.mesh.position;
        const playerBox = new THREE.Box3(
            new THREE.Vector3(playerPos.x - 0.6, playerPos.y + 0.1, playerPos.z - 0.6),
            new THREE.Vector3(playerPos.x + 0.6, playerPos.y + 1.8, playerPos.z + 0.6)
        );
        const hasMagnet = this.powerUpManager.hasMagnet();
        
        for (const item of collectibles) {
            // Magnet pull physics
            if (hasMagnet) {
                const itemWorldPos = new THREE.Vector3();
                item.getWorldPosition(itemWorldPos);
                const dist = itemWorldPos.distanceTo(playerPos);

                if (dist < this.powerUpManager.magnetRadius) {
                    const dir = new THREE.Vector3().subVectors(playerPos, itemWorldPos).normalize();
                    item.position.add(dir.multiplyScalar(deltaTime * 24));
                }
            }

            const itemBox = new THREE.Box3().setFromObject(item);
            if (playerBox.intersectsBox(itemBox)) {
                const itemX = item.position.x;
                item.parent.remove(item);
                item.userData.isCollectible = false;

                if (item.userData.isPowerUp) {
                    this.powerUpManager.activatePowerUp(item.userData.powerUpType);
                    this.screenShake.addTrauma(0.25);
                } else if (item.userData.type === 'chrono') {
                    this.timeRemaining += 5.0;
                    this.score += 200 * this.powerUpManager.multiplier;
                    this.audioSynth.playCollectChrono();
                } else {
                    // Regular Coin with 3D spatial panning relative to lane
                    this.coinsCollected++;
                    this.score += 100 * this.powerUpManager.multiplier;
                    this.audioSynth.playCollectCoin(itemX);
                }
            }
        }

        // Swarm squad coin vacuum
        if (this.swarmManager) {
            this.swarmManager.checkCoinVacuum(collectibles, deltaTime, (itemX) => {
                this.coinsCollected++;
                this.score += 100 * this.powerUpManager.multiplier;
                this.audioSynth.playCollectCoin(itemX);
            });
        }
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = Math.floor(this.score);
        document.getElementById('distanceValue').textContent = `${Math.floor(this.distance)}m`;
        document.getElementById('speedValue').textContent = `${Math.floor(this.speed * 100)}%`;

        const swarmEl = document.getElementById('swarmCount');
        if (swarmEl && this.swarmManager) {
            swarmEl.textContent = this.swarmManager.swarmCount;
        }

        if (this.gameMode === 'timeAttack') {
            const timerVal = document.getElementById('timerValue');
            if (timerVal) {
                timerVal.textContent = `${Math.max(0, this.timeRemaining).toFixed(1)}s`;
            }
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);
        const elapsedTime = this.clock.getElapsedTime();
        
        if (this.isPlaying && !this.isPaused) {
            // Hyper boost speed multiplier
            const currentSpeedMultiplier = this.powerUpManager.isHyperBoost ? 2.2 : 1.0;
            const effectiveSpeed = this.baseSpeed * this.speed * currentSpeedMultiplier;

            // Distance and Score
            this.distance += effectiveSpeed * deltaTime;
            this.score += effectiveSpeed * deltaTime * 0.15 * this.powerUpManager.multiplier;
            
            // Speed scaling over distance
            this.speed = MathUtils.lerp(this.speed, 1.0 + this.distance * 0.00008, deltaTime * 0.4);
            this.audioSynth.setSpeed(this.speed * currentSpeedMultiplier);

            // Time attack countdown
            if (this.gameMode === 'timeAttack') {
                this.timeRemaining -= deltaTime;
                if (this.timeRemaining <= 0) {
                    this.gameOver('Time Expired!');
                    return;
                }
            }

            // Subsystem updates
            this.themeEngine.update(this.distance, deltaTime);
            this.powerUpManager.update(deltaTime);
            this.player.update(deltaTime, this.speed);
            if (this.swarmManager) {
                this.swarmManager.update(
                    deltaTime,
                    this.player.mesh.position,
                    this.speed,
                    this.player.isJumping,
                    this.player.isSliding,
                    this.player.rollAngle
                );
            }
            
            // Move player forward
            this.player.mesh.position.z -= effectiveSpeed * deltaTime;
            
            // Smooth Camera Follow in Gameplay
            this.camera.position.z = this.player.mesh.position.z + 9.5;
            this.camera.position.x = MathUtils.lerp(
                this.camera.position.x,
                this.player.mesh.position.x * 0.45,
                deltaTime * 4.0
            );
            this.camera.position.y = 4.8;
            this.camera.lookAt(
                this.player.mesh.position.x * 0.25,
                this.player.mesh.position.y + 1.6,
                this.player.mesh.position.z - 6.0
            );
            
            // Update tile generator & hazards
            this.tileManager.update(this.player.mesh.position.z, deltaTime, elapsedTime);
            
            // Math Portal interaction check
            this.checkMathPortals();

            // Collision detection & animated crash sequence
            if (this.checkCollisions()) {
                this.isPlaying = false;
                this.audioSynth.stopMusic();
                this.audioSynth.playCrashSound();
                this.player.playDeath(() => {
                    this.gameOver('Fatal Obstacle Impact');
                });
                return;
            }
            
            // Collectibles & magnet pull
            this.checkCollectibles(deltaTime);
            
            // Spin collectibles
            this.tileManager.getCollectibles().forEach(item => {
                item.rotation.y += (item.userData.rotationSpeed || 2.5) * deltaTime;
            });
            
            this.updateUI();
        } else if (this.player && this.player.inMenuPreview) {
            // Live 3D Preview in Start Screen / Menu
            this.player.update(deltaTime, 1.0);
            
            const isDesktop = window.innerWidth >= 960;
            const previewX = isDesktop ? -1.65 : 0;
            
            this.player.mesh.position.set(previewX, 0, 0);
            this.player.mesh.rotation.y = Math.sin(elapsedTime * 0.75) * 0.28;
            this.camera.position.set(previewX, 1.15, 4.8);
            this.camera.lookAt(previewX, 0.85, 0);
        }

        // Apply Screen Shake Offsets
        const shake = this.screenShake.update(deltaTime, elapsedTime);
        this.camera.position.x += shake.posX;
        this.camera.position.y += shake.posY;
        this.camera.rotation.z += shake.rotZ;

        // Update Cyber Warp & Chromatic Aberration Shader Uniforms
        if (this.warpPass) {
            const targetWarp = this.powerUpManager.isHyperBoost ? 1.0 : 0.0;
            this.warpPass.uniforms.uWarp.value = MathUtils.lerp(
                this.warpPass.uniforms.uWarp.value,
                targetWarp,
                deltaTime * 8.0
            );
            this.warpPass.uniforms.uChromatic.value = Math.max(
                0.0,
                this.warpPass.uniforms.uChromatic.value - deltaTime * 2.2
            );
            this.warpPass.uniforms.uTime.value = elapsedTime;
        }
        
        // Render Frame with Bloom Post-Processing (or standard WebGLRenderer)
        if (this.composer && this.bloomQuality !== 'off') {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// ============================================
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.game = new Game();
} else {
    window.addEventListener('DOMContentLoaded', () => {
        window.game = new Game();
    });
}

