import { TeamContext } from 'vso-node-api/interfaces/CoreInterfaces';
import { IWorkItemTrackingApi } from 'vso-node-api/WorkItemTrackingApi';
import { arrayMax, mapColor, statusColorField } from './util';

// tslint:disable-next-line no-import-side-effect
import 'bluefill';

export interface IQueryContext {
    instance: IWorkItemTrackingApi;
    teamContext: TeamContext;
}

export async function reportQuery(query: string, context: IQueryContext) {
    const queryDetails = await context.instance.getQuery(context.teamContext.project, query);
    const queryResults = await runQuery(query, context);

    return {
        title: queryDetails.name,
        items: queryResults,
    };
}

async function runQuery(query: string, context: IQueryContext) {
    const results = (await context.instance.queryById(query, context.teamContext))
    .workItems
    .map(item => item.id);

    async function getLatestComment(id: number): Promise<string> {
        const commentsResult = await context.instance.getComments(id);
        if (!commentsResult.count) {
            return ' ';
        }

        return arrayMax(commentsResult.comments, 'revision')['text'];
    }

    const items = await context.instance.getWorkItems(results);

    return await Promise.map(items, async item => {
        const comment = await getLatestComment(item.id);

        return {
            id: item.id,
            status: item.fields['System.State'],
            title: item.fields['System.Title'],
            statusColor: mapColor(item.fields[statusColorField]),
            comment,
        };
    });
}
