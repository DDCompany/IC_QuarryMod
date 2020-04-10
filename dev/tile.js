TileEntity.registerPrototype(BlockID.quarry, {
    defaultValues: {
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
        // Если true в tick произойдёт обновление состояния переключателя
        stateFlag: false,
        // Валидна ли структура карьера
        isValid: false
    },

    created: function () {
        this.data.digY = this.y - 3;
        this.data.digX = this.x - 16 * this.data.territoryModifier;
        this.data.digZ = this.z - 16 * this.data.territoryModifier;
    },

    getGuiScreen: function () {
        this.data.stateFlag = true;
        return gui;
    },

    /**
     * Добавление дропа в буффер
     * @param items
     */
    addItemToStorage: function (items) {
        for (let index in items) {
            let item = items[index];

            if (this.smelt) {
                let smelted = Recipes.getFurnaceRecipeResult(item[0], item[2]);

                if (smelted)
                    item = [smelted.id, item[1], smelted.data];
            }

            for (let i = 0; i < 15; i++) {
                let slot = this.container.getSlot("slot" + i);

                if (!slot.id) {

                    slot.id = item[0];
                    slot.count = item[1];
                    slot.data = item[2];
                    break;

                } else if (slot.id === item[0] && slot.data === item[2] && Item.getMaxStack(slot.id) - slot.count !== 0) {
                    let count = Math.min(Item.getMaxStack(slot.id) - slot.count, item[1]);
                    slot.count += count;

                    if (count < item[1]) {
                        this.addItemToStorage([item[0], item[1] - count, item[2]]);
                    }
                    break;
                }
            }
        }

    },

    /**
     * Применение модификаторов апгрейдов и линз
     */
    applyUpgrades: function () {
        this.data.territoryModifier = 1;
        this.smelt = false;

        for (let i = 0; i < 2; i++) {
            let slotUpgrade = this.container.getSlot("slotUpgrade" + i);
            let slotLens = this.container.getSlot("slotLens" + i);

            if (slotUpgrade.id === ItemID.quarryUpgradeTerritory) {
                this.data.territoryModifier *= 2;
            }

            if (slotLens.id === ItemID.quarryLensSmelt) {
                this.smelt = true;
            }
        }
    },

    /**
     * @param slotTool
     * @returns boolean Истина если предметом slotTool можно добывать блоки с материалом stone
     */
    isCorrectTool: function (slotTool) {
        if (!slotTool.id)
            return false;

        let toolData = ToolAPI.getToolData(slotTool.id);
        return toolData && toolData.blockMaterials && toolData.blockMaterials["stone"];
    },

    /**
     * Тратим прочность инструмента
     * @param slotTool
     */
    damageTool: function (slotTool) {
        slotTool.data++;
        if (slotTool.data >= Item.getMaxDamage(slotTool.id)) {
            slotTool.id = 0;
            slotTool.data = 0;
            slotTool.count = 0;
        }
    },

    /**
     * Проверка валидности структуры
     * @returns {boolean}
     */
    isValidStructure: function () {
        for (let index in directions) {
            let dir = directions[index];

            if (World.getBlockID(this.x + dir[0], this.y + dir[1], this.z + dir[2]) !== BlockID.quarryCasing)
                return false;
        }
        return true;
    },

    /**
     * Обновление списка блоков в Белом/Черном списке
     */
    refreshList: function () {
        this.data.list = {};
        for (let i = 0; i < 6; i++) {
            let slot = this.container.getSlot("slotList" + i);

            if (slot.id)
                this.data.list[slot.id + ":" + slot.data] = true;
        }
    },

    isOnTheList: function (block) {
        if (this.data.whitelist) {
            return this.data.list[block.id + ":" + block.data];
        } else return !this.data.list[block.id + ":" + block.data];
    },

    tick: function () {
        const content = this.container.getGuiContent();
        let invalidTool = false;

        if (World.getThreadTime() % 60 === 0) {
            this.data.isValid = this.isValidStructure();
            this.refreshList(); //TODO: refactor
            this.applyUpgrades();
        }

        if (this.data.isValid && !this.data.complete && this.data.energy > ENERGY_PER_DESTROY + ENERGY_PER_SCAN) {
            let slotTool = this.container.getSlot("slotTool");
            let correctTool = this.isCorrectTool(slotTool);

            if (slotTool.id && !correctTool) {
                invalidTool = true;
            } else {
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
                    if (ToolAPI.getBlockMaterial(block.id).name === "stone" && this.isOnTheList(block)) {
                        let coords = {
                            x: this.data.digX,
                            y: this.data.digY,
                            z: this.data.digZ
                        };
                        let drop = Block.getBlockDropViaItem(block, correctTool ? slotTool : {
                            id: 278,
                            data: 0
                        }, coords);
                        let entities = Entity.getAllInRange(coords, 2, 69);

                        if (correctTool)
                            this.damageTool(slotTool);
                        else this.data.energy -= ENERGY_PER_DESTROY;

                        if (drop)
                            this.addItemToStorage(drop);

                        for (let index in entities) {
                            if (this.data.exp >= 1000)
                                break;

                            this.data.exp = Math.min(1000, this.data.exp + 2);
                            Entity.remove(entities[index]);
                        }

                        World.setBlock(this.data.digX, this.data.digY, this.data.digZ, 3);
                    }
                }
            }
        }

        if (this.data.stateFlag) {
            this.container.setBinding("switch", "state", this.data.whitelist);
        }

        if (content) {
            if (invalidTool) {
                content.elements["text"].text = "Incorrect tool";
            } else if (this.data.isValid) {
                content.elements["text"].text = "X:" + this.data.digX + " Y:" + this.data.digY + " Z:" + this.data.digZ;
            } else {
                content.elements["text"].text = "Incorrect structure";
            }

            content.elements["textExp"].text = "Exp: " + this.data.exp;
            content.elements["textRange"].text = "Range: " + 16 * this.data.territoryModifier;

            this.container.setScale("energyScale", this.data.energy / this.getEnergyStorage());
            this.container.setScale("expScale", this.data.exp / 1000);
        }
    },

    energyReceive: function (type, amount) {
        const add = Math.min(amount, this.getEnergyStorage() - this.data.energy);
        this.data.energy += add;
        return add;
    },

    getEnergyStorage: function () {
        return 50000;
    }
});

EnergyTileRegistry.addEnergyTypeForId(BlockID.quarry, EU);