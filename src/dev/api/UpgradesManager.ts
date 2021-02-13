type T_Drop = [number, number, number, ItemExtraData?][];

enum UpgradeType {
    UPGRADE = "upgrade",
    LENS = "lens"
}

interface ILensDesc {
    type: UpgradeType.LENS;
    singleton?: boolean

    processDrop?(items: T_Drop): T_Drop;

    modifyExtra?(extra: ItemExtraData);
}

interface IQuarryParams {
    radius: number;
    maxExp: number;
    maxEnergy: number;
}

interface IUpgradeDesc {
    type: UpgradeType.UPGRADE;
    energy?: number;

    onInstall?(params: IQuarryParams, tile: TileEntity.TileEntityPrototype);

    onTakeOut?(tile: TileEntity.TileEntityPrototype);

    onDig?(x: number, y: number, z: number, block: number, tile: TileEntity.TileEntityPrototype)
}

class UpgradesManager {
    private static readonly upgrades: Record<number, IUpgradeDesc> = {};
    private static readonly lenses: Record<number, ILensDesc> = {};

    static register(id: number, desc: IUpgradeDesc | ILensDesc) {
        if (!id || id < 0) {
            throw "Invalid item. Id must be > 0";
        }

        if (!desc) {
            throw "Invalid upgrade description";
        }

        switch (desc.type) {
            case UpgradeType.LENS:
                if (this.isLens(id)) {
                    throw "Lens already registered";
                }

                this.lenses[id] = desc;
                break;
            case UpgradeType.UPGRADE:
                if (this.isUpgrade(id)) {
                    throw "Upgrade already registered";
                }

                this.upgrades[id] = desc;
                break;
            default:
                throw "Invalid upgrade type";
        }

    }

    static getUpgrade(id: number): IUpgradeDesc {
        return this.upgrades[id];
    }

    static getLens(id: number): ILensDesc {
        return this.lenses[id];
    }

    static isUpgrade(id: number): boolean {
        return !!this.upgrades[id];
    }

    static isLens(id: number): boolean {
        return !!this.lenses[id];
    }
}