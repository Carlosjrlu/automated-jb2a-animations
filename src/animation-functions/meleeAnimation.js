import { buildFile } from "./file-builder/build-filepath.js"
import { meleeSwitch } from "./meleeSwitch.js";
//import { AAITEMCHECK } from "./item-arrays.js";
//import { animationDefault } from "./file-builder/options.js";
const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

export async function meleeAnimation(handler) {
    function moduleIncludes(test) {
        return !!game.modules.get(test);
    }
    let itemName = handler.convertedName;
    let rangeSwitch;
    if (moduleIncludes("jb2a_patreon")) {
        rangeSwitch = ['sword', 'greatsword', 'mace', 'dagger', 'spear', 'greataxe', 'handaxe', 'lasersword']
    } else {
        rangeSwitch = ['dagger', 'lasersword']
    }
    // Sets JB2A database and Global Delay
    let globalDelay = game.settings.get("autoanimations", "globaldelay");
    await wait(globalDelay);

    //Builds Primary File Path and Pulls from flags if already set
    let variant = itemName === "unarmedstrike" || itemName === "flurryofblows" ? handler.uaStrikeType : "01";
    let customPath = handler.enableCustom01 ? handler.custom01 : false;
    let attack = await buildFile(false, itemName, "melee", variant, handler.color, customPath)
    //let attack = await buildWeaponFile(obj01, itemName, handler)
    let sourceToken = handler.actorToken;
    let sourceScale = itemName === "unarmedstrike" || itemName === "flurryofblows" ? sourceToken.w / canvas.grid.size * 0.85 : sourceToken.w / canvas.grid.size * 0.5;

    //Builds Explosion File Path if Enabled, and pulls from flags if already set
    let explosion;
    let customExplosionPath;
    if (handler.flags.explosion) {
        customExplosionPath = handler.customExplode ? handler.customExplosionPath : false;
        explosion = await buildFile(true, handler.explosionVariant, "static", "01", handler.explosionColor, customExplosionPath)
    }

    let explosionSound = handler.allSounds?.explosion;
    let explosionVolume = 0.25;
    let explosionDelay = 1;
    let explosionFile = "";
    if (handler.explodeSound) {
        explosionVolume = explosionSound?.volume || 0.25;
        explosionDelay = explosionSound?.delay === 0 ? 1 : explosionSound?.delay;
        explosionFile = explosionSound?.file;
    }
    // builds Source Token file if Enabled, and pulls from flags if already set
    let sourceFX;
    let sFXScale;
    let customSourcePath; 
    if (handler.sourceEnable) {
        customSourcePath = handler.sourceCustomEnable ? handler.sourceCustomPath : false;
        sourceFX = await buildFile(true, handler.sourceName, "static", handler.sourceVariant, handler.sourceColor, customSourcePath);
        sFXScale = 2 * sourceToken.w / sourceFX.metadata.width;
    }
    // builds Target Token file if Enabled, and pulls from flags if already set
    let targetFX;
    let tFXScale;
    let customTargetPath; 
    if (handler.targetEnable) {
        customTargetPath = handler.targetCustomEnable ? handler.targetCustomPath : false;
        targetFX = await buildFile(true, handler.targetName, "static", handler.targetVariant, handler.targetColor, customTargetPath);
    }

    //logging explosion Scale
    let scale = ((200 * handler.explosionRadius) / explosion?.metadata?.width) ?? 1;

    async function cast() {
        let arrayLength = handler.allTargets.length;
        for (var i = 0; i < arrayLength; i++) {

            let target = handler.allTargets[i];

            let moveTo = handler.getDistanceTo(target) > 5 ? true : false;
            //const switchName = handler.switchName;
            const switchType = handler.switchType;
            const switchDetect = handler.switchDetect;
            let noMelee = false;
            if (!game.settings.get("autoanimations", "rangeSwitch")) {
                switch (switchType) {
                    case "on":
                        if (rangeSwitch.some(el => itemName.includes(el))) {
                            if (handler.getDistanceTo(target) > (5 + handler.reachCheck)) {
                                noMelee = true;
                            }
                        }
                        break;
                    case "custom":
                        if (switchDetect === "manual") {
                            if ((handler.getDistanceTo(target) / canvas.dimensions.distance) > handler.switchRange) {
                                noMelee = true;
                            }
                        } else if (handler.getDistanceTo(target) > (5 + handler.reachCheck)) {
                            noMelee = true;
                        }
                        break;
                }
            }
            if (noMelee) {
                await meleeSwitch(handler, target)
            }
            else {
                if (handler.targetEnable) {
                    tFXScale = 2 * target.w / targetFX.metadata.width;
                }

                let hit;
                if (handler.playOnMiss) {
                    hit = handler.hitTargetsId.includes(target.id) ? false : true;
                } else {
                    hit = false;
                }
                await new Sequence()
                .effect()
                    .atLocation(sourceToken)
                    .scale(sFXScale * handler.sourceScale)
                    .repeats(handler.sourceLoops, handler.sourceLoopDelay)
                    .belowTokens(handler.sourceLevel)
                    .waitUntilFinished(handler.sourceDelay)
                    .playIf(handler.sourceEnable)
                    .addOverride(async (effect, data) => {
                        if (handler.sourceEnable) {
                            data.file = sourceFX.file;
                        }
                        return data;
                    })
                .thenDo(function () {
                    Hooks.callAll("aa.animationStart", sourceToken, target)
                })
                .effect()
                    //.delay(sourceOptions.delayAfter)
                    .file(attack.file)
                    .atLocation(sourceToken)
                    .rotateTowards(target)
                    //.JB2A()
                    .scale(sourceScale * handler.scale)
                    .repeats(handler.animationLoops, handler.loopDelay)
                    .randomizeMirrorY()
                    .missed(hit)
                    .name("animation")
                    .belowTokens(handler.animLevel)
                    .addOverride(async (effect, data) => {
                        data.anchor = { x: 0.4, y: 0.5 }
                        return data;
                    })
                    .playIf(!moveTo)
                .effect()
                    .file(attack.file)
                    .atLocation(sourceToken)
                    .moveTowards(target)
                    //.JB2A()
                    .scale(sourceScale * handler.scale)
                    .repeats(handler.animationLoops, handler.loopDelay)
                    .randomizeMirrorY()
                    .missed(hit)
                    .name("animation")
                    .belowTokens(handler.animLevel)
                    .playIf(moveTo)
                .effect()
                    .atLocation("animation")
                    //.file(explosion.file)
                    .scale({ x: scale, y: scale })
                    .delay(500 + handler.explosionDelay)
                    .repeats(handler.animationLoops, handler.loopDelay)
                    .belowTokens(handler.explosionLevel)
                    .playIf(() => { return explosion })
                    .addOverride(async (effect, data) => {
                        if (explosion) {
                            data.file = explosion.file;
                        }
                        return data;
                    })
                    //.waitUntilFinished(explosionDelay)
                .sound()
                    .file(explosionFile)
                    .playIf(() => {return explosion && handler.explodeSound})
                    .delay(explosionDelay)
                    .volume(explosionVolume)
                    .repeats(handler.animationLoops, handler.loopDelay)
                .effect()
                    .delay(handler.targetDelay)
                    .atLocation(target)
                    .scale(tFXScale * handler.targetScale)
                    .repeats(handler.targetLoops, handler.targetLoopDelay)
                    .belowTokens(handler.targetLevel)
                    .playIf(handler.targetEnable)
                    .addOverride(async (effect, data) => {
                        if (handler.targetEnable) {
                            data.file = targetFX.file;
                        }
                        return data;
                    })
                    .play()
                await wait(handler.animEnd)
                Hooks.callAll("aa.animationEnd", sourceToken, target)
            }
        }
    }
    cast()
}
