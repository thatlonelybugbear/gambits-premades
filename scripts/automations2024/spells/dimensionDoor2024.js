export async function dimensionDoor2024({ speaker, actor, token, character, item, args, scope, workflow, options }) {
    if(!game.modules.get("animated-spell-effects-cartoon")?.active) return ui.notifications.error("You must install the Jack Kerouac's Animated Spell Effects - Cartoon module to use this automation.");
    if (args[0].macroPass === "preActiveEffects") {
        if (workflow.targets.size > 1) return ui.notifications.warn("You can only select one creature to teleport along with yourself");
        let target = workflow.targets.first() ?? null;
        if(target) {
            let targetDistance = MidiQOL.computeDistance(target,token, {wallsBlock: true, includeCover: true})
            if(targetDistance > 6) return ui.notifications.warn("You must be within 5 feet of the ally you are trying to teleport");
        }
        const portalScale = token?.w / canvas.grid.size * 0.7;

        const x1 = token.center.x;
        const y1 = token.center.y;
        const x2 = target?.center.x;
        const y2 = target?.center.y;
        let midpointX;
        let midpointY;
        if(target) {
            midpointX = (x1 + x2) / 2;
            midpointY = (y1 + y2) / 2;
        }
        else {
            midpointX = x1;
            midpointY = y1;
        }

        let cprConfig = game.gps.getCprConfig({itemUuid: item.uuid});
        let { animEnabled, animColor } = cprConfig;
        if(!animColor) animColor = "red";

        if(animEnabled) {
            const magicSign = new Sequence().effect()
                .file(`animated-spell-effects-cartoon.magic.portal.${animColor}`)
                .atLocation({ x: midpointX, y: midpointY })
                .scale(portalScale * 1.5)
                .opacity(1)
                .name(`${token.document.name}_DimensionDoor1`)
                .persist();

            const magicSign2 = new Sequence().effect()
                .file(`jb2a.portals.horizontal.ring.dark_${animColor}`)
                .belowTokens()
                .atLocation(token)
                .scaleToObject(2)
                .opacity(0.5)
                .name(`${token.document.name}_DimensionDoor2`)
                .persist();

            let magicSign3;
            if(target) {
                magicSign3 = new Sequence().effect()
                    .file(`jb2a.portals.horizontal.ring.dark_${animColor}`)
                    .belowTokens()
                    .atLocation(target)
                    .scaleToObject(2)
                    .opacity(0.5)
                    .name(`${token.document.name}_DimensionDoor3`)
                    .persist();
            }

            await magicSign.play();
            await magicSign2.play();
            if(target) await magicSign3.play();
        }

        let config = {
            gridHighlight: true,
            icon: {
                texture: token.document.texture.src,
                borderVisible: true
            },
            location: {
                obj: token,
                limitMaxRange: item.system.range.value,
                showRange: true
            }
        };
          
        let callbacks = {
            [Sequencer.Crosshair.CALLBACKS.MOUSE_MOVE]: (crosshair) => {
                new Sequence()
                    .effect()
                        .file(`animated-spell-effects-cartoon.magic.portal.${animColor}`)
                        .atLocation({ x: crosshair.x, y: crosshair.y })
                        .scale(0.25)
                        .duration(500)
                        .fadeOut(500)
                .play();
            }
        };
          
        let position = await Sequencer.Crosshair.show(config, callbacks);

        if(animEnabled) {
            Sequencer.EffectManager.endEffects({ name: `${token.document.name}_DimensionDoor1` });
            Sequencer.EffectManager.endEffects({ name: `${token.document.name}_DimensionDoor2` });
            if(target) Sequencer.EffectManager.endEffects({ name: `${token.document.name}_DimensionDoor3` });
        }

        if(!position) return;

        const outroSequence = new Sequence();
        if(animEnabled) {
            let hue;
            let file;
            switch (animColor) {
                case "blue":
                    hue = 0;
                    file = "jb2a.energy_conduit.bluepurple.square.01"
                    break;
                case "green":
                    hue = 0;
                    file = "jb2a.energy_conduit.greenyellow.square"
                    break;
                // Additional cases
                case "purple":
                    hue = 30;
                    file = "jb2a.energy_conduit.bluepurple.square.01"
                    break;
                case "red":
                    hue = 280;
                    file = "jb2a.energy_conduit.greenyellow.square"
                    break;
                case "yellow":
                    hue = 60;
                    file = "jb2a.energy_conduit.greenyellow.square"
                    break;
                default: hue = 280;
            }
            
            outroSequence.effect()
                .file(file)
                .scale(portalScale * 0.5)
                .duration(1200)
                .fadeOut(500)
                .fadeIn(200)
                .atLocation({ x: midpointX, y: midpointY })
                .filter("ColorMatrix", { hue: hue })
                .stretchTo(position);

            outroSequence.effect()
                .copySprite(token)
                .fadeIn(500)
                .duration(500)
                .zeroSpriteRotation()
                .waitUntilFinished();
        }

        outroSequence.animation()
            .on(token)
            .teleportTo(position, { relativeToCenter: true })
            .opacity(1);

        await outroSequence.play();

        let offsetLocation = position;

        if(target) {
            const tokenSize = target.w;
            const offsetX = tokenSize + 10;

            const offsetLocation = {
                x: position.x + offsetX,
                y: position.y 
            };

            const outroSequence2 = new Sequence();
            outroSequence2.animation()
                .on(target)
                .teleportTo(offsetLocation, { relativeToCenter: true })
                .opacity(1);

            await outroSequence2.play();
        }
        if(animEnabled) {
            const outroSequence3 = new Sequence().effect()
            .file(`animated-spell-effects-cartoon.magic.portal.${animColor}`)
            .atLocation(offsetLocation)
            .scale(portalScale * 1.5)
            .opacity(1);
            await outroSequence3.play();
        }
    }
}