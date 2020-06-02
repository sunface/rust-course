import React, { useEffect } from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import { Layout} from 'antd'
import './index.less'
import { getToken } from '../library/utils/auth'
import { isEmpty } from '../library/utils/validate'
import Routers from '../routes'
import SiderWrapper from './Sider'
import HeaderWrapper from './Header'
import ContentWrapper from './Content'
 
const Index = () => {
  const history = useHistory()

  useEffect(() => {
    if(isEmpty(getToken())){
        history.push('/login')
    }
    return () => { }
  })

  return (
    <Layout className="layouts" style={{ minHeight: '100vh' }}>
        <SiderWrapper routers={Routers} />
      <Layout style={{ marginLeft: 83 }}>
        <HeaderWrapper />
        <ContentWrapper routers={Routers} />
      </Layout>
    </Layout>
  )
}

export default withRouter(Index)