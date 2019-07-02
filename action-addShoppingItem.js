#!/usr/bin/env node
const { withHermes } = require('hermes-javascript')
const Intents = require('./lib/intents');
const Todoist = require('./lib/todoist');

withHermes(hermes => {
    const todoist = await Todoist.factory();
    const dialog = hermes.dialog()

    dialog.flow(Intents.addShoppingItem, (msg, flow) => {
        const item = msg.slots.find(slot => slot.slotName == 'item');
        const content = item.rawValue;
        const confidence = item.confidenceScore;

        const commands = [{
            type: Todoist.Commands.item_add,
            uuid:  uuidv4(),
            temp_id: uuidv4(),
            args: {
                content: content,
                project_id: todoist.projectId
            }
        }];

        await todoist.write(commands);
        flow.end();
        
        return `<speak>
            <s>Ich habe <emphasis level=\"moderate\">${content}</emphasis> der Einkaufsliste hinzugefügt.</s>
            <s>Der Erkennungswert war ${confidence}</s>
        </speak>`;
    });
});
