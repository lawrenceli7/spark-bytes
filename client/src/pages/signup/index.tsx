import { useState } from 'react';
import { UserAddOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, type FormProps, Alert } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validateEmail, validatePassword, validateUsername } from '@/utility/validationUtils';
import { API_URL } from '@/common/constants';

type FieldType = {
  email?: string;
  password?: string;
  name?: string;
};


// const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
//   console.log('Success:', values);
// };

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const Signup = () => {
  const [form] = Form.useForm<FieldType>();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const onCloseError = () => {
    setErrors({});
  };

  const onFinish = async (values: FieldType) => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    console.log(res)
    if (res.status === 200) {
      router.push('/');
    } else {
      const json = await res.json();
      setErrors({ message: json.error });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", maxWidth: "100%", backgroundColor: "#eaf7f0" }} >
      <div style={{ position: "absolute", top: "20px", padding: "0 20px" }}>
        {errors.message && <Alert message={errors.message} type="error" showIcon closable onClose={onCloseError} />}
      </div>
      <Card style={{ width: "30%" }}>
        <h1 style={{ textAlign: "center", color: "#455a64" }}>Sign Up</h1>
        <Form
          name="basic"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout='vertical'
        >

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input your name!' }, () => ({
              validator(_, value) {
                if (!value || validateUsername(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Username must be alphanumeric and between 3 to 20 characters long'));
              },
            })]}
            help={errors.name}
            validateStatus={errors.name ? 'error' : ''}
          >
            <Input placeholder='Name' />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              {
                required: true,
                message: 'Please input your email address!'
              },
              () => ({
                validator(_, value) {
                  if (!value || validateEmail(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Invalid email format'));
                },
              }),
            ]}
            help={errors.email}
            validateStatus={errors.email ? 'error' : ''}
          >
            <Input placeholder='Email' />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' },
            () => ({
              validator(_, value) {
                if (!value || validatePassword(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Password must be at least 8 characters long and contain at least 1 digit, 1 uppercase, and 1 lowercase character'));
              },
            }),
            ]}
            help={errors.password}
            validateStatus={errors.password ? 'error' : ''}
          >
            <Input.Password placeholder='Password' />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: "#66bb69", width: "100%" }} icon={<UserAddOutlined />}>
              Sign Up
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <Link href="/">Back to Home</Link >
          </div>
        </Form>
      </Card>
    </div>
  )
};



export default Signup;

