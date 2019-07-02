const config = require('./config');
const fetch = require('node-fetch').default;
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const path = require('path');
const tokenFile = path.join(path.dirname(require.main.filename), ".synctoken");
const WebSocket = require('ws');
const debounce = require('lodash.debounce');
const URLSearchParams = require('url').URLSearchParams

/**
 * Todoist config class
 */
class Todoist {
    static get Commands() {
        return  {
            item_add: 'item_add'
        };
    }
    /**
     * Setter for syncToken will persist to file
     */
    set syncToken(value) {
        fs.writeFileSync(tokenFile, value);
        this._syncToken = value;
    }

    /**
     * Getter for syncToken will read from file initially
     */
    get syncToken() {
        if (!this._syncToken) {
            this._syncToken = fs.readFileSync(tokenFile, 'utf-8');
        }
        return this._syncToken;
    }

    constructor() {
        /**
         * Default request method, this is always POST (Todoist sync API)
         */
        this._requestMethod = 'POST';

        /**
         * Request Timeout, set via config. This should be less than your Snips listening timeout
         */
        this._requestTimeout = parseInt(config.global.request_timeout);

        /**
         * Sync API endpoint
         */
        this._url = 'https://todoist.com/api/v8/sync';

        /**
         * Sync Token, set privately via sam assistant
         */
        this._token = config.secret.todoist_token;

        this.projectId = null;
        this.userId = null;

        // bind this context
        this.read = this.read.bind(this);
        this.write = this.write.bind(this);
    }

    /**
     * Initial sync call to get user data and default project_id
     * Also sets up the socket connection to receive updates
     */
    async connect() {
        if (this._connected) {
            return;
        }
        const body = new URLSearchParams();
        body.append('token', this._token);
        body.append('resource_types', '["user"]');
        body.append('sync_token', '*');
        const request = await fetch(this._url, {
            body,
            method: this._requestMethod,
            timeout: this._requestTimeout
        });
        const response = await request.json();

        if (response.user.start_page.substr(0,8) !==  'project:') {
            throw new Error('Project not set as start page');
        }

        this.projectId = parseInt(response.user.start_page.substr(8));

        const ws = new WebSocket(response.user.websocket_url,  {
            origin: 'https://localhost'
        });

        // TODO:  CLEANUP
        ws.on('open', function open() {
            console.log('Websocket connection established');
        });

        ws.on('message', (debounce((data) => {
            const parsed = JSON.parse(data);
            if(parsed.type && parsed.type === "sync_needed") {
                this.sync();
            }
        }, 1000)));

        ws.on('error', function error(error) {
            console.log('[Socket Error]', error);
        });

        this._connected = true;
    }

    async sync() {
        console.log('sync was invoked')
    }

    async write(commands) {
        const body = new URLSearchParams();
        body.append('token', this._token);
        body.append('sync_token', this._syncToken)
        body.append('commands', JSON.stringify(commands));
        const request = await fetch(this._url, {
            body,
            method: this._requestMethod,
            timeout: this._requestTimeout
        });
        const response = await request.json();
        this.syncToken = response.sync_token;
        return response;
    }

    async read() {
        const formData = new URLSearchParams();
        formData.append('token', this._token);
        formData.append('resource_types', '["items"]');
        formData.append('sync_token', this._syncToken);
        const request = await fetch(this._url, {
            body: formData,
            method: this._requestMethod,
            timeout: this._requestTimeout
        });
        const response = await request.json();
        this.syncToken = response.sync_token;
        return response;
    }

    static async factory() {
        const instance = new Todoist();
        await instance.connect();
        return instance;
    }
};

module.exports = Todoist;
