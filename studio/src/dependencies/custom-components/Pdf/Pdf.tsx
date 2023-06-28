// @ts-nocheck
import React from 'react';
import { Box } from '@chakra-ui/react';
import { Document } from 'react-pdf';



const Pdf = (
  {
    children,
    ...props
  }
    : {
    
    }) => {

    

  return (
    <Box {...props}>
      <Document>
          {children}
      </Document>
    </Box>    
  )

}

export default Pdf
