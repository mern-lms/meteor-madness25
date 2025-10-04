// ==================== Global State ====================
let scene, camera, renderer, earth, asteroid, orbit, controls;
let currentImpactData = null;
let animationId = null;
let asteroidObjects = []; // Array to store all asteroid 3D objects
let orbitLines = []; // Array to store all orbit lines
let selectedAsteroid = null; // Currently selected asteroid
let allAsteroidsData = []; // Store all asteroid data from NASA

// ==================== Intro Screen Management ====================
function showIntroScreen() {
    const introScreen = document.getElementById('intro-screen');
    if (introScreen) {
        introScreen.style.display = 'flex';
        
        // Hide intro screen after 5 seconds
        setTimeout(() => {
            introScreen.style.transition = 'opacity 1s ease-out';
            introScreen.style.opacity = '0';
            
            setTimeout(() => {
                introScreen.style.display = 'none';
                // Initialize the main application after intro
                initializeApp();
            }, 1000);
        }, 5000);
    }
}

function initializeApp() {
    // Initialize Three.js and start the main application
    initThreeJS();
    initEventListeners();
    loadNASAStats();
    loadFeaturedAsteroids();
    loadAllAsteroids();
    updateSliderValues();
    initNewResourcesEventListeners();
}

const state = {
    diameter: 100,
    velocity: 20,
    density: 3000,
    angle: 45,
    impactResults: null,
    mitigationResults: null,
    showAllAsteroids: false,
    selectedAsteroidId: null,
    // Visualization state
    showTrajectories: true,
    maxOrbitsToShow: 1000, // Show up to 1000 orbits like NASA Eyes
    isFullscreen: false
};

// ==================== API Configuration ====================
// Use relative API paths on production (Vercel). Fall back to localhost in dev.
const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE = isLocalhost ? 'http://localhost:8080' : '';
const FLASK_API = isLocalhost ? 'http://localhost:5000' : '';

// ==================== Initialize App ====================
document.addEventListener('DOMContentLoaded', () => {
    // Show intro screen first
    showIntroScreen();
});

// ==================== Three.js 3D Visualization ====================
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.error('Canvas container not found');
        return;
    }
    
    // Scene - Black space background like NASA
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.00025);
    
    // Camera - Wide field of view for heliocentric system
    camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        10000
    );
    // Position camera to view Sun-centered system from above and side
    camera.position.set(30, 40, 60);
    camera.lookAt(0, 0, 0); // Look at Sun
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Lighting - Minimal like NASA
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(100, 50, 50);
    scene.add(sunLight);
    
    // ==================== HELIOCENTRIC VIEW (Sun at center, like NASA Eyes) ====================
    
    // SUN at center (0, 0, 0)
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        emissive: 0xffaa00,
        emissiveIntensity: 1
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    
    // Sun glow
    const sunGlowGeometry = new THREE.SphereGeometry(4, 32, 32);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    scene.add(sunGlow);
    
    // EARTH orbiting the Sun at 1 AU (10 units in our scale)
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32); // Smaller Earth
    const textureLoader = new THREE.TextureLoader();
    
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: textureLoader.load('https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg'),
        bumpMap: textureLoader.load('https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png'),
        bumpScale: 0.1,
        specular: new THREE.Color(0x333333),
        shininess: 15
    });
    
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(10, 0, 0); // 1 AU from Sun (1 AU = 10 units)
    scene.add(earth);
    
    // Earth's orbit line
    const earthOrbitPoints = [];
    const earthOrbitSegments = 128;
    for (let i = 0; i <= earthOrbitSegments; i++) {
        const angle = (i / earthOrbitSegments) * Math.PI * 2;
        earthOrbitPoints.push(new THREE.Vector3(
            10 * Math.cos(angle),
            0,
            10 * Math.sin(angle)
        ));
    }
    const earthOrbitGeometry = new THREE.BufferGeometry().setFromPoints(earthOrbitPoints);
    const earthOrbitMaterial = new THREE.LineBasicMaterial({
        color: 0x404040,
        transparent: true,
        opacity: 0.4
    });
    const earthOrbitLine = new THREE.Line(earthOrbitGeometry, earthOrbitMaterial);
    scene.add(earthOrbitLine);
    
    // VENUS orbit (0.72 AU)
    const venusOrbitPoints = [];
    for (let i = 0; i <= earthOrbitSegments; i++) {
        const angle = (i / earthOrbitSegments) * Math.PI * 2;
        venusOrbitPoints.push(new THREE.Vector3(
            7.2 * Math.cos(angle),
            0,
            7.2 * Math.sin(angle)
        ));
    }
    const venusOrbitGeometry = new THREE.BufferGeometry().setFromPoints(venusOrbitPoints);
    const venusOrbitMaterial = new THREE.LineBasicMaterial({
        color: 0x000000
    });
    const venusOrbitLine = new THREE.Line(venusOrbitGeometry, venusOrbitMaterial);
    scene.add(venusOrbitLine);
    
    // MARS orbit (1.52 AU)
    const marsOrbitPoints = [];
    for (let i = 0; i <= earthOrbitSegments; i++) {
        const angle = (i / earthOrbitSegments) * Math.PI * 2;
        marsOrbitPoints.push(new THREE.Vector3(
            15.2 * Math.cos(angle),
            0,
            15.2 * Math.sin(angle)
        ));
    }
    const marsOrbitGeometry = new THREE.BufferGeometry().setFromPoints(marsOrbitPoints);
    const marsOrbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2
    });
    const marsOrbitLine = new THREE.Line(marsOrbitGeometry, marsOrbitMaterial);
    scene.add(marsOrbitLine);
    
    // Stars - Dense starfield like NASA
    createNASAStarField();
    
    // OrbitControls - NASA style
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 5000;
    controls.enablePan = true;
    controls.autoRotate = false; // User controlled
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.2;
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Start animation
    animate();
}

function createRealisticAsteroid(baseSize) {
    // Create irregular asteroid geometry using IcosahedronGeometry with noise
    const geometry = new THREE.IcosahedronGeometry(baseSize, 2);
    const positions = geometry.attributes.position;
    
    // Add randomness to vertices to create irregular shape
    const vertex = new THREE.Vector3();
    for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i);
        
        // Add noise to create craters and bumps
        const noise = 0.2 + Math.random() * 0.3;
        vertex.normalize().multiplyScalar(baseSize * noise);
        
        positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();
    
    // Create asteroid material with texture
    const textureLoader = new THREE.TextureLoader();
    
    // Create a procedural rocky texture using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base rocky color
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, 512, 512);
    
    // Add rocky details
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 3;
        const brightness = Math.random() * 100 + 50;
        ctx.fillStyle = `rgb(${brightness}, ${brightness * 0.9}, ${brightness * 0.8})`;
        ctx.fillRect(x, y, size, size);
    }
    
    // Add craters
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 30 + 10;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, '#2a2a2a');
        gradient.addColorStop(0.7, '#3a3a3a');
        gradient.addColorStop(1, '#4a4a4a');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.9,
        metalness: 0.1,
        color: 0xffffff,
        emissive: 0x000000,
        emissiveIntensity: 0.1
    });
    
    const asteroidMesh = new THREE.Mesh(geometry, material);
    
    // Add random rotation for variety
    asteroidMesh.rotation.x = Math.random() * Math.PI;
    asteroidMesh.rotation.y = Math.random() * Math.PI;
    asteroidMesh.rotation.z = Math.random() * Math.PI;
    
    // Store rotation speed for animation
    asteroidMesh.rotationSpeed = {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02
    };
    
    return asteroidMesh;
}

function createOrbitPath() {
    const curve = new THREE.EllipseCurve(
        0, 0,           // center
        3, 2.5,         // xRadius, yRadius
        0, 2 * Math.PI, // start angle, end angle
        false,          // clockwise
        0               // rotation
    );
    
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
    );
    
    const material = new THREE.LineBasicMaterial({
        color: 0x404040,
        transparent: true,
        opacity: 0.6
    });
    
    orbit = new THREE.Line(geometry, material);
    scene.add(orbit);
}

function createNASAStarField() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    
    // Create 10000 stars like NASA - dense background
    for (let i = 0; i < 10000; i++) {
        const radius = 1000 + Math.random() * 4000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 1.5,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    // Rotate Earth on its axis
    if (earth) {
        earth.rotation.y += 0.005; // Earth's rotation
    }
    
    // Optional: Animate Earth around the Sun (very slow)
    // Uncomment to see Earth orbit
    // if (earth) {
    //     const time = Date.now() * 0.00001;
    //     earth.position.x = 10 * Math.cos(time);
    //     earth.position.z = 10 * Math.sin(time);
    // }
    
    // Animate impact points (pulsing effect)
    const time = Date.now() * 0.001;
    scene.traverse((object) => {
        if (object.userData && object.userData.isImpactPoint) {
            // Pulsing animation for impact markers
            const pulseScale = 1 + Math.sin(time * 5) * 0.3;
            object.scale.setScalar(pulseScale);
            
            // Color pulsing
            if (object.material) {
                const intensity = 0.5 + Math.sin(time * 3) * 0.5;
                object.material.emissiveIntensity = intensity;
            }
        }
    });
    
    // Animate asteroid rotation
    asteroidObjects.forEach(asteroidObj => {
        if (asteroidObj.mesh && asteroidObj.mesh.rotationSpeed) {
            asteroidObj.mesh.rotation.x += asteroidObj.mesh.rotationSpeed.x;
            asteroidObj.mesh.rotation.y += asteroidObj.mesh.rotationSpeed.y;
            asteroidObj.mesh.rotation.z += asteroidObj.mesh.rotationSpeed.z;
        }
    });
    
    // Update controls
    if (controls) {
        controls.update();
    }
    
    renderer.render(scene, camera);
}


// ==================== NASA Enhanced Data Integration ====================

