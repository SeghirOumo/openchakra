// @ts-nocheck
import React from 'react';
import { usePDF } from '@react-pdf/renderer';


const PdfDownload = ({
  pdf, 
  filename = 'bullshit',
  ...props
}) => {

  // const Pdf = pdf

  // const [instance, update] = usePDF({document: <Pdf />})

  return (
    <a
      className=""
      // href={instance.url!}
      download={filename}
    >
      <span className="whitespace-nowrap">Download Resume</span>
    </a>
  )


}

export default PdfDownload
