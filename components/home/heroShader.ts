const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}`;

const FRAG = `precision mediump float;
uniform vec2 u_res;
uniform float u_t;
const vec3 BG=vec3(0.020,0.024,0.027);
const vec3 GREEN=vec3(0.290,0.870,0.502);
const vec3 BLUE=vec3(0.220,0.305,0.430);
const vec3 SLATE=vec3(0.118,0.161,0.231);
float blob(vec2 uv,vec2 c,float r){float d=distance(uv,c)/r;return exp(-d*d);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float asp=u_res.x/u_res.y;
  vec2 q=vec2(uv.x*asp,uv.y);
  float t=u_t*0.05;
  vec3 col=BG;
  vec2 c1=vec2(asp*0.30+0.10*sin(t*0.70),0.35+0.08*cos(t*0.90));
  vec2 c2=vec2(asp*0.72+0.12*cos(t*0.50),0.62+0.10*sin(t*0.60));
  vec2 c3=vec2(asp*0.50+0.14*sin(t*0.40+1.7),0.20+0.09*cos(t*0.55+2.0));
  vec2 c4=vec2(asp*0.86+0.10*sin(t*0.80+3.1),0.32+0.07*cos(t*0.70+1.1));
  col+=GREEN*blob(q,c1,0.45)*0.10;
  col+=BLUE *blob(q,c2,0.58)*0.22;
  col+=SLATE*blob(q,c3,0.52)*0.30;
  col+=BLUE *blob(q,c4,0.40)*0.14;
  float vig=smoothstep(1.30,0.20,distance(uv,vec2(0.5)));
  col*=mix(0.86,1.0,vig);
  gl_FragColor=vec4(col,1.0);
}`;

const SCALE = 0.5;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

type Opts = { wrap: HTMLElement; onSlow: () => void };

export function startShader(canvas: HTMLCanvasElement, opts: Opts): () => void {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) {
    opts.onSlow();
    return () => {};
  }

  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) {
    opts.onSlow();
    return () => {};
  }
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    opts.onSlow();
    return () => {};
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const uRes = gl.getUniformLocation(prog, "u_res");
  const uT = gl.getUniformLocation(prog, "u_t");

  let w = 0;
  let h = 0;
  const resize = () => {
    const r = opts.wrap.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * SCALE;
    w = Math.max(1, Math.round(r.width * dpr));
    h = Math.max(1, Math.round(r.height * dpr));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  };

  let raf = 0;
  let t0 = 0;
  let inView = true;
  let vis = !document.hidden;
  let running = false;

  let probe = 0;
  let frames = 0;
  let slow = false;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!t0) t0 = now;
    if (!probe) probe = now;
    frames += 1;
    const elapsed = now - probe;
    if (elapsed >= 1100) {
      if (frames / (elapsed / 1000) < 50 && !slow) {
        slow = true;
        stop();
        opts.onSlow();
        return;
      }
      probe = now;
      frames = 0;
    }
    gl.uniform1f(uT, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const start = () => {
    if (running) return;
    running = true;
    probe = 0;
    frames = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const sync = () => {
    if (inView && vis && !slow) start();
    else stop();
  };

  const io = new IntersectionObserver(
    (e) => {
      inView = e[e.length - 1].isIntersecting;
      sync();
    },
    { threshold: 0 },
  );
  io.observe(opts.wrap);
  const onVis = () => {
    vis = !document.hidden;
    sync();
  };
  document.addEventListener("visibilitychange", onVis);
  const ro = new ResizeObserver(resize);
  ro.observe(opts.wrap);
  resize();
  sync();

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    gl.deleteProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    gl.deleteBuffer(buf);
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
  };
}
