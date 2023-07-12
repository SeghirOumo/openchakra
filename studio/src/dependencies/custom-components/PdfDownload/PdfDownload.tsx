import React from 'react';
import { Document, usePDF, Page } from '@react-pdf/renderer';

const PdfDownload = ({
  pdf = null, 
  filename = 'bullshit',
  ...props
}) => {


  // const {pdf} = usePdfContext()

  // const Pdf = pdf?.current || <Document><Page></Page></Document>

  // const [instance, update] = usePDF({document: Pdf })

  // console.log('ohoho', typeof Pdf)

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
