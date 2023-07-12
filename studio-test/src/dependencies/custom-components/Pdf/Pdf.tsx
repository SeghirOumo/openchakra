// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { Document, Page, View, Text, usePDF } from '@react-pdf/renderer';


const Pdf = (
  {
    children,
    ...props
  }
    : {
    
    }) => {

  const pdfRef = useRef()

  return (
      <Document ref={pdfRef}>
        <Page orientation='portrait' size={'A4'}>
          <View>
            <Text>Aha</Text>
          </View>
          {children}
        </Page>
      </Document>    
  )
}



export default Pdf
