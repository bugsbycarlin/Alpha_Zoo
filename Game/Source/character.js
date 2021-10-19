
var default_walk_speed = 6;
var walk_frame_time = 105;

var directions = ["down", "left", "up", "right", "downleft", "upleft", "downright", "upright"]

Game.prototype.makeCharacter = function(character_name) {
  let character = new PIXI.Container();
  character.position.set(0,0);
  character.scale.set(0.72, 0.72);
  // map.addChild(character);

  character.type = "character";
  character.character_name = character_name;

  character.red_circle = new PIXI.Sprite(PIXI.Texture.from("Art/red_circle.png"));
  character.red_circle.anchor.set(0.5,0.5);
  character.red_circle.position.set(0,0);
  character.red_circle.visible = false;
  character.addChild(character.red_circle)
  

  var sheet = PIXI.Loader.shared.resources["Art/Characters/" + character_name + ".json"].spritesheet;
  character.character_sprite = {};
  for(let i = 0; i < 8; i++) {
    character.character_sprite[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
    character.character_sprite[directions[i]].anchor.set(0.5,0.5);
    character.character_sprite[directions[i]].position.set(0, 0);
    character.addChild(character.character_sprite[directions[i]]);
    character.character_sprite[directions[i]].visible = false;
  }

  character.direction = "down";

  character.walk_frame_time = walk_frame_time;

  character.last_image_time = null;

  character.walk_speed = default_walk_speed;

  character.current_image = "down_0";
  character.character_sprite["down"].visible = true;

  character.move = function() {

    //character.direction = character.level.testWalk(character, character.direction);

    if (character.direction == "upright") {
      character.y -= 0.707 * character.walk_speed;
      character.x += 0.707 * character.walk_speed; 
    } else if (character.direction == "upleft") {
      character.y -= 0.707 * character.walk_speed;
      character.x -= 0.707 * character.walk_speed;
    } else if (character.direction == "downright") {
      character.y += 0.707 * character.walk_speed;
      character.x += 0.707 * character.walk_speed;
    } else if (character.direction == "downleft") {
      character.y += 0.707 * character.walk_speed;
      character.x -= 0.707 * character.walk_speed;
    } else if (character.direction == "down") {
      character.y += character.walk_speed;
    } else if (character.direction == "up") {
      character.y -= character.walk_speed;
    } else if (character.direction == "left") {
      character.x -= character.walk_speed;
    } else if (character.direction == "right") {
      character.x += character.walk_speed;
    }

    if (character.direction != null) {
      character.walkAnimation();
    }
  }


  character.walkAnimation = function() {
    for(let i = 0; i < 8; i++) {
      if (directions[i] == character.direction) {
        character.character_sprite[directions[i]].visible = true;
      } else {
        character.character_sprite[directions[i]].visible = false;
      }
    }

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
    } else if (character.character_sprite[character.direction].currentFrame == 1 && character.current_image == f0) {
      character.character_sprite[character.direction].gotoAndStop(0);
    }
  }


  character.updateDirection = function() {
    for(let i = 0; i < 8; i++) {
      if (directions[i] == character.direction) {
        character.character_sprite[directions[i]].visible = true;
      } else {
        character.character_sprite[directions[i]].visible = false;
      }
    }

    character.character_sprite[character.direction].gotoAndStop(0);
  }

  return character;
}
