/*
 *    ___                              __  __           _ ____  _____
 *   / _ \ _   _  __ _ _ __ _ __ _   _|  \/  | ___   __| |  _ \| ____|
 *  | | | | | | |/ _` | '__| '__| | | | |\/| |/ _ \ / _` | |_) |  _|
 *  | |_| | |_| | (_| | |  | |  | |_| | |  | | (_) | (_| |  __/| |___
 *   \__\_\\__,_|\__,_|_|  |_|   \__, |_|  |_|\___/ \__,_|_|   |_____|
 *                               |___/
 *
 * Terms of use:
 *  - Forbidden to distribute the library on third-party sources
 *    without links to the official group (https://vk.com/forestry_pe)
 *  - Forbidden to change the code of this mod
 *  - Forbidden to explicitly copy the code to other libraries or mods
 *  - Allowed to use in any mod packs
 *  - Using the mod you automatically agree to the conditions described above
 *
 * Textures Author: https://vk.com/vasya.blyaa
 * @DDCompany (https://vk.com/forestry_pe)
 */

IMPORT("EnergyNet");
// IMPORT("SoundAPI");

const EntityType = Native.EntityType;
const energyTypes = [
    EnergyTypeRegistry.assureEnergyType("Eu", 1, {}),
    EnergyTypeRegistry.assureEnergyType("RF", 1 / 4, {}),
];

const directions = [
    [-1, 0, 0],
    [1, 0, 0],
    [0, -1, 0],
    [0, 1, 0],
    [0, 0, -1],
    [0, 0, 1],
];

const ENERGY_CONSUMPTION = +__config__.get("energyConsumption");

//TODO: update sounds

// const soundClick = new Sound("click.ogg");
// soundClick.setInPlayer();
// const levelUpSound = new Sound("levelUp.ogg");
// levelUpSound.setInPlayer();
