import React from 'react'
import { useDropComponent } from '~hooks/useDropComponent'
import { useInteractive } from '~hooks/useInteractive'
import { Box } from '@chakra-ui/react'
import ComponentPreview from '~components/editor/ComponentPreview'
import Pdf from '~dependencies/custom-components/Pdf'

const PdfPreview: React.FC<IPreviewProps> = ({ component, children }) => {

  const { drop, isOver } = useDropComponent(component.id)
  const { props, ref } = useInteractive(component, true)

  if (isOver) {
    props.bg = 'teal.50'
  }

  return (
    <Box pos="relative" ref={drop(ref)} {...props}>
      <Pdf>
      {component.children.map((key: string) => (
         <ComponentPreview key={key} componentName={key} />
      ))}
      </Pdf>
    </Box>
  )
}

export default PdfPreview

