import { createContext, useEffect, useState } from "react";
import { loadResourcePack } from "../../minecraft/resourcepack/loadResourcePack";
import { ResourcePack } from "../../types/ResourcePack";


export const ResourcePackContext = createContext<ResourcePack | null>(null);

export function ResourcePackProvider({ children }: { children: React.ReactNode }) {
  const [resourcePack, setResourcePack] = useState<ResourcePack | null>(null);

  useEffect(() => {
    loadResourcePack(
      "https://dl.dropbox.com/scl/fi/6v6uqbfgedpi5n9gk2316/1.21.11-Template.zip?rlkey=mk8x5sp50uk7mk7hj554o4hfn&dl=1"
    ).then(setResourcePack);
  }, []);

  return (
    <ResourcePackContext.Provider value={resourcePack}>
      {children}
    </ResourcePackContext.Provider>
  );
}