import { webhookUrl } from '@/lib/api';

const name = "Marketplace Apparatus CIA";
const webhookItemName = 'Marketplace Auditor';
const webhookItemPath = `/sitecore/system/Webhooks/${webhookItemName}`;
const webhookTemplateId = '{F05212CE-30A7-4733-A7F4-ED6E13F26692}';
const parentId = '{7D2FA73D-6AE7-47CB-8D0B-D64671768C82}';
const allEvents = '{EAB76990-706E-4343-B7FC-16A96A37C37F}|{CE714622-73F7-4892-9873-C234947FA52D}|{4EB17C13-DC1E-45CE-88F0-A88F4ADE3ADF}|{A56A9B5F-50B7-41F8-A176-707F0D9E03EB}|{1D323CBA-C898-4E13-A6C5-1DCDB292BAC9}|{723C4A34-9CE2-4D96-B1C6-B61A1425BE03}|{50DF427E-5A44-4004-9A8D-9B1A6E08F0D1}|{10F78F45-7C58-4753-A09E-41D890EA2A2B}|{7C7ECB12-AF42-4411-B5EA-7EF78CF73491}|{194583FD-FE2F-4E1B-A021-96E828935E3C}|{34750BC1-8A3F-4654-A47F-A0AC232F1D17}|{C4BBE403-4E24-4152-A7DD-E4794C1035F5}|{B87E9607-0AB4-42DE-AB3D-AFF6A56719A1}|{1C4FA567-26F7-4DC2-AE46-250914C82EB6}|{FE2D8B0D-26CC-4610-A380-5F24C756DF30}|{08C0376C-098E-4A7D-A75E-B157BB6862E0}|{8CD40F15-596D-49D0-9286-87750E2592CC}';


export const createMutationVariables = (instanceId: string, existingItemId?: string) => {
    const result = {
        url: webhookUrl(instanceId)
    };
    return existingItemId ? {
        ...result,
        itemId: existingItemId
    } : result;
};

const selectFields = `
        itemId
        name
        description:field(name:"Description") { value }
        events:field(name:"Events") { value }
        rule:field(name:"Rule") { value }
        enabled:field(name:"Enabled") { value }
        url:field(name:"Url") { value }
        type:field(name:"Serialization Type") { value }
`;

export const readWebhookQuery = `
query ReadAuditorWebhook {
    item(where: {
        path: "${webhookItemPath}"
    }) {${selectFields}
    }
}`;

const updateWebhookQuery = `
mutation UpdateAuditorWebhook($itemId:ID!) {
    updateItem(input: {
        fields: [
            { name: "Description", value: "${name}" }
            { name: "Url", value: "$url" }
            { name: "Events", value: "${allEvents}" }
            { name: "Enabled", value: "1" }
        ]
        itemId: $itemId
        language: "en"
    }){
        item {
            ${selectFields}
        }
    }
}`;

const createWebhookQuery = `
mutation CreateAuditorWebhook {
    createItem(input: {
        name: "${webhookItemName}"
        templateId: "${webhookTemplateId}"
        parent: "${parentId}"
        language: "en"
        fields: [
            { name: "Description", value: "${name}" }
            { name: "Url", value: "$url" }
            { name: "Events", value: "${allEvents}" }
            { name: "Enabled", value: "1" }
        ]
        itemId: $itemId
        language: "en"
    }){
        item {
            ${selectFields}
        }
    }
}`;

export const makeUpdateWebhookQuery = (sitecoreContextId: string, instanceId: string, existingItemId: string) => ({
    query: { sitecoreContextId },
    body: {
        query: updateWebhookQuery.replace('\$url', webhookUrl(instanceId)),
        variables: createMutationVariables(instanceId, existingItemId)
    }
});
export const makeCreateWebhookQuery = (sitecoreContextId: string, instanceId: string) => ({
    query: { sitecoreContextId },
    body: {
        query: createWebhookQuery.replace('\$url', webhookUrl(instanceId)),
        variables: createMutationVariables(instanceId)
    }
});

export type ItemId = string;

export type FieldValue = {
    value: string;
};

export type WebhookItem = {
    itemId: ItemId;
    name: string;
    description: FieldValue;
    events: FieldValue;
    rule: FieldValue;
    enabled: FieldValue;
    url: FieldValue;
    type: FieldValue;
};
