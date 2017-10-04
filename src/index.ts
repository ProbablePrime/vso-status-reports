import { getTeamContext, getWebApi } from './util';

// tslint:disable-next-line no-import-side-effect
import 'bluefill';

function arrayMax(arr: object[], key: string) {
  return arr.reduce((p: object , v: object) => {
    return ( p[key] > v[key] ? p : v );
  });
}

async function run() {
    const instance = await getWebApi();
    const context = getTeamContext();

    const workTracking = instance.getWorkItemTrackingApi();

    const results = (await workTracking.queryById('c26d3794-c629-476d-8360-cb7f4b055d67', context))
        .workItems
        .map(item => item.id);

    async function getLatestComment(id: number): Promise<string> {
        const commentsResult = await workTracking.getComments(id);
        if (!commentsResult.count) {
            return ' ';
        }

        return arrayMax(commentsResult.comments, 'revision')['text'];
    }

    const items = await workTracking.getWorkItems(results);

    const final = await Promise.map(items, async item => {
        const comment = await getLatestComment(item.id);

        return {
            id: item.id,
            status: item.fields['System.State'],
            title: item.fields['System.Title'],
            comment,
        };
    });

    console.log(final);

}

run().catch(err => {
    console.log(err);
})


