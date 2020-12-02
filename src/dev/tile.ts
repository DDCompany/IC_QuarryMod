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
    energyReceive: function (type, amount) {
        if (!this.tile) {
            return 0;
        }

        amount = amount / EnergyTypeRegistry.getValueRatio(type, "Eu");
        const add = Math.min(amount, this.tile.getEnergyStorage() - this.tile.data.energy);
        this.tile.data.energy += add;
        return add;
    },

    click: function () {
        if (this.tile && !Entity.getSneaking(Player.get())) {
            this.tile.container.openAs(this.tile.getGuiScreen());
            return true;
        }

        return false;
    },

    destroy: function () {
        if (this.tile) {
            this.tile.removeCasing(this);
        }
    },
});

TileEntity.registerPrototype(BlockID.quarry, {
    defaultValues: {
        // Карьер включен?
        enabled: false,
        // Количество энергии в TE
        energy: 0,
        // Количество опыта
        exp: 0,
        // Модификатор радиуса копания
        territoryModifier: 1,
        //Координаты, на который копает карьер
        digY: 0,
        digX: 0,
        digZ: 0,
        // Карьер завершил свою работы?
        complete: false,
        // Включён белый список?
        whitelist: false,
        // Если true в tick произойдёт обновление состояния переключателя и кнопки включения
        updateFlag: false,
        drop: [],
        progress: 0,
        progressMax: 0,
        //Структура построена верно?
        isValid: false,
        list: {},
        smelt: false,
    },
    casings: [],

    init: function () {
        this.casings = [];
        this.sound = new Sound("work.ogg");
        this.sound.setLooping(true);
        this.sound.setInBlock(this.x, this.y, this.z, 15);
    },

    created: function () {
        this.data.digY = this.y - 3;
        this.data.digX = this.x - 8 * this.data.territoryModifier;
        this.data.digZ = this.z - 8 * this.data.territoryModifier;
    },

    getGuiScreen: function () {
        this.data.updateFlag = true;
        return gui;
    },

    toggleEnable: function () {
        this.data.enabled = !this.data.enabled;
        this.data.updateFlag = true;
    },

    /**
     * Добавление дропа в буффер
     * @param item
     */
    addItemToStorage: function (item) {
        for (let i = 0; i < 15; i++) {
            let slot = this.container.getSlot("slot" + i);

            if (!slot.id) {
                slot.id = item[0];
                slot.count = item[1];
                slot.data = item[2];

                return null;
            } else if (slot.id === item[0] && slot.data === item[2] && Item.getMaxStack(slot.id) !== slot.count) {
                let count = Math.min(Item.getMaxStack(slot.id) - slot.count, item[1]);
                slot.count += count;

                if (count < item[1]) {
                    return [item[0], item[1] - count, item[2]];
                } else {
                    return null;
                }
            }
        }

        return item;
    },

    onUpgradeChanged: function () {
        let territoryModifier = 1;

        for (let i = 0; i < 2; i++) {
            let slotUpgrade = this.container.getSlot("slotUpgrade" + i);

            if (slotUpgrade.id === ItemID.quarryUpgradeTerritory) {
                territoryModifier *= 2;
            }
        }

        this.data.territoryModifier = territoryModifier;
    },

    onLensChanged: function () {
        let smelt = false;

        for (let i = 0; i < 2; i++) {
            let slotLens = this.container.getSlot("slotLens" + i);

            if (slotLens.id === ItemID.quarryLensSmelt) {
                smelt = true;
            }
        }

        this.data.smelt = smelt;
    },

    onListChanged: function (slotId, id, data) {
        let slot = this.container.getSlot("slotList" + slotId);
        if (slot.id === id && slot.data === data) {
            return;
        }

        if (id > 0) {
            delete this.data.list[id + ":" + data];
        }

        if (slot.id > 0) {
            this.data.list[slot.id + ":" + slot.data] = true;
        }
    },

    /**
     * @param slotTool
     * @returns boolean Истина если предметом slotTool можно добывать блоки с материалом stone
     */
    isCorrectTool: function (slotTool) {
        if (!slotTool.id) {
            return false;
        }

        const toolData = ToolAPI.getToolData(slotTool.id);
        const chargeData = ChargeItemRegistry.getItemData(slotTool.id);
        if (chargeData) {
            const energyPerUse = toolData.toolMaterial.energyPerUse;
            return chargeData.energy === "Eu" || chargeData.energy === "RF"
                && energyPerUse
                && ChargeItemRegistry.getEnergyStored(slotTool, chargeData.energy) >= energyPerUse;
        }

        return toolData && toolData.blockMaterials && toolData.blockMaterials["stone"];
    },

    /**
     * Тратим прочность инструмента
     * @param slotTool
     */
    damageTool: function (slotTool) {
        const chargeData = ChargeItemRegistry.getItemData(slotTool.id);
        if (chargeData) {
            let consume = ToolAPI.getToolData(slotTool.id).toolMaterial.energyPerUse;
            const energy = Math.min(this.data.energy, consume);

            if (energy > 0) {
                consume -= energy;
                this.data.energy -= energy;
            }

            if (consume > 0) {
                ChargeItemRegistry.setEnergyStored(slotTool, ChargeItemRegistry.getEnergyStored(slotTool) - consume);
            }
        } else {
            slotTool.data++;
            if (slotTool.data >= Item.getMaxDamage(slotTool.id)) {
                slotTool.id = 0;
                slotTool.data = 0;
                slotTool.count = 0;
                slotTool.extra = 0;
            }
        }
    },

    addCasing: function (casing) {
        this.casings.push(casing);
        casing.tile = this;
    },

    removeCasing: function (casing) {
        this.casings.splice(this.casings.indexOf(casing), 1);
    },

    isOnTheList: function (block) {
        if (this.data.whitelist) {
            return this.data.list[block.id + ":" + block.data];
        } else {
            return !this.data.list[block.id + ":" + block.data];
        }
    },

    checkStructure: function () {
        for (let i = this.casings.length - 1; i >= 0; i--) {
            let casing = this.casings[i];
            if (casing.remove) {
                this.removeCasing(casing);
            }
        }

        if (this.casings.length < 6) {
            let self = this;
            findNearest(this.x, this.y, this.z, BlockID.quarryCasing, function (tile) {
                if (!tile.tile) {
                    self.addCasing(tile);
                }

                return self.casings.length >= 6;
            });
        }

        this.data.isValid = this.casings.length === 6;
    },

    tick: function () {
        const content = this.container.getGuiContent();
        let slotTool = this.container.getSlot("slotTool");
        let correctTool = false;
        let drop = this.data.drop;

        if (World.getThreadTime() % 60 === 0) {
            this.checkStructure();
        }

        if (this.data.enabled) {
            correctTool = this.isCorrectTool(slotTool);
            if (drop && drop.length > 0) {
                const items = [];
                for (let i in drop) {
                    let item = drop[i];
                    item = this.addItemToStorage(item);
                    if (item) {
                        items.push(item);
                    }
                }

                drop = this.data.drop = items;
            } else if (World.getThreadTime() % 20 === 0) {
                if (this.data.isValid
                    && !this.data.complete
                    && (slotTool.id === 0 ? this.data.energy > ENERGY_PER_DESTROY : correctTool)) {
                    if (this.data.progress) {
                        if (++this.data.progress > this.data.progressMax) {
                            this.data.progress = 0;
                            let coords = {
                                x: this.data.digX,
                                y: this.data.digY,
                                z: this.data.digZ,
                            };
                            let block = World.getBlock(this.data.digX, this.data.digY, this.data.digZ);
                            let dropped = Block.getBlockDropViaItem(block, correctTool ? slotTool : {
                                id: 278,
                                data: 0,
                            }, coords, this.blockSource);
                            let entities = Entity.getAllInRange(coords, 2, 69);

                            if (this.data.smelt) {
                                if (dropped && dropped.length > 0) {
                                    for (let i in dropped) {
                                        const item = dropped[i];
                                        const smelted = Recipes.getFurnaceRecipeResult(item[0], item[2]);

                                        if (smelted) {
                                            dropped[i] = [smelted.id, item[1], smelted.data];
                                        }
                                    }
                                }
                            }
                            this.data.drop = dropped;

                            if (correctTool) {
                                this.damageTool(slotTool);
                            } else {
                                this.data.energy -= ENERGY_PER_DESTROY;
                            }

                            for (let index in entities) {
                                if (this.data.exp >= 1000) {
                                    break;
                                }

                                this.data.exp = Math.min(1000, this.data.exp + 2);
                                Entity.remove(entities[index]);
                            }

                            this.blockSource.setBlock(this.data.digX, this.data.digY, this.data.digZ, 3);
                        }
                    } else if (this.data.energy >= ENERGY_PER_SCAN) {
                        let range = 16 * this.data.territoryModifier;

                        //Increase dig position
                        if (++this.data.digX > this.x + range) {
                            this.data.digX = this.x - range;
                            if (++this.data.digZ > this.z + range) {
                                this.data.digZ = this.z - range;
                                if (--this.data.digY < 1) {
                                    this.data.complete = true;
                                }
                            }
                        }
                        //Consume energy
                        this.data.energy -= ENERGY_PER_SCAN;

                        let block = World.getBlock(this.data.digX, this.data.digY, this.data.digZ);
                        if (block.id > 0) {
                            let material = ToolAPI.getBlockMaterial(block.id);
                            if (material && material.name === "stone" && this.isOnTheList(block) &&
                                !TileEntity.getPrototype(block.id)) {
                                const coords = {
                                    x: this.data.digX,
                                    y: this.data.digY,
                                    z: this.data.digZ,
                                };
                                this.data.progress = 1;
                                this.data.progressMax = Math.round(ToolAPI.getDestroyTimeViaTool(block, slotTool || {
                                    id: 278,
                                    data: 0,
                                }, coords as Callback.ItemUseCoordinates, false) * 3);
                            }
                        }
                    }
                    if (!this.sound.isPlaying()) {
                        this.sound.play();
                    }
                } else {
                    if (this.sound.isPlaying()) {
                        this.sound.stop();
                    }
                }
            }
        } else {
            if (this.sound.isPlaying()) {
                this.sound.stop();
            }
        }

        if (content) {
            if (this.data.updateFlag) {
                this.container.setBinding("switch", "state", this.data.whitelist);
                content.elements["buttonToggle"].bitmap = this.data.enabled ? "btn_redstone_on" : "btn_redstone_off";
                this.data.updateFlag = false;
            }

            let elementText = content.elements["text"];

            if (!this.data.enabled) {
                elementText.text = Translation.translate("Turned off");
            } else if (slotTool.id !== 0 && !correctTool) {
                elementText.text = Translation.translate("Incorrect tool");
            } else if (drop && drop.length > 0) {
                elementText.text = Translation.translate("Not enough space");
            } else if (this.data.isValid) {
                elementText.text = "X:" + this.data.digX + " Y:" + this.data.digY + " Z:" + this.data.digZ;
            } else {
                elementText.text = Translation.translate("Incorrect structure");
            }

            content.elements["textExp"].text = Translation.translate("Exp: ") + this.data.exp;
            elementText.text += "\n\n" + Translation.translate("Range: ") + 16 * this.data.territoryModifier;

            this.container.setScale("energyScale", this.data.energy / this.getEnergyStorage());
            this.container.setScale("expScale", this.data.exp / 1000);
        }
    },

    getEnergyStorage: function () {
        return 50000;
    },

    destroy: function () {
        for (let i in this.casings) {
            let casing = this.casings[i];
            casing.tile = null;
        }

        this.sound.destroy();
    }
});

for (let i in energyTypes) {
    EnergyTileRegistry.addEnergyTypeForId(BlockID.quarryCasing, energyTypes[i]);
}