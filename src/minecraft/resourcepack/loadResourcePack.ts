import JSZip from "jszip"

export async function loadResourcePack(url: string): Promise<Record<string, string>> {

  const res = await fetch(url)
  const blob = await res.blob()

  const zip = await JSZip.loadAsync(blob)

  const textures: Record<string, string> = {}

  for (const path of Object.keys(zip.files)) {
    if (
      path.startsWith("assets/minecraft/textures/block/")
      && path.endsWith(".png")
    ) {
      const name = (path.split("/").pop() ?? "").replace(".png","")
      const file = zip.files[path]

      const imgBlob = await file.async("blob")
      textures[name] = URL.createObjectURL(imgBlob)
    }
  }

  return textures
}