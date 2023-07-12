import React, { memo } from 'react'
import {
  Input,
  Select,
} from '@chakra-ui/react'
import { useForm } from '~hooks/useForm'
import FormControl from '~components/inspector/controls/FormControl'
import usePropsSelector from '~hooks/usePropsSelector'
import ColorPickerControl from '../../components/inspector/controls/ColorPickerControl'

const PdfPanel = () => {

  const { setValueFromEvent } = useForm()
  const illu = usePropsSelector('illu')

  return (
    <>
      A peu p
    </>
  )
}

export default memo(PdfPanel)
