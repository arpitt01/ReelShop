import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  createReelDefinitions,
  checkReelDefinitions,
} from "./Servers/reelsSetup.server";

// Loader
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const { exists } = await checkReelDefinitions(admin);
  return { setupDone: exists };
};

// Action
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const step = formData.get("step");
  if (step === "setup") {
    const { resp1, resp2 } = await createReelDefinitions(admin);
    return { step: "setup", resp1, resp2 };
  }
  return null;
};

// Component
export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const handleSetup = () => {
    fetcher.submit({ step: "setup" }, { method: "post" });
  };

  const setupDone = loaderData.setupDone || fetcher.data?.step === "setup";

  return (
    <Page>
      <TitleBar title="Shop Reels" />

      <Layout>
        {/* Intro */}
        <Layout.Section>
          <Card sectioned>
            <BlockStack gap="300">
              <Text variant="headingLg" as="h1">
                🎥 Welcome to ReelShop
              </Text>
              <Text tone="subdued">
                Turn your product videos into engaging <strong>shoppable reels</strong>. Showcase them on your <em>homepage</em> or <em>product pages</em> and boost conversions with an interactive shopping experience.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Step 1: Setup */}
        <Layout.Section>
          <Card title="Step 1: Initial Setup" sectioned>
            {!setupDone ? (
              <BlockStack distribution="equalSpacing" alignment="center">
                <Text>
                  Before creating reels, we need to configure definitions in your store.
                </Text>
                <Button
                  primary
                  onClick={handleSetup}
                  loading={fetcher.state !== "idle"}
                >
                  Run Setup
                </Button>
              </BlockStack>
            ) : (
              <BlockStack distribution="equalSpacing" alignment="center">
                <InlineStack gap="3" blockAlign="center">
                  <Text tone="success">✅ Initial Setup complete</Text>
                </InlineStack>
              </BlockStack>
            )}
          </Card>
        </Layout.Section>

        {/* Step 2: Create Reel */}
        {setupDone && (
          <Layout.Section>
            <Card title="Step 2: Create Your First Reel" sectioned>
              <BlockStack distribution="equalSpacing" alignment="center">
                <Text>
                  Upload a video and link it to a product to create your first reel.
                </Text>
                <Button
                  primary
                  url="shopify://admin/content/metaobjects/entries/shop-reels"
                  target="_top"
                >
                  Create Reel
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        {/* Step 3: Add Reels in Theme */}
        {setupDone && (
          <Layout.Section>
            <Card title="Step 3: Add Reels to Your Theme" sectioned>
              <BlockStack distribution="equalSpacing" alignment="center">
                <Text>
                  Add the Shop Reels app block to your theme pages (homepage or product pages).
                </Text>
              </BlockStack>
              <Text tone="subdued" small>
                Steps: 1) Click 'Edit Theme' 2) Go to the page section (homepage/product) 3) Add "Shop Reels" block 4) Save.
              </Text>
            </Card>
          </Layout.Section>
        )}

        {/* How it works */}
        <Layout.Section>
          <Card title="How it works" sectioned>
            <BlockStack gap="4">
              <InlineStack gap="3" blockAlign="center">
                <Text as="p">
                  Upload reels <strong>(video + product tag + caption)</strong>.
                </Text>
              </InlineStack>

              <InlineStack gap="3" blockAlign="center">
                <Text as="p">
                  Display reels on your <strong>homepage</strong> to engage visitors.
                </Text>
              </InlineStack>

              <InlineStack gap="3" blockAlign="center">
                <Text as="p">
                  Add reels to <strong>product pages</strong>. Choose between a floating reel widget or suggested products tray.
                </Text>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
