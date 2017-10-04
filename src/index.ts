import * as config from 'config';

// tslint:disable-next-line no-import-side-effect
import 'bluefill';

import { IQueryContext, reportQuery } from './QueryReporter';

import { getTeamContext, getWebApi } from './util';

const queries = config.get<string[]>('queries');

async function run() {
    const instance = await getWebApi();

    const queryContext: IQueryContext = {
        instance: instance.getWorkItemTrackingApi(),
        teamContext: getTeamContext(),
    };

    const result = await Promise.map(queries, query => reportQuery(query, queryContext));
    console.log(result);

}

run().catch(err => {
    console.log(err);
});




