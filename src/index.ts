import * as config from 'config';
import * as fs from 'fs';
import * as path from 'path';

// tslint:disable-next-line no-import-side-effect
import 'bluefill';

// tslint:disable-next-line
import Handlebars = require('handlebars');

import { IQueryContext, reportQuery } from './QueryReporter';

import { getTeamContext, getWebApi } from './util';

const queries = config.get<string[]>('queries');
//const workItemURI = config.get<string>('direct_uri');

async function run() {
    const instance = await getWebApi();

    const queryContext: IQueryContext = {
        instance: instance.getWorkItemTrackingApi(),
        teamContext: getTeamContext(),
    };

    const reports = await Promise.map(queries, query => reportQuery(query, queryContext));

    makeReport({reports});
}

run().catch(err => {
    console.log(err);
});

function makeReport(result: any) {
    const template = fs.readFileSync(path.join(__dirname,  '/templates/report.tmpl')).toString();

    const parser = Handlebars.compile(template);

    const out = parser(result);
    fs.writeFileSync('./report.md', out);
}




