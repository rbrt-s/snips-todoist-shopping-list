const config = require('./config');
const fetch = require('node-fetch').default;
const uuidv4 = require('uuid/v4');

/**
 * Todoist config object set with endpoints and headers
 */
const Todoist  = {
    fetchConfig:  {
        method: 'POST',
        timeout: 3000,
    },
    projectId: config.secret.project_id,
    url: 'https://todoist.com/api/v8/sync',
    userUid: config.secret.user_uuid,
    syncToken: null,
    token: config.secret.todoist_token
};

const read = () =>  {
    const formData = new URLSearchParams();
    formData.append('token', Todoist.token);
    formData.append('resource_types', '["items"]');
    formData.append('sync_token', Todoist.syncToken || '*');
    return fetch(Todoist.url, {
        body: formData,
        ...Todoist.fetchConfig
    })
    .then(res => res.json())
    .then(response =>  {
        Todoist.syncToken = response.sync_token;
        return response;
    });
};

const write = () =>  {
    // return  fetch(Todoist.url, {
    //     body: 
    // })
}

module.exports = {
    read,
    write
};
