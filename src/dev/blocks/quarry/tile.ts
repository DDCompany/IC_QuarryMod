function findNearest(x, y, z, id, func) {
    for (let index in directions) {
        let dir = directions[index];
        if (World.getBlockID(x + dir[0], y + dir[1], z + dir[2]) === id) {
            let tile = World.getTileEntity(x + dir[0], y + dir[1], z + dir[2]);
            if (!tile && TileEntity.getPrototype(id)) {
                tile = TileEntity.addTileEntity(x + dir[0], y + dir[1], z + dir[2]);
            }

            if (tile) {
                if (func(tile)) {
                    return;
                }
            }
        }
    }
}

interface UIDataPacket {
    enabled: boolean,
    whitelist: boolean
}

const BASE_SPEED = 80;

function getDefaultQuarryParams(): IQuarryParams {
    return {
        radius: 16,
        maxEnergy: 50000,
        maxExp: 1000,
        maxProgress: BASE_SPEED,
    };
}

TileEntity.registerPrototype(BlockID.quarry, {
    useNetworkItemContainer: true,
    defaultValues: {
        exp: 0,
        energy: 0,
        centerX: 0,
        centerZ: 0,
        progress: 0,
        digX: 0,
        digY: 0,
        digZ: 0,
        drop: [],
        enabled: true,
        valid: false,
        whitelist: false,
        completed: false,
    },
    casings: [],
    list: [],
    upgrades: [],
    params: getDefaultQuarryParams(),
    toolExtra: new ItemExtraData(),
    energyConsumption: ENERGY_CONSUMPTION,

    client: {
        containerEvents: {
            uiData: (container, window, content, data: UIDataPacket) => {
                if (content) {
                    const elements = content.elements;
                    elements.buttonToggle.bitmap =
                        data.enabled ? "quarry_mod.btn.redstone_on" : "quarry_mod.btn.redstone_off";
                    elements.switch.state = data.whitelist;
                }
            },
        },

        load() {
            this.sendPacket("onLoad", {});
        },
    },

    events: {
        onLoad() {
            this.refreshList();
            this.onUpgradeChanged();

            this.container.setGlobalAddTransferPolicy((container, name, id, amount) => {
                if (name.startsWith("slotModule")) {
                    if (!UpgradesManager.isModule(id)) {
                        return 0;
                    }
                } else if (name.startsWith("slotLens")) {
                    if (!UpgradesManager.isLens(id)) {
                        return 0;
                    }
                }

                return Math.min(amount, Item.getMaxStack(id) - container.getSlot(name).count);
            });
        },
    },

    containerEvents: {
        toggleEnable() {
            this.data.enabled = !this.data.enabled;
        },

        giveExp(data) {
            // @ts-ignore
            const player = data.player;
            if (Player.isPlayer(player)) {
                const actor = new PlayerActor(player);
                actor.addExperience(this.data.exp);
                this.data.exp = 0;
            }
        },

        whitelistChanged(data) {
            // @ts-ignore
            this.data.whitelist = data.state ?? this.data.state;
        },

        listChanged() {
            this.refreshList();
        },

        upgradeChanged() {
            this.onUpgradeChanged();
        },
    },

    init() {
        this.casings = [];
        this.list = [];
        this.data.centerX = this.x - this.x % 16;
        this.data.centerZ = this.z - this.z % 16;
        this.data.digX = this.data.centerX - this.params.radius;
        this.data.digZ = this.data.centerZ - this.params.radius;
        this.data.digY = this.y - 2;
    },

    tick() {
        if (World.getThreadTime() % 60 === 0) {
            this.validateStructure();
        }

        if (this.data.drop.length) {
            const drop = [];
            for (const item of this.data.drop) {
                const fallback = this.addItemToStorage(item);
                if (fallback) {
                    drop.push(fallback);
                }
            }
            this.data.drop = drop;
        }

        let text = "";
        if (!this.data.enabled) {
            text = Translation.translate("Turned off");
        } else if (this.data.drop.length) {
            text = Translation.translate("Not enough space");
        } else if (!this.data.valid) {
            text = Translation.translate("Incorrect structure");
        } else if (this.data.completed) {
            text = Translation.translate("Completed");
        } else if (this.data.energy < this.energyConsumption) {
            text = Translation.translate("Not enough energy");
        } else {
            if (this.data.progress < this.params.maxProgress) {
                this.data.progress++;
            } else {
                const block = this.blockSource.getBlock(this.data.digX, this.data.digY, this.data.digZ);
                if (ToolAPI.getBlockMaterial(block.id)?.name === "stone"
                    && !TileEntity.getPrototype(block.id)
                    && this.isOnTheList(block)) {
                    const coords = {
                        x: this.data.digX,
                        y: this.data.digY,
                        z: this.data.digZ,
                    };
                    let drop = Block.getBlockDropViaItem(block, {
                        id: VanillaItemID.diamond_pickaxe,
                        count: 1,
                        data: 0,
                        extra: this.toolExtra,
                    }, coords, this.blockSource);
                    this.upgrades.forEach(lens => {
                        if (lens.processDrop) {
                            drop = lens.processDrop(drop);
                        }
                    });
                    this.data.drop = drop;

                    this.collectExp();
                    this.blockSource.setBlock(this.data.digX, this.data.digY, this.data.digZ, 0);
                    this.upgrades.forEach(
                        upgrade => upgrade.onDig?.(this.data.digX, this.data.digY, this.data.digZ, block, this));
                }

                this.nextPos();
                this.data.progress = 0;
            }

            this.data.energy -= this.energyConsumption;
        }

        if (text) {
            this.container.setText("text", "");
            this.container.setText("textError", text);
        } else {
            this.container.setText("text", `X: ${this.data.digX} Y: ${this.data.digY} Z: ${this.data.digZ}`);
            this.container.setText("textError", "");
        }

        this.container.sendEvent("uiData",
            {enabled: this.data.enabled, whitelist: this.data.whitelist});
        this.container.setScale("energyScale", this.data.energy / this.getEnergyStorage());
        this.container.setScale("expScale", this.data.exp / this.params.maxExp);
        this.container.setText("textExp", this.data.exp);
        this.container.sendChanges();
    },

    nextPos() {
        if (++this.data.digX > this.data.centerX + 16 + this.params.radius) {
            if (++this.data.digZ > this.data.centerZ + 16 + this.params.radius) {
                if (--this.data.digY === 0) {
                    this.data.completed = true;
                }
                this.data.digZ = this.data.centerZ - this.params.radius;
            }
            this.data.digX = this.data.centerX - this.params.radius;
        }
    },

    collectExp() {
        const maxExp = this.params.maxExp;
        if (this.data.exp < maxExp) {
            const expOrbs = this.blockSource.fetchEntitiesInAABB(
                this.data.digX - 2, this.data.digY - 2, this.data.digZ - 2,
                this.data.digX + 2, this.data.digY + 2, this.data.digZ + 2,
                EntityType.EXPERIENCE_ORB);

            for (const orb of expOrbs) {
                this.data.exp = Math.min(maxExp, this.data.exp + Entity.getCompoundTag(orb).getInt("experience value"));
                Entity.remove(orb);

                if (this.data.exp === maxExp) {
                    break;
                }
            }
        }
    },

    refreshList() {
        const list = [];
        for (let i = 0; i < 6; i++) {
            const slot = this.container.getSlot(`slotList${i}`);
            if (slot.id) {
                list.push(slot.id + ":" + slot.data);
            }
        }
        this.list = list;
    },

    addItemToStorage(item: [number, number, number]) {
        for (let i = 0; i < 15; i++) {
            let slot = this.container.getSlot("slot" + i);

            if (!slot.id) {
                this.container.setSlot("slot" + i, item[0], item[1], item[2]);
                return null;
            } else if (slot.id === item[0] && slot.data === item[2] && Item.getMaxStack(slot.id) !== slot.count) {
                const count = Math.min(Item.getMaxStack(slot.id) - slot.count, item[1]);
                this.container.setSlot("slot" + i, slot.id, slot.count + count, slot.data);

                if (count === item[1]) {
                    return null;
                }

                item[1] = item[1] - count;
            }
        }

        return item;
    },

    onUpgradeChanged() {
        this.reset();

        const container = this.container;
        const upgrades = [];

        for (let i = 0; i < 4; i++) {
            const slot = container.getSlot(i < 2 ? `slotModule${i}` : `slotLens${2 - i}`);
            const upgrade = UpgradesManager.getUpgrade(slot.id);
            if (upgrade && (!upgrade.singleton || upgrades.indexOf(upgrade) === -1)) {
                upgrade.onInstall?.(this.params, this, slot);
                upgrade.modifyExtra?.(this.toolExtra, slot);
                upgrades.push(upgrade);
            }
        }

        const upgradeEnergy = this.upgrades.reduce((prev, upgrade) =>
            upgrade.energy > 0 ? prev + upgrade.energy : prev, 0);
        this.energyConsumption =
            Math.floor(BASE_SPEED / this.params.maxProgress * (ENERGY_CONSUMPTION + upgradeEnergy));

        this.data.exp = Math.min(this.data.exp, this.params.maxExp);
        this.data.energy = Math.min(this.data.energy, this.params.maxEnergy);
        this.upgrades = upgrades;
    },

    reset() {
        for (let i = 0; i < 2; i++) {
            const oldUpgrade = this.upgrades[i];
            if (oldUpgrade) {
                oldUpgrade.onTakeOut?.(this);
            }
        }

        this.params = getDefaultQuarryParams();
        this.toolExtra = new ItemExtraData();
        this.energyConsumption = ENERGY_CONSUMPTION;
    },

    isOnTheList(block) {
        const exists = this.list.indexOf(block.id + ":" + block.data) !== -1;
        return this.data.whitelist ? exists : !exists;
    },

    validateStructure() {
        for (let i = this.casings.length - 1; i >= 0; i--) {
            const casing = this.casings[i];
            if (casing.remove) {
                this.casings.splice(this.casings.indexOf(casing), 1);
            }
        }

        if (this.casings.length < 6) {
            findNearest(this.x, this.y, this.z, BlockID.quarryCasing, (tile) => {
                if (!tile.parent) {
                    this.casings.push(tile);
                    tile.parent = this;
                }

                return this.casings.length >= 6;
            });
        }

        this.data.valid = this.casings.length === 6;
    },

    getEnergyStorage() {
        return this.params.maxEnergy;
    },

    getScreenName() {
        return "main";
    },

    getScreenByName() {
        return gui;
    },

    destroy() {
        for (const casing of this.casings) {
            casing.parent = null;
        }
    },
});

for (const i in energyTypes) {
    EnergyTileRegistry.addEnergyTypeForId(BlockID.quarryCasing, energyTypes[i]);
}