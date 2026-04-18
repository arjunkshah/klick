import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/** Aurora-style gradient: soft orbs, flowing palette, subtle grain in overlay CSS. */
const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

vec3 palette(float t) {
  vec3 a = vec3(0.22, 0.28, 0.62);
  vec3 b = vec3(0.72, 0.38, 0.58);
  vec3 c = vec3(0.32, 0.62, 0.78);
  vec3 d = vec3(0.58, 0.42, 0.68);
  return a + b * cos(6.28318 * (c * t + d));
}

float glow(vec2 p, vec2 c, float r) {
  float d = length(p - c);
  return r / (d + r * 3.5);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  float aspect = u_resolution.x / u_resolution.y;
  p.x *= aspect;

  float t = u_time * 0.22;

  vec2 c1 = vec2(sin(t * 0.61) * 0.55, cos(t * 0.48) * 0.42);
  vec2 c2 = vec2(cos(t * 0.37 + 1.7) * 0.62, sin(t * 0.55 + 0.9) * 0.38);
  vec2 c3 = vec2(sin(t * 0.33 + 2.9) * 0.35, cos(t * 0.71) * 0.55);

  float w =
    sin(p.x * 2.8 + t * 1.1) * sin(p.y * 2.2 - t * 0.85) * 0.12 +
    sin((p.x + p.y) * 1.9 + t * 0.6) * 0.08;

  vec3 col = palette(w + length(uv) * 0.35 + t * 0.04);

  col += glow(p, c1, 0.11) * vec3(0.45, 0.55, 1.0);
  col += glow(p, c2, 0.09) * vec3(1.0, 0.45, 0.75);
  col += glow(p, c3, 0.075) * vec3(0.35, 0.85, 0.95);

  float rim = 1.0 - smoothstep(0.2, 1.4, length(p));
  col += rim * 0.08 * vec3(0.6, 0.75, 1.0);

  col = pow(clamp(col, 0.0, 1.0), vec3(0.94));

  vec2 vigUv = uv - 0.5;
  float vig = 1.0 - dot(vigUv, vigUv) * 1.15;
  col *= clamp(vig, 0.15, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/** Full-bleed animated gradient shader for the auth hero panel. */
export function AuthShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduceMotionRef.current = mq.matches;
    const onMq = () => {
      reduceMotionRef.current = mq.matches;
    };
    mq.addEventListener("change", onMq);

    const canvas = canvasRef.current;
    if (!canvas) return () => mq.removeEventListener("change", onMq);

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      depth: false,
      stencil: false,
    });
    if (!gl) return () => mq.removeEventListener("change", onMq);

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return () => mq.removeEventListener("change", onMq);

    const prog = gl.createProgram();
    if (!prog) return () => mq.removeEventListener("change", onMq);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return () => mq.removeEventListener("change", onMq);
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(prog, "a_pos");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.25);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    startRef.current = performance.now();
    const frame = (now: number) => {
      const t = reduceMotionRef.current ? 0 : (now - startRef.current) / 1000;
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      mq.removeEventListener("change", onMq);
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-split__canvas" aria-hidden />;
}
