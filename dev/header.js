/*
     ______     __  __     ______     ______     ______     __  __     __    __     ______     _____
    /\  __ \   /\ \/\ \   /\  __ \   /\  == \   /\  == \   /\ \_\ \   /\ "-./  \   /\  __ \   /\  __-.
    \ \ \/\_\  \ \ \_\ \  \ \  __ \  \ \  __<   \ \  __<   \ \____ \  \ \ \-./\ \  \ \ \/\ \  \ \ \/\ \
     \ \___\_\  \ \_____\  \ \_\ \_\  \ \_\ \_\  \ \_\ \_\  \/\_____\  \ \_\ \ \_\  \ \_____\  \ \____-
      \/___/_/   \/_____/   \/_/\/_/   \/_/ /_/   \/_/ /_/   \/_____/   \/_/  \/_/   \/_____/   \/____/

      QuarryMod by Dmitriy Medvedev for ModChallenge3
 */

IMPORT("EnergyNet");
IMPORT("ChargeItem");

const energyTypes = [
    EnergyTypeRegistry.assureEnergyType("Eu", 1),
    EnergyTypeRegistry.assureEnergyType("RF", 1 / 4)
];


const directions = [
    [-1, 0, 0],
    [1, 0, 0],
    [0, -1, 0],
    [0, 1, 0],
    [0, 0, -1],
    [0, 0, 1],
];

const ENERGY_PER_SCAN = __config__.get("energyPerScan");
const ENERGY_PER_DESTROY = __config__.get("energyPerDestroy");