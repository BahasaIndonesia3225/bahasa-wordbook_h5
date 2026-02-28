import React, { useState, useEffect, useCallback } from 'react'
import {useNavigate, connect } from 'umi';
import { Form, Input, TextArea, Button, Grid, Space, Image, Selector } from 'antd-mobile'
import { request } from '@/services';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import countryCode from '@/utils/countryCode.json'
import convert from 'color-convert';
import { TYPrompt } from '@/utils/format';
import './index.less'

const WordCreate = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false);

  const onFinish = () => {
    setLoading(true);
    const values = form.getFieldsValue();
    request.post('/prod-api/system/wordUser', {
      data: values
    }).then((res) => {
      setLoading(false)
    })
  }

  const [aiLoading, setAiLoading] = useState(false);
  const url = process.env.NODE_ENV === 'development' ?
    '/compatible-mode/v1/chat/completions' :
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  const handleExportAiResult = () => {
    const word = form.getFieldValue('word');
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
            "content": TYPrompt(message)
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
          console.log(content);
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
            rules={[{ required: true, message: '单词原文不能为空' }]}>
            <Grid columns={4} gap={8}>
              <Grid.Item span={3}>
                <Input
                  className="wordBookCreateInput"
                  style={{ '--text-align': 'center' }}
                  placeholder='请输入单词原文'
                />
              </Grid.Item>
              <Grid.Item span={1}>
                <Button
                  onClick={() => handleExportAiResult()}
                  color='primary'
                  fill='none'
                  loadingText='AI生成中'
                  loading={aiLoading}
                  style={{ height: 54 }}>
                  AI填充
                </Button>
              </Grid.Item>
            </Grid>
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
