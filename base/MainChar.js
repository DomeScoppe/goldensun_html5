class MainChar {
	constructor (
		key_name,
		actions,
		walk_speed,
		dash_speed,
		climb_speed
	) {
		this.key_name = key_name;
		this.actions = {};
		for (let key in actions) {
			this.actions[actions[key]] = {};
		}
		this.walk_speed = walk_speed;
		this.dash_speed = dash_speed;
		this.climb_speed = climb_speed;
		this.animations = {};
	}

	setActionDirections(action, directions, frame_counts) {
		this.actions[action].directions = [];
		this.actions[action].frame_counts = [];
		for (let i = 0; i < directions.length; i++) {
			this.actions[action].directions.push(directions[i]);
			this.actions[action].frame_counts.push(frame_counts[i]);
		}
	}

	setActionFrameRate(action, frame_rate) {
		this.actions[action].frame_rate = frame_rate;
	}

	setActionSpritesheet(action, spritesheet_image_url, spritesheet_json_url) {
		this.actions[action].spritesheet = {
			spritesheet_image_url : spritesheet_image_url,
			spritesheet_json_url : spritesheet_json_url
		};
	}

	loadSpritesheets(game) {
		for(let action in this.actions){
			const spritesheet = this.actions[action].spritesheet;
			game.load.atlasJSONHash(
				u([this.key_name, action]),
				spritesheet.spritesheet_image_url,
				spritesheet.spritesheet_json_url
			);
		}
	}

	addAnimation(action, direction, start, stop, suffix, zeroPad) {
		if (!(action in this.animations))
			this.animations[action] = {};
		this.animations[action][direction] = Phaser.Animation.generateFrameNames(
			action+"/"+direction+"/",
			start,
			stop,
			suffix,
			zeroPad
		);
	}

	setAnimation(sprite, action) {
		const directions = this.actions[action].directions;
		const frame_rate = this.actions[action].frame_rate;
		for (let key in directions) {
			const direction = directions[key];
			sprite.animations.add(
				u([action, direction]), 
				this.animations[action][direction], 
				frame_rate, 
				true, 
				false
			);
		}
	}
}