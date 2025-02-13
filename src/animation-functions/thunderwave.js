import { JB2APATREONDB } from "./databases/jb2a-patreon-database.js";
import { JB2AFREEDB } from "./databases/jb2a-free-database.js";
import { buildFile } from "./file-builder/build-filepath.js";
import { socketlibSocket } from "../socketset.js";

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

export async function thunderwaveAuto(handler) {

    function moduleIncludes(test) {
        return !!game.modules.get(test);
    }

    let obj01 = moduleIncludes("jb2a_patreon") === true ? JB2APATREONDB : JB2AFREEDB;
    let color = handler.templates.tempColor;
    const colors = ['green', 'orange', 'purple', 'red', 'blue']
    function random_item(items) {
        return items[Math.floor(Math.random() * items.length)];
    }
    console.log(color)
    switch (true) {
        case color === "a1" || ``:
        case !color:
            color = "blue";
            break;
        case color === "random":
            color = random_item(colors);
        default:
            color = color;
    }

    let templateSound = handler.allSounds?.item;
    let templateVolume = 0.25;
    let templateDelay = 1;
    let templateFile = "";
    if (handler.itemSound) {
        templateVolume = templateSound?.volume || 0.25;
        templateDelay = templateSound?.delay === 0 ? 1 : templateSound?.delay;
        templateFile = templateSound?.file;
    }

    let sourceFX;
    let sFXScale;
    if (handler.sourceEnable) {
        sourceFX = await buildFile(true, handler.sourceName, "static", handler.sourceVariant, handler.sourceColor);
        sFXScale = 2 * sourceToken.w / sourceFX.metadata.width;
    }

    const templateID = await canvas.templates.placeables[canvas.templates.placeables.length - 1].data._id;
    let template = await canvas.templates.get(templateID);
    let gridSize = canvas.scene.data.grid;

    let templateW = template.data.width;
    let templateLength = canvas.grid.size * (templateW / canvas.dimensions.distance);
    let scaleX = (100 / canvas.grid.size) * templateLength / 600;
    let scaleY = scaleX;
    let xPos = handler.actorToken.data.x;
    let yPos = handler.actorToken.data.y;
    let tempY = template.data.y;
    let tempX = template.data.x;

    let filePath = obj01.static.rect['thunderwave'][color];
    let ang = 0;
    let anFile = filePath['mid'];;
    switch (true) {
        case ((xPos >= tempX && xPos <= (tempX + (gridSize * 2))) && (yPos >= tempY && yPos <= (tempY + (gridSize * 2)))):
            ang = 0;
            anFile = filePath['center'];
            break;
        case ((xPos >= (tempX - gridSize)) && (xPos <= (tempX - (gridSize * 0.5)))) && ((yPos >= (tempY - gridSize)) && (yPos <= (tempY - (gridSize * 0.5)))):
            ang = 270;
            anFile = filePath['left'];
            break;
        case ((xPos >= (tempX + (gridSize * 2.5))) && (xPos <= (tempX + (gridSize * 3)))) && ((yPos >= (tempY - gridSize)) && (yPos <= (tempY - (gridSize * 0.5)))):
            ang = 180;
            anFile = filePath['left'];
            break;
        case (((xPos >= (tempX + (gridSize * 2.5))) && xPos <= (tempX + (gridSize * 3))) && ((yPos <= (tempY + (gridSize * 3))) && (yPos >= (tempY + (gridSize * 2.5))))):
            ang = 90;
            anFile = filePath['left'];
            break;
        case ((xPos <= (tempX - (gridSize * 0.5))) && (xPos >= (tempX - gridSize))) && ((yPos <= (tempY + (gridSize * 3))) && (yPos >= (tempY + (gridSize * 2.5)))):
            ang = 0;
            anFile = filePath['left'];
            break;
        case (xPos >= (tempX + (gridSize * 2.5))) && ((yPos >= tempY) && yPos <= (tempY + (gridSize * 2))):
            ang = 90;
            anFile = filePath['mid'];
            break;
        case ((xPos >= tempX) && (xPos <= (tempX + (gridSize * 2)))) && ((yPos >= (tempY - gridSize)) && (yPos <= (tempY - (gridSize * 0.5)))):
            ang = 180;
            anFile = filePath['mid'];
            break;
        case ((xPos >= (tempX - gridSize)) && (xPos <= (tempX - (gridSize * 0.5)))) && ((yPos >= tempY) && yPos <= (tempY + (gridSize * 2))):
            ang = 270;
            anFile = filePath['mid'];
            break;
    }
    let globalDelay = game.settings.get("autoanimations", "globaldelay");
    await wait(globalDelay);

    if (handler.templatePersist && (handler.templates.tempType === "circle" || handler.templates.tempType === "rect")) {
        let data;
        if (handler.templates.overhead) {
            data = {
                alpha: handler.templateOpacity,
                width: gridSize * 3,
                height: gridSize * 3,
                img: anFile,
                // false sets it in canvas.background. true sets it to canvas.foreground
                overhead: true,
                occlusion: {
                    alpha: occlusionAlpha,
                    mode: occlusionMode,
                },
                video: {
                    autoplay: true,
                    loop: true,
                    volume: 0,
                },
                x: tempX,
                y: tempY,
                z: 100,
            }
        } else {
            data = {
                alpha: handler.templateOpacity,
                width: gridSize * 3,
                height: gridSize * 3,
                img: anFile,
                // false sets it in canvas.background. true sets it to canvas.foreground
                overhead: false,
                video: {
                    autoplay: true,
                    loop: true,
                    volume: 0,
                },
                x: tempX,
                y: tempY,
                z: 100,
            }
        }
        socketlibSocket.executeAsGM("placeTile", data)
        new Sequence()
            .sound()
            .file(templateFile)
            .playIf(handler.itemSound)
            .delay(templateDelay)
            .volume(templateVolume)
            .repeats(handler.animationLoops, handler.loopDelay)
            .play()
        if (handler.templates.removeTemplate) {
            canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.data._id])
        }
        //const newTile = await canvas.scene.createEmbeddedDocuments("Tile", [data]);    
    } else {
        if (handler.templates.removeTemplate) {
            canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template.data._id])
        }
        await new Sequence()
            .effect()
            .atLocation(handler.actorToken)
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
                Hooks.callAll("aa.animationStart", handler.actorToken, "no-target")
            })
            .effect()
            .file(anFile)
            .atLocation({ x: tempX + (gridSize * 1.5), y: tempY + (gridSize * 1.5) })
            .anchor({ x: 0.5, y: 0.5 })
            .rotate(ang)
            .scale({x: scaleX, y: scaleY})
            .belowTokens(false)
            .repeats(handler.templates.tempLoop, handler.templates.loopDelay)
            .sound()
            .file(templateFile)
            .playIf(handler.itemSound)
            .delay(templateDelay)
            .volume(templateVolume)
            .repeats(handler.animationLoops, handler.loopDelay)
            .play()
        await wait(500)
        Hooks.callAll("aa.animationEnd", handler.actorToken, "no-target")
    }
}

export default thunderwaveAuto;