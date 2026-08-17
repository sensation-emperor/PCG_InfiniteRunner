/**
 * Math Runner - Procedural 3D Infinite Runner
 * All assets generated mathematically using Three.js
 */

// ============================================
// MATH UTILITIES
// ============================================

class MathUtils {
    // Linear interpolation
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Clamp value between min and max
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // Smooth step function
    static smoothstep(edge0, edge1, x) {
        const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }
    
    // Perlin noise implementation
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

// Permutation table for Perlin noise
MathUtils.perm = new Uint8Array(512);
for (let i = 0; i < 256; i++) {
    MathUtils.perm[i] = Math.floor(Math.random() * 256);
    MathUtils.perm[i + 256] = MathUtils.perm[i];
}

// ============================================
// PROCEDURAL MESH GENERATORS
// ============================================

class MeshGenerator {
    // Generate a platform tile
    static createPlatform(width, length, height, segments = 10) {
        const geometry = new THREE.BoxGeometry(width, height, length);
        return geometry;
    }
    
    // Generate obstacle (spike block)
    static createSpikeObstacle(size, spikeCount = 4) {
        const shape = new THREE.Shape();
        const angleStep = (Math.PI * 2) / spikeCount;
        
        for (let i = 0; i <= spikeCount * 2; i++) {
            const angle = i * angleStep / 2;
            const radius = i % 2 === 0 ? size : size * 0.3;
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
    
    // Generate collectible coin (toroid)
    static createCoin(radius = 0.5, tube = 0.15, radialSegments = 16) {
        const geometry = new THREE.TorusGeometry(radius, tube, 8, radialSegments);
        return geometry;
    }
    
    // Generate power-up capsule
    static createCapsule(radius = 0.3, height = 1, segments = 16) {
        const geometry = new THREE.CapsuleGeometry(radius, height, 4, segments);
        return geometry;
    }
    
    // Generate arch/tunnel obstacle
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
    
    // Generate decorative pillar
    static createPillar(radius, height, segments = 8) {
        const geometry = new THREE.CylinderGeometry(
            radius * 0.8,
            radius,
            height,
            segments
        );
        return geometry;
    }
    
    // Generate ramp/jump platform
    static createRamp(width, length, height) {
        const geometry = new THREE.BoxGeometry(width, height, length);
        const positions = geometry.attributes.position.array;
        
        // Slope the top face
        for (let i = 0; i < positions.length; i += 3) {
            if (positions[i + 1] > 0) { // Top vertices
                const t = (positions[i + 2] + length / 2) / length;
                positions[i + 1] = t * height;
            }
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    // Generate particle system for effects
    static createParticleEmitter(count = 100) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
            
            velocities[i * 3] = (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
            
            sizes[i] = Math.random() * 0.2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        return { geometry, velocities };
    }
}

// ============================================
// PROCEDURAL MATERIAL GENERATOR
// ============================================

class MaterialGenerator {
    static createNeonMaterial(color, emissiveIntensity = 0.5) {
        return new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: emissiveIntensity,
            metalness: 0.8,
            roughness: 0.2,
            wireframe: false
        });
    }
    
    static createWireframeMaterial(color) {
        return new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
    }
    
    static createGlowMaterial(color) {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(color) }
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
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    float pulse = sin(time * 3.0) * 0.5 + 0.5;
                    gl_FragColor = vec4(color * (intensity + pulse * 0.3), 1.0);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.FrontSide
        });
    }
    
