type T_Drop = [number, number, number, ItemExtraData?][];

enum UpgradeType {
    MODULE = "module",
    LENS = "lens"
}

interface IQuarryParams {
    radius: number;
    maxExp: number;
    maxEnergy: number;
    maxProgress: number;
}

interface IUpgradeDesc {
    type: UpgradeType;
    singleton?: boolean
    energy?: number;

    processDrop?(items: T_Drop): T_Drop;

    modifyExtra?(extra: ItemExtraData, slot: UI.Slot);

    onInstall?(params: IQuarryParams, tile: TileEntity.TileEntityPrototype, slot: UI.Slot);

    onTakeOut?(tile: TileEntity.TileEntityPrototype);

    onDig?(x: number, y: number, z: number, block: number, tile: TileEntity.TileEntityPrototype)
}

class UpgradesManager {
    private static readonly upgrades: Record<number, IUpgradeDesc> = {};

    static register(id: number, desc: IUpgradeDesc) {
        if (!id || id < 0) {
            throw "Invalid item. Id must be > 0";
        }

        if (!desc) {
            throw "Invalid upgrade description";
        }

        if (desc.type !== UpgradeType.LENS && desc.type !== UpgradeType.MODULE) {
            throw "Invalid upgrade type";
        }

        if (this.isUpgrade(id)) {
            throw "Lens already registered";
        }

        this.upgrades[id] = desc;
    }

    static getUpgrade(id: number): IUpgradeDesc {
        return this.upgrades[id];
    }

    static isUpgrade(id: number): boolean {
        return !!this.upgrades[id];
    }

    static isModule(id: number): boolean {
        return this.upgrades[id]?.type === UpgradeType.MODULE;
    }

    static isLens(id: number): boolean {
        return this.upgrades[id]?.type === UpgradeType.LENS;
    }
}