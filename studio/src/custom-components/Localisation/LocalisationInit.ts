import { buildUploadFile } from '../ComponentBuilder'
import { registerComponent } from '~components/register'
import LocalisationPanel from './LocalisationPanel'
import LocalisationPreview from './LocalisationPreview'

registerComponent({
  componentType: 'Localisation',
  previewComponent: LocalisationPreview,
  componentPanel: LocalisationPanel,
  builderFunction: buildUploadFile,
})
