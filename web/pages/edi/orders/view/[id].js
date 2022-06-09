import React, {useState, useEffect} from 'react'
import {useRouter} from 'next/router'
import {BASEPATH_EDI, ORDER, VIEW, ENDPOINTS} from '../../../../utils/feurst/consts'
import withEdiAuth from '../../../../hoc/withEdiAuth'
import BaseViewTable from'../../../../components/Feurst/BaseViewTable'
import {
  orderColumns,
} from '../../../../components/Feurst/tablestructures'


const View = ({accessRights}) => {

  const router = useRouter()
  const [orderid, setOrderid] = useState(router.query.id)

  useEffect(() => {
    /* Ugly, but it works */
    const currentUrl = new URL(window.location)
    const splittedUrl = currentUrl.pathname.split('/')
    const indexView = splittedUrl.findIndex(e => e === 'view')
    const askedId = splittedUrl[indexView + 1]
    orderid !== askedId && setOrderid(askedId)
  }, [orderid, setOrderid])

  return (
    <BaseViewTable
      key={orderid}
      id={orderid}
      endpoint={ENDPOINTS[ORDER]}
      columns={orderColumns}
      wordingSection={'EDI.ORDER'}
      accessRights={accessRights}
    />
  )
}


export default withEdiAuth(View, {model: ORDER, action: VIEW, pathAfterFailure: `${BASEPATH_EDI}/login`})