async function fetchNASAHorizonsData(asteroidId) {
    try {
        // Fetch detailed orbital elements from NASA JPL Horizons via our API
        const response = await fetch(`${API_BASE}/api/horizons/${asteroidId}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.warn(`Could not fetch Horizons data for ${asteroidId}:`, error);
    }
    return null;
}

async function calculateImpactProbability(asteroidData) {
    try {
        // Use NASA's close approach data and Sentry data to calculate impact probability
        let impactProb = 0;
        let impactYear = null;
        
        // Check Sentry data first (most accurate for impact risk)
        if (asteroidData.sentryData && asteroidData.sentryData.impactProbability) {
            impactProb = asteroidData.sentryData.impactProbability;
            impactYear = asteroidData.sentryData.impactYear;
        }
        
        // Check close approach data
        if (asteroidData.close_approach_data && asteroidData.close_approach_data.length > 0) {
            const closeApproach = asteroidData.close_approach_data[0];
            const distanceAU = parseFloat(closeApproach.miss_distance?.astronomical) || 999;
            
            // Calculate rough impact probability based on distance and size
            if (distanceAU < 0.05) { // Very close approach
                const size = getAsteroidDiameter(asteroidData);
                if (size > 100) { // Large asteroid
                    impactProb = Math.max(impactProb, 1e-6); // Minimum detectable risk
                }
            }
        }
        
        return {
            probability: impactProb,
            year: impactYear,
            riskLevel: impactProb > 1e-4 ? 'HIGH' : impactProb > 1e-6 ? 'MEDIUM' : 'LOW'
        };
    } catch (error) {
        console.warn('Error calculating impact probability:', error);
        return {
            probability: 0,
            year: null,
            riskLevel: 'LOW'
        };
    }
}

function getAsteroidDiameter(asteroidData) {
    if (asteroidData.estimated_diameter && asteroidData.estimated_diameter.meters) {
        const min = asteroidData.estimated_diameter.meters.estimated_diameter_min;
        const max = asteroidData.estimated_diameter.meters.estimated_diameter_max;
        return (min + max) / 2;
    }
    return 100; // Default
}

// ==================== Asteroid Loading & Visualization ====================

async function loadAllAsteroids() {
    try {
        console.log('Loading asteroids from NASA...');
        
        // Load multiple data sources in parallel (increased limits for NASA Eyes style)
        const [neoData, sentryData, cadData, sbdbData] = await Promise.allSettled([
            fetch(`${API_BASE}/api/neo/browse?size=200`).then(r => r.json()).catch(() => null), // Increased from 50
            fetch(`${API_BASE}/api/sentry/all`).then(r => r.json()).catch(() => null),
            fetch(`${API_BASE}/api/cad/all?dist_max=5.0`).then(r => r.json()).catch(() => null), // Increased distance
            fetch(`${API_BASE}/api/sbdb/all?limit=2000`).then(r => r.json()).catch(() => null) // Increased from 100 to get ~1946 total
        ]);
        
        // Process NEO data
        let asteroids = [];
        if (neoData.status === 'fulfilled' && neoData.value?.near_earth_objects) {
            asteroids = neoData.value.near_earth_objects;
            console.log(`Loaded ${asteroids.length} NEO asteroids`);
        }
        
        // Add Sentry risk data (impact probability)
        let sentryObjects = [];
        if (sentryData.status === 'fulfilled' && sentryData.value?.data) {
            sentryObjects = sentryData.value.data;
            console.log(`Loaded ${sentryObjects.length} Sentry risk objects`);
            
            // Merge Sentry data with asteroids
            asteroids = mergeSentryData(asteroids, sentryObjects);
        }
        
        // Add Close Approach Data
        if (cadData.status === 'fulfilled' && cadData.value?.data) {
            console.log(`Loaded ${cadData.value.count} close approach records`);
            asteroids = mergeCloseApproachData(asteroids, cadData.value);
        }
        
        // Add Small-Body Database data (includes all asteroids, not just NEOs)
        if (sbdbData.status === 'fulfilled' && sbdbData.value?.data) {
            console.log(`Loaded ${sbdbData.value.data.length} SBDB asteroids`);
            asteroids = mergeSBDBData(asteroids, sbdbData.value.data);
        }
        
        allAsteroidsData = asteroids;
        console.log(`Total asteroids loaded: ${allAsteroidsData.length}`);
        
        // Create 3D objects for all asteroids (show up to 1946 like NASA Eyes)
        const maxAsteroids = Math.min(1946, allAsteroidsData.length); // NASA Eyes shows ~1946 asteroids
        const asteroidsToShow = allAsteroidsData.slice(0, maxAsteroids);
        console.log(`✨ Displaying ${asteroidsToShow.length} asteroids in 3D view out of ${allAsteroidsData.length} total (NASA Eyes style)`);
        console.log(`📊 Asteroid distance range: ${Math.min(...asteroidsToShow.map(a => {
            const orbit = calculateOrbitFromNASAData(a, 0);
            return orbit.realDistanceAU || 999;
        })).toFixed(2)} - ${Math.max(...asteroidsToShow.map(a => {
            const orbit = calculateOrbitFromNASAData(a, 0);
            return orbit.realDistanceAU || 0;
        })).toFixed(2)} AU`);
        
        // Enhanced asteroid creation with impact analysis
        try {
            await createEnhancedAsteroidObjects(asteroidsToShow);
            console.log('✅ Enhanced asteroid visualization loaded successfully');
        } catch (enhancedError) {
            console.warn('⚠️ Enhanced visualization failed, falling back to standard:', enhancedError);
            // Fallback to standard asteroid creation
            createAsteroidObjects(asteroidsToShow);
        }
        
        // Update UI
        updateAsteroidBrowser(allAsteroidsData);
        
        // Show impact risk summary
        displayImpactRiskSummary(allAsteroidsData);
        
    } catch (error) {
        console.error('Error loading all asteroids:', error);
    }
}

function mergeSentryData(asteroids, sentryObjects) {
    // Create a map of Sentry data by designation
    const sentryMap = {};
    sentryObjects.forEach(obj => {
        sentryMap[obj.des] = {
            impactProbability: parseFloat(obj.ip) || 0,
            palomoScale: parseInt(obj.ps_max) || 0,
            torinoScale: parseInt(obj.ts_max) || 0,
            lastObserved: obj.last_obs,
            possibleImpacts: parseInt(obj.n_imp) || 0,
            impactYear: obj.year_range ? obj.year_range.split('-')[0] : null
        };
    });
    
    // Merge with existing asteroids
    asteroids.forEach(asteroid => {
        const designation = asteroid.designation || asteroid.name;
        if (sentryMap[designation]) {
            asteroid.sentryData = sentryMap[designation];
        }
    });
    
    // Add Sentry objects that aren't in NEO list
    sentryObjects.forEach(obj => {
        const exists = asteroids.find(a => 
            (a.designation === obj.des) || (a.name && a.name.includes(obj.des))
        );
        
        if (!exists) {
            asteroids.push({
                id: obj.des,
                name: obj.des,
                designation: obj.des,
                sentryData: {
                    impactProbability: parseFloat(obj.ip) || 0,
                    palomoScale: parseInt(obj.ps_max) || 0,
                    torinoScale: parseInt(obj.ts_max) || 0,
                    lastObserved: obj.last_obs,
                    possibleImpacts: parseInt(obj.n_imp) || 0,
                    impactYear: obj.year_range ? obj.year_range.split('-')[0] : null
                },
                is_sentry_object: true,
                is_potentially_hazardous_asteroid: true
            });
        }
    });
    
    return asteroids;
}

function mergeCloseApproachData(asteroids, cadData) {
    // CAD data format: data is array of arrays
    // fields: des, orbit_id, jd, cd, dist, dist_min, dist_max, v_rel, v_inf, t_sigma_f, h
    const fields = cadData.fields;
    const desIndex = fields.indexOf('des');
    const cdIndex = fields.indexOf('cd');
    const distIndex = fields.indexOf('dist');
    const vRelIndex = fields.indexOf('v_rel');
    
    // Create map of closest approaches
    const approachMap = {};
    cadData.data.forEach(record => {
        const des = record[desIndex];
        const date = record[cdIndex];
        const dist = parseFloat(record[distIndex]);
        const vRel = parseFloat(record[vRelIndex]);
        
        if (!approachMap[des] || dist < approachMap[des].distance) {
            approachMap[des] = {
                date: date,
                distance: dist,
                velocity: vRel
            };
        }
    });
    
    // Merge with asteroids
    asteroids.forEach(asteroid => {
        const designation = asteroid.designation || asteroid.name;
        if (approachMap[designation]) {
            if (!asteroid.close_approach_data) {
                asteroid.close_approach_data = [];
            }
            asteroid.futureApproach = approachMap[designation];
        }
    });
    
    return asteroids;
}

function mergeSBDBData(asteroids, sbdbData) {
    // SBDB data includes all asteroids (main belt, trojans, etc.)
    // Add asteroids that aren't NEOs
    
    sbdbData.forEach(record => {
        const name = record[1]; // full_name
        const neo = record[3]; // neo flag
        const pha = record[4]; // pha flag
        
        // Check if already exists
        const exists = asteroids.find(a => a.name === name);
        
        if (!exists && record[6]) { // has diameter
            asteroids.push({
                id: record[0], // spkid
                name: name,
                is_neo: neo === 'Y',
                is_potentially_hazardous_asteroid: pha === 'Y',
                absolute_magnitude_h: parseFloat(record[5]) || null,
                estimated_diameter: {
                    meters: {
                        estimated_diameter_min: parseFloat(record[6]) * 1000 || 100,
                        estimated_diameter_max: parseFloat(record[6]) * 1000 || 100
                    }
                },
                orbital_data: {
                    orbit_class: { orbit_class_type: record[7] },
                    semi_major_axis: parseFloat(record[8]) || null,
                    eccentricity: parseFloat(record[9]) || null,
                    inclination: parseFloat(record[10]) || null,
                    orbital_period: parseFloat(record[11]) * 365.25 || null // convert years to days
                },
                is_sbdb_object: true
            });
        }
    });
    
    return asteroids;
}

function displayImpactRiskSummary(asteroids) {
    // Count asteroids by risk level
    const withImpactProb = asteroids.filter(a => a.sentryData?.impactProbability > 0);
    const highRisk = asteroids.filter(a => a.sentryData?.torinoScale >= 1);
    const totalPHA = asteroids.filter(a => a.is_potentially_hazardous_asteroid);
    
    console.log('=== Impact Risk Summary ===');
    console.log(`Total asteroids: ${asteroids.length}`);
    console.log(`Potentially Hazardous: ${totalPHA.length}`);
    console.log(`With impact probability: ${withImpactProb.length}`);
    console.log(`Torino Scale ≥ 1: ${highRisk.length}`);
    
    // Update stats if elements exist
    const statHazardous = document.getElementById('stat-hazardous');
    if (statHazardous) {
        statHazardous.textContent = totalPHA.length;
    }
}

async function createEnhancedAsteroidObjects(asteroids) {
    // Clear existing asteroids
    asteroidObjects.forEach(obj => {
        scene.remove(obj.mesh);
        if (obj.orbit) scene.remove(obj.orbit);
    });
    asteroidObjects = [];
    orbitLines = [];
    
    let impactRiskCount = 0;
    let highRiskCount = 0;
    
    for (let index = 0; index < asteroids.length; index++) {
        const asteroidData = asteroids[index];
        
        // Calculate enhanced impact probability
        const impactAnalysis = await calculateImpactProbability(asteroidData);
        asteroidData.impactAnalysis = impactAnalysis;
        
        if (impactAnalysis.probability > 0) {
            impactRiskCount++;
            if (impactAnalysis.riskLevel === 'HIGH') {
                highRiskCount++;
            }
        }
        
        // Calculate orbit parameters
        const orbitData = calculateOrbitFromNASAData(asteroidData, index);
        
        // Calculate initial 3D position using orbital mechanics
        const initialPosition = calculateInitialAsteroidPosition(asteroidData, orbitData, index);
        
        // Log enhanced data for verification
        if (index < 5) {
            console.log(`🌌 Enhanced Asteroid ${asteroidData.name || asteroidData.id}:`, {
                distance: (orbitData.realDistanceAU?.toFixed(4) || 'N/A') + ' AU',
                position: `(${initialPosition.x.toFixed(2)}, ${initialPosition.y.toFixed(2)}, ${initialPosition.z.toFixed(2)})`,
                impactRisk: impactAnalysis.riskLevel,
                impactProb: impactAnalysis.probability.toExponential(2),
                orbitalData: asteroidData.orbital_data ? 'YES' : 'NO',
                inclination: orbitData.inclination?.toFixed(2) + '°'
            });
        }
        
        // Create enhanced asteroid visualization
        const size = getAsteroidSize(asteroidData);
        const geometry = new THREE.SphereGeometry(size, 16, 16); // Higher detail
        
        // Enhanced NASA Eyes-style coloring with impact risk indication
        let color, emissive, emissiveIntensity;
        
        if (impactAnalysis.riskLevel === 'HIGH') {
            // High impact risk: pulsing bright red
            color = 0xff0000;
            emissive = 0xff0000;
            emissiveIntensity = 0.8;
        } else if (asteroidData.is_potentially_hazardous_asteroid) {
            // Hazardous asteroids: bright red/orange
            color = 0xff3333;
            emissive = 0x440000;
            emissiveIntensity = 0.4;
        } else if (asteroidData.sentryData && asteroidData.sentryData.impactProbability > 0) {
            // Sentry objects: bright orange
            color = 0xff8800;
            emissive = 0x442200;
            emissiveIntensity = 0.3;
        } else if (orbitData.realDistanceAU && orbitData.realDistanceAU < 1.3) {
            // Close asteroids: bright blue
            color = 0xffffff;
            emissive = 0x1a1a1a;
            emissiveIntensity = 0.2;
        } else {
            // Regular asteroids: white/cyan
            color = 0xffffff;
            emissive = 0x404040;
            emissiveIntensity = 0.1;
        }
        
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            emissive: emissive,
            emissiveIntensity: emissiveIntensity
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Enhanced user data with impact analysis
        mesh.userData = {
            asteroidData: asteroidData,
            asteroidId: asteroidData.id,
            impactAnalysis: impactAnalysis,
            orbitData: orbitData
        };
        
        // Add rotation for realism
        mesh.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        };
        
        // Use the calculated initial position
        mesh.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
        scene.add(mesh);
        
        // Create enhanced elliptical orbit with impact prediction
        const orbitGroup = createEllipticalOrbit(orbitData, asteroidData, index, initialPosition);
        if (orbitGroup) {
            scene.add(orbitGroup);
        }
        
        // Store reference
        asteroidObjects.push({
            mesh: mesh,
            orbit: orbitGroup,
            data: asteroidData,
            impactAnalysis: impactAnalysis
        });
    }
    
    // Update impact statistics in UI
    updateImpactStatistics(impactRiskCount, highRiskCount, asteroids.length);
    
    console.log(`🚨 Impact Risk Summary: ${impactRiskCount} asteroids with impact risk (${highRiskCount} high risk)`);
}

function updateImpactStatistics(impactRiskCount, highRiskCount, totalCount) {
    // Update the orbital info display with impact statistics
    const orbitInfo = document.getElementById('orbit-info');
    if (orbitInfo) {
        orbitInfo.innerHTML = `
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                <span>🌌 ${totalCount} asteroids tracked</span>
                <span class="text-orange-400">⚠️ ${impactRiskCount} with impact risk</span>
                <span class="text-red-400">🚨 ${highRiskCount} high risk</span>
            </div>
        `;
    }
    
    // Update legend in the 3D view
    updateAsteroidLegend();
}

function updateAsteroidLegend() {
    // Find the legend container in the 3D view
    const legendContainer = document.querySelector('.flex.items-center.space-x-2.sm\\:space-x-4');
    if (legendContainer) {
        legendContainer.innerHTML = `
            <div class="flex items-center space-x-1 sm:space-x-2">
                <div class="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                <span>Earth</span>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-2">
                <div class="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>High Risk</span>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-2">
                <div class="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
                <span>PHA</span>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-2">
                <div class="w-2 h-2 sm:w-3 sm:h-3 bg-cyan-400 rounded-full"></div>
                <span>NEO</span>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-2">
                <div class="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full opacity-60"></div>
                <span>Impact Point</span>
            </div>
        `;
    }
}

function createAsteroidObjects(asteroids) {
    // Clear existing asteroids
    asteroidObjects.forEach(obj => {
        scene.remove(obj.mesh);
        if (obj.orbit) scene.remove(obj.orbit);
    });
    asteroidObjects = [];
    orbitLines = [];
    
    asteroids.forEach((asteroidData, index) => {
        // Calculate orbit parameters
        const orbitData = calculateOrbitFromNASAData(asteroidData, index);
        
        // Calculate initial 3D position using orbital mechanics
        const initialPosition = calculateInitialAsteroidPosition(asteroidData, orbitData, index);
        
        // Log real distance data for verification
        if (index < 5) {
            console.log(`🌌 Asteroid ${asteroidData.name || asteroidData.id}:`, {
                distance: (orbitData.realDistanceAU?.toFixed(4) || 'N/A') + ' AU',
                position: `(${initialPosition.x.toFixed(2)}, ${initialPosition.y.toFixed(2)}, ${initialPosition.z.toFixed(2)})`,
                orbitalData: asteroidData.orbital_data ? 'YES' : 'NO',
                inclination: orbitData.inclination?.toFixed(2) + '°',
                trueAnomaly: initialPosition.trueAnomaly ? (initialPosition.trueAnomaly * 180 / Math.PI).toFixed(1) + '°' : 'N/A'
            });
        }
        
        // Create enhanced asteroid visualization like NASA Eyes
        const size = getAsteroidSize(asteroidData);
        const geometry = new THREE.SphereGeometry(size, 12, 12);
        
        // NASA Eyes-style coloring with enhanced visibility
        let color, emissive;
        
        if (asteroidData.is_potentially_hazardous_asteroid) {
            // Hazardous asteroids: bright red
            color = 0xff3333;
            emissive = 0x440000;
        } else if (asteroidData.sentryData && asteroidData.sentryData.impactProbability > 0) {
            // Sentry objects: bright orange
            color = 0xff8800;
            emissive = 0x442200;
        } else if (orbitData.realDistanceAU && orbitData.realDistanceAU < 1.3) {
            // Close asteroids: bright blue
            color = 0xffffff;
            emissive = 0x1a1a1a;
        } else {
            // Regular asteroids: white/cyan
            color = 0xffffff;
            emissive = 0x404040;
        }
        
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            emissive: emissive,
            emissiveIntensity: 0.3
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.userData = {
            asteroidData: asteroidData,
            asteroidId: asteroidData.id
        };
        
        // Use the already calculated initial position
        mesh.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
        scene.add(mesh);
        
        // Create elliptical orbit trajectory (pass asteroid position for perfect connection)
        const orbitLine = createEllipticalOrbit(orbitData, asteroidData, index, initialPosition);
        if (orbitLine) {
            scene.add(orbitLine);
        }
        
        // Store reference
        asteroidObjects.push({
            mesh: mesh,
            orbit: orbitLine,
            orbitData: orbitData,
            data: asteroidData
        });
        
        // Make clickable
        mesh.callback = () => selectAsteroid(asteroidData);
    });
    
    // Add click detection
    setupAsteroidClickDetection();
    
    // Final statistics
    const totalWithOrbits = asteroidObjects.filter(obj => obj.orbit).length;
    console.log(`🎯 NASA Eyes Style Visualization Complete:`);
    console.log(`   • Total asteroids: ${asteroidObjects.length}`);
    console.log(`   • With trajectories: ${totalWithOrbits}`);
    console.log(`   • Trajectory visibility: ${state.showTrajectories ? 'ON' : 'OFF'}`);
    console.log(`   • Max orbits shown: ${state.maxOrbitsToShow}`);
}

function calculateInitialAsteroidPosition(asteroidData, orbitData, index) {
    // Use real orbital mechanics for accurate positioning like NASA Eyes
    const orbitalData = asteroidData.orbital_data || {};
    
    // Get orbital elements with fallbacks
    const semiMajorAxis = orbitData.realDistanceAU || orbitData.distance || 1.5; // AU
    const eccentricity = Math.min(orbitData.eccentricity || 0.1, 0.95);
    const inclination = (orbitData.inclination || (index * 0.5) % 30) * (Math.PI / 180); // degrees to radians
    
    // Get angular elements (with fallbacks for missing data)
    let argumentOfPerihelion = 0;
    let longitudeOfAscendingNode = 0;
    let meanAnomaly = (index * 0.1) % (2 * Math.PI); // Spread asteroids around orbit
    
    if (orbitalData.perihelion_argument) {
        argumentOfPerihelion = parseFloat(orbitalData.perihelion_argument) * (Math.PI / 180);
    } else {
        argumentOfPerihelion = (index * 0.3) % (2 * Math.PI); // Distribute randomly
    }
    
    if (orbitalData.ascending_node_longitude) {
        longitudeOfAscendingNode = parseFloat(orbitalData.ascending_node_longitude) * (Math.PI / 180);
    } else {
        longitudeOfAscendingNode = (index * 0.2) % (2 * Math.PI); // Distribute randomly
    }
    
    if (orbitalData.mean_anomaly) {
        meanAnomaly = parseFloat(orbitalData.mean_anomaly) * (Math.PI / 180);
    }
    
    // Solve Kepler's equation for eccentric anomaly (simplified Newton-Raphson)
    let eccentricAnomaly = meanAnomaly;
    for (let i = 0; i < 5; i++) {
        const f = eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
        const fp = 1 - eccentricity * Math.cos(eccentricAnomaly);
        if (Math.abs(fp) > 1e-10) {
            eccentricAnomaly = eccentricAnomaly - f / fp;
        }
    }
    
    // Calculate true anomaly
    const trueAnomaly = 2 * Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
        Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
    );
    
    // Calculate distance from Sun (heliocentric distance)
    const radius = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
    
    // Position in orbital plane
    const x_orbital = radius * Math.cos(trueAnomaly);
    const y_orbital = radius * Math.sin(trueAnomaly);
    const z_orbital = 0;
    
    // Apply 3D rotations to get heliocentric position
    // 1. Argument of perihelion rotation (ω)
    const cos_w = Math.cos(argumentOfPerihelion);
    const sin_w = Math.sin(argumentOfPerihelion);
    const x1 = cos_w * x_orbital - sin_w * y_orbital;
    const y1 = sin_w * x_orbital + cos_w * y_orbital;
    const z1 = z_orbital;
    
    // 2. Inclination rotation (i)
    const cos_i = Math.cos(inclination);
    const sin_i = Math.sin(inclination);
    const x2 = x1;
    const y2 = cos_i * y1 - sin_i * z1;
    const z2 = sin_i * y1 + cos_i * z1;
    
    // 3. Longitude of ascending node rotation (Ω)
    const cos_O = Math.cos(longitudeOfAscendingNode);
    const sin_O = Math.sin(longitudeOfAscendingNode);
    const x3 = cos_O * x2 - sin_O * y2;
    const y3 = sin_O * x2 + cos_O * y2;
    const z3 = z2;
    
    // Scale for visualization (1 AU = 10 units in our 3D space)
    const scale = 10;
    
    return { 
        x: x3 * scale, 
        y: y3 * scale, 
        z: z3 * scale,
        // Store additional data for trajectory connection
        trueAnomaly: trueAnomaly,
        radius: radius,
        orbitalElements: {
            semiMajorAxis,
            eccentricity,
            inclination,
            argumentOfPerihelion,
            longitudeOfAscendingNode,
            meanAnomaly
        }
    };
}

function calculateOrbitFromNASAData(asteroidData, index) {
    // Extract orbital data if available
    const orbitalData = asteroidData.orbital_data || {};
    
    // Default values
    let distance = 3 + (index * 0.1); // Fallback spacing
    let semiMajorAxis = distance;
    let eccentricity = 0.1;
    let inclination = 0;
    let speed = 0.0003;
    let realDistanceAU = null;
    
    // Priority 1: Use semi-major axis (a) from orbital data - most accurate
    if (orbitalData.semi_major_axis) {
        semiMajorAxis = parseFloat(orbitalData.semi_major_axis);
        realDistanceAU = semiMajorAxis;
        // Scale AU to visualization units (1 AU = 2 units in our scene)
        distance = semiMajorAxis * 2;
    }
    // Priority 2: Use close approach data
    else if (asteroidData.close_approach_data && asteroidData.close_approach_data.length > 0) {
        const approach = asteroidData.close_approach_data[0];
        
        // Use astronomical units if available
        if (approach.miss_distance && approach.miss_distance.astronomical) {
            realDistanceAU = parseFloat(approach.miss_distance.astronomical);
            distance = realDistanceAU * 2; // Scale: 1 AU = 2 units
        }
        // Fallback to kilometers
        else if (approach.miss_distance && approach.miss_distance.kilometers) {
            const missDistanceKm = parseFloat(approach.miss_distance.kilometers);
            realDistanceAU = missDistanceKm / 149597870.7; // Convert km to AU
            distance = realDistanceAU * 2;
        }
    }
    
    // Clamp distance for visualization (0.5 to 20 units = 0.25 to 10 AU)
    distance = Math.max(0.5, Math.min(20, distance));
    
    // Get eccentricity (orbital shape)
    if (orbitalData.eccentricity) {
        eccentricity = Math.min(0.9, parseFloat(orbitalData.eccentricity)); // Clamp to prevent extreme orbits
    }
    
    // Get inclination (tilt of orbit)
    if (orbitalData.inclination) {
        inclination = parseFloat(orbitalData.inclination) * (Math.PI / 180); // Convert to radians (full scale for visibility)
    }
    
    // Calculate orbital speed based on period
    if (orbitalData.orbital_period) {
        const period = parseFloat(orbitalData.orbital_period);
        speed = (2 * Math.PI) / (period * 10); // Scale for visualization
    }
    
    return {
        distance: distance,
        semiMajorAxis: semiMajorAxis,
        eccentricity: eccentricity,
        inclination: inclination,
        speed: speed,
        realDistanceAU: realDistanceAU // Store real distance for display
    };
}

function createEllipticalOrbit(orbitData, asteroidData, index, asteroidPosition) {
    // Check if trajectories are enabled
    if (!state.showTrajectories) return null;
    
    // Show orbits for more asteroids like NASA Eyes on Asteroids
    // Use performance-based limiting: show orbits based on state
    if (index > state.maxOrbitsToShow) return null;
    
    const orbitalData = asteroidData.orbital_data || {};
    const points = [];
    const segments = 256; // Higher resolution for better visual quality
    
    // Use the SAME orbital elements as asteroid positioning for perfect connection
    const semiMajorAxis = orbitData.realDistanceAU || orbitData.distance || 1.5; // AU
    const eccentricity = Math.min(orbitData.eccentricity || 0.1, 0.95);
    const inclination = (orbitData.inclination || (index * 0.5) % 30) * (Math.PI / 180);
    
    // Use same angular elements as asteroid positioning
    let argumentOfPerihelion = 0;
    let longitudeOfAscendingNode = 0;
    
    if (orbitalData.perihelion_argument) {
        argumentOfPerihelion = parseFloat(orbitalData.perihelion_argument) * (Math.PI / 180);
    } else {
        argumentOfPerihelion = (index * 0.3) % (2 * Math.PI); // Same as asteroid positioning
    }
    
    if (orbitalData.ascending_node_longitude) {
        longitudeOfAscendingNode = parseFloat(orbitalData.ascending_node_longitude) * (Math.PI / 180);
    } else {
        longitudeOfAscendingNode = (index * 0.2) % (2 * Math.PI); // Same as asteroid positioning
    }
    
    // Calculate Earth's position for impact trajectory
    const earthPosition = { x: 10, y: 0, z: 0 }; // Earth at 1 AU
    let impactPoint = null;
    let closestDistance = Infinity;
    let impactTrueAnomaly = null;
    
    // Generate ellipse points using EXACT same orbital mechanics as asteroid positioning
    for (let i = 0; i <= segments; i++) {
        const trueAnomaly = (i / segments) * Math.PI * 2;
        
        // Calculate radius using vis-viva equation
        const radius = semiMajorAxis * (1 - eccentricity * eccentricity) / 
                      (1 + eccentricity * Math.cos(trueAnomaly));
        
        // Position in orbital plane
        const x_orbital = radius * Math.cos(trueAnomaly);
        const y_orbital = radius * Math.sin(trueAnomaly);
        const z_orbital = 0;
        
        // Apply SAME 3D rotations as asteroid positioning
        // 1. Argument of perihelion rotation (ω)
        const cos_w = Math.cos(argumentOfPerihelion);
        const sin_w = Math.sin(argumentOfPerihelion);
        const x1 = cos_w * x_orbital - sin_w * y_orbital;
        const y1 = sin_w * x_orbital + cos_w * y_orbital;
        const z1 = z_orbital;
        
        // 2. Inclination rotation (i)
        const cos_i = Math.cos(inclination);
        const sin_i = Math.sin(inclination);
        const x2 = x1;
        const y2 = cos_i * y1 - sin_i * z1;
        const z2 = sin_i * y1 + cos_i * z1;
        
        // 3. Longitude of ascending node rotation (Ω)
        const cos_O = Math.cos(longitudeOfAscendingNode);
        const sin_O = Math.sin(longitudeOfAscendingNode);
        const x3 = cos_O * x2 - sin_O * y2;
        const y3 = sin_O * x2 + cos_O * y2;
        const z3 = z2;
        
        // Apply SAME scaling as asteroid positioning (1 AU = 10 units)
        const scale = 10;
        const point = new THREE.Vector3(x3 * scale, y3 * scale, z3 * scale);
        points.push(point);
        
        // Check for potential Earth impact (closest approach)
        const distanceToEarth = Math.sqrt(
            Math.pow(point.x - earthPosition.x, 2) +
            Math.pow(point.y - earthPosition.y, 2) +
            Math.pow(point.z - earthPosition.z, 2)
        );
        
        if (distanceToEarth < closestDistance) {
            closestDistance = distanceToEarth;
            impactPoint = point.clone();
            impactTrueAnomaly = trueAnomaly;
        }
    }
    
    // Create orbit line group
    const orbitGroup = new THREE.Group();
    
    // Main orbit line
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Enhanced NASA Eyes-style coloring and visibility
    let color, opacity;
    
    if (asteroidData.is_potentially_hazardous_asteroid) {
        // Hazardous asteroids: bright red/orange orbits
        color = 0xff4444;
        opacity = 0.7;
    } else if (asteroidData.sentryData && asteroidData.sentryData.impactProbability > 0) {
        // Sentry objects: yellow/orange orbits
        color = 0xffaa00;
        opacity = 0.6;
    } else if (orbitData.realDistanceAU && orbitData.realDistanceAU < 1.3) {
        // Close asteroids: blue orbits
        color = 0xffffff;
        opacity = 0.5;
    } else {
        // Regular asteroids: dim white/gray orbits
        color = 0xffffff;
        opacity = 0.3;
    }
    
    // Create material with NASA Eyes styling
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        linewidth: 1,
        depthWrite: false, // Prevent z-fighting issues
        blending: THREE.AdditiveBlending // Additive blending for better visibility
    });
    
    const orbitLine = new THREE.Line(geometry, material);
    orbitGroup.add(orbitLine);
    
    // Add impact point visualization if close approach detected
    if (impactPoint && closestDistance < 2.0) { // Within 2 units (0.2 AU) of Earth
        // Create impact point marker
        const impactGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const impactMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        const impactMarker = new THREE.Mesh(impactGeometry, impactMaterial);
        impactMarker.position.copy(impactPoint);
        orbitGroup.add(impactMarker);
        
        // Add pulsing animation to impact point
        impactMarker.userData = {
            isImpactPoint: true,
            originalScale: 1,
            pulseSpeed: 0.05
        };
        
        // Create connection line from asteroid to impact point
        const connectionPoints = [asteroidPosition, impactPoint];
        const connectionGeometry = new THREE.BufferGeometry().setFromPoints(connectionPoints);
        const connectionMaterial = new THREE.LineDashedMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.8,
            dashSize: 0.5,
            gapSize: 0.3,
            linewidth: 2
        });
        const connectionLine = new THREE.Line(connectionGeometry, connectionMaterial);
        connectionLine.computeLineDistances(); // Required for dashed lines
        orbitGroup.add(connectionLine);
        
        // Add impact trajectory prediction using NASA's close approach data
        if (asteroidData.close_approach_data && asteroidData.close_approach_data.length > 0) {
            const closeApproach = asteroidData.close_approach_data[0];
            const approachDate = new Date(closeApproach.close_approach_date);
            
            // Create trajectory arc showing approach path
            const trajectoryPoints = [];
            const trajectorySegments = 32;
            
            for (let i = 0; i <= trajectorySegments; i++) {
                const t = i / trajectorySegments;
                const point = new THREE.Vector3().lerpVectors(asteroidPosition, impactPoint, t);
                
                // Add slight curve based on gravitational influence
                const earthGravityInfluence = Math.sin(t * Math.PI) * 0.5;
                point.y += earthGravityInfluence;
                
                trajectoryPoints.push(point);
            }
            
            const trajectoryGeometry = new THREE.BufferGeometry().setFromPoints(trajectoryPoints);
            const trajectoryMaterial = new THREE.LineBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.6,
                linewidth: 3
            });
            const trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
            orbitGroup.add(trajectoryLine);
        }
        
        // Store impact data for UI display
        orbitGroup.userData.impactData = {
            hasImpactRisk: true,
            closestDistance: closestDistance,
            impactPoint: impactPoint,
            impactTrueAnomaly: impactTrueAnomaly,
            distanceAU: closestDistance / 10, // Convert back to AU
            riskLevel: closestDistance < 1.0 ? 'HIGH' : closestDistance < 1.5 ? 'MEDIUM' : 'LOW'
        };
    }
    
    // Store orbital data for future reference
    orbitGroup.userData = {
        asteroidData: asteroidData,
        orbitData: orbitData,
        semiMajorAxis: semiMajorAxis,
        eccentricity: eccentricity,
        inclination: inclination,
        ...orbitGroup.userData
    };
    
    return orbitGroup;
}

function getAsteroidSize(asteroidData) {
    // Get estimated diameter
    let diameter = 100; // Default in meters
    
    if (asteroidData.estimated_diameter && asteroidData.estimated_diameter.meters) {
        const min = asteroidData.estimated_diameter.meters.estimated_diameter_min;
        const max = asteroidData.estimated_diameter.meters.estimated_diameter_max;
        diameter = (min + max) / 2;
    }
    
    // NASA Eyes-style sizing: make all asteroids visible but vary by importance
    let baseSize = 0.8; // Larger base size for visibility
    
    if (asteroidData.is_potentially_hazardous_asteroid) {
        baseSize = 1.2; // Larger for hazardous asteroids
    } else if (asteroidData.sentryData && asteroidData.sentryData.impactProbability > 0) {
        baseSize = 1.0; // Medium for Sentry objects
    }
    
    // Add size variation based on actual diameter (subtle)
    const sizeVariation = Math.log10(diameter) / 100; // Very subtle variation
    const finalSize = baseSize + sizeVariation;
    
    return Math.max(0.3, Math.min(1.5, finalSize)); // Ensure reasonable size range
}

function setupAsteroidClickDetection() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const container = document.getElementById('canvas-container');
    
    container.addEventListener('click', (event) => {
        // Calculate mouse position in normalized device coordinates
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update raycaster
        raycaster.setFromCamera(mouse, camera);
        
        // Check for intersections
        const meshes = asteroidObjects.map(obj => obj.mesh);
        const intersects = raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const asteroidData = clickedMesh.userData.asteroidData;
            selectAsteroid(asteroidData);
        }
    });
    
    // Add hover effect with tooltip
    const tooltip = document.getElementById('tooltip');
    
    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const meshes = asteroidObjects.map(obj => obj.mesh);
        const intersects = raycaster.intersectObjects(meshes);
        
        // Reset all asteroids
        asteroidObjects.forEach(obj => {
            if (obj.mesh) {
                obj.mesh.material.opacity = 0.8;
                obj.mesh.scale.set(1, 1, 1);
            }
        });
        
        // Highlight hovered asteroid and show tooltip
        if (intersects.length > 0) {
            container.style.cursor = 'pointer';
            const hoveredObj = intersects[0].object;
            hoveredObj.material.opacity = 1.0;
            hoveredObj.scale.set(2, 2, 2);
            
            // Find the asteroid object data
            const asteroidObj = asteroidObjects.find(obj => obj.mesh === hoveredObj);
            if (asteroidObj && tooltip) {
                const data = asteroidObj.data;
                const orbitData = asteroidObj.orbitData;
                
                let tooltipText = `<strong>${data.name || data.id}</strong><br>`;
                
                if (orbitData.realDistanceAU) {
                    tooltipText += `Distance: ${orbitData.realDistanceAU.toFixed(4)} AU<br>`;
                    tooltipText += `(${(orbitData.realDistanceAU * 149597870.7).toFixed(0)} km)<br>`;
                }
                
                if (data.estimated_diameter && data.estimated_diameter.meters) {
                    const diameter = ((data.estimated_diameter.meters.estimated_diameter_min + 
                                     data.estimated_diameter.meters.estimated_diameter_max) / 2).toFixed(0);
                    tooltipText += `Diameter: ~${diameter}m<br>`;
                }
                
                if (data.is_potentially_hazardous_asteroid) {
                    tooltipText += `<span style="color: #ff6666;">⚠️ Potentially Hazardous</span>`;
                }
                
                tooltip.innerHTML = tooltipText;
                tooltip.style.display = 'block';
                tooltip.style.left = (event.clientX + 10) + 'px';
                tooltip.style.top = (event.clientY + 10) + 'px';
            }
        } else {
            container.style.cursor = 'default';
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        }
    });
}

function selectAsteroid(asteroidData) {
    console.log('Selected asteroid:', asteroidData);
    selectedAsteroid = asteroidData;
    state.selectedAsteroidId = asteroidData.id;
    
    // Highlight selected asteroid
    asteroidObjects.forEach(obj => {
        if (obj.data.id === asteroidData.id) {
            obj.mesh.material.color.setHex(0xffff00); // Yellow for selected
            obj.mesh.material.opacity = 1.0;
            if (obj.orbit) {
                obj.orbit.material.opacity = 0.8;
                obj.orbit.material.color.setHex(0xffff00);
            }
        } else {
            const color = obj.data.is_potentially_hazardous_asteroid ? 0xff3333 : 0xffffff;
            obj.mesh.material.color.setHex(color);
            obj.mesh.material.opacity = 0.8;
            if (obj.orbit) {
                obj.orbit.material.opacity = 0.2;
                const orbitColor = obj.data.is_potentially_hazardous_asteroid ? 0xff6666 : 0xffffff;
                obj.orbit.material.color.setHex(orbitColor);
            }
        }
    });
    
    // Show asteroid details panel
    showAsteroidDetails(asteroidData);
    
    // Load parameters into calculator
    loadAsteroidParameters(asteroidData);
}

function showAsteroidDetails(asteroidData) {
    // Create or update details panel as right sidebar
    let detailsPanel = document.getElementById('asteroid-details-panel');
    
    if (!detailsPanel) {
        detailsPanel = document.createElement('div');
        detailsPanel.id = 'asteroid-details-panel';
        // Desktop: Right sidebar, Mobile: Full screen modal
        detailsPanel.className = 'fixed top-0 right-0 h-full w-full md:w-96 z-50 transform translate-x-full transition-transform duration-300 ease-in-out';
        document.body.appendChild(detailsPanel);
        
        // Add styles for sidebar
        if (!document.getElementById('asteroid-panel-styles')) {
            const style = document.createElement('style');
            style.id = 'asteroid-panel-styles';
            style.textContent = `
                .asteroid-sidebar-open {
                    transform: translateX(0) !important;
                }
                
                @media (max-width: 768px) {
                    #asteroid-details-panel {
                        width: 100% !important;
                    }
                }
                
                .stat-card {
                    transition: all 0.3s ease;
                }
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                }
                
                /* Custom scrollbar for sidebar */
                .asteroid-sidebar-content::-webkit-scrollbar {
                    width: 6px;
                }
                .asteroid-sidebar-content::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                }
                .asteroid-sidebar-content::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 3px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Show the sidebar
    detailsPanel.classList.add('asteroid-sidebar-open');
    
    // Get diameter
    let diameterText = 'Unknown';
    if (asteroidData.estimated_diameter && asteroidData.estimated_diameter.meters) {
        const min = asteroidData.estimated_diameter.meters.estimated_diameter_min;
        const max = asteroidData.estimated_diameter.meters.estimated_diameter_max;
        diameterText = `${min.toFixed(0)} - ${max.toFixed(0)} m`;
    }
    
    // Get velocity
    let velocityText = 'Unknown';
    if (asteroidData.close_approach_data && asteroidData.close_approach_data.length > 0) {
        const velocity = parseFloat(asteroidData.close_approach_data[0].relative_velocity.kilometers_per_second);
        velocityText = `${velocity.toFixed(2)} km/s`;
    }
    
    // Get miss distance
    let missDistanceText = 'Unknown';
    if (asteroidData.close_approach_data && asteroidData.close_approach_data.length > 0) {
        const missKm = parseFloat(asteroidData.close_approach_data[0].miss_distance.kilometers);
        const lunarDistance = missKm / 384400;
        missDistanceText = `${lunarDistance.toFixed(2)} LD (${(missKm / 1000000).toFixed(2)} million km)`;
    }
    
    // Get orbital data
    const orbitalData = asteroidData.orbital_data || {};
    
    // Get Sentry risk data
    const sentryData = asteroidData.sentryData || null;
    
    // Determine risk level color
    let riskColor = '#4ade80'; // green
    let riskLevel = 'Low Risk';
    if (sentryData) {
        if (sentryData.torinoScale >= 2) {
            riskColor = '#ef4444'; // red
            riskLevel = 'High Risk';
        } else if (sentryData.torinoScale >= 1 || sentryData.impactProbability > 0.001) {
            riskColor = '#fbbf24'; // yellow
            riskLevel = 'Moderate Risk';
        }
    }
    
    detailsPanel.innerHTML = `
        <!-- Solid Background Sidebar -->
        <div class="h-full bg-gray-900 border-l border-gray-700 flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <i data-lucide="orbit" class="w-5 h-5 text-white"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white truncate">${asteroidData.name}</h3>
                        <p class="text-xs text-blue-100 font-mono">ID: ${asteroidData.id}</p>
                    </div>
                </div>
                <button onclick="closeAsteroidDetails()" class="p-2 hover:bg-white/20 rounded-lg transition-all">
                    <i data-lucide="x" class="w-5 h-5 text-white"></i>
                </button>
            </div>
            
            <!-- Hazard Status -->
            <div class="p-4 border-b border-gray-700">
                ${asteroidData.is_potentially_hazardous_asteroid ? 
                    '<div class="flex items-center space-x-2 bg-red-600 rounded-lg px-3 py-2"><div class="w-2 h-2 bg-white rounded-full animate-pulse"></div><span class="text-white text-sm font-semibold">POTENTIALLY HAZARDOUS</span></div>' 
                    : '<div class="flex items-center space-x-2 bg-green-600 rounded-lg px-3 py-2"><div class="w-2 h-2 bg-white rounded-full"></div><span class="text-white text-sm font-semibold">SAFE TRAJECTORY</span></div>'}
            </div>
            
            <!-- Scrollable Content -->
            <div class="flex-1 overflow-y-auto asteroid-sidebar-content p-4 space-y-4"
                ${sentryData ? `
                <div class="bg-orange-600 rounded-lg p-4">
                    <h5 class="font-semibold text-white flex items-center space-x-2 mb-3">
                        <i data-lucide="shield-alert" class="w-4 h-4"></i>
                        <span>Impact Risk Assessment</span>
                    </h5>
                    <div class="space-y-2 text-sm text-white">
                        <div class="flex justify-between">
                            <span>Risk Level:</span>
                            <span class="font-bold">${riskLevel}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Impact Probability:</span>
                            <span class="font-medium">${(sentryData.impactProbability * 100).toExponential(2)}%</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Torino Scale:</span>
                            <span class="font-medium">${sentryData.torinoScale}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- Physical Properties -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h5 class="font-semibold text-white mb-3">Physical Properties</h5>
                    <div class="space-y-3">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Diameter:</span>
                            <span class="text-white font-medium">${diameterText}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Magnitude (H):</span>
                            <span class="text-white font-medium">${asteroidData.absolute_magnitude_h || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                ${asteroidData.close_approach_data && asteroidData.close_approach_data.length > 0 ? `
                <div class="bg-gray-800 rounded-lg p-4">
                    <h5 class="font-semibold text-white mb-3">Close Approach</h5>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Date:</span>
                            <span class="text-white font-medium">${new Date(asteroidData.close_approach_data[0].close_approach_date).toLocaleDateString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Velocity:</span>
                            <span class="text-white font-medium">${velocityText}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Miss Distance:</span>
                            <span class="text-white font-medium">${missDistanceText}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                ${orbitalData.orbit_class ? `
                <div class="bg-gray-800 rounded-lg p-4">
                    <h5 class="font-semibold text-white mb-3">Orbital Data</h5>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Orbit Class:</span>
                            <span class="text-white font-medium">${orbitalData.orbit_class.orbit_class_type || 'N/A'}</span>
                        </div>
                        ${orbitalData.orbital_period ? `
                        <div class="flex justify-between">
                            <span class="text-gray-400">Orbital Period:</span>
                            <span class="text-white font-medium">${parseFloat(orbitalData.orbital_period).toFixed(1)} days</span>
                        </div>
                        ` : ''}
                        ${orbitalData.eccentricity ? `
                        <div class="flex justify-between">
                            <span class="text-gray-400">Eccentricity:</span>
                            <span class="text-white font-medium">${parseFloat(orbitalData.eccentricity).toFixed(4)}</span>
                        </div>
                        ` : ''}
                        ${orbitalData.inclination ? `
                        <div class="flex justify-between">
                            <span class="text-gray-400">Inclination:</span>
                            <span class="text-white font-medium">${parseFloat(orbitalData.inclination).toFixed(2)}°</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ` : ''}
                
                <!-- Action Buttons -->
                <div class="space-y-2">
                    <button onclick="calculateImpactForSelected()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
                        Calculate Impact
                    </button>
                    <a href="${asteroidData.nasa_jpl_url}" target="_blank" class="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition text-center">
                        View on NASA JPL
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Reinitialize Lucide icons
    lucide.createIcons();
}

function closeAsteroidDetails() {
    const panel = document.getElementById('asteroid-details-panel');
    if (panel) {
        panel.classList.remove('asteroid-sidebar-open');
    }
    
    // Reset asteroid highlighting
    asteroidObjects.forEach(obj => {
        const color = obj.data.is_potentially_hazardous_asteroid ? 0xff4444 : 0xffffff;
        obj.mesh.material.color.setHex(color);
        obj.mesh.material.emissiveIntensity = 0.3;
        obj.orbit.material.opacity = 0.3;
        obj.orbit.material.color.setHex(0xffffff);
    });
    
    selectedAsteroid = null;
    state.selectedAsteroidId = null;
}

function loadAsteroidParameters(asteroidData) {
    // Load diameter
    if (asteroidData.estimated_diameter && asteroidData.estimated_diameter.meters) {
        const min = asteroidData.estimated_diameter.meters.estimated_diameter_min;
        const max = asteroidData.estimated_diameter.meters.estimated_diameter_max;
        const avgDiameter = (min + max) / 2;
        
        state.diameter = Math.round(avgDiameter);
        document.getElementById('diameter-slider').value = state.diameter;
    }
    
    // Load velocity
    if (asteroidData.close_approach_data && asteroidData.close_approach_data.length > 0) {
        const velocity = parseFloat(asteroidData.close_approach_data[0].relative_velocity.kilometers_per_second);
        state.velocity = Math.round(velocity);
        document.getElementById('velocity-slider').value = state.velocity;
    }
    
    updateSliderValues();
}

function calculateImpactForSelected() {
    if (selectedAsteroid) {
        loadAsteroidParameters(selectedAsteroid);
        calculateImpact();
        
        // Scroll to results
        document.getElementById('tab-impact').scrollIntoView({ behavior: 'smooth' });
    }
}

function updateAsteroidBrowser(asteroids) {
    // Add asteroid browser section if it doesn't exist
    let browserSection = document.getElementById('asteroid-browser-section');
    
    if (!browserSection) {
        // Insert after featured asteroids section
        const featuredSection = document.getElementById('featured-asteroids').parentElement;
        browserSection = document.createElement('div');
        browserSection.className = 'glass-effect rounded-xl p-6 mt-8';
        browserSection.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold flex items-center space-x-2">
                    <i data-lucide="telescope" class="w-5 h-5"></i>
                    <span>All Tracked Asteroids (${asteroids.length})</span>
                </h2>
                <div class="flex items-center space-x-2">
                    <button id="toggle-all-asteroids" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition">
                        <i data-lucide="eye" class="w-4 h-4 inline-block mr-2"></i>
                        Show All in 3D
                    </button>
                </div>
            </div>
            <div id="asteroid-browser-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto"></div>
        `;
        featuredSection.parentElement.insertBefore(browserSection, featuredSection.nextSibling);
        
        // Add toggle functionality
        document.getElementById('toggle-all-asteroids').addEventListener('click', () => {
            state.showAllAsteroids = !state.showAllAsteroids;
            const btn = document.getElementById('toggle-all-asteroids');
            
            if (state.showAllAsteroids) {
                btn.innerHTML = '<i data-lucide="eye-off" class="w-4 h-4 inline-block mr-2"></i>Hide from 3D';
                asteroidObjects.forEach(obj => {
                    obj.mesh.visible = true;
                    obj.orbit.visible = true;
                });
            } else {
                btn.innerHTML = '<i data-lucide="eye" class="w-4 h-4 inline-block mr-2"></i>Show All in 3D';
                asteroidObjects.forEach(obj => {
                    obj.mesh.visible = false;
                    obj.orbit.visible = false;
                });
            }
            lucide.createIcons();
        });
    }
    
    const grid = document.getElementById('asteroid-browser-grid');
    grid.innerHTML = '';
    
    asteroids.forEach(asteroid => {
        const card = createAsteroidBrowserCard(asteroid);
        grid.appendChild(card);
    });
    
    lucide.createIcons();
}

function createAsteroidBrowserCard(asteroid) {
    const card = document.createElement('div');
    card.className = 'bg-white/5 rounded-lg p-3 hover:bg-white/10 transition cursor-pointer border border-transparent hover:border-blue-500';
    
    let diameter = 'Unknown';
    if (asteroid.estimated_diameter && asteroid.estimated_diameter.meters) {
        const avg = (asteroid.estimated_diameter.meters.estimated_diameter_min + 
                     asteroid.estimated_diameter.meters.estimated_diameter_max) / 2;
        diameter = `${avg.toFixed(0)}m`;
    }
    
    card.innerHTML = `
        <div class="flex items-start justify-between mb-2">
            <h4 class="font-semibold text-sm truncate flex-1">${asteroid.name}</h4>
            ${asteroid.is_potentially_hazardous_asteroid ? 
                '<i data-lucide="alert-triangle" class="w-4 h-4 text-red-400 flex-shrink-0"></i>' : 
                '<i data-lucide="check-circle" class="w-4 h-4 text-green-400 flex-shrink-0"></i>'}
        </div>
        <div class="text-xs text-gray-400 space-y-1">
            <div>Diameter: <span class="text-white">${diameter}</span></div>
            <div>Magnitude: <span class="text-white">${asteroid.absolute_magnitude_h || 'N/A'}</span></div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        selectAsteroid(asteroid);
        
        // Scroll 3D view into view
        document.getElementById('canvas-container').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    
    return card;
}

// ==================== Event Listeners ====================
function initEventListeners() {
    // Sliders
    document.getElementById('diameter-slider').addEventListener('input', (e) => {
        state.diameter = parseFloat(e.target.value);
        updateSliderValues();
    });
    
    document.getElementById('velocity-slider').addEventListener('input', (e) => {
        state.velocity = parseFloat(e.target.value);
        updateSliderValues();
    });
    
    document.getElementById('density-slider').addEventListener('input', (e) => {
        state.density = parseFloat(e.target.value);
        updateSliderValues();
    });
    
    document.getElementById('angle-slider').addEventListener('input', (e) => {
        state.angle = parseFloat(e.target.value);
        updateSliderValues();
    });
    
    // Preset scenarios
    document.getElementById('preset-select').addEventListener('change', (e) => {
        loadPreset(e.target.value);
    });
    
    // Calculate button
    document.getElementById('btn-calculate').addEventListener('click', calculateImpact);
    
    // Mitigation
    document.getElementById('btn-calculate-mitigation').addEventListener('click', calculateMitigation);
    
    document.getElementById('warning-time-slider').addEventListener('input', (e) => {
        document.getElementById('warning-time-value').textContent = e.target.value;
    });
    
    document.getElementById('deflection-time-slider').addEventListener('input', (e) => {
        document.getElementById('deflection-time-value').textContent = e.target.value;
    });
    
    // Tabs
    document.querySelectorAll('.result-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Info modal
    document.getElementById('btn-info').addEventListener('click', () => {
        document.getElementById('info-modal').classList.remove('hidden');
        document.getElementById('info-modal').classList.add('flex');
    });
    
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('info-modal').classList.add('hidden');
        document.getElementById('info-modal').classList.remove('flex');
    });
    
    // Defend Earth button
    document.getElementById('btn-defend-earth').addEventListener('click', startDefendEarthMode);
    
    // View buttons
    document.getElementById('btn-view-orbit').addEventListener('click', () => {
        switchView('orbit');
    });
    
    document.getElementById('btn-view-impact').addEventListener('click', () => {
        switchView('impact');
    });
    
    // Trajectory toggle button
    document.getElementById('btn-toggle-trajectories').addEventListener('click', () => {
        toggleTrajectories();
    });
    
    // Fullscreen toggle button
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
        toggleFullscreen();
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            // Toggle menu icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.setAttribute('data-lucide', 'menu');
            } else {
                icon.setAttribute('data-lucide', 'x');
            }
            // Refresh lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }
    
    // Mobile menu button handlers (duplicate functionality for mobile buttons)
    const mobileButtons = [
        { id: 'btn-defend-earth-mobile', handler: startDefendEarthMode },
        { id: 'btn-stories-mobile', handler: () => console.log('Stories clicked') },
        { id: 'btn-share-mobile', handler: () => console.log('Share clicked') },
        { id: 'btn-library-mobile', handler: () => console.log('Library clicked') }
    ];
    
    mobileButtons.forEach(({ id, handler }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                handler();
                // Close mobile menu after selection
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        }
    });
    
    // Add click interaction for 3D asteroids
    if (typeof renderer !== 'undefined' && renderer.domElement) {
        const canvas = renderer.domElement;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
    
    canvas.addEventListener('click', (event) => {
        // Calculate mouse position in normalized device coordinates
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update the raycaster
        raycaster.setFromCamera(mouse, camera);
        
        // Check for intersections with asteroids
        const asteroidMeshes = asteroidObjects.map(obj => obj.mesh);
        const intersects = raycaster.intersectObjects(asteroidMeshes);
        
        if (intersects.length > 0) {
            const selectedMesh = intersects[0].object;
            const asteroidData = selectedMesh.userData.asteroidData;
            const impactAnalysis = selectedMesh.userData.impactAnalysis;
            
            // Display asteroid information
            displayAsteroidInfo(asteroidData, impactAnalysis);
            
            // Highlight selected asteroid
            highlightAsteroid(selectedMesh);
        }
    });
    } else {
        console.warn('⚠️ Renderer not available for click interactions');
    }
    
}

