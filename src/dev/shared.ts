ModAPI.registerAPI("QuarryAPI", {
    UpgradesManager,

    requireGlobal(str: string): unknown {
        return eval(str);
    },
});