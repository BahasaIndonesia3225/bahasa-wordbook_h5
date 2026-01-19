import React, { useState, useEffect } from 'react'
import {useNavigate, connect } from 'umi';
import { Button, Skeleton, Empty, Dialog, Image } from 'antd-mobile'
import { request } from '@/services';
import convert from 'color-convert';
import './index.less'

const WordBookCatalog = (props) => {
  const navigate = useNavigate();

  const getRgbaColor = (color, opacity) => {
    const colorArray = convert.hex.rgb(color);
    return `rgba(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, ${opacity})`
  }

  const handleDeleteWordBookCatalog = (event, item) => {
    event.preventDefault();
    const { id, name } = item;
    Dialog.show({
      header: (
        <Image
          style={{ width: 100 }}
          src='/image/rubsh.png'
        />
      ),
      content: `你确定要删除${name}单词本`,
      closeOnAction: true,
      actions: [
        [
          {
            key: 'cancel',
            text: '取消',
          },
          {
            key: 'delete',
            text: '删除',
            bold: true,
            danger: true,
            onClick: () => {
              request('/prod-api/system/phrase/' + id, { method: 'DELETE' }).then(res => {
                queryWordBookList();
              })
            },
          },
        ]
      ]
    })
  }

  const handleCreateWordBookCatalog = () => {
    navigate("/wordBookCreate", { replace: true });
  }

  const handleCheckWordBookCatalog = (item) => {
    const { id, name } = item;
    navigate("/wordBookCheck", {
      replace: true,
      state: { id, name }
    });
  }

  //单词本列表
  const [loading, setLoading] = useState(false)
  const [wordBookList, setWordBookList] = useState([]);
  const queryWordBookList = () => {
    setLoading(true)
    request('/prod-api/system/phrase/list', {
      method: 'GET',
      params: { pageNum: 1, pageSize: 100 }
    })
      .then(res => {
        setLoading(false)
        const { total, rows, code } = res;
        const list = rows.map((item) => {
          const { colour } = item;
          const colorType = colour.split('_')[0];
          const colorHex = colour.split('_')[1];
          return { ...item, colorType, colorHex }
        })
        if(code === 200) setWordBookList(list)
      })
  }
  useEffect(() => { queryWordBookList() }, [])

  return (
    <div className='wordBookCatalog'>
      <div className="wordBookCatalogInner">
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
                    const { id, name, language, colorType, colorHex, createTime, num } = item;
                    return (
                      <li
                        onClick={() => handleCheckWordBookCatalog(item)}
                        style={{ backgroundColor: getRgbaColor(colorHex, 0.1) }}
                        key={id}>
                        <Image
                          className='bookLogo'
                          src={`./image/${colorType}.png`}
                        />
                        <div className='bookContent'>
                          <p>{name}</p>
                          <p>{num}词语</p>
                          <div>
                            <span>创建 {createTime}</span>
                            <div className="buttonGroup">
                              {/*<div style={{ backgroundColor: getRgbaColor(colorHex, 0.3) }}>*/}
                              {/*  <span style={{ color: getRgbaColor(colorHex, 1) }}>导出</span>*/}
                              {/*</div>*/}
                              <div
                                onClick={(e) => handleDeleteWordBookCatalog(e, item) }
                                style={{ backgroundColor: getRgbaColor(colorHex, 0.3) }}>
                                <span style={{ color: getRgbaColor(colorHex, 1) }}>删除</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })
                }
              </ul>
            ) : <Empty description='暂无数据' style={{marginTop: '50%'}}/>
          )
        }
        <Image
          onClick={() => handleCreateWordBookCatalog() }
          src={`./image/create.png`} />
      </div>
    </div>
  )
}

export default WordBookCatalog