function displayAsteroidInfo(asteroidData, impactAnalysis) {
    // Create or update asteroid info panel
    let infoPanel = document.getElementById('asteroid-info-panel');
    if (!infoPanel) {
        infoPanel = document.createElement('div');
        infoPanel.id = 'asteroid-info-panel';
        infoPanel.className = 'fixed top-20 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-4 max-w-sm z-40 shadow-2xl';
        document.body.appendChild(infoPanel);
    }
    
    const diameter = getAsteroidDiameter(asteroidData);
    const closeApproach = asteroidData.close_approach_data?.[0];
    
    infoPanel.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <h3 class="text-lg font-bold text-white">${asteroidData.name || asteroidData.id}</h3>
            <button onclick="closeAsteroidInfo()" class="text-gray-400 hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        
        <div class="space-y-3 text-sm">
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <span class="text-gray-400">Diameter:</span>
                    <div class="text-white font-semibold">${diameter.toFixed(0)}m</div>
                </div>
                <div>
                    <span class="text-gray-400">Risk Level:</span>
                    <div class="font-semibold ${impactAnalysis.riskLevel === 'HIGH' ? 'text-red-400' : 
                        impactAnalysis.riskLevel === 'MEDIUM' ? 'text-orange-400' : 'text-green-400'}">
                        ${impactAnalysis.riskLevel}
                    </div>
                </div>
            </div>
            
            ${impactAnalysis.probability > 0 ? `
                <div class="bg-red-900/30 border border-red-700 rounded-lg p-3">
                    <div class="text-red-400 font-semibold mb-1">⚠️ Impact Risk Detected</div>
                    <div class="text-xs text-gray-300">
                        Probability: ${impactAnalysis.probability.toExponential(2)}
                        ${impactAnalysis.year ? `<br>Potential Year: ${impactAnalysis.year}` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${closeApproach ? `
                <div class="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                    <div class="text-blue-400 font-semibold mb-1">🌍 Close Approach</div>
                    <div class="text-xs text-gray-300">
                        Date: ${new Date(closeApproach.close_approach_date).toLocaleDateString()}<br>
                        Distance: ${parseFloat(closeApproach.miss_distance?.astronomical || 0).toFixed(4)} AU<br>
                        Velocity: ${parseFloat(closeApproach.relative_velocity?.kilometers_per_hour || 0).toFixed(0)} km/h
                    </div>
                </div>
            ` : ''}
            
            <div class="flex gap-2 pt-2">
                ${asteroidData.is_potentially_hazardous_asteroid ? 
                    '<span class="px-2 py-1 bg-red-600 text-white text-xs rounded">PHA</span>' : ''}
                ${asteroidData.sentryData ? 
                    '<span class="px-2 py-1 bg-orange-600 text-white text-xs rounded">Sentry</span>' : ''}
                ${asteroidData.is_neo ? 
                    '<span class="px-2 py-1 bg-blue-600 text-white text-xs rounded">NEO</span>' : ''}
            </div>
        </div>
    `;
    
    // Refresh lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function highlightAsteroid(mesh) {
    // Reset all asteroid materials
    asteroidObjects.forEach(obj => {
        if (obj.mesh.material.emissiveIntensity !== undefined) {
            obj.mesh.material.emissiveIntensity *= 0.5; // Dim others
        }
    });
    
    // Highlight selected asteroid
    if (mesh.material.emissiveIntensity !== undefined) {
        mesh.material.emissiveIntensity = 1.0; // Brighten selected
    }
    
    // Add selection ring
    const ringGeometry = new THREE.RingGeometry(mesh.geometry.parameters.radius * 1.5, mesh.geometry.parameters.radius * 2, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(mesh.position);
    ring.lookAt(camera.position);
    
    // Remove existing selection ring
    const existingRing = scene.getObjectByName('selection-ring');
    if (existingRing) {
        scene.remove(existingRing);
    }
    
    ring.name = 'selection-ring';
    scene.add(ring);
    
    // Animate ring
    const animateRing = () => {
        if (ring.parent) {
            ring.rotation.z += 0.02;
            ring.material.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
            requestAnimationFrame(animateRing);
        }
    };
    animateRing();
}

// Global function to close asteroid info
window.closeAsteroidInfo = function() {
    const infoPanel = document.getElementById('asteroid-info-panel');
    if (infoPanel) {
        infoPanel.remove();
    }
    
    // Reset asteroid highlighting
    asteroidObjects.forEach(obj => {
        if (obj.mesh.material.emissiveIntensity !== undefined) {
            // Restore original intensity based on asteroid type
            const asteroidData = obj.mesh.userData.asteroidData;
            const impactAnalysis = obj.mesh.userData.impactAnalysis;
            
            if (impactAnalysis.riskLevel === 'HIGH') {
                obj.mesh.material.emissiveIntensity = 0.8;
            } else if (asteroidData.is_potentially_hazardous_asteroid) {
                obj.mesh.material.emissiveIntensity = 0.4;
            } else if (asteroidData.sentryData) {
                obj.mesh.material.emissiveIntensity = 0.3;
            } else {
                obj.mesh.material.emissiveIntensity = 0.1;
            }
        }
    });
    
    // Remove selection ring
    const existingRing = scene.getObjectByName('selection-ring');
    if (existingRing) {
        scene.remove(existingRing);
    }
};

function updateSliderValues() {
    document.getElementById('diameter-value').textContent = state.diameter;
    document.getElementById('velocity-value').textContent = state.velocity;
    document.getElementById('density-value').textContent = state.density;
    document.getElementById('angle-value').textContent = state.angle;
    
    // Update asteroid size in 3D view (if main asteroid exists)
    // Removed - using NASA style with fixed-size asteroids
}

function loadPreset(preset) {
    const presets = {
        chelyabinsk: { diameter: 20, velocity: 19, density: 1800, angle: 18 },
        tunguska: { diameter: 60, velocity: 15, density: 2000, angle: 20 },
        'city-killer': { diameter: 150, velocity: 25, density: 2500, angle: 30 },
        regional: { diameter: 300, velocity: 20, density: 3000, angle: 45 },
        extinction: { diameter: 10000, velocity: 30, density: 3500, angle: 60 }
    };
    
    if (presets[preset]) {
        state.diameter = presets[preset].diameter;
        state.velocity = presets[preset].velocity;
        state.density = presets[preset].density;
        state.angle = presets[preset].angle;
        
        document.getElementById('diameter-slider').value = state.diameter;
        document.getElementById('velocity-slider').value = state.velocity;
        document.getElementById('density-slider').value = state.density;
        document.getElementById('angle-slider').value = state.angle;
        
        updateSliderValues();
    }
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.result-tab').forEach(tab => {
        tab.classList.remove('tab-active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('tab-active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
}

function switchView(view) {
    document.getElementById('btn-view-orbit').classList.remove('tab-active');
    document.getElementById('btn-view-impact').classList.remove('tab-active');
    
    if (view === 'orbit') {
        document.getElementById('btn-view-orbit').classList.add('tab-active');
        orbit.visible = true;
    } else {
        document.getElementById('btn-view-impact').classList.add('tab-active');
        orbit.visible = false;
    }
}

// ==================== NASA API Integration ====================
async function loadNASAStats() {
    try {
        // Try local API first
        const response = await fetch(`${API_BASE}/api/neo/stats`);
        const data = await response.json();
        
        if (data.near_earth_objects) {
            document.getElementById('stat-neos').textContent = 
                data.near_earth_objects.count.toLocaleString();
            return;
        }
    } catch (error) {
        console.error('Error loading NASA stats from local API:', error);
    }
    
    try {
        // Fallback to direct NASA API
        console.log('Trying direct NASA stats API...');
        const directResponse = await fetch('https://api.nasa.gov/neo/rest/v1/stats?api_key=DEMO_KEY');
        if (directResponse.ok) {
            const directData = await directResponse.json();
            if (directData.near_earth_objects) {
                document.getElementById('stat-neos').textContent = 
                    directData.near_earth_objects.count.toLocaleString();
                return;
            }
        }
    } catch (directError) {
        console.error('Direct NASA stats API also failed:', directError);
    }
    
    // Final fallback
    document.getElementById('stat-neos').textContent = '30,000+';
}

async function loadFeaturedAsteroids() {
    try {
        const response = await fetch(`${API_BASE}/api/asteroids/featured`);
        const data = await response.json();
        
        const container = document.getElementById('featured-asteroids');
        container.innerHTML = '';
        
        if (data.asteroids && data.asteroids.length > 0) {
            document.getElementById('stat-hazardous').textContent = data.count;
            
            data.asteroids.slice(0, 6).forEach(asteroid => {
                const card = createAsteroidCard(asteroid);
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p class="text-gray-400 col-span-full text-center">No potentially hazardous asteroids in the next 7 days</p>';
            document.getElementById('stat-hazardous').textContent = '0';
        }
    } catch (error) {
        console.error('Error loading featured asteroids:', error);
        const container = document.getElementById('featured-asteroids');
        container.innerHTML = '<p class="text-red-400 col-span-full text-center">Failed to load NASA data. Using demo mode.</p>';
        document.getElementById('stat-hazardous').textContent = 'N/A';
    }
}

function createAsteroidCard(asteroid) {
    const card = document.createElement('div');
    card.className = 'bg-black border border-white rounded-xl p-4 sm:p-6 hover:scale-105 hover:border-white transition-all duration-300 cursor-pointer relative';
    
    const diameter = ((asteroid.diameter_min + asteroid.diameter_max) / 2).toFixed(0);
    const approachDate = new Date(asteroid.close_approach_date);
    const isRecent = (approachDate - new Date()) < 30 * 24 * 60 * 60 * 1000; // Within 30 days
    
    card.innerHTML = `
        <!-- Threat Level Indicator -->
        <div class="absolute top-0 right-0 w-16 h-16 bg-white rounded-bl-full"></div>
        
        <!-- Header Section -->
        <div class="flex items-start justify-between mb-4 relative z-10">
            <div class="flex-1 min-w-0">
                <h3 class="font-bold text-base sm:text-lg text-white truncate orbitron">${asteroid.name}</h3>
                <div class="flex items-center space-x-2 mt-1">
                    ${asteroid.is_hazardous ? 
                        '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white text-black border border-white"><i data-lucide="alert-triangle" class="w-3 h-3 mr-1"></i>Hazardous</span>' : 
                        '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white text-black border border-white"><i data-lucide="check-circle" class="w-3 h-3 mr-1"></i>Safe</span>'
                    }
                    ${isRecent ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white text-black border border-white"><i data-lucide="clock" class="w-3 h-3 mr-1"></i>Soon</span>' : ''}
                </div>
            </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-black border border-white rounded-lg p-3 text-center">
                <div class="flex items-center justify-center mb-1">
                    <i data-lucide="circle" class="w-4 h-4 text-white mr-1"></i>
                    <span class="text-xs text-white">Size</span>
                </div>
                <div class="text-lg font-bold text-white orbitron">${diameter}m</div>
            </div>
            <div class="bg-black border border-white rounded-lg p-3 text-center">
                <div class="flex items-center justify-center mb-1">
                    <i data-lucide="zap" class="w-4 h-4 text-white mr-1"></i>
                    <span class="text-xs text-white">Speed</span>
                </div>
                <div class="text-lg font-bold text-white orbitron">${asteroid.velocity.toFixed(1)}</div>
                <div class="text-xs text-white">km/s</div>
            </div>
        </div>
        
        <!-- Distance & Date -->
        <div class="space-y-2 mb-4">
            <div class="flex items-center justify-between p-3 bg-black border border-white rounded-lg">
                <div class="flex items-center">
                    <i data-lucide="target" class="w-4 h-4 text-white mr-2"></i>
                    <span class="text-sm text-white">Miss Distance</span>
                </div>
                <span class="text-sm font-semibold text-white">${(asteroid.miss_distance / 384400).toFixed(2)} LD</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-black border border-white rounded-lg">
                <div class="flex items-center">
                    <i data-lucide="calendar" class="w-4 h-4 text-white mr-2"></i>
                    <span class="text-sm text-white">Approach</span>
                </div>
                <span class="text-sm font-semibold text-white">${approachDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
        </div>
        
        <!-- Action Button -->
        <button class="w-full cosmic-btn py-3 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 hover:scale-105 transition-transform">
            <i data-lucide="calculator" class="w-4 h-4"></i>
            <span>Simulate Impact</span>
        </button>
        
        <!-- Tap Indicator for Mobile -->
        <div class="absolute bottom-2 right-2 opacity-30 sm:hidden">
            <i data-lucide="touch-app" class="w-4 h-4 text-gray-400"></i>
        </div>
    `;
    
    // Enhanced click handler with visual feedback
    card.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Visual feedback
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
        
        // Update state and calculate
        state.diameter = parseFloat(diameter);
        state.velocity = asteroid.velocity;
        document.getElementById('diameter-slider').value = state.diameter;
        document.getElementById('velocity-slider').value = state.velocity;
        updateSliderValues();
        
        // Show loading state
        const button = card.querySelector('button');
        const originalContent = button.innerHTML;
        button.innerHTML = '<div class="loading-spinner mx-auto"></div>';
        
        // Calculate impact
        calculateImpact().then(() => {
            button.innerHTML = originalContent;
            lucide.createIcons();
            
            // Scroll to results on mobile
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    document.querySelector('.result-tab').scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        });
    });
    
    // Add touch feedback for mobile
    card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
    });
    
    card.addEventListener('touchend', () => {
        setTimeout(() => {
            card.style.transform = '';
        }, 100);
    });
    
    return card;
}

