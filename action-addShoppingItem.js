#!/usr/bin/env node
const { withHermes } = require('hermes-javascript')
const Intents = require('./lib/intents');

withHermes(hermes => {
    const dialog = hermes.dialog()

    dialog.flow(Intents.addShoppingItem, (msg, flow) => {
        const item = msg.slots.find(slot => slot.slotName == 'item').rawValue;
        flow.end();
        return `<speak>Ich habe <emphasis level=\"moderate\">${item}</emphasis> der Einkaufsliste hinzugefügt.</speak>`;
    });
});
