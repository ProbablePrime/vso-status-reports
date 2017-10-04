import * as config from 'config';
import * as vm from 'vso-node-api';
import * as VsoBaseInterfaces from 'vso-node-api/interfaces/common/VsoBaseInterfaces';
import * as CoreInterfaces from 'vso-node-api/interfaces/CoreInterfaces';

const TOKEN: string = config.get<string>('token');
const URI: string = config.get<string>('uri');

export interface IConfigItem {
    name: string;
    id: string;
}

const PROJECT = config.get<IConfigItem>('project');
const TEAM = config.get<IConfigItem>('team');

console.log(URI, TOKEN);

export async function getWebApi(): Promise<vm.WebApi> {
    return new Promise<vm.WebApi>(async(resolve: Function, reject: Function): Promise<void> => {
        try {
            const authHandler: VsoBaseInterfaces.IRequestHandler = vm.getPersonalAccessTokenHandler(TOKEN);

            const vsts: vm.WebApi = new vm.WebApi(URI, authHandler, undefined);
            await vsts.connect();
            resolve(vsts);
        } catch (err) {
            reject(err);
        }
    });
}

export function getTeamContext(): CoreInterfaces.TeamContext {
    return {
        project: PROJECT.name,
        projectId: PROJECT.id,
        team: TEAM.name,
        teamId: TEAM.id,
    };
}
