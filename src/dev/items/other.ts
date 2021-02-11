IDRegistry.genItemID("coreInterdimensional");
Item.createItem("coreInterdimensional", "Interdimensional Core", {name: "core_interdimensional", meta: 0}, {});

Callback.addCallback("PostLoaded", () => {
    if (ModAPI.requireAPI("ICore")) {
        Recipes.addShaped({id: ItemID.coreInterdimensional, count: 1, data: 0}, [
            "131",
            "202",
            "131",
        ], [
            '0', VanillaItemID.ender_eye, 0,
            '1', ItemID.dustDiamond, 0,
            '2', VanillaItemID.glowstone_dust, 0,
            '3', ItemID.circuitAdvanced, 0,
        ]);
    }
});
