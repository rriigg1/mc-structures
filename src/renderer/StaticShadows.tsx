import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export function StaticShadows() {
  const { gl } = useThree();

  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
  }, [gl]);

  return null;
}