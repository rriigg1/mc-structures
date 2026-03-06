import { ChangeEvent } from "react"

type Props = {
  onLoad: (buffer: ArrayBuffer) => void
}

export default function StructureUpload({ onLoad }: Props) {

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0]
    if (!file) return

    const buffer = await file.arrayBuffer()

    onLoad(buffer)
  }

  return (
    <input
      type="file"
      accept=".nbt"
      onChange={handleFile}
    />
  )
}