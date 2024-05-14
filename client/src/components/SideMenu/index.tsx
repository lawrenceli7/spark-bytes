import React, { useState, useEffect } from "react";
import {
  LogoutOutlined,
  CalendarOutlined,
  HomeOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { Menu } from "antd";
import { useAuth } from "@/contexts/AuthContext";

function SideMenu() {
  const router = useRouter();
  const pathname = router.pathname;
  const [selectedKeys, setSelectedKeys] = useState(pathname);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const { clearAuthState, authState, getAuthState } = useAuth();

  useEffect(() => {
    const authState = getAuthState();
    if (authState.decodedToken?.isAdmin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setSelectedKeys(pathname);
  }, [pathname, getAuthState, isAdmin]);

  const signOut = () => {
    clearAuthState();
    router.push("/");
  };

  return (
    <div className="SideMenu">
      <Menu
        mode="vertical"
        onClick={(item) => {
          if (item.key === "signOut") {
            signOut();
          } else {
            router.push(item.key);
          }
        }}
        selectedKeys={[selectedKeys]}
        items={[
          {
            label: "Example Protected Route",
            key: "/protected",
            icon: <HomeOutlined />,
          },
          {
            label: "Events",
            key: "/events",
            icon: <CalendarOutlined />,
          },
          {
            label: "Create Event",
            key: "/events/create",
            icon: <PlusOutlined />,
            hidden: !authState?.decodedToken?.canPostEvents, //hides menu if cannot post events
          },
          {
            label: "Admin",
            key: "/admin",
            icon: <TeamOutlined />,
            hidden: !isAdmin,
          },
        ].filter((item) => !item.hidden)}
      />
      <Menu
        mode="vertical"
        onClick={(item) => {
          if (item.key === "signOut") {
            signOut();
          }
        }}
        selectedKeys={[selectedKeys]}
        items={[
          {
            label: "Sign Out",
            key: "signOut",
            icon: <LogoutOutlined />,
          },
        ]}
      />
    </div>
  );
}
export default SideMenu;

