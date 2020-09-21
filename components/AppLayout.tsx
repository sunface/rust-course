import React, { useState, useEffect } from "react";
//
import Link from "next/link";
import { useRouter } from "next/router";
//
import {
  useWindowSize,
  useWindowWidth,
  useWindowHeight
} from "@react-hook/window-size";
//
import { Layout, Menu, Switch } from "antd";
import {
  HomeOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  CloudOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  UploadOutlined,
  VideoCameraOutlined
} from "@ant-design/icons";
//
import { Input } from "antd";
//
//
//
//

const { Search } = Input;
//

const { Header, Content, Footer, Sider } = Layout;

const AppLayout = props => {
  const [siderKey, setSiderKey] = useState(-1);
  const [isSiderCollapsed, setSiderCollapsed] = useState(false);
  const [window, setWindow] = useState({ width: -1, height: -1 });

  const [width, height] = useWindowSize();
  useEffect(() => {
    setWindow({ width: width, height: height });

    return () => {
      // cleanup
    };
  }, [width, height]);

  const router = useRouter();

  useEffect(() => {
    console.log(siderKey);
    return () => {
      // cleanup
    };
  }, [siderKey]);

  useEffect(() => {
    console.log("useEffect fired by useRouter");
    const urlPath = router.pathname;

    switch (urlPath) {
      case "/":
        setSiderKey(0);
        break;
      case "/profile":
        setSiderKey(1);
        break;
      case "/videos":
        setSiderKey(2);
        break;
      case "/backup":
        setSiderKey(3);
        break;
      case "/analytics":
        setSiderKey(4);
        break;
    }
    return () => {
      // cleanup
    };
  }, [router]);

  const contentStyleWidth =
    // responsive design
    window.width < 480 ? { width: "calc(100vw - 32px)" } : {};

  return (
    <Layout>
      <Sider
        collapsible
        breakpoint="lg"
        collapsedWidth={window.width > 480 ? "80" : "0"} // enable responsive hidden sider for mobile only
        onBreakpoint={broken => {
          console.log(broken);
        }}
        collapsed={isSiderCollapsed}
        onCollapse={(collapsed, type) => {
          setSiderCollapsed(collapsed);
          console.log(collapsed, type);
        }}
      >
        <div
          className="logo"
          style={{
            height: 64,
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            whiteSpace: "nowrap"
          }}
        >
          Sider Logo
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[siderKey.toString()]}>
          <Menu.Item key="0">
            <Link href="/">
              <div>
                <HomeOutlined />
                <span className="nav-text">Home</span>
              </div>
            </Link>
          </Menu.Item>

          <Menu.Item key="1">
            <Link href="/profile">
              <div>
                <UserOutlined />
                <span className="nav-text">Profile</span>
              </div>
            </Link>
          </Menu.Item>

          <Menu.Item key="2">
            <Link href="/videos">
              <div>
                <VideoCameraOutlined />
                <span className="nav-text">Videos</span>
              </div>
            </Link>
          </Menu.Item>

          <Menu.Item key="3">
            <Link href="/backup">
              <div>
                <UploadOutlined />
                <span className="nav-text">Backup</span>
              </div>
            </Link>
          </Menu.Item>

          <Menu.Item key="4">
            <Link href="/analytics">
              <div>
                <BarChartOutlined />
                <span className="nav-text">Analytics</span>
              </div>
            </Link>
          </Menu.Item>

          <Menu.Item key="5">
            <CloudOutlined />
            <span className="nav-text">Cloud</span>
          </Menu.Item>

          <Menu.Item key="6">
            <AppstoreOutlined />
            <span className="nav-text">Apps</span>
          </Menu.Item>

          <Menu.Item key="7">
            <TeamOutlined />
            <span className="nav-text">Collaborate</span>
          </Menu.Item>

          <Menu.Item key="8">
            <ShopOutlined />
            <span className="nav-text">Shop</span>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header
          className={"site-layout-sub-header-background"}
          style={{ padding: 0 }}
        >
          <div
            className="logo"
            style={{
              height: 64,
              color: "white",
              textAlign: "center"
            }}
          >
            Main Logo
          </div>
        </Header>
        <Content // you may want to change these
          style={{
            ...contentStyleWidth,
            margin: "24px 16px 0",
            overflow: "initial"
          }}
        >
          <div
            className="site-layout-background"
            style={{
              padding: 24,
              textAlign: "center",
              minHeight: "calc(100vh - 158px)"
            }}
          >
            {props.children}
          </div>
        </Content>
        <Footer style={{ ...contentStyleWidth, textAlign: "center" }}>
          Footer Text
          {/* <p>
            width: {window.width}, height: {window.height}
          </p> */}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
