import { getWebApi } from './util';

async function run() {

    const instance = await getWebApi();

    const workTracking = instance.getWorkItemTrackingApi();
    const stuff = await workTracking.getQueries('Mixer');

    console.log(stuff);
}

run().catch(err => {
    console.log(err);
})
