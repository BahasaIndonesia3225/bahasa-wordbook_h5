import React, { useState, useEffect } from 'react'
import {useNavigate, useLocation, connect } from 'umi';
import { Button, Space, Empty, Card, Dialog, Image, Segmented, Collapse, SwipeAction, Modal } from 'antd-mobile'
import { SoundOutline, DeleteOutline } from 'antd-mobile-icons';
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
  const [wordType, setWordType] = useState('1');
  // 计算当前显示的单词列表
  const currentWordList = wordList.filter(item => item.state === wordType);
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
  useEffect(() => { queryWordList() }, [])

  //类型切换逻辑
  const handleChangeWordType = (type) => {
    setWordType(type);
  }

  //播放音频相关
  const audio = new Audio();
  const once = function () {
    audio.removeEventListener('error', once);
    Modal.alert({
      content: '这个单词还没有录音哦～',
      onConfirm: () => {
        console.log('Confirmed')
      },
    })
  }
  const handlePlayAudio = (data) => {
    const { word } = data;
    audio.src = `http://taioassets.oss-cn-beijing.aliyuncs.com/Audios/${word}.mp3`;
    audio.addEventListener('canplaythrough', () => {
      audio.play();
    })
    audio.addEventListener('error', once);
    audio.load()
  }

  //删除音频相关
  const handleDeleteAudio = (data) => {
    const { id: wordId, word } = data;
    Dialog.show({
      header: (<Image style={{ width: 100 }} src='/image/rubsh.png'/>),
      content: `你确定要删除${word}单词`,
      closeOnAction: true,
      actions: [
        [
          {
            key: 'cancel',
            text: '我在想想',
          },
          {
            key: 'delete',
            text: '删除',
            bold: true,
            danger: true,
            onClick: () => {
              request('/prod-api/system/wordUser/remove', {
                method: 'DELETE',
                data: {
                  phraseId: id,
                  id: wordId
                }
              }).then(res => {
                queryWordList()
              })
            },
          },
        ]
      ]
    })
  }

  const handleAddWord = () => {
    navigate("/wordCreate", { replace: false });
  }

  return (
    <div className="wordBookCheck">
      <Segmented
        block
        className="wordBookSwitchArea"
        options={[
          { label: '不认识', value: '1', className: 'incognizance' },
          { label: '模糊', value: '2', className: 'indistinct' },
          { label: '已掌握', value: '3', className: 'airnslnq' },
        ]}
        value={wordType}
        onChange={(v) => handleChangeWordType(v)}
      />
      <div className="wordBookCheckInner">
        {
          currentWordList.length ? (
            <Collapse defaultActiveKey={['0']}>
              {
                currentWordList.map((item, index) => {
                  const { id, word, chinese, example, usage } = item;
                  return (
                    <Collapse.Panel
                      key={id}
                      title={
                        <div className="courseTitle">
                          <div className="index">
                            <span>{index + 1}</span>
                          </div>
                          <div className='content'>
                            <div>
                              <span className='title'>{word}</span>
                            </div>
                            <div>
                              <span className='chinese'>{chinese}</span>
                            </div>
                          </div>
                        </div>
                      }>
                      <SwipeAction
                        leftActions={leftActions}
                        rightActions={rightActions}>
                        <Card
                          title={
                            <Space justify='end' block>
                              <Button
                                onClick={(() => handlePlayAudio(item))}
                                color='primary'
                                size='mini'
                                fill='outline'>
                                <SoundOutline fontSize={16} />
                              </Button>
                              <Button
                                onClick={(() => handleDeleteAudio(item))}
                                color='danger'
                                size='mini'
                                fill='outline'>
                                <DeleteOutline fontSize={16} />
                              </Button>
                            </Space>
                          }
                        >
                          <div className='courseContent'>
                            <div>
                              <span>【中文释义】：</span>
                              <span>{item.chinese}</span>
                            </div>
                            <div>
                              <span>【单词例句】：</span>
                              <span>{item.example}</span>
                            </div>
                            <div>
                              <span>【单词用法】：</span>
                              <span>{item.usage}</span>
                            </div>
                          </div>
                        </Card>
                      </SwipeAction>
                    </Collapse.Panel>
                  )
                })
              }
            </Collapse>
          ) : <Empty description='暂无数据' style={{marginTop: '50%'}}/>
        }
      </div>
      <Button
        block
        color='primary'
        size='large'
        onClick={() => handleAddWord()}>
        添加单词
      </Button>
    </div>
  )
}

export default WordBookCheck
