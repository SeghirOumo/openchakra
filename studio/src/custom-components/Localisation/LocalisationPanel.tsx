import React, { memo } from 'react'
import {
  Input,
} from '@chakra-ui/react'
import { useForm } from '~hooks/useForm'
import FormControl from '~components/inspector/controls/FormControl'
import usePropsSelector from '~hooks/usePropsSelector'

const LocalisationPanel = () => {

  const { setValueFromEvent } = useForm()
  const size = usePropsSelector('size')

  return (
    <>
   
       <FormControl label="Size" htmlFor="ratingsize">
        <Input
          value={size || ''}
          id="ratingsize"
          type={'number'}
          size="sm"
          name="size"
          onChange={setValueFromEvent}
        />
      </FormControl>
    </>
  )
}

export default memo(LocalisationPanel)
