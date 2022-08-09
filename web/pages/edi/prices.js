import React from 'react'
import withEdiAuth from '../../hoc/withEdiAuth'
import Prices from '../../components/Feurst/Prices'
import {PRICELIST, VIEW, BASEPATH_EDI} from '../../utils/feurst/consts'

const List = ({accessRights}) => {

  return (<>
    <Prices accessRights={accessRights} />
  </>)
}

export default withEdiAuth(List, {model: PRICELIST, action: VIEW, pathAfterFailure: `${BASEPATH_EDI}/login`})
