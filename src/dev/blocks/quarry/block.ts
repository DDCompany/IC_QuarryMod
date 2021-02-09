IDRegistry.genBlockID("quarry");
Block.createBlock("quarry", [{name: "Quarry", texture: [["quarry", 0]], inCreative: true}]);
Block.setBlockMaterial(BlockID.quarry, "stone", 2);

Recipes.addShaped({id: BlockID.quarry, count: 1, data: 0}, [
    "gpg",
    "cdc",
    "rcr",
], ['g', 266, 0, 'c', BlockID.quarryCasing, 0, 'd', 57, 0, 'r', 152, 0, 'p', 278, 0]);