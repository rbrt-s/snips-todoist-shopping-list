#!/usr/bin/env node
const { withHermes } = require('hermes-javascript')
const Intents = require('./lib/intents');
const Todoist = require('./lib/todoist');
const uuidv4 = require('uuid/v4');

withHermes(async hermes => {
    const todoist = await Todoist.factory();
    const dialog = hermes.dialog()

    dialog.flow(Intents.addShoppingItem, async (msg, flow) => {
        const item = msg.slots.find(slot => slot.slotName == 'item');
        const content = item.rawValue;
        const confidence = item.confidenceScore;
        const tempId = uuidv4();
        const commands = [{
            type: Todoist.Commands.item_add,
            uuid:  uuidv4(),
            temp_id: tempId,
            args: {
                content: content,
                project_id: todoist.projectId
            }
        }];

        const result = await todoist.write(commands);
        todoist.lastItemId = result.temp_id_mapping[tempId];
        todoist.lastItemContent = content;

        flow.end();
        
        return `<speak>
            <s>Ich habe <emphasis level=\"moderate\">${content}</emphasis> der Einkaufsliste hinzugefügt.</s>
            <s>Der Erkennungswert war ${confidence}</s>
        </speak>`;
    });

    dialog.flow(Intents.removeLastShoppingItem, async (msg, flow) =>  {
        if (!todoist.lastItemId) {
            flow.end();
            return `<speak>
                <s>Ich weiß leider nicht was ich löschen soll. Mein Kurzzeitgedächtnis is nicht das beste.</s>
            </speak>`;
        } else  {
            const content = todoist.lastItemContent;
            const commands = [{
                type: Todoist.Commands.item_add,
                uuid:  uuidv4(),
                args: {
                    id: todoist.lastItemId
                }
            }];

            await todoist.write(commands);
            todoist.lastItemId = null;
            todoist.lastItemContent = null;

            flow.end();
            
            return `<speak>
                <s>Ich habe <emphasis level=\"moderate\">${content}</emphasis> wieder gelöscht.</s>
            </speak>`;
        }
    });
});
