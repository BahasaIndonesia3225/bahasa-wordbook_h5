import React, { useState, useEffect, useRef } from 'react'
import {useNavigate, connect } from 'umi';
import { List, Skeleton, Empty, Badge } from 'antd-mobile'
import { request } from '@/services';
import './index.less'

const courseCatalog = (props) => {
  const navigate = useNavigate();

  //单词本列表
  const [loading, setLoading] = useState(false)
  const [wordBookList, setWordBookList] = useState([]);
  const queryWordBookList = () => {
    setLoading(true)
    request.get('/prod-api/system/phrase/list')
      .then(res => {
        const { total, rows, code } = res;
        setLoading(false)
        if(code === 200) setWordBookList(rows)
      })
  }
  useEffect(() => { queryWordBookList() }, [])

  return (
    <div className='courseCatalog'>
      <div className="chapterContain">
        {
          loading ? (
            <>
              <Skeleton.Title animated/>
              <Skeleton.Paragraph lineCount={5} animated/>
              <Skeleton.Title animated/>
              <Skeleton.Paragraph lineCount={5} animated/>
              <Skeleton.Title animated/>
              <Skeleton.Paragraph lineCount={5} animated/>
            </>
          ) : (
            wordBookList.length ? (
              <ul>
                {
                  wordBookList.map(item => {
                    return (
                      <li key={item.id}>
                        {item.name}
                      </li>
                    )
                  })
                }
              </ul>
            ) : <Empty description='暂无数据' style={{marginTop: '50%'}}/>
          )
        }
      </div>
    </div>
  )
}

export default courseCatalog
