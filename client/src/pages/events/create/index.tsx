import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Form, Card, Button, type FormProps, Input, Select, DatePicker, Upload, UploadFile, message } from "antd";
import { useRouter } from "next/navigation";
import { ITag, ILocation } from "@/common/interfaces";
import dayjs from 'dayjs';
import { API_URL } from "@/common/constants";
import { PlusOutlined } from '@ant-design/icons';

type FieldType = {
  description?: string;
  qty?: number;
  exp_time?: string;
  tags?: number[];
  photos?: UploadFile[];
  location?: {
    id?: number;
    Address?: string;
    floor?: number;
    room?: string;
    loc_note?: string;
  };
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const Create = () => {
  const { getAuthState } = useAuth();
  const [tags, setTags] = useState<ITag[]>([]);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [createNewLocation, setCreateNewLocation] = useState(false);
  const router = useRouter();
  const authState = getAuthState();

  useEffect(() => {
    if (!authState?.decodedToken?.canPostEvents) {
      message.error("Need permission to create events. Redirecting...");
      router.push("/protected");
      return;
    }
  }, [authState, router]);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const [tagsRes, locationsRes] = await Promise.all([
          fetch(`${API_URL}/api/tags`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authState.token}`,
            },
          }),
          fetch(`${API_URL}/api/events/location/locations`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authState.token}`,
            },
          }),
        ]);

        // Parse the responses as JSON
        const tags = await tagsRes.json();
        const locations = await locationsRes.json();

        // Ensure the parsed data is an array
        setTags(Array.isArray(tags) ? tags : []);
        setLocations(Array.isArray(locations) ? locations : []);
        console.log("Data fetched successfully");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    if (authState?.decodedToken?.canPostEvents) {
      fetchData(); // Only fetch data if the user has permission to create events
    }
  }, []);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }

    setFileList(e.fileList);
    return e && e.fileList;
  };

  //Permission to create event error
  const onFinish = async (values: FieldType) => {
    if (!authState?.decodedToken?.canPostEvents) {
      message.error("Need permission to create events");
      return;
    }
    const locationData = createNewLocation
      ? {
        Address: values.location?.Address,
        floor: values.location?.floor,
        room: values.location?.room,
        loc_note: values.location?.loc_note,
      }
      : { id: values.location?.id };

    // Convert UploadFile[] objects to their URLs for backend submission
    const photoURLs = fileList.map((file) => file.thumbUrl || file.url).filter(Boolean);

    const newEvent = {
      ...values,
      photos: photoURLs,
      location: locationData,
    };

    try {
      const res = await fetch(`${API_URL}/api/events/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify(newEvent),
      });

      if (res.ok) {
        router.push("/events");
      } else if (res.status === 401) {
        message.error("Unauthorized access.");
      } else {
        const json = await res.json();
        message.error(json.error || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Create event error: ", error);
      message.error("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#eaf7f0",
        padding: "20px",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card style={{ width: "50%" }}>
        <h1 style={{ textAlign: "center", color: "#455a64" }}>Create Event</h1>
        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item<FieldType>
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter a description of your event." },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Quantity"
            name="qty"
            rules={[{ required: true, message: "Please enter a quantity." }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Expiration Time"
            name="exp_time"
            rules={[{ required: true, message: "Please enter an expiration time." }]}
          >
            <DatePicker
              format="YYYY-MM-DD HH:mm:ss"
              showTime={{ defaultValue: dayjs("00:00:00", "HH:mm:ss") }}
            />
          </Form.Item>

          <Form.Item
            label="Tags"
            name="tags"
            rules={[{ required: true, message: "Please select at least one tag." }]}
          >
            <Select mode="multiple" placeholder="Select tags">
              {tags.map((tag) => (
                <Select.Option key={tag.tag_id} value={tag.tag_id}>
                  {tag.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item<FieldType>
            label="Location"
            name={['location', 'id']}
            rules={[{ required: !createNewLocation, message: "Please select a location or add a new one." }]}
          >
            <Select
              placeholder="Select a location or add new..."
              onSelect={(value) => setCreateNewLocation(value === 'new')}
            >
              {locations.map((loc) => (
                <Select.Option key={loc.id} value={loc.id}>{loc.Address}</Select.Option>
              ))}
              <Select.Option key="new" value="new">+ Add new location</Select.Option>
            </Select>
          </Form.Item>

          {createNewLocation && (
            <>
              <Form.Item<FieldType> name={['location', 'Address']} rules={[{ required: true, message: "Please enter an address." }]}>
                <Input placeholder="Address" />
              </Form.Item>
              <Form.Item<FieldType> name={['location', 'floor']} rules={[{ required: true, message: "Please enter a floor number." }]}>
                <Input placeholder="Floor" type="number" />
              </Form.Item>
              <Form.Item<FieldType> name={['location', 'room']} rules={[{ required: true, message: "Please enter a room number." }]}>
                <Input placeholder="Room" />
              </Form.Item>
              <Form.Item<FieldType> name={['location', 'loc_note']}>
                <Input placeholder="Location note (optional)" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="photos"
            label="Upload Photos (Max: 10)"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[
              { required: true, message: "At least one photo is required." },
              {
                validator: (_, value) => {
                  if (value?.length > 10) {
                    return Promise.reject(new Error("Cannot upload more than 10 images"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Upload
              accept="image/png, image/jpeg"
              beforeUpload={() => false}
              listType="picture-card"
              multiple
              fileList={fileList}
              showUploadList={{ showPreviewIcon: false }}
            >
              {fileList.length >= 10 ? null : (
                <button style={{ border: 0, background: "none" }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              )}
            </Upload>
          </Form.Item>

          <Form.Item wrapperCol={{ span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Create;