// ==================== Impact Calculations ====================
async function calculateImpact() {
    const btn = document.getElementById('btn-calculate');
    btn.disabled = true;
    btn.innerHTML = '<div class="loading-spinner mx-auto"></div>';
    
    try {
        const response = await fetch(`${FLASK_API}/api/calculate/impact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                diameter: state.diameter,
                velocity: state.velocity,
                density: state.density,
                angle: state.angle
            })
        });
        
        const data = await response.json();
        state.impactResults = data;
        
        displayImpactResults(data);
        updateStats(data);
        
    } catch (error) {
        console.error('Error calculating impact:', error);
        alert('Failed to calculate impact. Make sure the Flask server is running on port 5000.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="calculator" class="w-5 h-5"></i><span>Calculate Impact</span>';
        lucide.createIcons();
    }
}

function displayImpactResults(data) {
    // Energy
    document.getElementById('result-energy-mt').textContent = 
        data.energy.megatons_tnt.toFixed(2);
    document.getElementById('result-energy-hiroshima').textContent = 
        `${data.energy.hiroshima_bombs.toFixed(0)} bombs`;
    
    // Crater
    document.getElementById('result-crater-diameter').textContent = 
        `${data.crater.diameter_km.toFixed(2)} km`;
    document.getElementById('result-crater-depth').textContent = 
        `${data.crater.depth_meters.toFixed(0)} m`;
    
    // Seismic
    document.getElementById('result-seismic-mag').textContent = 
        data.seismic.magnitude.toFixed(1);
    document.getElementById('result-seismic-desc').textContent = 
        data.seismic.description;
    
    // Blast
    document.getElementById('result-blast-severe').textContent = 
        `${data.effects.blast_radius_severe_km.toFixed(1)} km`;
    document.getElementById('result-blast-moderate').textContent = 
        `${data.effects.blast_radius_moderate_km.toFixed(1)} km`;
    
    // Thermal
    document.getElementById('result-fireball').textContent = 
        `${data.effects.fireball_radius_km.toFixed(1)} km`;
    document.getElementById('result-thermal').textContent = 
        `${data.effects.thermal_radius_km.toFixed(1)} km`;
    
    // Classification
    document.getElementById('result-classification').textContent = 
        data.classification.level;
    document.getElementById('result-classification').style.color = 
        data.classification.color;
    document.getElementById('result-classification-desc').textContent = 
        data.classification.description;
}

function updateStats(data) {
    document.getElementById('stat-energy').textContent = 
        data.energy.megatons_tnt.toFixed(1);
    document.getElementById('stat-crater').textContent = 
        data.crater.diameter_km.toFixed(1);
}

// ==================== Mitigation Calculations ====================
async function calculateMitigation() {
    const strategy = document.getElementById('mitigation-strategy').value;
    const warningTime = parseFloat(document.getElementById('warning-time-slider').value);
    const deflectionTime = parseFloat(document.getElementById('deflection-time-slider').value);
    
    const btn = document.getElementById('btn-calculate-mitigation');
    btn.disabled = true;
    btn.innerHTML = '<div class="loading-spinner mx-auto"></div>';
    
    try {
        const response = await fetch(`${FLASK_API}/api/calculate/mitigation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                diameter: state.diameter,
                velocity: state.velocity,
                density: state.density,
                strategy: strategy,
                warning_time: warningTime,
                deflection_time: deflectionTime
            })
        });
        
        const data = await response.json();
        state.mitigationResults = data;
        
        displayMitigationResults(data);
        
    } catch (error) {
        console.error('Error calculating mitigation:', error);
        alert('Failed to calculate mitigation. Make sure the Flask server is running on port 5000.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Calculate Deflection';
    }
}

