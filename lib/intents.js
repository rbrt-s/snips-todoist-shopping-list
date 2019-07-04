const prefix = 'rbrt-s';

module.exports = {
    AddItem: `${prefix}:ShoppingListAddItem`,
    ExistsItem: `${prefix}:ShoppingListExistsItem`,
    GetItems: `${prefix}:ShoppingListGetItems`,
    RemoveLastItem: `${prefix}:ShoppingListRemoveLastItem`,
    RemoveItem: `${prefix}:ShoppingListRemoveItem`,

    // not enabled by default:
    ConfirmNo: `${prefix}:ShoppingListConfirmNo`,
    ConfirmYes: `${prefix}:ShoppingListConfirmYes`
}
