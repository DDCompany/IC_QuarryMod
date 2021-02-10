TileEntity.registerPrototype(BlockID.quarryCasing, {
    useNetworkItemContainer: true,

    energyReceive(type, amount) {
        if (!this.parent) {
            return 0;
        }

        amount = amount / EnergyTypeRegistry.getValueRatio(type, "Eu");
        const added = Math.min(1024, amount, this.parent.getEnergyStorage() - this.parent.data.energy);
        this.parent.data.energy += added;
        return added;
    },

    click(id, count, data, coords, player) {
        if (this.parent && !Entity.getSneaking(player)) {
            const client = Network.getClientForPlayer(player);
            if (!client) {
                return true;
            }

            this.parent.container.openFor(client, this.parent.getScreenName(player, coords));
            return true;
        }

        return false;
    },
});