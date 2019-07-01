# snips-todoist-shopping-list

WIP!

## Requirements

This Snips skill (actions) requires a Nodejs Installation (>= 8.0.0), see [snips.ai Documentation](https://docs.snips.ai/getting-started/quick-start-raspberry-pi#step-5:-create-a-constants-file-and-set-the-realm-cloud-instance-url-3):

```sh
# Run on Raspberry Pi:
sudo apt-get remove node nodejs nodejs-legacy nodered
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install npm@latest -g
```

## Feature-Status

- [ ] Documentation
    - [ ] Readme with Infrastructure explained
- [x] Installable via Github repo
- [x] Setup testing infrastructure
- [ ] `addShoppingItem`: Handle Intent for adding a Shopping Item
    - [ ] Naivly add Item to Todoist List
    - [ ] Respectfully refuse to add `unknownword` to list
    - [ ] Politely decline if Item is already on list (`existsShoppingItem`-logic)
        - [ ] Refuse adding
        - [ ] Give option to add nonetheless
- [ ] `removeLastShoppingItem`: Handle Intent to remove the previously added Shopping Item
- [ ] `existsShoppingItem`: Handle Intent to checking for existing Shopping Item
    - [ ] Check for exact match
    - [ ] Use stemming to handle fuzzyness
- [ ] `getShoppingItems`: Handle Intent to read out the shopping list
- [ ] `removeShoppingItem`: Handle Intent to remove any existing Shopping Item
    - [ ] Remove exact match
    - [ ] Use stemming to handle fuzzyness
- [ ] Self-learning vocabulary-injection
    - [ ] Sync-Job starting from the date of installation
    - [ ] Inject all Items into the Vocabulary that were not written by the skill
    - [ ] Save all added Words for injection after installation
- [ ] Handle being offline
    - [ ] Save up items to gracefully sync later