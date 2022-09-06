import React, { memo, useState } from 'react'
import { Flex, Button, Select, useTheme } from '@chakra-ui/react'
import FormControl from '~components/inspector/controls/FormControl'
import { ComboboxOption } from '@reach/combobox'
import InputSuggestion from '~components/inspector/inputs/InputSuggestion'
import { useForm } from '~hooks/useForm'
import uniq from 'lodash/uniq'
import usePropsSelector from '~hooks/usePropsSelector'
import FlexPanel from './FlexPanel'

function responsiveOptions(data: object) {
  return JSON.stringify(data)
}

const DisplayPanel = () => {
  const { setValueFromEvent, setValue } = useForm()
  const display = usePropsSelector('display')
  const displayString = typeof display === 'string'
  const theme = useTheme()
  const initialBreakpoint: string = 'base'
  const [customResponsiveProps, setCustomResponsiveProps] = useState(
    displayString ? { [initialBreakpoint]: display } : display,
  )
  const themeBreakpoints: { string: string } = theme.breakpoints
  const [settledBreakpoints, setSettledBreakpoints] = useState(
    !displayString ? Object.keys(display) : [initialBreakpoint],
  )
  const availableBreakpoints = Object.keys(themeBreakpoints)
    .filter(bkpt => !Object.keys(customResponsiveProps).includes(bkpt))
    .filter(bkpt => !settledBreakpoints.includes(bkpt))
  const [breakpointToAdd, setBreakpointToAdd] = useState(
    () => availableBreakpoints.filter(bkpt => bkpt !== initialBreakpoint)[0],
  )

  // console.log('breakpointToAdd', breakpointToAdd, availableBreakpoints)

  const valueToDisplay =
    typeof display === 'string'
      ? responsiveOptions({ base: display })
      : responsiveOptions(display)

  const AddABreakpoint = () => {
    return (
      <Flex>
        <FormControl label="breakpoint" htmlFor="breakpoint">
          <Select
            size="sm"
            value={breakpointToAdd || ''}
            name="addBreakpoint"
            id="breakpoint"
            onChange={e => setBreakpointToAdd(e.target.value)}
          >
            {availableBreakpoints.map(bkpt => (
              <option key={bkpt} value={bkpt}>
                {bkpt}
              </option>
            ))}
          </Select>
        </FormControl>
        <Button size="xs" onClick={addBreakpoint}>
          Add breakpoint
        </Button>
      </Flex>
    )
  }

  // const breakpointsToDisplay = Object.entries(themeBreakpoints)
  //   .sort((a, b) => {
  //     const [bka, msa] = a
  //     const [bkb, msb] = b

  //     if (parseInt(msa) < parseInt(msb)) {
  //       return -1
  //     }
  //     return 1
  //   })
  //   .map(([bk, val]) => bk)

  const handleBreakpoints = e => {
    const [breakpoint] = e?.target?.name.split('-')
    const { value } = e.target

    setCustomResponsiveProps({ ...customResponsiveProps, [breakpoint]: value })
    setValue('display', customResponsiveProps)
  }

  const addBreakpoint = () => {
    setSettledBreakpoints(uniq([...settledBreakpoints, breakpointToAdd]))
    setBreakpointToAdd(
      availableBreakpoints.filter(
        bkpt => bkpt !== initialBreakpoint && bkpt !== breakpointToAdd,
      )[0],
    )
  }

  /* Au départ, pas de valeur, pas de breakpoint */

  if (displayString && !settledBreakpoints.length) {
    return (
      <>
        <FormControl label="Display">
          <Select
            size="sm"
            value={valueToDisplay || ''}
            onChange={setValueFromEvent}
            name="display"
          >
            <option></option>
            <option>block</option>
            <option>flex</option>
            <option>inline</option>
            <option>grid</option>
            <option>inline-block</option>
          </Select>
        </FormControl>

        <AddABreakpoint />
      </>
    )
  }

  return (
    <>
      {settledBreakpoints.map((breakpoint: string, i: number) => {
        // console.log('alors', customResponsiveProps?.[breakpoint], breakpoint)

        return (
          <div key={i}>
            {breakpoint}
            <FormControl label="Display">
              <Select
                size="sm"
                value={customResponsiveProps?.[breakpoint] || ''}
                onChange={e => handleBreakpoints(e)}
                name={`${breakpoint}-display`}
              >
                <option value={''}></option>
                <option value={'block'}>block</option>
                <option value={'flex'}>flex</option>
                <option value={'inline'}>inline</option>
                <option value={'grid'}>grid</option>
                <option value={'inline-block'}>inline-block</option>
              </Select>
            </FormControl>
          </div>
        )
      })}

      <AddABreakpoint />

      {/*<InputSuggestion
        value={fontSize}
        handleChange={setValueFromEvent}
        name="fontSize"
      > */}
      {/* {Object.keys(theme.breakpoints).map(option => (
          <ComboboxOption key={option} value={option} />
        ))} */}
      {/* </InputSuggestion> */}

      {display === 'flex' && <FlexPanel />}
    </>
  )
}

export default memo(DisplayPanel)
