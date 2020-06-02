import React,{useEffect} from 'react';
import './index.less';
import { Card } from 'antd';
import { ISystem } from '../../store/system'
import { inject, observer } from 'mobx-react'
import GridLayout from 'react-grid-layout';

const { Meta } = Card;

function Index(props: {system:ISystem}) {
  let {system} = props
  useEffect(() => {
    
  },[system.startDate,system.endDate])

  const layout = [
    {i: 'a', x: 0, y: 0, w: 3, h: 3},
    {i: 'b', x: 3, y: 0, w: 3, h: 3},
    {i: 'c', x: 6, y: 0, w: 3, h: 3}
  ];
  return (
    <div className="test">
       <GridLayout className="layout" layout={layout} cols={12} width={1200}>
        <div key="a">
        <Card
        hoverable
        style={{ width: '100%',height:'100%' }}
        // cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
      >
        <Meta title="Europe Street beat" description="www.instagram.com" />
      </Card>
        </div>
        <div key="b">
        <Card
        hoverable
        style={{ width: '100%',height:'100%' }}
        // cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
      >
        <Meta title="Europe Street beat" description="www.instagram.com" />
      </Card>
        </div>
        <div key="c">
        <Card
        hoverable
        style={{ width: '100%',height:'100%' }}
        // cover={<img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />}
      >
        <Meta title="Europe Street beat" description="www.instagram.com" />
      </Card>
        </div>
      </GridLayout>

    </div>
  );
}

let Test = inject('system')(observer(Index))

export default Test;
