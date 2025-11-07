"use client"

interface WarningModalProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
}

export default function WarningModal({ isOpen, title, message, onClose }: WarningModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="warning-modal bg-gray-900 text-white rounded-xl p-8 max-w-md shadow-2xl border border-blue-400 border-opacity-50">
          <h2 className="text-xl font-bold mb-3 text-white">{title}</h2>
          <p className="text-gray-200 whitespace-pre-wrap mb-6 leading-relaxed text-sm">{message}</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="ok-button px-8 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg border-2 border-blue-400 transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