    static createGridMaterial(color, gridSize = 1) {
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
                    float line = 0.02;
                    float gridPattern = step(grid.x, line) + step(grid.y, line);
                    float pulse = sin(time * 2.0) * 0.3 + 0.7;
                    gl_FragColor = vec4(color * gridPattern * pulse, 1.0);
                }
            `,
            transparent: true
        });
    }
}

// ============================================
// SEED ENGINE (Deterministic RNG)
// ============================================

class SeedEngine {
    constructor(seed = 12345) {
        this.seed = seed;
        this.initialSeed = seed;
    }
    
    initialize(seed) {
        this.seed = seed;
        this.initialSeed = seed;
    }
    
    next() {
        // Linear Congruential Generator
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
    
    stringToSeed(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
}

// ============================================
// GAME OBJECTS
// ============================================

class Player {
    constructor(scene) {
        this.scene = scene;
        this.createMesh();
        this.reset();
    }
    
    createMesh() {
        // Geometric robot character from primitives
        this.mesh = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.BoxGeometry(0.6, 0.8, 0.4);
        const bodyMat = MaterialGenerator.createNeonMaterial(0x00ffff);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        this.mesh.add(body);
        
        // Head
        const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMat = MaterialGenerator.createNeonMaterial(0x00ffff);
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 1.5;
        this.mesh.add(head);
        
        // Eyes (glowing)
        const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const eyeMat = MaterialGenerator.createGlowMaterial(0xff00ff);
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.1, 1.55, 0.2);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.1, 1.55, 0.2);
        this.mesh.add(leftEye);
        this.mesh.add(rightEye);
        
        // Trail effect
        this.trailPositions = [];
        this.maxTrailLength = 20;
        
        this.scene.add(this.mesh);
    }
    
    reset() {
        this.mesh.position.set(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isJumping = false;
        this.isSliding = false;
        this.lane = 1; // 0: left, 1: center, 2: right
        this.targetX = 0;
    }
    
    update(deltaTime, speed) {
        // Lane switching
        this.mesh.position.x = THREE.MathUtils.lerp(
            this.mesh.position.x,
            this.targetX,
            deltaTime * 10
        );
        
        // Jump physics (parabolic arc)
        if (this.isJumping) {
            this.mesh.position.y += this.velocity.y * deltaTime;
            this.velocity.y -= 20 * deltaTime; // Gravity
            
            if (this.mesh.position.y <= 0) {
                this.mesh.position.y = 0;
                this.isJumping = false;
            }
        }
        
        // Sliding
        if (this.isSliding) {
            this.mesh.scale.y = THREE.MathUtils.lerp(
                this.mesh.scale.y,
                0.5,
                deltaTime * 15
            );
        } else {
            this.mesh.scale.y = THREE.MathUtils.lerp(
                this.mesh.scale.y,
                1,
                deltaTime * 15
            );
        }
        
        // Running animation (bobbing)
        if (!this.isJumping && !this.isSliding) {
            this.mesh.position.y = Math.sin(Date.now() * 0.015 * speed) * 0.1;
        }
        
        // Update trail
        this.trailPositions.push(this.mesh.position.clone());
        if (this.trailPositions.length > this.maxTrailLength) {
            this.trailPositions.shift();
        }
    }
    
    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.velocity.y = 10;
        }
    }
    
    slide() {
        if (!this.isJumping) {
            this.isSliding = true;
            setTimeout(() => { this.isSliding = false; }, 0.8);
        }
    }
    
    moveLeft() {
        if (this.lane > 0) {
            this.lane--;
            this.targetX = (this.lane - 1) * 3;
        }
    }
    
    moveRight() {
        if (this.lane < 2) {
            this.lane++;
            this.targetX = (this.lane - 1) * 3;
        }
    }
}

// ============================================
// TILE MANAGER
// ============================================

class TileManager {
    constructor(scene, seedEngine) {
        this.scene = scene;
        this.seedEngine = seedEngine;
        this.tiles = [];
        this.tileLength = 20;
        this.tilePool = [];
        this.activeTileCount = 15;
    }
    
    generateTile(zPosition, tileIndex) {
        const tileGroup = new THREE.Group();
        const difficulty = Math.min(tileIndex * 0.01, 1.0);
        
        // Base platform
        const platformGeo = MeshGenerator.createPlatform(9, this.tileLength, 0.5);
        const platformMat = MaterialGenerator.createNeonMaterial(0x0088ff, 0.3);
        const platform = new THREE.Mesh(platformGeo, platformMat);
        platform.position.y = -0.25;
        tileGroup.add(platform);
        
        // Grid pattern on surface
        const gridMat = MaterialGenerator.createGridMaterial(0x00aaff, 2);
        const gridGeo = new THREE.PlaneGeometry(9, this.tileLength);
        const grid = new THREE.Mesh(gridGeo, gridMat);
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = 0.01;
        tileGroup.add(grid);
        
        // Add obstacles based on difficulty
        if (tileIndex > 3 && Math.random() < 0.3 + difficulty * 0.4) {
            this.addObstacles(tileGroup, difficulty);
        }
        
        // Add collectibles
        if (tileIndex > 2 && Math.random() < 0.6) {
            this.addCollectibles(tileGroup);
        }
        
        // Add decorations
        this.addDecorations(tileGroup, tileIndex);
        
        tileGroup.position.z = zPosition;
        this.scene.add(tileGroup);
        this.tiles.push(tileGroup);
        
        return tileGroup;
    }
    
    addObstacles(tileGroup, difficulty) {
        const obstacleType = this.seedEngine.randRange(0, 3);
        const lane = this.seedEngine.randRange(0, 2);
        const xPos = (lane - 1) * 3;
        
        switch (obstacleType) {
            case 0: // Spike blocks
                const spikeGeo = MeshGenerator.createSpikeObstacle(0.5, 4);
                const spikeMat = MaterialGenerator.createNeonMaterial(0xff0000, 0.8);
                const spike = new THREE.Mesh(spikeGeo, spikeMat);
                spike.position.set(xPos, 0.5, this.seedEngine.randRangeFloat(-8, 8));
                tileGroup.add(spike);
                break;
                
            case 1: // Arch/tunnel to go under
                const archGeo = MeshGenerator.createArch(2.5, 2, 3);
                const archMat = MaterialGenerator.createNeonMaterial(0xff00ff, 0.6);
                const arch = new THREE.Mesh(archGeo, archMat);
                arch.position.set(xPos, 1.5, this.seedEngine.randRangeFloat(-8, 8));
                arch.rotation.y = Math.PI / 2;
                tileGroup.add(arch);
                break;
                
            case 2: // Ramp
                const rampGeo = MeshGenerator.createRamp(2, 4, 0.8);
                const rampMat = MaterialGenerator.createNeonMaterial(0xffff00, 0.5);
                const ramp = new THREE.Mesh(rampGeo, rampMat);
                ramp.position.set(xPos, 0.4, this.seedEngine.randRangeFloat(-8, 6));
                tileGroup.add(ramp);
                break;
                
            case 3: // Pillars
                for (let i = 0; i < 2; i++) {
                    const pillarGeo = MeshGenerator.createPillar(0.3, 2, 6);
                    const pillarMat = MaterialGenerator.createNeonMaterial(0x00ff00, 0.4);
                    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
                    pillar.position.set(xPos + (i * 0.8 - 0.4), 1, this.seedEngine.randRangeFloat(-8, 8));
                    tileGroup.add(pillar);
                }
                break;
        }
    }
    
    addCollectibles(tileGroup) {
        const coinGeo = MeshGenerator.createCoin(0.4, 0.1, 12);
        const coinMat = MaterialGenerator.createGlowMaterial(0xffd700);
        
        const numCoins = this.seedEngine.randRange(3, 6);
        const pattern = this.seedEngine.randRange(0, 2);
        
        for (let i = 0; i < numCoins; i++) {
            const coin = new THREE.Mesh(coinGeo, coinMat);
            
            switch (pattern) {
                case 0: // Line
                    coin.position.set((this.seedEngine.randRange(0, 2) - 1) * 3, 1, -8 + i * 2);
                    break;
                case 1: // Arc
                    coin.position.set(
                        Math.sin(i * 0.5) * 2,
                        1 + Math.abs(Math.sin(i * 0.5)) * 1.5,
                        -8 + i * 2
                    );
                    break;
                case 2: // Zigzag
                    coin.position.set(
                        (i % 2 === 0 ? 1 : -1) * 1.5,
                        1,
                        -8 + i * 2
                    );
                    break;
            }
            
            coin.userData = { isCollectible: true, type: 'coin', rotationSpeed: 2 };
            tileGroup.add(coin);
        }
    }
    
    addDecorations(tileGroup, tileIndex) {
        // Add ambient particles
        if (tileIndex % 5 === 0) {
            const particleData = MeshGenerator.createParticleEmitter(20);
            const particleMat = new THREE.PointsMaterial({
                color: 0x00ffff,
                size: 0.1,
                transparent: true,
                opacity: 0.6
            });
            const particles = new THREE.Points(particleData.geometry, particleMat);
            particles.position.set(
                this.seedEngine.randRangeFloat(-4, 4),
                this.seedEngine.randRangeFloat(2, 5),
                this.seedEngine.randRangeFloat(-10, 10)
            );
            tileGroup.add(particles);
        }
    }
    
    update(playerZ) {
        // Remove tiles behind player
        for (let i = this.tiles.length - 1; i >= 0; i--) {
            if (this.tiles[i].position.z > playerZ + 20) {
                this.scene.remove(this.tiles[i]);
                this.tiles.splice(i, 1);
            }
        }
        
        // Add new tiles ahead
        const lastTile = this.tiles[this.tiles.length - 1];
        if (lastTile && lastTile.position.z < playerZ + this.activeTileCount * this.tileLength) {
            this.generateTile(
                lastTile.position.z + this.tileLength,
                Math.floor(lastTile.position.z / this.tileLength) + 1
            );
        }
    }
    
    getCollidables() {
        const collidables = [];
        this.tiles.forEach(tile => {
            tile.children.forEach(child => {
                if (child.geometry && !child.userData.isCollectible) {
                    collidables.push({
                        mesh: child,
                        worldPosition: new THREE.Vector3(),
                        worldScale: new THREE.Vector3()
                    });
                    child.getWorldPosition(collidables[collidables.length - 1].worldPosition);
                    child.getWorldScale(collidables[collidables.length - 1].worldScale);
                }
            });
        });
        return collidables;
    }
    
    getCollectibles() {
        const collectibles = [];
        this.tiles.forEach(tile => {
            tile.children.forEach(child => {
                if (child.userData.isCollectible) {
                    collectibles.push(child);
                }
            });
        });
        return collectibles;
    }
}

// ============================================
// AUDIO SYNTHESIZER
// ============================================

class AudioSynth {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
        this.initialized = true;
    }
    
    playTone(frequency, duration, type = 'sine', volume = 0.5) {
        if (!this.initialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playJumpSound() {
        this.playTone(400, 0.2, 'sine', 0.4);
        setTimeout(() => this.playTone(600, 0.2, 'sine', 0.3), 50);
    }
    
    playCollectSound() {
        const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00];
        const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
        this.playTone(note, 0.3, 'sine', 0.3);
    }
    
    playCrashSound() {
        this.playTone(150, 0.5, 'sawtooth', 0.5);
        this.playTone(100, 0.5, 'square', 0.4);
    }
    
    playPowerUpSound() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playTone(400 + i * 100, 0.15, 'sine', 0.3);
            }, i * 80);
        }
    }
}

// ============================================
// MAIN GAME CLASS
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
        this.audioSynth = null;
        
        this.score = 0;
        this.distance = 0;
        this.speed = 1.0;
        this.baseSpeed = 15;
        this.isPlaying = false;
        this.clock = new THREE.Clock();
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        this.scene.fog = new THREE.FogExp2(0x000011, 0.015);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x00ffff, 1, 50);
        pointLight.position.set(0, 10, 5);
        this.scene.add(pointLight);
        
        // Initialize systems
        this.seedEngine = new SeedEngine(Math.floor(Math.random() * 1000000));
        this.player = new Player(this.scene);
        this.tileManager = new TileManager(this.scene, this.seedEngine);
        this.audioSynth = new AudioSynth();
        
        // Generate initial tiles
        for (let i = 0; i < 10; i++) {
            this.tileManager.generateTile(i * this.tileManager.tileLength, i);
        }
        
        // Start render loop
        this.animate();
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying) return;
            
            switch (e.code) {
                case 'Space':
                case 'KeyW':
                case 'ArrowUp':
                    this.player.jump();
                    this.audioSynth.playJumpSound();
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
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // UI buttons
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.audioSynth.init();
        document.getElementById('startScreen').style.display = 'none';
        this.isPlaying = true;
        this.clock.start();
    }
    
    restartGame() {
        // Reset game state
        this.score = 0;
        this.distance = 0;
        this.speed = 1.0;
        
        // Reset player
        this.player.reset();
        
        // Clear tiles
        this.tileManager.tiles.forEach(tile => {
            this.scene.remove(tile);
        });
        this.tileManager.tiles = [];
        
        // Generate new tiles
        for (let i = 0; i < 10; i++) {
            this.tileManager.generateTile(i * this.tileManager.tileLength, i);
        }
        
        document.getElementById('gameOverScreen').style.display = 'none';
        this.isPlaying = true;
        this.clock.start();
    }
    
    gameOver() {
        this.isPlaying = false;
        this.audioSynth.playCrashSound();
        document.getElementById('finalScore').textContent = `Score: ${Math.floor(this.score)}`;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
    
    checkCollisions() {
        const playerBox = new THREE.Box3().setFromObject(this.player.mesh);
        playerBox.expandByScalar(-0.2); // Make hitbox slightly smaller
        
        // Check obstacles
        const collidables = this.tileManager.getCollidables();
        for (const collidable of collidables) {
            const obstacleBox = new THREE.Box3().setFromObject(collidable.mesh);
            if (playerBox.intersectsBox(obstacleBox)) {
                return true;
            }
        }
        
        return false;
    }
    
    checkCollectibles() {
        const collectibles = this.tileManager.getCollectibles();
        const playerBox = new THREE.Box3().setFromObject(this.player.mesh);
        
        for (const collectible of collectibles) {
            const collectibleBox = new THREE.Box3().setFromObject(collectible);
            if (playerBox.intersectsBox(collectibleBox)) {
                // Collect!
                this.scene.remove(collectible);
                collectible.userData.isCollectible = false;
                this.score += 100;
                this.audioSynth.playCollectSound();
            }
        }
    }
    
    updateUI() {
        document.getElementById('scoreValue').textContent = Math.floor(this.score);
        document.getElementById('distanceValue').textContent = Math.floor(this.distance);
        document.getElementById('speedValue').textContent = Math.floor(this.speed * 100);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        if (this.isPlaying) {
            // Update distance and score
            this.distance += this.baseSpeed * this.speed * deltaTime;
            this.score += this.baseSpeed * this.speed * deltaTime * 0.1;
            
            // Gradually increase speed
            this.speed = THREE.MathUtils.lerp(this.speed, 1.0 + this.distance * 0.0001, deltaTime * 0.5);
            
            // Update player
            this.player.update(deltaTime, this.speed);
            
            // Move player forward
            this.player.mesh.position.z -= this.baseSpeed * this.speed * deltaTime;
            
            // Update camera follow
            this.camera.position.z = this.player.mesh.position.z + 10;
            this.camera.position.x = THREE.MathUtils.lerp(
                this.camera.position.x,
                this.player.mesh.position.x * 0.5,
                deltaTime * 3
            );
            this.camera.lookAt(
                this.player.mesh.position.x * 0.3,
                this.player.mesh.position.y + 2,
                this.player.mesh.position.z - 5
            );
            
            // Update tiles
            this.tileManager.update(this.player.mesh.position.z);
            
            // Check collisions
            if (this.checkCollisions()) {
                this.gameOver();
            }
            
            // Check collectibles
            this.checkCollectibles();
            
            // Animate collectibles
            this.tileManager.getCollectibles().forEach(coin => {
                coin.rotation.y += coin.userData.rotationSpeed * deltaTime;
            });
            
            // Update UI
            this.updateUI();
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// ============================================
// START GAME
// ============================================

window.addEventListener('load', () => {
    window.game = new Game();
});