function displayMitigationResults(data) {
    const container = document.getElementById('mitigation-results');
    
    const statusColor = data.recommendation.color;
    const statusIcon = data.results.success ? 'check-circle' : 'alert-circle';
    
    container.innerHTML = `
        <div class="text-center mb-6">
            <i data-lucide="${statusIcon}" class="w-16 h-16 mx-auto mb-4" style="color: ${statusColor}"></i>
            <h4 class="text-2xl font-bold mb-2" style="color: ${statusColor}">${data.recommendation.status}</h4>
            <p class="text-gray-300">${data.recommendation.message}</p>
        </div>
        
        <div class="space-y-3">
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Strategy:</span>
                <span class="font-semibold">${formatStrategy(data.strategy)}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Delta-V:</span>
                <span class="font-semibold">${data.results.delta_v_cms.toFixed(4)} cm/s</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Deflection Distance:</span>
                <span class="font-semibold">${data.results.deflection_distance_km.toFixed(0)} km</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Deflection Angle:</span>
                <span class="font-semibold">${data.results.deflection_angle_degrees.toFixed(4)}°</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-400">Success Margin:</span>
                <span class="font-semibold" style="color: ${statusColor}">
                    ${data.results.success_margin_km > 0 ? '+' : ''}${data.results.success_margin_km.toFixed(0)} km
                </span>
            </div>
        </div>
        
        <div class="mt-6 p-4 bg-white/5 rounded-lg">
            <p class="text-sm text-gray-300">
                <strong>Note:</strong> This simulation assumes ideal conditions. 
                Actual deflection missions would require precise trajectory calculations 
                and multiple course corrections.
            </p>
        </div>
    `;
    
    lucide.createIcons();
}

