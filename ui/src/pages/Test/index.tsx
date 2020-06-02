import React,{useEffect} from 'react';
import './index.less';
import { Card } from 'antd';
import { ISystem } from '../../store/system'
import { inject, observer } from 'mobx-react'

const { Meta } = Card;

function Index(props: {system:ISystem}) {
  let {system} = props
  useEffect(() => {
    
  },[system.startDate,system.endDate])

 
  return (
    <div />
  );
}

let Test = inject('system')(observer(Index))

export default Test;
