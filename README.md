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

- [ ] Documentation with infrastructure explained
- [x] Installable via Github repo
- [x] Setup testing infrastructure
- [-] `addShoppingItem`: Handle Intent for adding a Shopping Item
    - [x] Naivly add Item to Todoist List
    - [ ] Respectfully refuse to add `unknownword` to list or low confidence
    - [ ] Politely decline if Item is already on list (`existsShoppingItem`-logic)
        - [ ] Refuse adding
        - [ ] Give option to add nonetheless
- [x] `removeLastShoppingItem`: Handle Intent to remove the previously added Shopping Item
- [ ] `existsShoppingItem`: Handle Intent to checking for existing Shopping Item
    - [x] Check for exact match/ignorecase
    - [ ] If not found, offer to add it.
    - [ ] Use stemming to handle fuzzyness
- [ ] `getShoppingItems`: Handle Intent to read out the shopping list
        - [x] Use REST API initially
        - [ ] Use Sync API to keep track of list locally
- [ ] `removeShoppingItem`: Handle Intent to remove any existing Shopping Item
    - [x] Remove exact match/ignorecase
    - [ ] Use stemming to handle fuzzyness
- [ ] Self-learning vocabulary-injection
    - [ ] Sync-Job starting from the date of installation
    - [ ] Inject all Items into the Vocabulary that were not written by the skill
    - [ ] Save all added Words for injection after installation
- [ ] Code cleanup and debug removal
- [ ] Give more character through varied answers
- [ ] Tests, tests, tests!
- [ ] Handle being offline
    - [ ] Save up items to gracefully sync later