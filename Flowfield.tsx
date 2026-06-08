import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

const vertexShader = `
  attribute vec2 iOffset;
  attribute float iAngle;

  uniform float displacementScale;
  uniform float time;
  uniform vec2 uMouse;
  uniform vec2 uMousePrev;
  uniform vec2 uMotion;
  uniform float uMotionIntensity;
  uniform float uMouseActive;
  uniform float uVel;

  varying float vOpacity;

  void main() {
    float cosA = cos(iAngle);
    float sinA = sin(iAngle);

    vec3 displacedPosition = position + vec3(
      cosA * displacementScale,
      sinA * displacementScale,
      0.0
    );

    vec4 worldPos = modelMatrix * instanceMatrix * vec4(displacedPosition, 1.0);

    // Mouse interaction
    vec2 toMouse = vec2(worldPos.x - uMouse.x, worldPos.y - uMouse.y);
    float mouseDist = length(toMouse);
    float mouseInfluence = smoothstep(200.0, 0.0, mouseDist);

    float perpX = -uMotion.y;
    float perpY = uMotion.x;
    float norm = sqrt(perpX * perpX + perpY * perpY);

    if (norm > 0.001 && uMouseActive > 0.5) {
      perpX /= norm;
      perpY /= norm;
      worldPos.xy += vec2(perpX, perpY) * mouseInfluence * 60.0 * uVel;
      worldPos.xy += uMotion * mouseInfluence * 0.3 * uMotionIntensity;
    }

    gl_Position = projectionMatrix * viewMatrix * worldPos;
    vOpacity = 0.4 + mouseInfluence * 0.3;
  }
`;

const fragmentShader = `
  uniform vec3 color;
  varying float vOpacity;

  void main() {
    float circle = distance(gl_PointCoord, vec2(0.5));
    circle = step(0.5, 1.0 - circle);
    if (circle < 0.5) discard;
    gl_FragColor = vec4(color, vOpacity);
  }
`;

const trailVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const trailFragmentShader = `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uTime;

  void main() {
    vec2 drift = vec2(
      sin(uTime * 0.1 + vUv.y * 2.0),
      cos(uTime * 0.1 + vUv.x * 2.0)
    ) * 0.002;
    vec2 uv = vUv + drift;
    vec4 col = texture2D(uTexture, uv) * 0.96;
    gl_FragColor = col;
  }
`;

