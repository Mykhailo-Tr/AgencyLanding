/**
 * WebGL Shader Background - Dynamic Gradient Mesh
 * Creates a living, animated gradient background using raw WebGL2
 */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Fallback to static gradient for reduced motion
    document.body.style.background = 'radial-gradient(ellipse at top right, rgba(255, 45, 85, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(0, 240, 255, 0.1) 0%, transparent 50%), #050505';
    return;
  }

  // Check WebGL2 support
  const canvas = document.createElement('canvas');
  canvas.id = 'webgl-canvas';
  canvas.style.cssText = 'position: fixed; inset: 0; z-index: -1; pointer-events: none;';
  document.body.insertBefore(canvas, document.body.firstChild);

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    console.warn('WebGL2 not supported, using fallback');
    document.body.style.background = 'radial-gradient(ellipse at top right, rgba(255, 45, 85, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(0, 240, 255, 0.1) 0%, transparent 50%), #050505';
    return;
  }

  // Vertex shader - simple fullscreen triangle
  const vertexShaderSource = `#version 300 es
    in vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader - gradient mesh with noise
  const fragmentShaderSource = `#version 300 es
    precision highp float;
    
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    
    out vec4 fragColor;
    
    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      
      // Slow noise evolution
      float noise1 = snoise(vec2(uv.x * 2.0, uv.y * 2.0 + u_time * 0.02));
      float noise2 = snoise(vec2(uv.x * 3.0 - u_time * 0.015, uv.y * 3.0));
      float noise3 = snoise(vec2(uv.x * 1.5 + u_time * 0.01, uv.y * 1.5));
      
      float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      // Mouse influence (subtle parallax)
      float mouseInfluence = 0.0;
      if (u_mouse.x > 0.0) {
        mouseInfluence = smoothstep(0.5, 0.0, distance(uv, u_mouse)) * 0.1;
      }
      
      // Color palette
      vec3 bgBase = vec3(0.02, 0.02, 0.03);      // Dark base
      vec3 accentLive = vec3(0.96, 0.18, 0.42);  // Pink accent
      vec3 accentTech = vec3(0.0, 0.94, 1.0);    // Cyan accent
      
      // Mix colors based on noise and position
      vec3 color = mix(bgBase, accentLive, (combinedNoise + 0.5) * 0.3 * uv.y);
      color = mix(color, accentTech, (combinedNoise + 0.5) * 0.15 * (1.0 - uv.y));
      
      // Add mouse influence
      color += accentLive * mouseInfluence;
      
      // Subtle vignette
      float vignette = 1.0 - smoothstep(0.3, 1.2, distance(uv, vec2(0.5)));
      color *= vignette;
      
      fragColor = vec4(color, 1.0);
    }
  `;

  // Compile shader
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

  // Create program
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

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(gl, vertexShader, fragmentShader);

  if (!program) {
    return;
  }

  // Setup fullscreen triangle
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    3, -1,
    -1, 3
  ]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const timeLocation = gl.getUniformLocation(program, 'u_time');
  const mouseLocation = gl.getUniformLocation(program, 'u_mouse');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Mouse tracking
  let mouseX = 0, mouseY = 0;
  const isHoverDevice = window.matchMedia('(hover: hover)').matches;
  
  if (isHoverDevice) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = 1.0 - e.clientY / window.innerHeight;
    });
  }

  // Resize handler
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    // Reduce resolution on mobile for performance
    const targetDpr = window.innerWidth < 768 ? Math.min(dpr, 1.5) : dpr;
    
    canvas.width = window.innerWidth * targetDpr;
    canvas.height = window.innerHeight * targetDpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  
  window.addEventListener('resize', resize);
  resize();

  // Animation loop
  let startTime = performance.now();
  let isRunning = true;
  let animationFrameId;

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    } else {
      isRunning = true;
      startTime = performance.now() - (lastTime || 0);
      render();
    }
  });

  // Intersection Observer for performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else if (isRunning === false) {
        isRunning = true;
        render();
      }
    });
  }, { threshold: 0 });
  
  observer.observe(canvas);

  let lastTime = 0;

  function render() {
    if (!isRunning) return;

    const currentTime = (performance.now() - startTime) / 1000;
    lastTime = currentTime;

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, currentTime);
    gl.uniform2f(mouseLocation, isHoverDevice ? mouseX : 0, isHoverDevice ? mouseY : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    animationFrameId = requestAnimationFrame(render);
  }

  render();

})();
