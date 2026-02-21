
//
// The character class makes characters (player and NPC) and has methods
// for making them move around. Actual input/control is handled in screen_zoo.js.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var default_walk_speed = 6;
var walk_frame_time = 105;

var history_length = 8;

var directions = ["down", "left", "up", "right", "downleft", "upleft", "downright", "upright"]

Game.prototype.makeCharacter = function(character_name, subtype = "normal") {
  let character = new PIXI.Container();
  character.position.set(0,0);
  character.scale.set(0.72, 0.72);
  // map.addChild(character);

  character.type = "character";
  character.character_name = character_name;

  character.red_circle = new PIXI.Sprite(PIXI.Texture.from("Art/red_circle.png"));
  character.red_circle.anchor.set(0.5,0.78125);
  character.red_circle.position.set(0,0);
  character.red_circle.visible = false;
  character.addChild(character.red_circle);

  character.history = [];
  character.stuffies = [];
  character.balloons = [];

  character.scooter_boost = 1.0;

  character.balloon_layer = new PIXI.Container();
  character.addChild(character.balloon_layer);

  if (subtype == "normal") {
    let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + ".json"].spritesheet;
    character.character_sprite = {};
    for(let i = 0; i < 8; i++) {
      character.character_sprite[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
      character.character_sprite[directions[i]].anchor.set(0.5,0.78125);
      character.character_sprite[directions[i]].position.set(0, 0);
      character.addChild(character.character_sprite[directions[i]]);
      character.character_sprite[directions[i]].visible = false;
    }

    character.current_image = "down_0";
    character.character_sprite["down"].visible = true;
  } else if (subtype == "stuffed") {
    character.character_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Stuffed_Animals/" + character_name + ".png"));
    character.character_sprite.anchor.set(0.5,0.75);
    character.character_sprite.position.set(0,0);
    character.scale.set(0.75,0.75);
    character.addChild(character.character_sprite);
  }

  character.shirt = null;
  character.glasses = null;
  character.hat = null;
  character.scooter = null;

  character.scooter_last_puff = game.markTime();
  character.scooter_next_puff = 200 + 150 * Math.random();
  character.scooter_last_puff_sound = game.markTime();

  character.shirt_layer = new PIXI.Container();
  character.addChild(character.shirt_layer);
  character.glasses_layer = new PIXI.Container();
  character.addChild(character.glasses_layer);
  character.hat_layer = new PIXI.Container();
  character.addChild(character.hat_layer);
  character.scooter_layer = new PIXI.Container();
  character.addChild(character.scooter_layer);

  character.direction = "down";
  character.walk_frame_time = walk_frame_time;
  character.last_image_time = null;
  character.walk_speed = default_walk_speed;

  character.move = function() {
    // if (character.character_name == "brown_bear") console.log("moving " + character.x);

    if (character.direction != null) {
      character.history.push([character.x, character.y, character.direction]);
      if (character.history.length > history_length) {
        character.history.shift();
      }
    }

    if (character.direction == "upright") {
      character.y -= 0.707 * character.walk_speed * character.scooter_boost;
      character.x += 0.707 * character.walk_speed * character.scooter_boost; 
    } else if (character.direction == "upleft") {
      character.y -= 0.707 * character.walk_speed * character.scooter_boost;
      character.x -= 0.707 * character.walk_speed * character.scooter_boost;
    } else if (character.direction == "downright") {
      character.y += 0.707 * character.walk_speed * character.scooter_boost;
      character.x += 0.707 * character.walk_speed * character.scooter_boost;
    } else if (character.direction == "downleft") {
      character.y += 0.707 * character.walk_speed * character.scooter_boost;
      character.x -= 0.707 * character.walk_speed * character.scooter_boost;
    } else if (character.direction == "down") {
      character.y += character.walk_speed * character.scooter_boost;
    } else if (character.direction == "up") {
      character.y -= character.walk_speed * character.scooter_boost;
    } else if (character.direction == "left") {
      character.x -= character.walk_speed * character.scooter_boost;
    } else if (character.direction == "right") {
      character.x += character.walk_speed * character.scooter_boost;
    }

    if (character.direction != null) {
      character.walkAnimation();

      character.pushBalloons();
    }

    for (let i = 0; i < character.stuffies.length; i++) {
      if (i == 0) character.stuffies[i].follow(character);
      else character.stuffies[i].follow(character.stuffies[i-1]);
    }
  }

  if (subtype == "normal") {
    character.walkAnimation = function() {
      for(let i = 0; i < 8; i++) {
        if (directions[i] == character.direction) {
          character.character_sprite[directions[i]].visible = true;
          if (character.shirt != null) character.shirt[directions[i]].visible = true;
          if (character.glasses != null) character.glasses[directions[i]].visible = true;
          if (character.hat != null) character.hat[directions[i]].visible = true;
          if (character.scooter != null) character.scooter[directions[i]].visible = true;
        } else {
          character.character_sprite[directions[i]].visible = false;
          if (character.shirt != null) character.shirt[directions[i]].visible = false;
          if (character.glasses != null) character.glasses[directions[i]].visible = false;
          if (character.hat != null) character.hat[directions[i]].visible = false;
          if (character.scooter != null) character.scooter[directions[i]].visible = false;
        }
      }

      if (character.scooter == null) {
        var f0 = character.direction + "_0";
        var f1 = character.direction + "_1";
        if (character.current_image != f0 && character.current_image != f1) {
          character.current_image = f0
          character.last_image_time = Date.now();
        } else if (character.last_image_time == null) {
          character.last_image_time = Date.now();
        } else if (Date.now() - character.last_image_time > character.walk_frame_time) {
          if (character.current_image == f0) {
            character.current_image = f1;
          } else {
            character.current_image = f0;
          }
          character.last_image_time = Date.now();
        }

        if (character.character_sprite[character.direction].currentFrame == 0 && character.current_image == f1) {
          character.character_sprite[character.direction].gotoAndStop(1);
          if (character.shirt != null) character.shirt[character.direction].gotoAndStop(1);
          if (character.glasses != null) character.glasses[character.direction].gotoAndStop(1);
          if (character.hat != null) character.hat[character.direction].gotoAndStop(1);
        } else if (character.character_sprite[character.direction].currentFrame == 1 && character.current_image == f0) {
          character.character_sprite[character.direction].gotoAndStop(0);
          if (character.shirt != null) character.shirt[character.direction].gotoAndStop(0);
          if (character.glasses != null) character.glasses[character.direction].gotoAndStop(0);
          if (character.hat != null) character.hat[character.direction].gotoAndStop(0);
        }
      } else {
        character.character_sprite[character.direction].gotoAndStop(0);
        if (character.shirt != null) character.shirt[character.direction].gotoAndStop(0);
        if (character.glasses != null) character.glasses[character.direction].gotoAndStop(0);
        if (character.hat != null) character.hat[character.direction].gotoAndStop(0);
        character.scooter[character.direction].gotoAndStop(0);

        if (character.direction == "upright" || character.direction == "upleft") {
          character.character_sprite[character.direction].gotoAndStop(1);
          if (character.shirt != null) character.shirt[character.direction].gotoAndStop(1);
          if (character.glasses != null) character.glasses[character.direction].gotoAndStop(1);
          if (character.hat != null) character.hat[character.direction].gotoAndStop(1);
          character.scooter[character.direction].gotoAndStop(1);
        }

        if (game.timeSince(character.scooter_last_puff) > character.scooter_next_puff
          && character.history.length > 2) {
          character.scooter_last_puff = game.markTime();
          character.scooter_next_puff = 100 + 200 * Math.random();
          // character.scooter_next_puff = 120 + 50 * Math.random();
          let scale = 0.5 + 0.2 * Math.random();
          let px = character.history[character.history.length - 1][0];
          let py = character.history[character.history.length - 1][1];


          
          if (character.scooter_scene == "gift_shop") {
            let puff = game.makePuff(game.gift_shop_object_layer, px - 5 + 10 * Math.random(), py - 5 + Math.random() * 10, scale, scale);
            game.gift_shop_objects.push(puff);
          } else if (character.scooter_scene == "zoo") {
            let puff = game.makePuff(game.map.decoration_layer, px - 5 + 10 * Math.random(), py - 5 + Math.random() * 10, scale, scale);
            game.decorations.push(puff);
          }
        }

        if (game.timeSince(character.scooter_last_puff_sound) > 226) {
          soundEffect("puff");
          character.scooter_last_puff_sound = game.markTime();
        }

        
      }
    }

    character.updateDirection = function() {
      if (character.direction == null) return;

      for(let i = 0; i < 8; i++) {
        if (directions[i] == character.direction) {
          character.character_sprite[directions[i]].visible = true;
          if (character.shirt != null) character.shirt[directions[i]].visible = true;
          if (character.glasses != null) character.glasses[directions[i]].visible = true;
          if (character.hat != null) character.hat[directions[i]].visible = true;
          if (character.scooter != null) character.scooter[directions[i]].visible = true;
        } else {
          character.character_sprite[directions[i]].visible = false;
          if (character.shirt != null) character.shirt[directions[i]].visible = false;
          if (character.glasses != null) character.glasses[directions[i]].visible = false;
          if (character.hat != null) character.hat[directions[i]].visible = false;
          if (character.scooter != null) character.scooter[directions[i]].visible = false;
        }
      }

      character.character_sprite[character.direction].gotoAndStop(0);
      if (character.shirt != null) character.shirt[character.direction].gotoAndStop(0);
      if (character.glasses != null) character.glasses[character.direction].gotoAndStop(0);
      if (character.hat != null) character.hat[character.direction].gotoAndStop(0);
      if (character.scooter != null) character.scooter[character.direction].gotoAndStop(0);

      if (character.scooter != null && 
        (character.direction == "upright" || character.direction == "upleft")) {
          character.character_sprite[character.direction].gotoAndStop(1);
        if (character.shirt != null) character.shirt[character.direction].gotoAndStop(1);
        if (character.glasses != null) character.glasses[character.direction].gotoAndStop(1);
        if (character.hat != null) character.hat[character.direction].gotoAndStop(1);
        character.scooter[character.direction].gotoAndStop(1);
      }

    }
  } else if (subtype == "stuffed") {
    // empty, no walk animation and no updateDirection
    character.walkAnimation = function() {
    }

    character.updateDirection = function() {
    }
  }

  character.follow = function(follow_character) {
    if (follow_character.history.length >= history_length) {
      var element = follow_character.history[0];
      character.x = element[0];
      character.y = element[1];
      character.direction = element[2];
      if (follow_character.direction != null) {
        if (character.direction != null) {
          character.history.push([element[0], element[1], element[2]]);
          if (character.history.length > history_length) {
            character.history.shift();
          }
        }

        character.walkAnimation();
      }
    }
  }

  character.addStuffie = function(stuffed_animal, decorations_list) {
    let stuffie = game.makeCharacter(stuffed_animal, "stuffed");
    stuffie.position.set(character.x + (character.stuffies.length + 1) * 50, character.y)
    stuffie.scale.set(character.scale.x * 0.65,character.scale.y * 0.65);
    character.stuffies.push(stuffie);
    decorations_list.push(stuffie);
    if (character.stuffies.length == 1) stuffie.follow(character);
    else {
      stuffie.follow(character.stuffies[character.stuffies.length-2]);
    }

    game.makeSmoke(character, stuffie.x - character.x + 10, stuffie.y - character.y - 40, 1.8, 1.8);
  }

  character.removeStuffie = function(stuffed_animal, decorations_list) {
    // Remove one instance of the matching stuffie.
    let removed = false;
    let new_stuffies = [];
    for (let i = 0; i < character.stuffies.length; i++) {
      let stuffie = character.stuffies[i];
      if (stuffie.character_name == stuffed_animal && removed == false) {
        game.makeSmoke(character, stuffie.x - character.x + 10, stuffie.y - character.y - 40, 1.8, 1.8);
        removed = true;
        stuffie.status = "dead";
      } else {
        new_stuffies.push(stuffie);
      }
    }
    character.stuffies = new_stuffies;
  }

  character.lineUpStuffies = function(dist = 20) {
    for (let i = 0; i < character.stuffies.length; i++) {
      dir = (i % 2 == 0) ? -1 : 1
      character.stuffies[i].position.set(character.x + dir * ((dist+15) + Math.floor(i/2) * dist), character.y - 1);
    }
  }

  character.addShirt = function(shirt_color) {
    if (character.shirt != null) {
      for(let i = 0; i < 8; i++) {
        character.shirt_layer.removeChild(character.shirt[directions[i]]);
        character.shirt[directions[i]].destroy();
      }
    }

    // let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_shirt.json"].spritesheet;
    let sheet = PIXI.Loader.shared.resources["Art/Characters/brown_bear_shirt.json"].spritesheet;
    character.shirt = {};
    character.shirt_color = shirt_color;
    for(let i = 0; i < 8; i++) {
      character.shirt[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
      character.shirt[directions[i]].anchor.set(0.5,0.78125);
      character.shirt[directions[i]].position.set(0, 0);
      character.shirt_layer.addChild(character.shirt[directions[i]]);
      character.shirt[directions[i]].tint = shirt_color
      character.shirt[directions[i]].visible = false;
    }

    character.updateDirection();

    game.makeSmoke(character, 0, 0, 1.8, 1.8);
  }

  character.addGlasses = function(glasses_type) {
    if (character.glasses != null) {
      for(let i = 0; i < 8; i++) {
        character.glasses_layer.removeChild(character.glasses[directions[i]]);
        character.glasses[directions[i]].destroy();
      }
    }

    character.glasses_type = glasses_type;

    if (glasses_type == "no_glasses") {
      character.glasses = null;
    } else {
      // let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_" + glasses_type + ".json"].spritesheet;
      let sheet = PIXI.Loader.shared.resources["Art/Characters/brown_bear_" + glasses_type + ".json"].spritesheet;
      character.glasses = {};
      character.glasses_type = glasses_type;
      for(let i = 0; i < 8; i++) {
        character.glasses[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
        character.glasses[directions[i]].anchor.set(0.5,0.78125);
        character.glasses[directions[i]].position.set(0, 0);
        character.glasses_layer.addChild(character.glasses[directions[i]]);
        character.glasses[directions[i]].visible = false;
      }

      character.updateDirection();

      game.makeSmoke(character, 0, 0, 1.8, 1.8);
    }
  }

  character.addHat = function(hat_type) {
    if (character.hat != null) {
      for(let i = 0; i < 8; i++) {
        character.hat_layer.removeChild(character.hat[directions[i]]);
        character.hat[directions[i]].destroy();
      }
    }

    character.hat_type = hat_type;

    if (hat_type == "no_hat") {
      character.hat = null;
    } else {
      // let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_" + hat_type + ".json"].spritesheet;
      let sheet = PIXI.Loader.shared.resources["Art/Characters/brown_bear_" + hat_type + ".json"].spritesheet;
      character.hat = {};
      character.hat_type = hat_type;
      for(let i = 0; i < 8; i++) {
        character.hat[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
        character.hat[directions[i]].anchor.set(0.5,0.78125);
        character.hat[directions[i]].position.set(0, 0);
        if (hat_type == "witch_hat") character.hat[directions[i]].position.set(0, -32); // witch hat is tall and needs adjustment to fit the sprite sheet.
        if (hat_type == "top_hat") character.hat[directions[i]].position.set(0, -32); // top hat is tall and needs adjustment to fit the sprite sheet.
        if (hat_type == "beanie") character.hat[directions[i]].position.set(0, -32); // beanie is tall and needs adjustment to fit the sprite sheet.
        character.hat_layer.addChild(character.hat[directions[i]]);
        character.hat[directions[i]].visible = false;
      }

      character.updateDirection();

      game.makeSmoke(character, 0, 0, 1.8, 1.8);
    }
  }


  character.addScooter = function(scooter_type, scooter_scene) {
    if (character.scooter != null) {
      for(let i = 0; i < 8; i++) {
        character.scooter_layer.removeChild(character.scooter[directions[i]]);
        character.scooter[directions[i]].destroy();
      }
    }

    character.scooter_scene = scooter_scene;

    if (scooter_type == "no_scooter") {
      character.scooter = null;
      character.scooter_boost = 1.0;
    } else {
      character.scooter_boost = 1.3;

      // let sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + "_scooter.json"].spritesheet;
      let sheet = PIXI.Loader.shared.resources["Art/Characters/brown_bear_scooter.json"].spritesheet;
      character.scooter = {};
      character.scooter_type = scooter_type;
      for(let i = 0; i < 8; i++) {
        character.scooter[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
        character.scooter[directions[i]].anchor.set(0.5,0.78125);
        character.scooter[directions[i]].position.set(0, 0);
        character.scooter_layer.addChild(character.scooter[directions[i]]);
        character.scooter[directions[i]].visible = false;
      }

      character.updateDirection();

      game.makeSmoke(character, 0, 0, 1.8, 1.8);
    }
  }


  character.addBalloon = function(balloon_color) {
    let balloon = game.makeBalloon(character.balloon_layer, balloon_color, 0, -77, -70 + Math.floor(140 * Math.random()), -50 - Math.floor(20 * Math.random()));
    character.balloons.push(balloon);
    game.makeSmoke(character.balloon_layer, balloon.top_x, balloon.top_y - 100, 1.8, 1.8);
  }

  // character.removeBalloon = function(balloon_color) {
  //   // Remove one instance of the matching balloon.
  //   let removed = false;
  //   let new_balloons = [];
  //   for (let i = 0; i < character.balloons.length; i++) {
  //     let balloon = character.balloons[i];
  //     if (stuffie.character_name == stuffed_animal && removed == false) {
  //       game.makeSmoke(character, stuffie.x - character.x + 10, stuffie.y - character.y - 40, 1.8, 1.8);
  //       removed = true;
  //       stuffie.status = "dead";
  //     } else {
  //       new_balloons.push(stuffie);
  //     }
  //   }
  //   character.balloons = new_balloons;
  // }

  character.updateBalloons = function() {
    for (let i = 0; i < character.balloons.length; i++) {
      character.balloons[i].update();
    }
  }

  character.hideBalloons = function() {
    character.balloon_layer.visible = false;
  }

  character.showBalloons = function() {
    character.balloon_layer.visible = true;
  }

  character.hideScooter = function() {
    character.scooter_layer.visible = false;
  }

  character.showScooter = function() {
    character.scooter_layer.visible = true;
  }

  character.pushBalloons = function() {
    if (character.history.length > 0) {
      let diff_x = character.position.x - character.history[character.history.length-1][0];
      let diff_y = character.position.y - character.history[character.history.length-1][1];
      for (let i = 0; i < character.balloons.length; i++) {
        character.balloons[i].push(-1 * diff_x * (0.97 + 0.06 * Math.random()), -1 * diff_y * (0.97 + 0.06 * Math.random()));
      }
    }
  }

  character.releaseBalloon = function() {
    if (character.balloons.length > 0) {
      let balloon = character.balloons.pop();
      balloon.scale.set(character.scale.x, character.scale.y);
      balloon.free(character.x + balloon.x * character.scale.x, character.y + balloon.y * character.scale.y, game.map.balloon_layer);   // this would be different in other screens
    }
  }

  return character;
}
