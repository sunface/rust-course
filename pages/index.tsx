// core
import React from "react";
// antd
import { Typography, Divider, Button, Card } from "antd";
const { Title, Text } = Typography;
// components
import AppLayout from "../components/AppLayout";
import { T } from "antd/lib/upload/utils";
import './index.less'

const App = () => (
  <AppLayout>
    <div>Home Page</div>
    <Title>Nextjs with Ant Design & Less</Title>
    <Text>
      Go ahead and edit <code>/pages/index.js</code>, and see your changes here
    </Text>
    <Divider />
    <Title level={2}>Useful Links</Title>
    <Button
      href="https://nextjs.org/learn/basics/getting-started"
      target="__blank"
    >
      Next.js Learn
    </Button>
    <Button href="https://nextjs.org/docs/getting-started" target="__blank">
      Next.js Docs
    </Button>
    <Button href="https://ant.design/components/button/" target="__blank">
      antd Docs
    </Button>

    <Divider />
    <div style={{ textAlign: "start" }}>
      <Card className="main-card">
        <Title level={2}>Quick Recap:</Title>
        <Title level={4}>Shared App Layout</Title>
        <Text>
          Shared/Common App Layout is located at{" "}
          <code>/components/AppLayout</code>
        </Text>
        <br />
        <Text>Sider/sidebar, header and footer are all in this file.</Text>

        <br />
        <br />

        <Title level={4}>antd Less</Title>
        <Text>
          antd's Less file is present at <code>/assets/antd-custom.less</code>
        </Text>
        <br />
        <Text>
          Head over to{" "}
          <a
            href="https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less"
            target="__blank"
          >
            antd's theming docs
          </a>{" "}
          for a list of less variables.
        </Text>
        <br />
        <Text>
          If you dont wish to mess around with Less, just delete everything in
          the less file.
        </Text>
      </Card>
    </div>
  </AppLayout>
);

export default App;
