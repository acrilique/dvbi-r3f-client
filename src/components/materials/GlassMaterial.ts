import { MeshPhysicalMaterial } from "three";

export class GlassMaterial extends MeshPhysicalMaterial {
  constructor() {
    super({
      transmission: 0.5,
      roughness: 0.3,
      reflectivity: 0.5,
      iridescence: 0.4,
      thickness: 0.05,
      specularIntensity: 1,
      metalness: 0.3,
      ior: 2,
      envMapIntensity: 1,
    });
  }
}
