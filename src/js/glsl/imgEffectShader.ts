const ImgEffectShader = {
  uniforms: {},

  vertexShader: /* glsl */ `
    uniform float time;
    varying vec2 vUv;

    void main(){
      vUv = uv;
      vec3 pos = position;
      // pos.x += sin(pos.y * 10.0 + time * 0.1) * 0.05;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }`,

  fragmentShader: /* glsl */ `
    uniform sampler2D tex;
    uniform float time;

    varying vec2 vUv;

    void main(void) {
      vec2 uv = vUv;
      // uv.x += sin(uv.y * 10.0 + time * 0.1) * 0.05;
      vec4 dest = texture2D(tex, fract(uv));

      // dest.r += sin(uv.x * 10.0 + time * 0.1) * 0.5;
      // dest.g += sin(uv.y * 10.0 + time * -0.1) * 0.5;

      gl_FragColor = dest;
    }`,
}

export { ImgEffectShader }
