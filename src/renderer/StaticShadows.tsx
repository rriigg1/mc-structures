import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export function StaticShadows() {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.type = THREE.PCFShadowMap;
    // Initial shadow map will be triggered by StructureRenderer
  }, [gl]);

  return null;
}