function formatStrategy(strategy) {
    const strategies = {
        kinetic_impactor: 'Kinetic Impactor',
        gravity_tractor: 'Gravity Tractor',
        laser_ablation: 'Laser Ablation',
        nuclear: 'Nuclear Deflection'
    };
    return strategies[strategy] || strategy;
}

// ==================== Defend Earth Mode ====================
function startDefendEarthMode() {
    alert('🎮 Defend Earth Mode\n\nComing soon! This gamified mode will challenge you to save Earth from an incoming asteroid by choosing the right deflection strategy and timing.\n\nStay tuned!');
}

// ==================== Utility Functions ====================
function showTooltip(event, text) {
    const tooltip = document.getElementById('tooltip');
    tooltip.textContent = text;
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 10 + 'px';
    tooltip.style.top = event.pageY + 10 + 'px';
}

function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}

// Add tooltip listeners
document.querySelectorAll('[data-lucide="help-circle"]').forEach(icon => {
    icon.addEventListener('mouseenter', (e) => {
        showTooltip(e, icon.getAttribute('title'));
    });
    icon.addEventListener('mouseleave', hideTooltip);
});

// ==================== New NASA Resources Integration ====================

function initNewResourcesEventListeners() {
    // USGS Earthquake Data
    document.getElementById('btn-load-earthquakes')?.addEventListener('click', loadEarthquakeData);
    document.getElementById('btn-seismic-comparison')?.addEventListener('click', performSeismicComparison);
    
    // USGS Elevation Data
    document.getElementById('btn-get-elevation')?.addEventListener('click', getElevationData);
    
    // NASA Planetary Positions
    document.getElementById('btn-get-planets')?.addEventListener('click', getPlanetaryPositions);
    
    // NASA Comets
    document.getElementById('btn-load-comets')?.addEventListener('click', loadCometData);
    
    // CSA NEOSSAT
    document.getElementById('btn-load-neossat')?.addEventListener('click', loadNEOSSATData);
    
    // Advanced Orbital Propagator
    document.getElementById('btn-calculate-orbit')?.addEventListener('click', calculateAdvancedOrbit);
    
    // Set default date for planetary positions
    const today = new Date().toISOString().split('T')[0];
    const planetaryDateInput = document.getElementById('planetary-date');
    if (planetaryDateInput) {
        planetaryDateInput.value = today;
    }
}

