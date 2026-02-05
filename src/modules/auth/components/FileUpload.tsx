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
        className={`relative border-2 border-dashed rounded-2xl px-6 py-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-neutral-400 bg-neutral-50'
            : uploadedFileName
            ? 'border-[#ABFF63] bg-[#EEFFD9]'
            : 'border-neutral-300 bg-white hover:border-neutral-400'
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
          <div className="flex flex-col items-center">
            <img
              src={`${import.meta.env.BASE_URL}images/doc_success.png`}
              alt=""
              aria-hidden="true"
              className="h-12 w-12 select-none"
            />
            <div className="mt-4 font-semibold text-neutral-900 text-2xl">File uploaded</div>
            <div className="mt-1 text-base text-neutral-500 break-all px-6">{uploadedFileName}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <img
              src={`${import.meta.env.BASE_URL}images/document.png`}
              alt=""
              aria-hidden="true"
              className="h-12 w-12 select-none"
            />
            <div className="mt-4 font-semibold text-neutral-900 text-2xl">
              {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
            </div>
            <div className="mt-2 text-base text-neutral-400">PDF, JPG, PNG (Max 10MB)</div>
          </div>
        )}
      </div>
    </div>
  )
}