export default function Flowfield() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    animId: number;
  }>({ renderer: null, animId: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const noise2D = createNoise2D(() => Math.random());

    const GRID_SIZE = 8;
    const DOT_SIZE = 1.0;
    const NOISE_SCALE = 0.002;
    const TIME_SCALE = 0.0005;
    const DISPLACEMENT_SCALE = 12.0;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // Camera
    const camera = new THREE.OrthographicCamera(
      -width / 2, width / 2,
      height / 2, -height / 2,
      0.1, 1000
    );
    camera.position.set(0, 0, 300);

    // Scene
    const scene = new THREE.Scene();

    // Grid builder
    function buildGrid() {
      const cols = Math.ceil((camera.right - camera.left) / GRID_SIZE);
      const rows = Math.ceil((camera.top - camera.bottom) / GRID_SIZE);
      const count = cols * rows;

      const startX = -((cols - 1) * GRID_SIZE) / 2;
      const startY = -((rows - 1) * GRID_SIZE) / 2;

      const offsets = new Float32Array(count * 2);
      const angles = new Float32Array(count);

      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          offsets[idx * 2] = startX + c * GRID_SIZE;
          offsets[idx * 2 + 1] = startY + r * GRID_SIZE;
          angles[idx] = 0;
          idx++;
        }
      }

      const geometry = new THREE.PlaneGeometry(DOT_SIZE, DOT_SIZE);
      const instancedGeometry = new THREE.InstancedBufferGeometry();
      instancedGeometry.index = geometry.index;
      instancedGeometry.attributes.position = geometry.attributes.position;

      instancedGeometry.setAttribute(
        'iOffset',
        new THREE.InstancedBufferAttribute(offsets, 2)
      );
      instancedGeometry.setAttribute(
        'iAngle',
        new THREE.InstancedBufferAttribute(angles, 1)
      );

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          displacementScale: { value: DISPLACEMENT_SCALE },
          time: { value: 0 },
          color: { value: new THREE.Color(0.39, 0.45, 0.52) },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uMousePrev: { value: new THREE.Vector2(0, 0) },
          uMotion: { value: new THREE.Vector2(0, 0) },
          uMotionIntensity: { value: 0 },
          uMouseActive: { value: 0 },
          uVel: { value: 0 },
        },
        transparent: true,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Points(instancedGeometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);

      return { mesh, count, cols, rows, startX, startY };
    }

    let gridData = buildGrid();

    // Trail render target
    const trailRenderTarget = new THREE.WebGLRenderTarget(
      width * dpr,
      height * dpr,
      {
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }
    );

    // Trail scene
    const trailScene = new THREE.Scene();
    const trailCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const trailMaterial = new THREE.ShaderMaterial({
      vertexShader: trailVertexShader,
      fragmentShader: trailFragmentShader,
      uniforms: {
        uTexture: { value: trailRenderTarget.texture },
        uTime: { value: 0 },
      },
      transparent: true,
    });
    const trailQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      trailMaterial
    );
    trailScene.add(trailQuad);

    // Mouse tracking
    const mouseLerp = { x: 0, y: 0 };
    const prevMouseLerp = { x: 0, y: 0 };
    let currentMotion = { x: 0, y: 0 };
    let motionIntensityLerp = 0;
    let vel = 0;
    let mouseActive = false;
    let mouseTimeout: ReturnType<typeof setTimeout> | null = null;
    let time = 0;

    const onPointerMove = (e: PointerEvent) => {
      const nx = e.clientX - width / 2;
      const ny = -(e.clientY - height / 2);

      currentMotion = { x: nx - mouseLerp.x, y: ny - mouseLerp.y };
      const motionIntensity = Math.sqrt(
        currentMotion.x * currentMotion.x + currentMotion.y * currentMotion.y
      );

      mouseLerp.x = nx;
      mouseLerp.y = ny;

      if (motionIntensity > 2.0) {
        vel = Math.min(vel + motionIntensity * 0.02, 1.0);
      }

      mouseActive = true;
      if (mouseTimeout) clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        mouseActive = false;
      }, 100);
    };

    document.body.addEventListener('pointermove', onPointerMove);

    // Animation loop
    const animate = () => {
      stateRef.current.animId = requestAnimationFrame(animate);
      time += 1;

      const mesh = gridData.mesh as THREE.Points;
      const material = mesh.material as THREE.ShaderMaterial;
      const geometry = mesh.geometry as THREE.InstancedBufferGeometry;
      const iAngleAttr = geometry.attributes.iAngle as THREE.InstancedBufferAttribute;
      const iOffsetAttr = geometry.attributes.iOffset as THREE.InstancedBufferAttribute;

      // Update noise angles
      for (let i = 0; i < gridData.count; i++) {
        const ox = iOffsetAttr.getX(i);
        const oy = iOffsetAttr.getY(i);
        const nx = ox * NOISE_SCALE;
        const ny = oy * NOISE_SCALE + time * TIME_SCALE;
        const noiseVal = noise2D(nx, ny);
        iAngleAttr.setX(i, noiseVal * Math.PI * 2);
      }
      iAngleAttr.needsUpdate = true;

      // Smooth motion
      if (mouseActive) {
        const motionIntensity = Math.sqrt(
          currentMotion.x * currentMotion.x + currentMotion.y * currentMotion.y
        );
        motionIntensityLerp += (motionIntensity - motionIntensityLerp) * 0.1;
      } else {
        vel *= 0.95;
        motionIntensityLerp *= 0.95;
      }

      // Update uniforms
      material.uniforms.time.value = time;
      material.uniforms.uMouse.value.set(mouseLerp.x, mouseLerp.y);
      material.uniforms.uMousePrev.value.set(prevMouseLerp.x, prevMouseLerp.y);
      material.uniforms.uMotion.value.set(currentMotion.x, currentMotion.y);
      material.uniforms.uMotionIntensity.value = motionIntensityLerp;
      material.uniforms.uMouseActive.value = mouseActive ? 1.0 : 0.0;
      material.uniforms.uVel.value = vel;

      prevMouseLerp.x = mouseLerp.x;
      prevMouseLerp.y = mouseLerp.y;

      // Trail pass
      trailMaterial.uniforms.uTime.value = time * 0.01;
      trailMaterial.uniforms.uTexture.value = trailRenderTarget.texture;
      renderer.setRenderTarget(trailRenderTarget);
      renderer.render(trailScene, trailCamera);

      // Main scene
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      trailRenderTarget.setSize(width * dpr, height * dpr);

      // Rebuild grid
      scene.remove(gridData.mesh);
      (gridData.mesh as THREE.Points).geometry.dispose();
      ((gridData.mesh as THREE.Points).material as THREE.ShaderMaterial).dispose();
      gridData = buildGrid();
    };

    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(stateRef.current.animId);
      document.body.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      if (mouseTimeout) clearTimeout(mouseTimeout);
      renderer.dispose();
      trailRenderTarget.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
