Hooks.once('aa.ready', async (jb2a) => { menuOptions(jb2a) });
const aaColorMenu = {};
const aaVariantMenu = {};
function menuOptions(database) {

const jb2a = database;

let range = Object.keys(jb2a.range)
let melee = Object.keys(jb2a.melee)
let aaStatic = Object.keys(jb2a.static)
let rangeReturn = Object.keys(jb2a.return)

//aaColorMenu = {}

aaColorMenu.range = range.reduce((o, key) => ({...o, [key]: Object.keys(jb2a.range[key]).reduce((o, variant) => ({...o, [variant]: Object.keys(jb2a.range[key][variant]).reduce((o, colors) => ({...o, [colors]: `AUTOANIM.${colors}`}), {})}), {})}), {});

aaColorMenu.return = rangeReturn.reduce((o, key) => ({...o, [key]: Object.keys(jb2a.return[key]).reduce((o, variant) => ({...o, [variant]: Object.keys(jb2a.return[key][variant]).reduce((o, colors) => ({...o, [colors]: `AUTOANIM.${colors}`}), {})}), {})}), {});

aaColorMenu.melee = melee.reduce((o, key) => ({...o, [key]: Object.keys(jb2a.melee[key]).reduce((o, variant) => ({...o, [variant]: Object.keys(jb2a.melee[key][variant]).reduce((o, colors) => ({...o, [colors]: `AUTOANIM.${colors}`}), {})}), {})}), {});

aaColorMenu.static = aaStatic.reduce((o, key) => ({...o, [key]: Object.keys(jb2a.static[key]).reduce((o, variant) => ({...o, [variant]: Object.keys(jb2a.static[key][variant]).reduce((o, colors) => ({...o, [colors]: `AUTOANIM.${colors}`}), {})}), {})}), {});

aaColorMenu.localized = function (cfg) {
    return Object.keys(cfg).reduce((i18nCfg, key) => {
        i18nCfg[key] = game.i18n.localize(cfg[key]);
        return i18nCfg;
    }, {}
    );
};

//aaVariantMenu = {}

aaVariantMenu.range = range.reduce((o, key) => ({...o, [key]: Object.keys(jb2a.range[key]).reduce((o, variant) => ({...o, [variant]: `AUTOANIM.${variant}`}), {})}), {});

aaVariantMenu.return = rangeReturn.reduce((o, key) => ({...o, [key]: Object.keys(jb2a.return[key]).reduce((o, variant) => ({...o, [variant]: `AUTOANIM.${variant}`}), {})}), {});

aaVariantMenu.melee = melee.reduce((o, key) => ({...o, [key]: Object.keys(jb2a.melee[key]).reduce((o, variant) => ({...o, [variant]: `AUTOANIM.${variant}`}), {})}), {});

aaVariantMenu.static = aaStatic.reduce((o, key) => ({...o, [key]: Object.keys(jb2a.static[key]).reduce((o, variant) => ({...o, [variant]: `AUTOANIM.${variant}`}), {})}), {});

aaVariantMenu.localized = function (cfg) {
    return Object.keys(cfg).reduce((i18nCfg, key) => {
        i18nCfg[key] = game.i18n.localize(cfg[key]);
        return i18nCfg;
    }, {}
    );
};

//return {aaColorsPatreon, aaVariantsPatreon}
}
export {aaColorMenu, aaVariantMenu}
