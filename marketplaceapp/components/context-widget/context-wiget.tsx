"use client";

import { useEffect, useState } from 'react';
import { type PagesContext, type ApplicationContext } from '@sitecore-marketplace-sdk/client';
import { useAppContext, useMarketplaceClient } from "@/components/providers/marketplace";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimelineVersions, VersionEvent, VersionGroup, dummyVersionsData } from "@/components/timeline-versions/timeline-version";
import { FilterTable } from "@/components/filter-table";
import { getItems, type ChangeModel } from '@/lib/api';

type AllData = {
    data?: ChangeModel[];
    versionsData?: VersionGroup[];
    workflowData?: VersionGroup[];
};

function mapGroup(groups: Partial<Record<string, ChangeModel[]>>) {
    const result = [];
    for (const key of Object.keys(groups)) {
        if (!groups[key]) {
            continue;
        }

        const events: VersionEvent[] = groups[key].map(x => ({
            time: x.timestamp,
            action: x.webHookData.eventName,
            state: x.workflowStateId ?? ''
        }));

        const group: VersionGroup = {
            name: key,
            id: key,
            events
        };
        result.push(group);
    }

    return result;
}

async function fetchData(installationId?: string, pageContext?: PagesContext, filters?: Record<string, unknown>): Promise<AllData> {
    if (!installationId || !pageContext?.pageInfo?.id) {
        return {};
    }
    const data = await getItems(installationId, [pageContext?.pageInfo?.id]);

    const versionsData = mapGroup(Object.groupBy(data, x => x.webHookData.item.version + ''));
    const workflowData = mapGroup(Object.groupBy(data.filter(x => !!x.workflowStateId), x => x.workflowStateId!));
    return { data, versionsData, workflowData };
}

function PageContextWidget() {
    const client = useMarketplaceClient();
    const appContext = useAppContext();

    const [page, setPage] = useState<PagesContext>();
    const [data, setData] = useState<AllData>();

    useEffect(() => {
        client.query("pages.context", {
            subscribe: true,
            onSuccess: data => {
                setPage(data);
            },
            onError: err => {
                console.error(err);
                setPage(undefined);
            },
        });
    }, [client]);

    useEffect(() => {
        fetchData(appContext?.installationId, page, {}).then(x => {
            setData(x);
        });
    }, [client, appContext?.installationId, page]);

    if (!page || !data) {
        return <Spinner variant="primary" />;
    }

    return (
        <>
            <Tabs defaultValue="versions" className="">
                <TabsList>
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                    <TabsTrigger value="workflow">Workflows</TabsTrigger>
                </TabsList>
                <TabsContent value="versions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Versions</CardTitle>
                            <CardDescription>
                                <TimelineVersions versions={data.versionsData ?? []} />
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
                <TabsContent value="workflow">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workflows</CardTitle>
                            <CardDescription>
                                <TimelineVersions versions={data.workflowData ?? []} />
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
            </Tabs>
            <FilterTable
                data={data.data ?? []}
                showFieldChanges={true}
                debounceTime={500}
                emptyStateMessage="No actions found matching your criteria"
                openFiltersByDefault={false}
            />
        </>
    );
}

export default PageContextWidget;
