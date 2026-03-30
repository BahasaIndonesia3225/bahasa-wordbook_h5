import React, { useState, useEffect } from 'react'
import {useNavigate, connect } from 'umi';
import { Button, Skeleton, Empty, Dialog, Image, Toast } from 'antd-mobile'
import { request } from '@/services';
import convert from 'color-convert';
import './index.less'

const WordBookCatalog = (props) => {
  const navigate = useNavigate();

  //pink_FD7BB1
  const getRgbaColor = (color, opacity) => {
    const colorArray = convert.hex.rgb(color);
    return `rgba(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]}, ${opacity})`
  }

  //单词本删除
  const handleDeleteWordBookCatalog = (event, item) => {
    event.stopPropagation();
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

  //分享功能
  const handleShareWordBookCatalog = (event, item) => {
    event.stopPropagation();
    const { id, name } = item;
    // navigate("/wordBookShare", {
    //   replace: false,
    //   state: { phraseId: id, phraseName: name }
    // });

    // 1. 拼接分享链接（指向你原本的查看页面或专门的分享展示页）
    // 这里的 window.location.origin 会自动获取当前域名
    const shareUrl = `${window.location.origin}/#/wordBookShare?phraseId=${id}&isShare=true`;

    // 2. 尝试调用系统原生分享 (如果浏览器支持，如 Safari 或 Chrome 手机版)
    if (navigator.share) {
      navigator.share({
        title: `分享单词本：${name}`,
        text: `我发现了一个很棒的单词本《${name}》，快来看看吧！`,
        url: shareUrl,
      }).catch(() => {
        // 如果用户取消分享，不做处理
      });
    } else {
      // 3. 降级方案：复制到剪贴板
      copyToClipboard(shareUrl);
    }
  }

  // 辅助函数：执行复制
  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // 现代浏览器 API
      navigator.clipboard.writeText(text).then(() => {
        Toast.show({ content: '链接已复制，去发送给朋友吧', icon: 'success' });
      });
    } else {
      // 传统兼容性方案
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        Toast.show({ content: '链接已复制', icon: 'success' });
      } catch (err) {
        Toast.show({ content: '复制失败，请手动长按链接', icon: 'fail' });
      }
      document.body.removeChild(textArea);
    }
  };

  //单词本创建
  const handleCreateWordBookCatalog = () => {
    navigate("/wordBookCreate", { replace: false });
  }

  //单词本查看
  const handleCheckWordBookCatalog = (item) => {
    const { id, name } = item;
    navigate("/wordBookCheck", {
      replace: false,
      state: { phraseId: id, phraseName: name }
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
                              <div
                                onClick={(e) => handleShareWordBookCatalog(e, item) }
                                style={{ backgroundColor: getRgbaColor(colorHex, 0.3) }}>
                                <span style={{ color: getRgbaColor(colorHex, 1) }}>分享</span>
                              </div>
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
