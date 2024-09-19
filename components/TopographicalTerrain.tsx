import * as THREE from 'three';

export function createTopographicalTerrain(width: number, height: number, resolution: number) {
  const geometry = new THREE.PlaneGeometry(width, height, resolution - 1, resolution - 1);
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();

  // Generate heightmap
  const heightMap = new Array(resolution * resolution).fill(0);
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const i = y * resolution + x;
      const nx = x / (resolution - 1) - 0.5;
      const ny = y / (resolution - 1) - 0.5;
      heightMap[i] = (Math.sin(nx * Math.PI * 4) + Math.sin(ny * Math.PI * 4)) * 0.5;
    }
  }

  // Apply heightmap to geometry
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    const height = heightMap[i];
    positions.setZ(i, height);
  }

  geometry.computeVertexNormals();

  // Create material
  const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    wireframe: true,
  });

  // Create mesh
  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2;

  // Add contour lines
  const contourMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
  const contourGroup = new THREE.Group();

  for (let h = -1; h <= 1; h += 0.1) {
    const points: THREE.Vector3[] = [];
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const i = y * resolution + x;
        if (Math.abs(heightMap[i] - h) < 0.05) {
          points.push(new THREE.Vector3(
            (x / (resolution - 1) - 0.5) * width,
            (y / (resolution - 1) - 0.5) * height,
            h
          ));
        }
      }
    }
    const contourGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const contourLine = new THREE.Line(contourGeometry, contourMaterial);
    contourGroup.add(contourLine);
  }

  terrain.add(contourGroup);

  return terrain;
}