async function loadEarthquakeData() {
    const container = document.getElementById('earthquake-data');
    container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-gray-400 mt-2">Loading USGS earthquake data...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/usgs/earthquakes?magnitude_min=6.0&days_back=30&limit=10`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        container.innerHTML = `
            <div class="mb-4 p-3 bg-orange-600/20 rounded-lg">
                <h4 class="font-semibold text-orange-400">Recent Major Earthquakes (M6.0+)</h4>
                <p class="text-sm text-gray-300">Found ${data.count} earthquakes in the last 30 days</p>
            </div>
            ${data.earthquakes.map(eq => `
                <div class="p-3 bg-white/5 rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                        <h5 class="font-semibold text-white">M${eq.magnitude}</h5>
                        <span class="text-xs text-gray-400">${new Date(eq.time).toLocaleDateString()}</span>
                    </div>
                    <p class="text-sm text-gray-300 mb-1">${eq.location}</p>
                    <div class="text-xs text-gray-400">
                        <span>Depth: ${eq.coordinates.depth}km</span>
                        ${eq.tsunami ? '<span class="ml-2 text-red-400">⚠️ Tsunami</span>' : ''}
                    </div>
                </div>
            `).join('')}
        `;
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading earthquake data:', error);
        container.innerHTML = `
            <div class="text-center text-red-400 py-4">
                <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                <p>Failed to load earthquake data</p>
                <p class="text-xs text-gray-400">${error.message}</p>
            </div>
        `;
        lucide.createIcons();
    }
}

async function performSeismicComparison() {
    if (!state.impactResults) {
        alert('Please calculate an impact first to compare with earthquakes.');
        return;
    }
    
    const container = document.getElementById('earthquake-data');
    container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-gray-400 mt-2">Comparing with historical earthquakes...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/usgs/impact-seismic-comparison`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                energy_megatons: state.impactResults.energy.megatons_tnt
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        container.innerHTML = `
            <div class="mb-4 p-3 bg-red-600/20 rounded-lg">
                <h4 class="font-semibold text-red-400">Seismic Impact Comparison</h4>
                <p class="text-sm text-gray-300">Impact equivalent to M${data.equivalent_earthquake.magnitude} earthquake</p>
            </div>
            
            <div class="p-3 bg-white/5 rounded-lg mb-3">
                <h5 class="font-semibold text-white mb-2">Equivalent Earthquake</h5>
                <div class="text-sm space-y-1">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Magnitude:</span>
                        <span class="text-white font-semibold">M${data.equivalent_earthquake.magnitude}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Description:</span>
                        <span class="text-white">${data.equivalent_earthquake.description}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Felt Radius:</span>
                        <span class="text-white">${data.seismic_effects.felt_radius_km.toFixed(0)} km</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Damage Radius:</span>
                        <span class="text-white">${data.seismic_effects.damage_radius_km.toFixed(0)} km</span>
                    </div>
                </div>
            </div>
            
            <div class="space-y-2">
                <h5 class="font-semibold text-white">Similar Historical Events:</h5>
                ${data.similar_historical_events.map(eq => `
                    <div class="p-2 bg-white/5 rounded">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold">M${eq.magnitude}</span>
                            <span class="text-xs text-gray-400">${eq.date}</span>
                        </div>
                        <p class="text-xs text-gray-300">${eq.location}</p>
                        ${eq.tsunami ? '<span class="text-xs text-red-400">⚠️ Tsunami</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error performing seismic comparison:', error);
        container.innerHTML = `
            <div class="text-center text-red-400 py-4">
                <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                <p>Failed to perform seismic comparison</p>
                <p class="text-xs text-gray-400">${error.message}</p>
            </div>
        `;
        lucide.createIcons();
    }
}

