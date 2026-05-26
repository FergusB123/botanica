import { useDropzone } from 'react-dropzone'
import { X, Upload, Image } from 'lucide-react'

export default function PhotoUpload({ files, onChange, multiple = true, label = 'Upload photos', hint }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple,
    onDrop: acceptedFiles => {
      const withPreviews = acceptedFiles.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }))
      onChange(multiple ? [...(files || []), ...withPreviews] : withPreviews)
    }
  })

  const remove = (idx) => {
    const updated = files.filter((_, i) => i !== idx)
    URL.revokeObjectURL(files[idx].preview)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-forest bg-forest-50' : 'border-stone-200 hover:border-forest/50 hover:bg-forest-50/50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragActive ? 'bg-forest text-white' : 'bg-stone-100 text-stone-400'}`}>
            <Upload size={22} />
          </div>
          <p className="font-sans text-sm text-bark/70">
            {isDragActive ? 'Drop here…' : label}
          </p>
          <p className="font-sans text-xs text-bark/40">
            {hint || 'JPG, PNG, WEBP · Max 10 MB each'}
          </p>
        </div>
      </div>

      {files?.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {files.map((file, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group shadow-soft">
              <img
                src={file.preview || file}
                alt=""
                className="w-full h-full object-cover"
                onLoad={() => { if (file.preview) URL.revokeObjectURL(file.preview) }}
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X size={18} className="text-white" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-forest text-white px-1.5 py-0.5 rounded-full font-sans font-medium">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
