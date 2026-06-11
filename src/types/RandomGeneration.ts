import {Vector3} from "three"

export type Dimensions = {
  width: number
  height: number
  depth: number
}

export type SemanticBlock = {
  type: SemanticBlockType,
  properties?: Record<string, any>,
  groups: string[]
}

export enum SemanticBlockType {
  AIR = "air",
  WALL = "wall",
  PILLAR = "pillar",
  BEAM_X = "beam_x",
  BEAM_Z = "beam_z",
  DECORATION = "decoration",
  GABLE = "gable",
  ROOF = "roof",
  FLOOR = "floor",
  DOOR = "door",
  WINDOW = "window"
}

export class SemanticMap {
  private map = new Map<string, SemanticBlock>();

  private key(v: Vector3): string {
    return `${v.x}:${v.y}:${v.z}`;
  }

  private parseKey(key: string): Vector3 {
    const [x, y, z] = key.split(":").map(Number);
    return new Vector3(x, y, z);
  }

  set(pos: Vector3, value: SemanticBlock): void {
    this.map.set(this.key(pos), value);
  }

  get(pos: Vector3): SemanticBlock | undefined {
    return this.map.get(this.key(pos));
  }

  has(pos: Vector3): boolean {
    return this.map.has(this.key(pos));
  }

  delete(pos: Vector3): boolean {
    return this.map.delete(this.key(pos));
  }

  *[Symbol.iterator](): Iterator<[Vector3, SemanticBlock]> {
    for (const [key, value] of this.map) {
      yield [this.parseKey(key), value];
    }
  }
}