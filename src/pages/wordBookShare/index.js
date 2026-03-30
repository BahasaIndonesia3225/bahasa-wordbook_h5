import React, { useState, useEffect } from 'react'
import {useNavigate, useSearchParams, useLocation, connect } from 'umi';
import { Button, Space, Empty, Card, Dialog, Image, Segmented, Collapse, SwipeAction, Modal } from 'antd-mobile'
import { SoundOutline, DeleteOutline } from 'antd-mobile-icons';
import { request } from '@/services';
import convert from 'color-convert';
import './index.less'

const wordBookShare = () => {
  // 1. 获取 URL 中的查询参数 (例如 ?phraseId=123)
  const [searchParams] = useSearchParams();
  const phraseIdFromUrl = searchParams.get('phraseId');
  const phraseNameFromUrl = searchParams.get('phraseName');
  // 2. 同时保留对原有 state 的兼容（防止内部跳转失效）
  const location = useLocation();
  const state = location.state || {};
  const phraseId = phraseIdFromUrl || state.phraseId ;
  const phraseName = phraseNameFromUrl || state.phraseName;

  const [wordList, setWordList] = useState([]);
  const [total, setTotal] = useState(0);
  const queryWordList = () => {
    request('/prod-api/phraseApi/list', {
      method: 'GET',
      params: { phraseId, pageNum: 1, pageSize: 500 }
    }).then(res => {
      const { rows, total } = res;
      setWordList(rows);
      setTotal(total);
    })
  }
  useEffect(() => {
    queryWordList()
  }, [])

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

  return (
    <div className="wordBookShare">
      <div className="wordBookShareInner">
        {
          wordList.length ? (
            <Collapse defaultActiveKey={['0']}>
              {
                wordList.map((item, index) => {
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
                    </Collapse.Panel>
                  )
                })
              }
            </Collapse>
          ) : <Empty description='暂无数据' style={{marginTop: '50%'}}/>
        }
      </div>
    </div>
  )
}

export default wordBookShare
