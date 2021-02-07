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

TileEntity.registerPrototype(BlockID.quarryCasing, {
    useNetworkItemContainer: true,

    energyReceive(type, amount) {
        if (!this.parent) {
            return 0;
        }

        amount = amount / EnergyTypeRegistry.getValueRatio(type, "Eu");
        const added = Math.min(amount, this.parent.getEnergyStorage() - this.parent.data.energy);
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

interface UIDataPacket {
    enabled: boolean,
    whitelist: boolean
}

TileEntity.registerPrototype(BlockID.quarry, {
    useNetworkItemContainer: true,
    defaultValues: {
        exp: 0,
        energy: 0,
        radius: 16,
        centerX: 0,
        centerZ: 0,
        digX: 0,
        digY: 0,
        digZ: 0,
        drop: [],
        enabled: true,
        isValid: false,
        whitelist: true,
        completed: false,
    },
    casings: [],
    list: [],

    client: {
        containerEvents: {
            uiData: (container, window, content, data: UIDataPacket) => {
                if (content) {
                    const elements = content.elements;
                    elements.buttonToggle.bitmap = data.enabled ? "btn_redstone_on" : "btn_redstone_off";
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
        this.data.digX = this.data.centerX - this.data.radius;
        this.data.digZ = this.data.centerZ - this.data.radius;
        this.data.digY = this.y - 2;

        this.container.setGlobalAddTransferPolicy((container, name, id, amount) =>
            name !== "slotTool" || this.isCorrectTool(id) ?
                Math.min(amount, Item.getMaxStack(id) - container.getSlot(name).count) : 0);
    },

    tick() {
        if (World.getThreadTime() % 60 === 0) {
            this.validateStructure();
        }

        if (this.data.enabled
            && World.getThreadTime() % 20 === 0
            && !this.data.completed
            && this.data.energy > Math.max(ENERGY_PER_DESTROY, ENERGY_PER_SCAN)
            && this.data.drop.length === 0) {
            const block = this.blockSource.getBlock(this.data.digX, this.data.digY, this.data.digZ);
            if (ToolAPI.getBlockMaterial(block.id)?.name === "stone"
                && !TileEntity.getPrototype(block.id)
                && this.isOnTheList(block)) {
                const tool = this.container.getSlot("slotTool");
                const coords = {
                    x: this.data.digX,
                    y: this.data.digY,
                    z: this.data.digZ,
                };
                let drop = Block.getBlockDropViaItem(block, tool.id > 0 ? tool : DEFAULT_TOOL, coords,
                    this.blockSource);
                if (this.data.smelt) {
                    drop = drop.map(item => {
                        const result = Recipes.getFurnaceRecipeResult(item[0], item[2]);
                        if (result) {
                            return [result.id, result.count, result.data];
                        }

                        return item;
                    });
                }
                this.data.drop = drop;

                this.data.energy -= ENERGY_PER_DESTROY;
                this.collectExp();
                this.blockSource.setBlock(this.data.digX, this.data.digY, this.data.digZ, 0);
            } else {
                this.data.energy -= ENERGY_PER_SCAN;
            }

            this.nextPos();
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
        } else if (!this.data.isValid) {
            text = Translation.translate("Incorrect structure");
        } else if (this.data.completed) {
            text = Translation.translate("Completed");
        } else {
            text = `X: ${this.data.digX} Y: ${this.data.digY} Z: ${this.data.digZ}`;
        }
        text += `\nRadius: ${this.data.radius / 16} chunks`;

        this.container.sendEvent("uiData",
            {enabled: this.data.enabled, whitelist: this.data.whitelist});
        this.container.setScale("energyScale", this.data.energy / this.getEnergyStorage());
        this.container.setScale("expScale", this.data.exp / 1000);
        this.container.setText("text", text);
        this.container.setText("textExp", Translation.translate("Exp: ") + this.data.exp);
        this.container.sendChanges();
    },

    nextPos() {
        if (++this.data.digX > this.data.centerX + this.data.radius) {
            if (++this.data.digZ > this.data.centerZ + this.data.radius) {
                if (--this.data.digY === 0) {
                    this.data.completed = true;
                }
                this.data.digZ = this.data.centerZ - this.data.radius;
            }
            this.data.digX = this.data.centerX - this.data.radius;
        }
    },

    collectExp() {
        if (this.data.exp < 1000) {
            const expOrbs = this.blockSource.fetchEntitiesInAABB(
                this.data.digX - 2, this.data.digY - 2, this.data.digZ - 2,
                this.data.digX + 2, this.data.digY + 2, this.data.digZ + 2,
                EntityType.EXPERIENCE_ORB);

            for (const orb of expOrbs) {
                this.data.exp = Math.min(1000, this.data.exp + 2);
                Entity.remove(orb);

                if (this.data.exp === 1000) {
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
        let radius = 1;
        let smelt = false;

        for (let i = 0; i < 2; i++) {
            const upgrade = this.container.getSlot(`slotUpgrade${i}`).id;
            if (upgrade == ItemID.quarryUpgradeTerritory) {
                radius++;
            }

            const lens = this.container.getSlot(`slotLens${i}`).id;
            if (lens == ItemID.quarryLensSmelt) {
                smelt = true;
            }
        }

        this.data.radius = radius * 16;
        this.data.smelt = smelt;
    },

    isOnTheList(block) {
        const exists = this.list.indexOf(block.id + ":" + block.data) !== -1;
        return this.data.whitelist ? exists : !exists;
    },

    isCorrectTool(id: number) {
        const toolData = ToolAPI.getToolData(id);
        return toolData && toolData.blockMaterials && toolData.blockMaterials["stone"];
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

        this.data.isValid = this.casings.length === 6;
    },

    getEnergyStorage() {
        return 50000;
    },

    getScreenName() {
        return "main";
    },

    getScreenByName() {
        return gui;
    },

    destroy() {
        for (const casing of this.casings) {
            casing.tile = null;
        }
    },
});

for (const i in energyTypes) {
    EnergyTileRegistry.addEnergyTypeForId(BlockID.quarryCasing, energyTypes[i]);
}