import { useState } from 'react'
import { Copy, Download, Eye, FileText } from 'lucide-react'
import { resourceMarkdown, resourceMeta } from '../lib/content'
import { Markdown, Modal, copyText, useToast } from './ui'

export function ResourceCard({ id }: { id: string }) {
  const meta = resourceMeta(id)
  const [open, setOpen] = useState(false)
  const { toast, toastNode } = useToast()
  const md = resourceMarkdown(id)

  const download = () => {
    const blob = new Blob([md], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${id}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-3">
      <span className="mt-0.5 rounded-md bg-warm-50 p-2 text-warm-700">
        <FileText size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{meta.kind}</p>
        <p className="font-medium text-stone-900">{meta.title}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button className="btn-secondary !px-2.5 !py-1 text-xs" onClick={() => setOpen(true)}>
            <Eye size={14} /> Preview
          </button>
          <button className="btn-secondary !px-2.5 !py-1 text-xs" onClick={async () => toast((await copyText(md)) ? 'Copied to clipboard' : 'Copy not available here')}>
            <Copy size={14} /> Copy
          </button>
          <button className="btn-secondary !px-2.5 !py-1 text-xs" onClick={download}>
            <Download size={14} /> Download
          </button>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={meta.title} wide>
        <Markdown md={md} />
      </Modal>
      {toastNode}
    </div>
  )
}
