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
            <s>Ich habe <emphasis level="moderate">${content}</emphasis> der Einkaufsliste hinzugefügt.</s>
            <s>Der Erkennungswert war ${confidence}</s>
        </speak>`;
    });

    dialog.flow(Intents.removeShoppingItem, async (msg, flow) => {
        const item = msg.slots.find(slot => slot.slotName == 'item');
        const content = item.rawValue;

        const items = (await todoist.getActiveItemsREST()).map(item => item.content);

        let text;
        if (items.includes(content)) {
            const commands = [{
                type: Todoist.Commands.item_delete,
                uuid:  uuidv4(),
                args: {
                    id: items.find(item => item.content === content).id
                }
            }];

            await todoist.write(commands);
            todoist.lastItemId = null;
            todoist.lastItemContent = null;

            text = `Ich habe <emphasis level="moderate">${content}</emphasis> von deiner Liste gelöscht.`
        } else {
            text = `${content} habe ich nicht auf deiner Liste`;
        }
        flow.end();

        return `<speak>
            <s>${text}</s>
        </speak>`;
    });

    dialog.flow(Intents.existsShoppingItem, async (msg, flow)  => {
        const item = msg.slots.find(slot => slot.slotName == 'item');
        const content = item.rawValue;

        const items = (await todoist.getActiveItemsREST()).map(item => item.content);
        flow.end();

        let text;
        if (items.length === 0) {
            text = `Deine Liste ist leer, was denkst du?`;
        } else if (items.includes(content)) {
            text = `Ja, ${content} hab ich auf deiner Liste.`;
        } else {
            text = `Nein, ${content} hab ich nicht auf deiner Liste.`
        }

        return `<speak>
            <s>${text}</s>
        </speak>`;
    });

    dialog.flow(Intents.getShoppingItems, async (msg, flow) => {
        const items = (await todoist.getActiveItemsREST()).map(item => item.content);
        flow.end();

        if (items.length === 0) {
            return  `<speak><s>Da ist nix drauf.</s></speak>`;
        }  else {
            let text;
            if (items.length === 1) {
                text = `<s>Es sind nur ${items[0]} auf deiner Einkaufsliste.</s>`;
            } else  {
                const last = items.splice(-1)[0];
                text = `<s>Also, <break time="600ms"/> auf deiner Einkaufsliste sind:</s>
                    <s>${items.join(', <break time="400ms"/>')} <break time="350ms"/> und ${last}.</s>`;
            }

            return `<speak>${text}</speak>`;
        }
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
                type: Todoist.Commands.item_delete,
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
                <s>Ich habe <emphasis level="moderate">${content}</emphasis> wieder gelöscht.</s>
            </speak>`;
        }
    });
});
