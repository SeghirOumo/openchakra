import React, {useEffect, useMemo, useState} from 'react'
import withEdiAuth from '../../hoc/withEdiAuth'
import Tabs from '../../components/Feurst/Tabs'

const Orders = ({accessRights}) => {

  return (<>
    <Tabs accessRights={accessRights} />
  </>)
}

export default withEdiAuth(Orders, {pathAfterFailure: '/edi/login'})
