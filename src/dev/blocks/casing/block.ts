IDRegistry.genBlockID("quarryCasing");
Block.createBlock("quarryCasing", [{name: "Quarry Casing", texture: [["quarry", 1]], inCreative: true}]);
Block.setBlockMaterial(BlockID.quarryCasing, "stone", 2);

Recipes.addShaped({id: BlockID.quarryCasing, count: 1, data: 0}, [
    "gig",
    "igi",
    "grg",
], ['g', 266, 0, 'i', 265, 0, 'r', 152, 0]);