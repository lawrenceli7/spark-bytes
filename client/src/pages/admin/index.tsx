import { useEffect, FC, useState } from "react";
import { useRouter } from "next/router";
import {
  message,
  Typography,
  Modal,
  Form, Table,
  Select
} from "antd";
import { API_URL } from "../../common/constants";
import { IAuthTokenDecoded } from "../../common/interfaces";
import { useAuth } from "@/contexts/AuthContext";
import { IUserData } from "@/common/interfaces_zod";
import { IAuthState } from "../../common/interfaces";


const AdminControl: FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [users, setUsers] = useState<IUserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserData | null>(null);
  const [form] = Form.useForm();

  const { getAuthState, updateAuthToken } = useAuth();

  useEffect(() => {
    const authState: IAuthState = getAuthState();
    if (!authState.decodedToken?.isAdmin) {
      router.push("/protected");
    }
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const eventsResponse = await fetch(`${API_URL}/api/user/`, {
          headers: {
            Authorization: `Bearer ${getAuthState()?.token}`,
          },
        });

        if (!eventsResponse.ok) {
          console.log("error");
          throw new Error(`${eventsResponse.status}`);
        }

        const usersData = await eventsResponse.json();
        setUsers(usersData);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error(error);
        message.error(
          "An error occurred while fetching users. Please try again later."
        );
      }
    };
    fetchUsers();
  }, [getAuthState, updateAuthToken]);

  const handleOk = async () => {
    try {
      setIsEditing(true);
      const { canPostEvents, isAdmin } = form.getFieldsValue();
      const response = await fetch(`${API_URL}/api/user/update/permissions/${selectedUser?.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getAuthState()?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ canPostEvents, isAdmin }),
      });

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const result = await response.json()
      if (result.token) {
        updateAuthToken(result.token);

      }

      const newUsers = users.map((user) => {
        if (user.id === selectedUser?.id) {
          return {
            ...user,
            canPostEvents,
            isAdmin,
          };
        }
        return user;
      });
      setUsers(newUsers);
      setIsOpenModal(false);
      setIsEditing(false);
      setSelectedUser(null);
    } catch (error) {
      setIsEditing(false);
      console.error(error);
      message.error(
        "An error occurred while editing user permissions. Please try again later."
      );
    }
  };

  const handleCancel = () => {
    setIsOpenModal(false);
    setSelectedUser(null);
  };


  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      editable: false,
    },
    {
      title: 'email',
      dataIndex: 'email',
      editable: false,
    },
    {
      title: 'canPostEvents',
      dataIndex: 'canPostEvents',
      render: (canPostEvents: boolean) => {
        if (canPostEvents) return "True";
        else return "False";
      }
    },
    {
      title: 'isAdmin',
      dataIndex: 'isAdmin',
      render: (isAdmin: boolean) => {
        if (isAdmin) return "True";
        else return "False";
      }
    },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: "#eaf7f0",
          padding: "20px",
          width: "100%",
          height: "100%",
        }}
      >
        <Typography.Title
          level={2}
          style={{ textAlign: "center", marginBottom: "20px" }}
        >
          {"Loading..."}
        </Typography.Title>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#eaf7f0",
        padding: "20px",
        width: "100%",
        height: "100%",
      }}
    >
      <Typography.Title
        level={2}
        style={{ textAlign: "center", marginBottom: "20px" }}
      >
        {"Admin Control"}
      </Typography.Title>
      <div>
        <Form form={form} component={false}>
          <Table
            components={{
              body: {
                // cell: EditableCell,
              },
            }}
            bordered
            dataSource={users}
            columns={columns}
            onRow={(record, _) => {
              return {
                onClick: (_) => {
                  setSelectedUser(record);
                  setIsOpenModal(true);
                },

              };
            }}
          />
        </Form>
      </div>
      <Modal
        title={`Edit ${selectedUser?.name}'s Permissions`}
        open={isOpenModal}
        onOk={handleOk}
        okButtonProps={{ loading: isEditing }}
        onCancel={handleCancel}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Form form={form} component={false} fields={[
          {
            name: ["canPostEvents"],
            value: selectedUser?.canPostEvents
          },
          {
            name: ["isAdmin"],
            value: selectedUser?.isAdmin
          }
        ]}>
          <Form.Item name="canPostEvents" label="Can Post Events?">
            <Select
              style={{ width: "100%" }}
              options={[
                {
                  value: true,
                  label: "Yes",
                },
                {
                  value: false,
                  label: "No",
                },
              ]}
            />
          </Form.Item>
          <Form.Item name="isAdmin" label="Is Admin?">
            <Select
              style={{ width: "100%" }}
              options={[
                {
                  value: true,
                  label: "Yes",
                },
                {
                  value: false,
                  label: "No",
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminControl;


