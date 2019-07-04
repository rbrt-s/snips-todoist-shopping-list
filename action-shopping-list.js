#!/usr/bin/env node
const { withHermes } = require('hermes-javascript')
const Intents = require('./lib/intents');
const Todoist = require('./lib/todoist');
const uuidv4 = require('uuid/v4');

withHermes(async hermes => {
    const todoist = await Todoist.factory();
    const dialog = hermes.dialog()

    dialog.flow(Intents.AddItem, async (msg, flow) => {
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
        </speak>`;
    });

    dialog.flow(Intents.RemoveItem, async (msg, flow) => {
        const item = msg.slots.find(slot => slot.slotName == 'item');
        const content = item.rawValue;

        const items = await todoist.getActiveItemsREST();
        const itemMatch = items.find(item => item.content.toLocaleLowerCase('de-DE') === content.toLocaleLowerCase('de-DE'));

        let text;
        if (itemMatch) {
            const commands = [{
                type: Todoist.Commands.item_delete,
                uuid:  uuidv4(),
                args: {
                    id: itemMatch.id
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

    dialog.flow(Intents.ExistsItem, async (msg, flow)  => {
        const item = msg.slots.find(slot => slot.slotName == 'item');
        const content = item.rawValue;

        const items = await todoist.getActiveItemsREST();

        const itemMatch = items.find(item => item.content.toLocaleLowerCase('de-DE') === content.toLocaleLowerCase('de-DE'))
        if (items.length === 0) {
            flow.end();
            return `<speak>
                <s>Deine Liste ist leer, was denkst du?</s>
            </speak>`;
        } else if (itemMatch) {
            flow.end();
            return `<speak>
                <s>Ja, ${content} hab ich auf deiner Liste.</s>
            </speak>`;
        }
        
        // we have no match, ask to add
        flow.continue(Intents.ConfirmYes, async (msg, confirmationFlow) => {
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
                <s>Erledigt.</s>
            </speak>`;
        });

        flow.continue(Intents.ConfirmNo, (message, confirmationFlow) => {
            flow.end();
        });

        flow.notRecognized((message, notRecognizedFlow) => {
            flow.end();
        });

        return `<speak>
            <s>Nein, ${content} hab ich noch nicht auf deiner Liste. Jetzt hinzufügen?</s>
        </speak>`;
    });

    const loopAdd = async (msg, flow) => {
        const item = msg.slots.find(slot => slot.slotName == 'item');
        const content = item.rawValue;
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

        flow.notRecognized((message, notRecognizedFlow) => {
            flow.end();
        });

        flow.continue(Intents.ConfirmItem, loopAdd);

        flow.continue(Intents.ConfirmNo, async (msg, noFlow) => {
            noFlow.end();
        });

        return `<speak>
            <s>Erledigt. Noch etwas?</s>
        </speak>`;
    };

    dialog.flow(Intents.GetItems, async (msg, flow) => {
        const items = (await todoist.getActiveItemsREST()).map(item => item.content);

        flow.notRecognized((message, notRecognizedFlow) => {
            flow.end();
        });

        flow.continue(Intents.ConfirmItem, loopAdd);

        flow.continue(Intents.ConfirmNo, async (msg, noFlow) => {
            noFlow.end();
        });

        if (items.length === 0) {
            return  `<speak><s>Da ist nix drauf.</s><s>Soll ich etwas hinzufügen?</s></speak>`;
        }  else {
            let text;
            if (items.length === 1) {
                text = `<s>Es sind nur ${items[0]} auf deiner Einkaufsliste.</s>`;
            } else  {
                const last = items.splice(-1)[0];
                text = `<s>Also, <break time="600ms"/> auf deiner Einkaufsliste sind:</s>
                    <s>${items.join(', <break time="400ms"/>')} <break time="350ms"/> und ${last}.</s>`;
            }

            return `<speak>
                ${text}
                <s>Soll ich noch etwas hinzufügen?</s>
            </speak>`;
        }
    });

    dialog.flow(Intents.RemoveLastItem, async (msg, flow) =>  {
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
