import { useContext, useState } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { Button, Form, Card, type FormProps, Input, Alert } from "antd";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/contexts/AuthContext";
import { validateEmail, validatePassword } from "@/utility/validationUtils";
import { API_URL } from "@/common/constants";

type FieldType = {
  username?: string;
  password?: string;
};

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
  console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const Login = () => {
  const { updateAuthToken } = useContext(AuthContext);
  const [form] = Form.useForm<FieldType>();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const onCloseError = () => {
    setErrors({});
  };

  const onFinish = async (values: FieldType) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const json = await res.json();
        updateAuthToken(json.token);
        router.push("/protected");
      } else if (res.status === 401) {
        // Specific handling for unauthorized access
        setErrors({ message: "Incorrect email or password." });
      } else {
        // General error handling
        const json = await res.json();
        setErrors({
          message: json.error || "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        message: "Network error. Please check your connection and try again.",
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        maxWidth: "100%",
        backgroundColor: "#eaf7f0",
      }}
    >
      <div
        style={{ position: "absolute", top: "20px", padding: "0 20px" }}
      ></div>
      <div style={{ position: "absolute", top: "20px", padding: "0 20px" }}>
        {errors.message && (
          <Alert
            message={errors.message}
            type="error"
            showIcon
            closable
            onClose={onCloseError}
          />
        )}
      </div>
      <Card style={{ width: "30%" }}>
        <h1 style={{ textAlign: "center", color: "#455a64" }}>Login</h1>

        <Form
          name="basic"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your email address!",
              },
              () => ({
                validator(_, value) {
                  if (!value || validateEmail(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Invalid email format"));
                },
              }),
            ]}
            help={errors.email}
            validateStatus={errors.email ? "error" : ""}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              // () => ({
              //   validator(_, value) {
              //     if (!value || validatePassword(value)) {
              //       return Promise.resolve();
              //     }
              //     return Promise.reject(new Error('Password must be at least 8 characters long and contain at least 1 digit, 1 uppercase, and 1 lowercase character'));
              //   },
              // }),
            ]}
            help={errors.password}
            validateStatus={errors.password ? "error" : ""}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#66bb69", width: "100%" }}
              icon={<HomeOutlined />}
            >
              Login
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <Link href="/">Back to Home</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
