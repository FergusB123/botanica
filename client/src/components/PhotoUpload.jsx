import { useDropzone } from 'react-dropzone'
import { X, Upload } from 'lucide-react'

export default function PhotoUpload({ files, onChange, multiple = true, label = 'Upload photos', hint }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    multiple,
    onDrop: accepted => {
      const withPreviews = accepted.map(f => Object.assign(f, { preview: URL.createObjectURL(f) }))
      onChange(multiple ? [...(files || []), ...withPreviews] : withPreviews)
    }
  })

  const remove = (idx) => {
    URL.revokeObjectURL(files[idx].preview)
    onChange(files.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-jet bg-ghost' : 'border-border hover:border-border-strong hover:bg-card'}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-jet text-white' : 'bg-ghost text-dust'}`}>
            <Upload size={18} />
          </div>
          <p className="font-sans text-sm text-ink">{isDragActive ? 'Drop here…' : label}</p>
          <p className="font-sans text-xs text-dust">{hint || 'JPG, PNG, WEBP · Max 10 MB'}</p>
        </div>
      </div>

      {files?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {files.map((file, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-border">
              <img src={file.preview || file} alt="" className="w-full h-full object-cover"
                onLoad={() => { if (file.preview) URL.revokeObjectURL(file.preview) }} />
              <button type="button" onClick={() => remove(idx)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <X size={16} className="text-white" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-jet text-white px-1.5 py-0.5 rounded-full font-medium">
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
