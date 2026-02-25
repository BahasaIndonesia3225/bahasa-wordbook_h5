import React, { useState, useEffect } from 'react'
import {useNavigate, connect } from 'umi';
import { Form, Input, TextArea, Button, Selector, Empty, Dialog, Image, Radio, Space } from 'antd-mobile'
import { request } from '@/services';
import convert from 'color-convert';
import './index.less'

const colorOptions = [
  { label: '', value: 'pink_FD7BB1' },
  { label: '', value: 'green_7DCD4B' },
  { label: '', value: 'cyan_33D2BA' },
  { label: '', value: 'blue_329DFB' },
  { label: '', value: 'red_F45856' },
  { label: '', value: 'orange_FBA050' },
  { label: '', value: 'purple_8980FF' },
  { label: '', value: 'yellow_FFCD4D' },
]

const WordBookCreate = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(); // 添加状态跟踪选中的颜色

  // 处理颜色选择
  const handleColorSelect = (colorValue) => {
    setSelectedColor(colorValue); // 更新本地状态
    form.setFieldValue('colour', colorValue); // 更新表单字段
    // 触发表单校验以清除错误提示
    form.validateFields(['colour']).catch(() => {});
  }

  const onFinish = () => {
    setLoading(true);
    const values = form.getFieldsValue();
    request.post('/prod-api/system/phrase', {
      data: values
    }).then((res) => {
      setLoading(false)
    })
  }

  return (
    <div className="wordBookCreate">
      <div className="wordBookCreateInner">
        <Form
          form={form}
          initialValues={{
            name: "",
            colour: "",
            language: "",
            remark: "",
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
              确定创建
            </Button>
          }
        >
          <Form.Header>您目前还可创建50个单词本</Form.Header>
          <Form.Item
            name='name'
            label='单词本名称'
            rules={[{ required: true, message: '单词本名称不能为空' }]}>
            <Input
              className="wordBookCreateInput"
              style={{ '--text-align': 'center' }}
              placeholder='请输入单词本名称'
            />
          </Form.Item>
          <Form.Item
            name='colour'
            label='单词本颜色'
            rules={[{ required: true, message: '请选择单词本颜色' }]}>
            <ul className="wordBookCreateColour">
              <Space wrap>
                {
                  colorOptions.map(item => {
                    const { value } = item;
                    const [colorName, colorCode] = value.split('_');
                    const isSelected = selectedColor === value; // 检查是否选中
                    return (<li
                      key={value}
                      style={{
                        background: `#${colorCode}`,
                        border: isSelected ? `2px solid #333` : `2px solid #${colorCode}`,
                      }}
                      onClick={() => handleColorSelect(value)}>
                    </li>)
                  })
                }
              </Space>
            </ul>
          </Form.Item>
          <Form.Item
            name='language'
            label='单词本语言'
            rules={[{ required: true, message: '备注不能为空' }]}>
          </Form.Item>
          <Form.Item
            name='remark'
            label='备注'
            rules={[{ required: true, message: '备注不能为空' }]}>
            <TextArea
              className="wordBookCreateTextArea"
              placeholder='请输入备注'
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default WordBookCreate
