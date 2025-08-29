import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

export async function checkReelDefinitions(admin: AdminApiContext) {
  const query = `
    query {
      metaobjectDefinitions(first: 50) {
        nodes {
          id
          name
          type
        }
      }
    }
  `;

  const resp = await admin.graphql(query).then((r) => r.json());
  const nodes = resp?.data?.metaobjectDefinitions?.nodes ?? [];

  const reelDef = nodes.find((d: any) => d.type === "shop-reels");
  const exists = Boolean(reelDef);

  return { exists, raw: resp };
}

export async function createReelDefinitions(admin: AdminApiContext) {
  const createMetaobjectMutation = `
    mutation {
      metaobjectDefinitionCreate(
        definition: {
          type: "shop-reels"
          name: "Shop Reels"
          access: { storefront: PUBLIC_READ }
          fieldDefinitions: [
            { name: "Name", key: "name", type: "single_line_text_field", required: true }
            { name: "Video", key: "video", type: "file_reference", required: true  }
            { name: "Product", key: "product", type: "product_reference", required: true }
          ]
          displayNameKey: "name"
        }
      ) {
        userErrors { field message }
        metaobjectDefinition { id name type }
      }
    }`;

  const createMetafieldDef = `
    mutation {
      metafieldDefinitionCreate(definition: {
        name: "Shop Reels"
        namespace: "shop-reels"
        key: "shop-reels"
        ownerType: PRODUCT
        type: "list.metaobject_reference"
        validations: [{ name: "metaobject_definition", value: "shop-reels" }]
      }) {
        userErrors { field message }
        createdDefinition { id name namespace key }
      }
    }`;

  const resp1 = await admin.graphql(createMetaobjectMutation).then((r) => r.json());
  const resp2 = await admin.graphql(createMetafieldDef).then((r) => r.json());

  return { resp1, resp2 };
}
