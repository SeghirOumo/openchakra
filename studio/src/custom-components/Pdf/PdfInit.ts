import { registerComponent } from '~components/register'
import PdfPanel from './PdfPanel'
import PdfPreview from './PdfPreview'

registerComponent({
  componentType: 'Pdf',
  previewComponent: PdfPreview,
  componentPanel: PdfPanel
})
