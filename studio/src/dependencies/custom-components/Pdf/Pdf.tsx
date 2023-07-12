// @ts-nocheck
'use client'
import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { Document, Page, View, Text, usePDF } from '@react-pdf/renderer';
import dynamic from 'next/dynamic'
 
const NoSSR = dynamic(() => <PdfRoot />, { ssr: false })

const Pdf = (
  {
    children,
    filename= "bidu",
    ...props
  }
    : {
    
    }) => {

  const Trick = () => <PdfRoot>{children}</PdfRoot>
  const [instance, update] = usePDF({document: <Trick /> })

  // useEffect(() => {
  //   update()
  // }, [])

  console.log({instance})

  return (
    <Box>
      <NoSSR>
        {children}
      </NoSSR>
      <a
      className=""
      // href={instance.url!}
      download={filename}
    >
      <span className="whitespace-nowrap">Download Resume</span>
    </a>
    </Box>
  )
}

const PdfRoot = ({children}) => {
  return (
    <Document>
        <Page orientation='portrait' size={'A4'}>
          {children}
        </Page>
      </Document>    
  )
}



export default Pdf
