declare module 'three/examples/jsm/loaders/GLTFLoader' {
  import { Loader, LoadingManager, Object3D, Material, AnimationClip, BufferGeometry, Camera } from 'three';

  export class GLTFLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(url: string, onLoad: (gltf: GLTF) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(data: ArrayBuffer | string, path: string, onLoad: (gltf: GLTF) => void, onError?: (event: ErrorEvent) => void): void;
  }

  export interface GLTF {
    animations: AnimationClip[];
    scene: Object3D;
    scenes: Object3D[];
    cameras: Camera[];
    asset: {
      copyright?: string;
      generator?: string;
      version?: string;
      minVersion?: string;
      extensions?: any;
      extras?: any;
    };
    parser: GLTFParser;
    userData: any;
  }

  export class GLTFParser {
    getDependency: (type: string, index: number) => Promise<any>;
    getDependencies: (type: string) => Promise<any[]>;
  }
}