async function getElevationData() {
    const latitude = document.getElementById('impact-latitude').value;
    const longitude = document.getElementById('impact-longitude').value;
    
    if (!latitude || !longitude) {
        alert('Please enter both latitude and longitude coordinates.');
        return;
    }
    
    const container = document.getElementById('elevation-data');
    container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-gray-400 mt-2">Getting elevation data...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/usgs/elevation?latitude=${latitude}&longitude=${longitude}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        container.innerHTML = `
            <div class="p-3 bg-green-600/20 rounded-lg mb-3">
                <h4 class="font-semibold text-green-400">Elevation Data (USGS)</h4>
                <p class="text-sm text-gray-300">Location: ${latitude}°, ${longitude}°</p>
            </div>
            
            <div class="space-y-3">
                <div class="p-3 bg-white/5 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-400">Elevation:</span>
                        <span class="text-white font-semibold">${data.elevation.value} ${data.elevation.units}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-400">Data Source:</span>
                        <span class="text-white text-sm">${data.elevation.data_source}</span>
                    </div>
                </div>
                
                <div class="p-3 bg-white/5 rounded-lg">
                    <h5 class="font-semibold text-white mb-2">Crater Modeling</h5>
                    <p class="text-sm text-gray-300">
                        Base elevation: ${data.elevation.value}m above sea level
                    </p>
                    <p class="text-xs text-gray-400 mt-2">
                        Final crater elevation will be calculated based on impact parameters and crater depth.
                    </p>
                </div>
            </div>
        `;
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error getting elevation data:', error);
        container.innerHTML = `
            <div class="text-center text-red-400 py-4">
                <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                <p>Failed to get elevation data</p>
                <p class="text-xs text-gray-400">${error.message}</p>
            </div>
        `;
        lucide.createIcons();
    }
}

async function getPlanetaryPositions() {
    const date = document.getElementById('planetary-date').value;
    const container = document.getElementById('planetary-data');
    
    container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-gray-400 mt-2">Calculating planetary positions...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/nasa/planetary-positions?date=${date}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        container.innerHTML = `
            <div class="mb-3 p-3 bg-purple-600/20 rounded-lg">
                <h4 class="font-semibold text-purple-400">Planetary Positions</h4>
                <p class="text-sm text-gray-300">${new Date(data.date).toLocaleDateString()}</p>
                <p class="text-xs text-gray-400">JD: ${data.julian_day.toFixed(1)}</p>
            </div>
            
            <div class="space-y-2">
                ${Object.entries(data.planetary_positions).map(([planet, pos]) => `
                    <div class="p-2 bg-white/5 rounded">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold capitalize">${planet}</span>
                            <span class="text-sm text-gray-400">${pos.distance_au.toFixed(3)} AU</span>
                        </div>
                        <div class="text-xs text-gray-400 mt-1">
                            <span>X: ${pos.x_au.toFixed(3)}</span>
                            <span class="ml-2">Y: ${pos.y_au.toFixed(3)}</span>
                            <span class="ml-2">ν: ${pos.true_anomaly_deg.toFixed(1)}°</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-3 p-2 bg-white/5 rounded text-xs text-gray-400">
                <p>Coordinates: Heliocentric ecliptic (AU)</p>
                <p>Reference: NASA Approximate Positions</p>
            </div>
        `;
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error getting planetary positions:', error);
        container.innerHTML = `
            <div class="text-center text-red-400 py-4">
                <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                <p>Failed to get planetary positions</p>
                <p class="text-xs text-gray-400">${error.message}</p>
            </div>
        `;
        lucide.createIcons();
    }
}

async function loadCometData() {
    const container = document.getElementById('comet-data');
    container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-white mt-2">Loading NASA comet data...</p></div>';
    
    try {
        console.log('Fetching comet data from:', `${API_BASE}/api/nasa/comets`);
        const response = await fetch(`${API_BASE}/api/nasa/comets`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Comet data received:', data);
        console.log('Number of comets:', data.count || data.length || 'unknown');
        console.log('Comets array:', data.comets || data.data || data);
        
        if (data.error) {
            throw new Error(data.message || data.error);
        }
        
        // Handle different possible API response structures
        let comets = data.comets || data.data || data;
        let count = data.count || comets.length || 0;
        
        if (!Array.isArray(comets)) {
            throw new Error('Invalid comet data format received');
        }
        
        container.innerHTML = `
            <div class="mb-3 p-3 bg-black border border-white rounded-lg">
                <h4 class="font-semibold text-white">Near-Earth Comets</h4>
                <p class="text-sm text-white">${count} comets loaded</p>
                <p class="text-xs text-white">NASA Open Data Portal</p>
            </div>
            
            <div class="space-y-2 max-h-96 overflow-y-auto">
                ${comets.map(comet => `
                    <div class="p-2 bg-black border border-white rounded">
                        <div class="flex justify-between items-start">
                            <span class="font-semibold text-sm text-white">${comet.object_name || comet.full_name || comet.name || 'Unknown'}</span>
                            <span class="text-xs text-white">e=${comet.e?.toFixed(3) || comet.eccentricity?.toFixed(3) || 'N/A'}</span>
                        </div>
                        <div class="text-xs text-white mt-1">
                            <span>i: ${comet.i_deg?.toFixed(1) || comet.inclination?.toFixed(1) || 'N/A'}°</span>
                            <span class="ml-2">q: ${comet.q_au_1?.toFixed(3) || comet.perihelion?.toFixed(3) || 'N/A'} AU</span>
                            ${(comet.p_yr || comet.period) ? `<span class="ml-2">P: ${(comet.p_yr || comet.period).toFixed(1)} yr</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-3 p-2 bg-black border border-white rounded text-xs text-white">
                <p>Showing all ${count} comets</p>
                <p>e=eccentricity, i=inclination, q=perihelion, P=period</p>
            </div>
        `;
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading comet data:', error);
        
        // Try direct NASA API as fallback
        try {
            console.log('Trying direct NASA API fallback...');
            const directResponse = await fetch('https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=full_name,e,i,q,per_y&sb-class=COM&limit=200');
            if (directResponse.ok) {
                const directData = await directResponse.json();
                console.log('Direct NASA API response:', directData);
                
                if (directData.data && Array.isArray(directData.data)) {
                    const comets = directData.data.map(row => ({
                        object_name: row[0] || 'Unknown',
                        e: parseFloat(row[1]) || null,
                        i_deg: parseFloat(row[2]) || null,
                        q_au_1: parseFloat(row[3]) || null,
                        p_yr: parseFloat(row[4]) || null
                    }));
                    
                    container.innerHTML = `
                        <div class="mb-3 p-3 bg-black border border-white rounded-lg">
                            <h4 class="font-semibold text-white">Near-Earth Comets (Direct NASA API)</h4>
                            <p class="text-sm text-white">${comets.length} comets loaded</p>
                            <p class="text-xs text-white">NASA JPL Small-Body Database</p>
                        </div>
                        
                        <div class="space-y-2 max-h-96 overflow-y-auto">
                            ${comets.map(comet => `
                                <div class="p-2 bg-black border border-white rounded">
                                    <div class="flex justify-between items-start">
                                        <span class="font-semibold text-sm text-white">${comet.object_name}</span>
                                        <span class="text-xs text-white">e=${comet.e?.toFixed(3) || 'N/A'}</span>
                                    </div>
                                    <div class="text-xs text-white mt-1">
                                        <span>i: ${comet.i_deg?.toFixed(1) || 'N/A'}°</span>
                                        <span class="ml-2">q: ${comet.q_au_1?.toFixed(3) || 'N/A'} AU</span>
                                        ${comet.p_yr ? `<span class="ml-2">P: ${comet.p_yr.toFixed(1)} yr</span>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="mt-3 p-2 bg-black border border-white rounded text-xs text-white">
                            <p>Showing all ${comets.length} comets</p>
                            <p>e=eccentricity, i=inclination, q=perihelion, P=period</p>
                        </div>
                    `;
                    lucide.createIcons();
                    return;
                }
            }
        } catch (directError) {
            console.error('Direct NASA API also failed:', directError);
        }
        
        // Final fallback to demo data
        const demoComets = [
            { object_name: "1P/Halley", e: 0.967, i_deg: 162.3, q_au_1: 0.586, p_yr: 75.3 },
            { object_name: "2P/Encke", e: 0.848, i_deg: 11.8, q_au_1: 0.336, p_yr: 3.3 },
            { object_name: "55P/Tempel-Tuttle", e: 0.906, i_deg: 162.5, q_au_1: 0.982, p_yr: 33.2 },
            { object_name: "109P/Swift-Tuttle", e: 0.963, i_deg: 113.5, q_au_1: 0.960, p_yr: 133.3 },
            { object_name: "81P/Wild", e: 0.540, i_deg: 3.2, q_au_1: 1.583, p_yr: 5.5 },
            { object_name: "67P/Churyumov-Gerasimenko", e: 0.641, i_deg: 7.0, q_au_1: 1.243, p_yr: 6.4 }
        ];
        
        container.innerHTML = `
            <div class="mb-3 p-3 bg-black border border-white rounded-lg">
                <h4 class="font-semibold text-white">Demo Comet Data</h4>
                <p class="text-sm text-white">${demoComets.length} famous comets (offline mode)</p>
                <p class="text-xs text-white">Error: ${error.message}</p>
            </div>
            
            <div class="space-y-2">
                ${demoComets.map(comet => `
                    <div class="p-3 bg-black border border-white rounded-lg">
                        <div class="flex justify-between items-start">
                            <span class="font-semibold text-sm text-white">${comet.object_name}</span>
                            <span class="text-xs text-white">e=${comet.e.toFixed(3)}</span>
                        </div>
                        <div class="text-xs text-white mt-1">
                            <span>i: ${comet.i_deg.toFixed(1)}°</span>
                            <span class="ml-2">q: ${comet.q_au_1.toFixed(3)} AU</span>
                            <span class="ml-2">P: ${comet.p_yr.toFixed(1)} yr</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-3 p-3 bg-black border border-white rounded-lg text-xs text-white">
                <p><strong>Demo Mode:</strong> Showing all ${demoComets.length} famous comets</p>
                <p>e=eccentricity, i=inclination, q=perihelion distance, P=orbital period</p>
                <button onclick="loadCometData()" class="mt-2 px-3 py-1 bg-white hover:bg-black text-black hover:text-white rounded text-xs transition">
                    <i data-lucide="refresh-cw" class="w-3 h-3 inline mr-1"></i>
                    Retry NASA Data
                </button>
            </div>
        `;
        lucide.createIcons();
    }
}

async function loadNEOSSATData() {
    const targetType = document.getElementById('neossat-target').value;
    const container = document.getElementById('neossat-data');
    
    container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-gray-400 mt-2">Loading NEOSSAT data...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/csa/neossat?target_type=${targetType}&limit=10`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        container.innerHTML = `
            <div class="mb-3 p-3 bg-red-600/20 rounded-lg">
                <h4 class="font-semibold text-red-400">NEOSSAT Observations</h4>
                <p class="text-sm text-gray-300">${data.count} ${targetType} observations</p>
                <p class="text-xs text-gray-400">Canadian Space Agency</p>
            </div>
            
            <div class="space-y-2">
                ${data.observations.map(obs => `
                    <div class="p-2 bg-white/5 rounded">
                        <div class="flex justify-between items-start">
                            <span class="font-semibold text-sm">${obs.target_designation}</span>
                            <span class="text-xs ${obs.tracking_status === 'Confirmed' ? 'text-green-400' : 'text-yellow-400'}">${obs.tracking_status}</span>
                        </div>
                        <div class="text-xs text-gray-400 mt-1">
                            <span>Mag: ${obs.magnitude.toFixed(1)}</span>
                            <span class="ml-2">Exp: ${obs.exposure_time_sec.toFixed(0)}s</span>
                            <span class="ml-2">${new Date(obs.observation_time).toLocaleDateString()}</span>
                        </div>
                        <div class="text-xs text-gray-400">
                            <span>RA: ${obs.right_ascension_deg.toFixed(2)}°</span>
                            <span class="ml-2">Dec: ${obs.declination_deg.toFixed(2)}°</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-3 p-2 bg-white/5 rounded text-xs text-gray-400">
                <p><strong>Note:</strong> ${data.data_note}</p>
                <p>Real NEOSSAT data requires special access through CSA</p>
            </div>
        `;
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading NEOSSAT data:', error);
        container.innerHTML = `
            <div class="text-center text-red-400 py-4">
                <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                <p>Failed to load NEOSSAT data</p>
                <p class="text-xs text-gray-400">${error.message}</p>
            </div>
        `;
        lucide.createIcons();
    }
}

async function calculateAdvancedOrbit() {
    const sma = parseFloat(document.getElementById('orbital-sma').value);
    const ecc = parseFloat(document.getElementById('orbital-ecc').value);
    const inc = parseFloat(document.getElementById('orbital-inc').value);
    const arg = parseFloat(document.getElementById('orbital-arg').value);
    
    const container = document.getElementById('orbital-results');
    container.innerHTML = '<div class="text-center py-4"><div class="loading-spinner mx-auto"></div><p class="text-gray-400 mt-2">Calculating advanced orbit...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE}/api/nasa/orbit-propagator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                semi_major_axis: sma,
                eccentricity: ecc,
                inclination: inc,
                argument_periapsis: arg,
                num_points: 100
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        container.innerHTML = `
            <div class="mb-3 p-3 bg-indigo-600/20 rounded-lg">
                <h4 class="font-semibold text-indigo-400">Orbital Properties</h4>
                <p class="text-sm text-gray-300">Advanced Keplerian propagation</p>
            </div>
            
            <div class="space-y-3">
                <div class="p-3 bg-white/5 rounded-lg">
                    <h5 class="font-semibold text-white mb-2">Orbital Elements</h5>
                    <div class="text-sm space-y-1">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Semi-major axis:</span>
                            <span class="text-white">${data.orbital_elements.semi_major_axis_au} AU</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Eccentricity:</span>
                            <span class="text-white">${data.orbital_elements.eccentricity}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Inclination:</span>
                            <span class="text-white">${data.orbital_elements.inclination_deg}°</span>
                        </div>
                    </div>
                </div>
                
                <div class="p-3 bg-white/5 rounded-lg">
                    <h5 class="font-semibold text-white mb-2">Orbit Properties</h5>
                    <div class="text-sm space-y-1">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Period:</span>
                            <span class="text-white">${data.orbit_properties.period_years.toFixed(2)} years</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Perihelion:</span>
                            <span class="text-white">${data.orbit_properties.perihelion_au.toFixed(3)} AU</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Aphelion:</span>
                            <span class="text-white">${data.orbit_properties.aphelion_au.toFixed(3)} AU</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Mean motion:</span>
                            <span class="text-white">${data.orbit_properties.mean_motion_deg_per_day.toFixed(4)}°/day</span>
                        </div>
                    </div>
                </div>
                
                <div class="p-2 bg-white/5 rounded text-xs text-gray-400">
                    <p>Calculated ${data.orbit_data.length} orbital positions</p>
                    <p>Reference: ${data.reference}</p>
                </div>
            </div>
        `;
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error calculating advanced orbit:', error);
        container.innerHTML = `
            <div class="text-center text-red-400 py-4">
                <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                <p>Failed to calculate orbit</p>
                <p class="text-xs text-gray-400">${error.message}</p>
            </div>
        `;
        lucide.createIcons();
    }
}

// ==================== Trajectory Toggle Functions ====================

function toggleTrajectories() {
    state.showTrajectories = !state.showTrajectories;
    
    // Update button appearance
    const button = document.getElementById('btn-toggle-trajectories');
    if (state.showTrajectories) {
        button.classList.add('bg-blue-600');
        button.classList.remove('bg-gray-600');
        button.title = 'Hide orbital trajectories';
    } else {
        button.classList.remove('bg-blue-600');
        button.classList.add('bg-gray-600');
        button.title = 'Show orbital trajectories';
    }
    
    // Toggle visibility of all orbit lines
    asteroidObjects.forEach(obj => {
        if (obj.orbit) {
            obj.orbit.visible = state.showTrajectories;
        }
    });
    
    console.log(`Orbital trajectories ${state.showTrajectories ? 'enabled' : 'disabled'}`);
}

function updateTrajectoryVisibility() {
    // Update all existing orbit lines based on current state
    asteroidObjects.forEach(obj => {
        if (obj.orbit) {
            obj.orbit.visible = state.showTrajectories;
        }
    });
}

function recreateAsteroidVisualization() {
    // Recreate all asteroids with updated trajectory settings
    if (allAsteroidsData && allAsteroidsData.length > 0) {
        const maxAsteroids = Math.min(500, allAsteroidsData.length);
        const asteroidsToShow = allAsteroidsData.slice(0, maxAsteroids);
        createAsteroidObjects(asteroidsToShow);
        console.log(`Recreated visualization with ${asteroidsToShow.length} asteroids, trajectories: ${state.showTrajectories ? 'ON' : 'OFF'}`);
    }
}

// ==================== Fullscreen Functions ====================

function toggleFullscreen() {
    const canvasContainer = document.getElementById('canvas-container');
    const button = document.getElementById('btn-fullscreen');
    const icon = button.querySelector('i');
    
    if (!state.isFullscreen) {
        enterFullscreen(canvasContainer, button, icon);
    } else {
        exitFullscreen(button, icon);
    }
}

function enterFullscreen(container, button, icon) {
    // Request fullscreen
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    }
    
    // Update state and UI
    state.isFullscreen = true;
    button.classList.add('bg-blue-600');
    button.title = 'Exit fullscreen (ESC)';
    icon.setAttribute('data-lucide', 'minimize');
    
    // Add fullscreen styles
    container.classList.add('fullscreen-canvas');
    
    // Resize renderer when entering fullscreen
    setTimeout(() => {
        resizeRendererForFullscreen();
        lucide.createIcons(); // Refresh icon
    }, 100);
    
    console.log('Entered fullscreen mode');
}

function exitFullscreen(button, icon) {
    // Exit fullscreen
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    
    // Update state and UI
    state.isFullscreen = false;
    button.classList.remove('bg-blue-600');
    button.title = 'Enter fullscreen';
    icon.setAttribute('data-lucide', 'maximize');
    
    // Remove fullscreen styles
    const container = document.getElementById('canvas-container');
    container.classList.remove('fullscreen-canvas');
    
    // Resize renderer when exiting fullscreen
    setTimeout(() => {
        resizeRenderer();
        lucide.createIcons(); // Refresh icon
    }, 100);
    
    console.log('Exited fullscreen mode');
}

function resizeRendererForFullscreen() {
    if (renderer && camera) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        console.log(`Renderer resized for fullscreen: ${width}x${height}`);
    }
}

function resizeRenderer() {
    if (renderer && camera) {
        const container = document.getElementById('canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight || 400; // Fallback height
        
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        console.log(`Renderer resized: ${width}x${height}`);
    }
}

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);

function handleFullscreenChange() {
    const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    
    if (!isCurrentlyFullscreen && state.isFullscreen) {
        // User exited fullscreen via ESC key or browser controls
        const button = document.getElementById('btn-fullscreen');
        const icon = button.querySelector('i');
        exitFullscreen(button, icon);
    }
}

// Listen for ESC key to exit fullscreen
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.isFullscreen) {
        const button = document.getElementById('btn-fullscreen');
        const icon = button.querySelector('i');
        exitFullscreen(button, icon);
    }
});

// ==================== Console Welcome Message ====================
console.log('%c🌍 Asteroid Impact Simulator', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
console.log('%cBuilt for NASA Space Apps Challenge 2025', 'font-size: 12px; color: #6b7280;');
console.log('%c🚀 Now with 7 additional NASA & USGS resources!', 'font-size: 14px; color: #10b981;');
console.log('%c🛸 HELIOCENTRIC VIEW (NASA Eyes Style)', 'font-size: 14px; font-weight: bold; color: #ffaa00;');
console.log('%c☀️  Sun at center (yellow sphere)', 'font-size: 12px; color: #fbbf24;');
console.log('%c🌍 Earth orbits Sun at 1 AU (blue orbit)', 'font-size: 12px; color: #3b82f6;');
console.log('%c☄️  Asteroids orbit Sun (elliptical paths)', 'font-size: 12px; color: #8b5cf6;');
console.log('%c⚠️  Threat: When asteroid orbits cross Earth\'s orbit!', 'font-size: 12px; color: #ef4444;');
console.log('%cData sources: NASA NEO API, USGS, JPL Horizons', 'font-size: 10px; color: #9ca3af;');
