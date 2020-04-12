Block.setPrototype("quarry", {
    type: Block.TYPE_BASE,

    getVariations: function () {
        return [{
            name: "Quarry",
            texture: [["quarry", 0]],
            inCreative: true
        }];
    }

});
Block.setBlockMaterial(BlockID.quarry, "stone", 2);

Block.setPrototype("quarryCasing", {
    type: Block.TYPE_BASE,

    getVariations: function () {
        return [{
            name: "Quarry Casing",
            texture: [["quarry", 1]],
            inCreative: true
        }];
    }

});
Block.setBlockMaterial(BlockID.quarryCasing, "stone", 2);