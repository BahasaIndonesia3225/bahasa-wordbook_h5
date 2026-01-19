import React, { useState, useEffect } from 'react'
import {useNavigate, useLocation, connect } from 'umi';
import { Button, Skeleton, Empty, Dialog, Image, List, SwipeAction } from 'antd-mobile'
import { request } from '@/services';
import convert from 'color-convert';
import './index.less'

const leftActions = [
  {
    key: 'pin',
    text: '不认识',
    color: 'primary',
  },
]
const rightActions = [
  {
    key: 'unsubscribe',
    text: '已掌握',
    color: 'primary',
  },
]

const WordBookCheck = () => {
  const stateParams = useLocation();
  const navigate = useNavigate();
  const { id, name } = stateParams.state;

  const [wordList, setWordList] = useState([]);
  const [total, setTotal] = useState(0);
  const queryWordList = () => {
    request('/prod-api/system/wordUser/list', {
      method: 'GET',
      params: { phraseId: id, pageNum: 1, pageSize: 100 }
    }).then(res => {
      const { rows, total } = res;
      setWordList(rows);
      setTotal(total);
    })
  }
  useEffect(() => {
    queryWordList()
  }, [])

  return (
    <div className="wordBookCheck">
      <List>
        {wordList.map(item => {
          const { id, word } = item;
          return (
            <SwipeAction
              key={id}
              leftActions={leftActions}
              rightActions={rightActions}
            >
              <List.Item>{word}</List.Item>
            </SwipeAction>
          )
        })}
      </List>
    </div>
  )
}

export default WordBookCheck
