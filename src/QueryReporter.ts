import { WorkItem } from 'vso-node-api/interfaces/WorkItemTrackingInterfaces';

import { TeamContext } from 'vso-node-api/interfaces/CoreInterfaces';
import { IWorkItemTrackingApi } from 'vso-node-api/WorkItemTrackingApi';
import { arrayMax, mapColor, statusColorField } from './util';

// tslint:disable-next-line no-import-side-effect
import 'bluefill';

export interface IQueryContext {
    instance: IWorkItemTrackingApi;
    teamContext: TeamContext;
}

export interface IQueryResultItem {
    id: number;
    status: string;
    title: string;
    statusColor: string;
    comment: string;
    owners: string;
}

export interface IQueryResults {
    title: string;
    items: IQueryResultItem[];
}

export async function reportQuery(query: string, context: IQueryContext): Promise<IQueryResults> {
    const queryDetails = await context.instance.getQuery(context.teamContext.project, query);
    const queryResults = await runQuery(query, context);

    return {
        title: queryDetails.name,
        items: queryResults,
    };
}

async function runQuery(query: string, context: IQueryContext): Promise<IQueryResultItem[]> {
    const results = (await context.instance.queryById(query, context.teamContext))

    if (!results.workItems) {
        console.log('Empty Query', query);

        return [];
    }

    const ids = results.workItems.map(item => item.id);

    async function getLatestComment(id: number): Promise<string> {
        const commentsResult = await context.instance.getComments(id);
        if (!commentsResult.count) {
            return ' ';
        }

        return arrayMax(commentsResult.comments, 'revision')['text'];
    }

    const items = await context.instance.getWorkItems(ids);

    return await Promise.map(items, async item => {
        const comment = await getLatestComment(item.id);

        const owners = getPeopleInvolved(item);

        return {
            id: item.id,
            status: item.fields['System.State'],
            title: item.fields['System.Title'],
            statusColor: mapColor(item.fields[statusColorField]),
            owners,
            comment,
        };
    });
}

export function getPeopleInvolved(item: WorkItem) {
    return item.fields['System.AssignedTo'];
}
