import {
  color,
  gfx,
  Material,
  Mesh,
  MeshRenderer,
  Node,
  primitives,
  utils,
  Vec3,
} from 'cc';
import { OFFICE_PALETTE, type OfficePaletteKey } from './OfficePalette.ts';
import {
  createOfficePrimitiveSpec,
  officeMaterialCacheKey,
  type OfficePrimitiveKind,
} from './OfficePrimitiveSpec.ts';

export interface OfficePrimitiveOptions {
  readonly name: string;
  readonly parent: Node;
  readonly position: Vec3;
  readonly scale: Vec3;
  readonly color: OfficePaletteKey;
  readonly rotation?: Vec3;
  readonly transparent?: boolean;
}

/** Creates reusable low-poly building blocks with shared meshes and materials. */
export class OfficePrimitiveFactory {
  private readonly materials = new Map<string, Material>();
  private readonly meshes: Readonly<Record<OfficePrimitiveKind, Mesh>>;

  constructor() {
    this.meshes = Object.freeze({
      box: utils.createMesh(primitives.box({ width: 1, height: 1, length: 1 })),
      cylinder: utils.createMesh(primitives.cylinder(0.5, 0.5, 1, { radialSegments: 12 })),
      sphere: utils.createMesh(primitives.sphere(0.5, { segments: 12 })),
    });
  }

  createGroup(name: string, parent: Node, position = new Vec3(), rotation = new Vec3()): Node {
    const group = new Node(name);
    parent.addChild(group);
    group.setPosition(position);
    group.setRotationFromEuler(rotation);
    return group;
  }

  createBox(options: OfficePrimitiveOptions): Node {
    return this.createPrimitive('box', options);
  }

  createCylinder(options: OfficePrimitiveOptions): Node {
    return this.createPrimitive('cylinder', options);
  }

  createSphere(options: OfficePrimitiveOptions): Node {
    return this.createPrimitive('sphere', options);
  }

  materialFor(key: OfficePaletteKey, transparent = false): Material {
    const cacheKey = officeMaterialCacheKey(key, transparent);
    const cached = this.materials.get(cacheKey);
    if (cached) return cached;

    const material = new Material();
    material.initialize({
      effectName: 'builtin-unlit',
      defines: { USE_COLOR: true },
    });
    material.setProperty('mainColor', color(OFFICE_PALETTE[key]));
    if (transparent) {
      material.overridePipelineStates({
        blendState: {
          targets: [{
            blend: true,
            blendSrc: gfx.BlendFactor.SRC_ALPHA,
            blendDst: gfx.BlendFactor.ONE_MINUS_SRC_ALPHA,
            blendSrcAlpha: gfx.BlendFactor.ONE,
            blendDstAlpha: gfx.BlendFactor.ONE_MINUS_SRC_ALPHA,
          }],
        },
        depthStencilState: { depthWrite: false },
      });
    }
    this.materials.set(cacheKey, material);
    return material;
  }

  private createPrimitive(kind: OfficePrimitiveKind, options: OfficePrimitiveOptions): Node {
    const spec = createOfficePrimitiveSpec({
      kind,
      name: options.name,
      position: [options.position.x, options.position.y, options.position.z],
      scale: [options.scale.x, options.scale.y, options.scale.z],
      rotation: options.rotation
        ? [options.rotation.x, options.rotation.y, options.rotation.z]
        : undefined,
      color: options.color,
      transparent: options.transparent,
    });
    const node = new Node(spec.name);
    options.parent.addChild(node);
    node.setPosition(...spec.position);
    node.setRotationFromEuler(...spec.rotation);
    node.setScale(...spec.scale);
    const renderer = node.addComponent(MeshRenderer);
    renderer.mesh = this.meshes[kind];
    renderer.setMaterial(this.materialFor(spec.color, spec.transparent), 0);
    return node;
  }
}

