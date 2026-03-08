import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
    type ApplicationResourceContext,
} from "@sitecore-marketplace-sdk/core";
import {
    type ApplicationContext,
    ClientSDK,
} from "@sitecore-marketplace-sdk/client";
import { XMC } from "@sitecore-marketplace-sdk/xmc";
import { readWebhookQuery, type WebhookItem } from "./webhook-queries";

async function fetchItem(client: ClientSDK, xmCloudResourceAccess: ApplicationResourceContext): Promise<[WebhookItem, string?]> {
    const sitecoreContextId = xmCloudResourceAccess.context.preview;

    const response: any = await client.mutate("xmc.authoring.graphql", {
        params: {
            query: { sitecoreContextId },
            body: {
                query: readWebhookQuery
            }
        }
    });
    const error = response?.error;
    const resultItem: WebhookItem = response?.data?.data?.item;
    return [resultItem, error];
}

export const useWebhookState = (appContext: ApplicationContext, client: ClientSDK): [WebhookItem | null, Dispatch<SetStateAction<WebhookItem | null>>] => {

    const [item, setItem] = useState<WebhookItem | null>(null);

    useEffect(() => {
        const xmCloudResourceAccess = appContext?.resourceAccess?.[0];
        if (!client || !xmCloudResourceAccess) {
            return;
        }

        fetchItem(client, xmCloudResourceAccess).then(result => {
            const [resultItem, error] = result;
            if (error) {
                console.error(error);
            } else {
                setItem(resultItem);
            }
        });

    }, [client, appContext]);

    return [item ?? null, setItem];
};