export function toggle_debug(data) {
    data.hero.body.debug = !data.hero.body.debug;
    data.map_collider.body.debug = !data.map_collider.body.debug;
    for (let i = 0; i < data.npc_group.children.length; ++i) {
        let sprite = data.npc_group.children[i];
        if (!sprite.is_npc && !sprite.is_interactable_object) continue;
        sprite.body.debug = !sprite.body.debug;
    }
    for (let i = 0; i < data.dynamic_jump_events_bodies.length; ++i) {
        data.dynamic_jump_events_bodies[i].debug = !data.dynamic_jump_events_bodies[i].debug;
    }
    data.debug = !data.debug;
}

export function set_debug_info(game, data) {
    game.debug.text('', 0, 0);

    if (data.show_fps) {
        game.debug.text('FPS: ' + game.time.fps || 'FPS: --', 5, 15, "#00ff00");
    }

    if (data.grid) {
        const tile_width = maps[data.map_name].sprite.tileWidth;
        for (let x = 0; x < game.world.width; x += tile_width) {
            game.debug.geom(new Phaser.Line(x, 0, x, game.world.height), 'rgba(0,255,255,0.35)', false, 4);
        }
        const tile_height = maps[data.map_name].sprite.tileHeight;
        for (let y = 0; y < game.world.height; y += tile_height) {
            game.debug.geom(new Phaser.Line(0, y, game.world.width, y), 'rgba(0,255,255,0.35)', false, 4);
        }
        let x_pos = data.hero_tile_pos_x*tile_width;
        let y_pos = data.hero_tile_pos_y*tile_height;
        game.debug.geom(new Phaser.Rectangle(x_pos, y_pos, tile_width, tile_height), 'rgba(255,0,0,0.5)');
        game.debug.geom(new Phaser.Circle(data.hero.x, data.hero.y, 5), 'rgba(20,75,0,1.0)');
        for (let point in maps[data.map_name].events) {
            let pos = point.split('_');
            game.debug.geom(new Phaser.Rectangle(pos[0]*tile_width, pos[1]*tile_height, tile_width, tile_height), 'rgba(255,255,60,0.7)');
        }

        if (game.input.mousePointer.withinGame) {
            const mouse_x = parseInt((game.camera.x + game.input.mousePointer.x/data.scale_factor)/maps[data.map_name].sprite.tileWidth);
            const mouse_y = parseInt((game.camera.y + game.input.mousePointer.y/data.scale_factor)/maps[data.map_name].sprite.tileHeight);
            game.debug.text(`x: ${mouse_x}, y: ${mouse_y}`, 140, 15, "#00ff00");
            const event_key = mouse_x + "_" + mouse_y;
            if (event_key in maps[data.map_name].events) {
                const events = maps[data.map_name].events[event_key].map(event => {
                    return Object.assign({}, event, {
                        ...(event.origin_interactable_object && { origin_interactable_object: `[${event.origin_interactable_object.key_name}]` })
                    });
                });
                document.getElementById("object_inspector").innerText = JSON.stringify(events, null, 4);
            }
        } else {
            game.debug.text(`x: --, y: --`, 140, 15, "#00ff00");
        }
    } else {
        document.getElementById("object_inspector").innerText = "";
    }
}