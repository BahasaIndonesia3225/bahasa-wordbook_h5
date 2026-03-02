import React, { useState, useEffect, useRef } from 'react'
import {useNavigate, useLocation } from 'umi';
import { Form, Input, TextArea, Button, Grid, Space, Image, Selector } from 'antd-mobile'
import { request } from '@/services';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import countryCode from '@/utils/countryCode.json'
import convert from 'color-convert';
import { TYPrompt } from '@/utils/format';
import './index.less'

const WordCreate = () => {
  const navigate = useNavigate();
  const stateParams = useLocation();
  const { phraseId } = stateParams.state;

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false);

  const onFinish = () => {
    setLoading(true);
    const values = form.getFieldsValue();
    request.post('/prod-api/system/wordUser', {
      data: { ...values, phraseId }
    }).then((res) => {
      setLoading(false);
      Toast.show({
        icon: 'success',
        content: '创建成功',
        afterClose: () => {
          navigate("/wordBookCheck", {
            replace: true,
            state: { phraseId, phraseName: "" }
          });
        },
      })
    })
  }

  // 【新增】监听 form 中的 'word' 字段
  // 它会实时返回 word 的当前值，并在值变化时重新渲染此组件
  const wordValue = Form.useWatch('word', form);
  const isButtonDisabled = aiLoading || !wordValue?.trim();

  const [aiLoading, setAiLoading] = useState(false);
  const url = process.env.NODE_ENV === 'development' ?
    '/compatible-mode/v1/chat/completions' :
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  // 使用 ref 存储累计文本，避免 onmessage 闭包问题
  const bufferRef = useRef("");
  const handleExportAiResult = () => {
    const word = form.getFieldValue('word');
    if(!word) return;

    bufferRef.current = ""; // 重置缓冲区
    const controller = new AbortController();
    const signal = controller.signal;

    fetchEventSource(url, {
      method: 'POST',
      signal: signal,
      headers: {
        "Authorization": 'Bearer' + 'sk-ab3033f199eb4bcd93ea82f4c76cd117',
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "qwen-plus",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant."
          },
          {
            "role": "user",
            "content": TYPrompt(word)
          },
        ],
        "stream": true,
        "parameters": {}
      }),
      onopen(e) {
        if(e.ok) {
          setAiLoading(true);
          console.log("链接建立")
        }
      },
      onmessage(ev) {
        const { data } = ev;
        if(data !== "[DONE]") {
          const message = JSON.parse(data);
          const content = message.choices[0].delta.content.replaceAll("\n", "<br/>");

          // 【关键改进】：累计文本
          bufferRef.current += content;
          const fullContent = bufferRef.current;

          // 在完整累计的文本中匹配（去掉原本的 replaceAll("\n", "<br/>")，正则更稳）
          const chineseMatch = fullContent.match(/【中文：([\s\S]*?)(】|$)/);
          const exampleMatch = fullContent.match(/【例句：([\s\S]*?)(】|$)/);
          const usageMatch = fullContent.match(/【用法：([\s\S]*?)(】|$)/);

          // 更新表单（利用实时更新让用户看到打字机效果）
          const newValues = {};
          if (chineseMatch && chineseMatch[1]) newValues.chinese = chineseMatch[1].trim();
          if (exampleMatch && exampleMatch[1]) newValues.example = exampleMatch[1].trim();
          if (usageMatch && usageMatch[1]) newValues.usage = usageMatch[1].trim();
          form.setFieldsValue(newValues);
        }
      },
      onerror() {
        setAiLoading(false);
        controller.abort();
        console.log("链接错误")
      },
      onclose() {
        setAiLoading(false);
        controller.abort();
        console.log("链接关闭")
      }
    })
  }

  return (
    <div className="WordCreate">
      <div className="WordCreateInner">
        <Form
          form={form}
          initialValues={{
            word: "",
            chinese: "",
            example: "",
            usage: "",
            state: "",
          }}
          onFinish={onFinish}
          footer={
            <Button
              block
              type='submit'
              color='primary'
              size='large'
              loadingText='保存中'
              loading={loading}>
              确定添加
            </Button>
          }
        >
          <Form.Item
            name='word'
            label='单词原文'
            rules={[{ required: true, message: '单词原文不能为空' }]}
            extra={
              <Button
                onClick={() => handleExportAiResult()}
                color='primary'
                fill='none'
                loadingText='AI生成中'
                loading={aiLoading}
                disabled={isButtonDisabled}>
                AI生成
              </Button>
            }>
            <Input
              className="wordBookCreateInput"
              style={{ '--text-align': 'center' }}
              placeholder='请输入单词原文'
            />
          </Form.Item>
          <Form.Item
            name='chinese'
            label='单词中文'
            rules={[{ required: true, message: '单词中文不能为空' }]}>
            <TextArea
              className="wordBookCreateTextArea"
              placeholder='请输入单词中文'
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          <Form.Item
            name='example'
            label='单词例句'
            rules={[{ required: true, message: '单词例句不能为空' }]}>
            <TextArea
              className="wordBookCreateTextArea"
              placeholder='请输入单词例句'
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          <Form.Item
            name='usage'
            label='单词用法'
            rules={[{ required: true, message: '单词用法不能为空' }]}>
            <TextArea
              className="wordBookCreateTextArea"
              placeholder='请输入单词用法'
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          <Form.Item
            name='state'
            label='请选择熟练度'
            rules={[{ required: true, message: '熟练度不能为空' }]}>
            <Selector
              columns={3}
              options={[
                {
                  label: '不认识',
                  value: '1',
                },
                {
                  label: '模糊',
                  value: '2',
                },
                {
                  label: '已掌握',
                  value: '3',
                },
              ]}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default WordCreate
