const urlPrefix = "https://coordinatorapi-bzacc3gkdgh7ehdd.westeurope-01.azurewebsites.net/api";

export type FieldValue = {
    fieldId: string;
    value: string;
};
export type FieldChangedValue = FieldValue & {
    originalValue: string;
};

export type WebHookData = {
    eventName: string;
    item: {
        language: string;
        version: number;
        id: string;
        name: string;
        parentId: string;
        templateId: string;
        sharedFields: Array<FieldValue>;
        unversionedFields: Array<FieldValue>;
        versionedFields: Array<FieldValue>;
    };
    changes: {
        fieldChanges: Array<FieldChangedValue>;
        isUnversionedFieldChanged: boolean;
        isSharedFieldChanged: boolean;
    };
};

export type ChangeModel = {
    storageId: string;
    timestamp: Date;
    user: string;
    workflowId: null | string;
    workflowStateId: null | string;
    webHookData: WebHookData;
};

export const webhookUrl = (instanceId: string) => `${urlPrefix}/receive/hook/${instanceId}`;

export const getItems = async (instanceId: string, ids: string[]) => {
    const itemsUrl = `${urlPrefix}/query/${instanceId}/items`;
    const response = await fetch(itemsUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Ids: ids
        })
    });
    const json: { items: ChangeModel[] } = await response.json();
    return json.items;
};