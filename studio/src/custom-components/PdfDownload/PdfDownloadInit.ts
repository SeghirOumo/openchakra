import { registerComponent } from '~components/register'
import PdfDownloadPanel from './PdfDownloadPanel'
import PdfDownloadPreview from './PdfDownloadPreview'

registerComponent({
  componentType: 'PdfDownload',
  previewComponent: PdfDownloadPreview,
  componentPanel: PdfDownloadPanel
})
