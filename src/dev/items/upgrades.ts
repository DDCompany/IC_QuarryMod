IDRegistry.genItemID("quarryUpgradeTerritory");
Item.createItem("quarryUpgradeTerritory", "Quarry Upgrade (Territory)", {name: "upgrade", meta: 0}, {stack: 1});

UpgradesManager.register(ItemID.quarryUpgradeTerritory, {
    type: UpgradeType.UPGRADE,

    onInstall(params) {
        params.radius += 16;
    },

    canWork(): boolean {
        return true;
    },
});

Recipes.addShaped({id: ItemID.quarryUpgradeTerritory, count: 1, data: 0}, [
    "dgd",
    "drd",
    "did",
], ['g', 266, 0, 'i', 42, 0, 'r', 152, 0, 'd', 264, 0]);