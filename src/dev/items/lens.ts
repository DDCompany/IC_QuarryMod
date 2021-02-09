IDRegistry.genItemID("quarryLensSmelt");
Item.createItem("quarryLensSmelt", "Quarry Lens (Smelt)", {name: "lens", meta: 0}, {stack: 1});

Recipes.addShaped({id: ItemID.quarryLensSmelt, count: 1, data: 0}, [
    "030",
    "414",
    "020",
], ['1', 20, 0, '2', 152, 0, '3', 264, 0, '4', 42, 0]);