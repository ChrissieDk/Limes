import { useState, useRef } from 'react'

interface FileUploadProps {
  label: string
  onFileSelect: (file: File) => void
  accept?: string
  uploadedFileName?: string
}

export default function FileUpload({ label, onFileSelect, accept = 'image/*,application/pdf', uploadedFileName }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="grid gap-2">
      <label className="text-sm text-neutral-700">{label}</label>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-lime-400 bg-lime-50'
            : uploadedFileName
            ? 'border-lime-400 bg-lime-50'
            : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        {uploadedFileName ? (
          <div className="flex flex-col items-center gap-2">
            <div className="size-12 rounded-full bg-lime-400 text-neutral-900 flex items-center justify-center text-2xl">
              ✓
            </div>
            <div className="font-semibold text-neutral-900">File uploaded</div>
            <div className="text-sm text-neutral-600 break-all px-4">{uploadedFileName}</div>
            <div className="text-xs text-neutral-500 mt-1">Click or drag to replace</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="size-12 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-2xl">
              📄
            </div>
            <div className="font-semibold text-neutral-900">
              {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
            </div>
            <div className="text-sm text-neutral-500">PDF, JPG, PNG (Max 10MB)</div>
          </div>
        )}
      </div>
    </div>
  )
}
