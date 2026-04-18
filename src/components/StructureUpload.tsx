import { ChangeEvent, useRef } from "react"

type Props = {
  onLoad: (buffer: ArrayBuffer) => void
}

export default function StructureUpload({ onLoad }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const buffer = await file.arrayBuffer()
    onLoad(buffer)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".nbt"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <button
        className="upload-button header-button"
        onClick={handleButtonClick}
      >
      </button>
    </>
  )
}