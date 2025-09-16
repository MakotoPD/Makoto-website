// utils/DiscardMaterial.ts
import * as THREE from 'three'

export class DiscardMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {},
      vertexShader: /*glsl*/ `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
      fragmentShader: /*glsl*/ `void main() { gl_FragColor = vec4( 0.0, 0.0, 0.0, 0.0 ); discard; }`,
    })
  }
}