import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import type { DragEvent, HTMLAttributes, InputHTMLAttributes } from 'react'
import { cx } from '../../internal/cx'

export interface FileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  files?: File[]
  defaultFiles?: File[]
  onFilesChange?: (files: File[]) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  /** Shown inside the dropzone. */
  label?: string
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'multiple' | 'accept'>
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(file: File): boolean {
  return file.type.startsWith('image/')
}

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function acceptFile(file: File, accept?: string): boolean {
  if (!accept) return true
  const tokens = accept.split(',').map((t) => t.trim()).filter(Boolean)
  if (tokens.length === 0) return true
  return tokens.some((token) => {
    if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token.toLowerCase())
    if (token.endsWith('/*')) return file.type.startsWith(token.slice(0, -1))
    return file.type === token
  })
}

export const FileUpload = /* @__PURE__ */ forwardRef<HTMLDivElement, FileUploadProps>(
  function FileUpload(
    {
      files,
      defaultFiles,
      onFilesChange,
      accept,
      maxSize,
      multiple = false,
      disabled = false,
      label = 'Drag files here or',
      className,
      inputProps,
      ...rest
    },
    ref,
  ) {
    const isControlled = files !== undefined
    const [internalFiles, setInternalFiles] = useState<File[]>(defaultFiles ?? [])
    const current = isControlled ? files : internalFiles

    const [dragActive, setDragActive] = useState(false)
    const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})

    const inputRef = useRef<HTMLInputElement>(null)
    const inputId = useId()

    const setFiles = useCallback(
      (next: File[]) => {
        if (!isControlled) setInternalFiles(next)
        onFilesChange?.(next)
      },
      [isControlled, onFilesChange],
    )

    const addFiles = useCallback(
      (incoming: FileList | File[]) => {
        const list = Array.from(incoming)
        const accepted = list.filter((file) => {
          if (!acceptFile(file, accept)) return false
          if (maxSize !== undefined && file.size > maxSize) return false
          return true
        })
        if (accepted.length === 0) return
        const first = accepted[0]
        if (!first) return
        const next = multiple ? [...current, ...accepted] : [first]
        setFiles(next)
      },
      [accept, current, maxSize, multiple, setFiles],
    )

    const removeFile = useCallback(
      (file: File) => {
        setFiles(current.filter((f) => f !== file))
      },
      [current, setFiles],
    )

    useEffect(() => {
      const entries = current
        .filter(isImage)
        .map((file) => ({ key: fileKey(file), url: URL.createObjectURL(file) }))
      setPreviewUrls(Object.fromEntries(entries.map((entry) => [entry.key, entry.url])))
      return () => {
        for (const entry of entries) URL.revokeObjectURL(entry.url)
      }
    }, [current])

    const onDrop = (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault()
      setDragActive(false)
      if (disabled) return
      if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files)
    }

    return (
      <div ref={ref} className={cx('hal-file-upload', className)} {...rest}>
        <label
          htmlFor={inputId}
          className={cx(
            'hal-file-upload__dropzone',
            dragActive && 'hal-file-upload__dropzone--active',
            disabled && 'hal-file-upload__dropzone--disabled',
          )}
          onDragEnter={(event) => {
            event.preventDefault()
            if (!disabled) setDragActive(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setDragActive(false)
          }}
          onDrop={onDrop}
        >
          <span>{label}</span>
          <span className="hal-file-upload__browse">browse</span>
          <input
            {...inputProps}
            ref={inputRef}
            id={inputId}
            className="hal-file-upload__input"
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files)
              event.target.value = ''
            }}
          />
        </label>

        {current.length > 0 ? (
          <ul className="hal-file-upload__list">
            {current.map((file) => {
              const key = fileKey(file)
              const preview = previewUrls[key]
              return (
                <li key={key} className="hal-file-upload__item">
                  {preview ? (
                    <img src={preview} alt="" className="hal-file-upload__preview" />
                  ) : null}
                  <div className="hal-file-upload__meta">
                    <div className="hal-file-upload__name">{file.name}</div>
                    <div className="hal-file-upload__size">{formatBytes(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    className="hal-file-upload__remove"
                    disabled={disabled}
                    onClick={() => removeFile(file)}
                  >
                    Remove
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    )
  },
)
