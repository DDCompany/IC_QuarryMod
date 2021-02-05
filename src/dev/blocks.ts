IDRegistry.genBlockID("quarry");
Block.createBlock("quarry", [{name: "Quarry", texture: [["quarry", 0]], inCreative: true}]);
Block.setBlockMaterial(BlockID.quarry, "stone", 2);

IDRegistry.genBlockID("quarryCasing");
Block.createBlock("quarryCasing", [{name: "Quarry Casing", texture: [["quarry", 1]], inCreative: true}]);
Block.setBlockMaterial(BlockID.quarryCasing, "stone", 2);