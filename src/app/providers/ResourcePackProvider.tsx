import { createContext, useEffect, useState } from "react";
import { loadResourcePack } from "../../minecraft/resourcepack/loadResourcePack";


export const ResourcePackContext = createContext<{ [key: string]: string } | null>(null);

export function ResourcePackProvider({ children }: { children: React.ReactNode }) {
  const [textures, setTextures] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    loadResourcePack(
      "https://dl.dropbox.com/scl/fi/6v6uqbfgedpi5n9gk2316/1.21.11-Template.zip?rlkey=mk8x5sp50uk7mk7hj554o4hfn&dl=1"
    ).then(setTextures);
  }, []);

  return (
    <ResourcePackContext.Provider value={textures}>
      {children}
    </ResourcePackContext.Provider>
  );
}