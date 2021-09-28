

animals = {
  "LION": {
    mouth: [304, 326],
    butt: [193, 350],
  },
  "HIPPO": {
    land: "watergrass",
    decorations: ["rock", "grass"],
    mouth: [320, 344],
    butt: [166, 335],
  },
  "RHINO": {
    land: "sand",
    mouth: [307, 355],
    butt: [179, 337],
  },
  "TURTLE": {
    land: "watergrass",
    decorations: ["rock", "grass"],
    mouth: [314, 351],
    butt: [196, 372],
  },
  "OTTER": {
    land: "water", // should be water rock, with a tiered rock
    decorations: ["rock", "grass"],
    mouth: [303, 333],
    butt: [221, 405],
  },
  "GORILLA": {
    mouth: [284, 307],
    butt: [191, 345],
  },
  "BABOON": {
    land: "sand",
    mouth: [288, 328],
    butt: [192, 350],
  },
  "GIRAFFE": {
    mouth: [332, 198],
    butt: [168, 319],
  },
  "ZEBRA": {
    mouth: [317, 318],
    butt: [183, 342],
  },
  "HORSE": {
    mouth: [316, 347],
    butt: [179, 334],
  },
  "ELEPHANT": {
    land: "sand",
    mouth: [311, 307],
    butt: [167, 328],
  },
  "TIGER": {
    mouth: [316, 339],
    butt: [192, 354],
  },
  "CHEETAH": {
    mouth: [311, 342],
    butt: [194, 356],
  },
  "LYNX": {
    sound: "zebra",
    mouth: [307, 345],
    butt: [200, 355],
  },
  "PANTHER": {
    mouth: [313, 339],
    butt: [194, 359],
  },
  "DOG": {
    mouth: [292, 328],
    butt: [204, 348],
  },
  "CAT": {
    mouth: [292, 321],
    butt: [204, 342],
  },
  "MOUSE": {
    mouth: [262, 341],
    butt: [242, 392],
  },
  "BROWN_BEAR": {
    sound: "bear",
    mouth: [314, 327],
    butt: [188, 338],
  },
  "BLACK_BEAR": {
    sound: "bear",
    mouth: [314, 327],
    butt: [188, 338],
  },
  "POLAR_BEAR": {
    land: "waterice",
    decorations: ["rock", "rock"],
    sound: "bear",
    mouth: [314, 327],
    butt: [188, 338],
  },
  "SEAL": {
    land: "waterice",
    decorations: ["rock", "rock"],
    mouth: [299, 344],
    butt: [200, 382],
  },
  "PANDA_BEAR": {
    mouth: [314, 327],
    butt: [188, 338],
  },
  "FOX": {
    mouth: [279, 329],
    butt: [226, 395],
  },
  "ALLIGATOR": {
    land: "watergrass",
    decorations: ["rock", "grass"],
    mouth: [354, 364],
    butt: [165, 392],
  },
  "PARROT": {
    movement: "fly",
    mouth: [264, 324],
    butt: [235, 386],
  },
  "SNAKE": {
    land: "sand",
    movement: "undulate",
    mouth: [371, 383],
    butt: [191, 392],
  },
  "COW": {
    mouth: [316, 351],
    butt: [180, 327],
  },
  "PIG": {
    land: "sand",
    mouth: [313, 354],
    butt: [178, 319],
  },
  "SHEEP": {
    mouth: [312, 349],
    butt: [181, 334],
  },
  "DEER": {
    mouth: [317, 327],
    butt: [192, 332],
  },
  "GAZELLE": {
    mouth: [317, 327],
    butt: [192, 332],
  },
  "ELK": {
    sound: "deer",
    mouth: [314, 324],
    butt: [174, 333],
  },
  "MOOSE": {
    mouth: [325, 332],
    butt: [158, 312],
  },
  "RED_PANDA": {
    mouth: [272, 333],
    butt: [222, 396],
  },
}

console.log("There are " + Object.keys(animals).length + " different animals available!");

omnivores = [
  "BROWN_BEAR", "BLACK_BEAR", "POLAR_BEAR", "FOX", "TURTLE",
  "PARROT", "MOUSE", "DOG", "PIG", "RED_PANDA", "BABOON",
]
carnivores = [
  "LION", "OTTER", "TIGER", "ALLIGATOR", "CHEETAH", "SNAKE", "PANTHER", "CAT", "SEAL",
]
bamboovores = [
  "PANDA_BEAR"
]

animated_animals = {
  "PARROT":0,
}


//
// There are three movement types. The standard is to bounce.
// The first alternate is to fly.
// The second alternate is to undulate.
//


for (const [name, data] of Object.entries(animals)) {
  if (!("land" in data)) data["land"] = "grass";
  if (!("decorations" in data)) data["decorations"] = ["grass", "grass", "rock", "grass", "tree", "bush", "rock"];
  if (!("movement" in data)) data["movement"] = "bounce";
  if (!("last_sound" in data)) data["last_sound"] = null;
  if (!("sound_delay" in data)) data["sound_delay"] = 500;
  if (!("sound" in data)) data["sound"] = name.toLowerCase();
}


let animal_scale = 0.66;


Game.prototype.makeAnimal = function(animal_type, pen) {
  let self = this;

  let animal = new PIXI.Container();

  animal.pen = pen;
  animal.type = animal_type;

  animal.sprite = null;
  if (!(animal.type in animated_animals)) {
    animal.sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + animal.type.toLowerCase() + ".png"));
  } else {
    var sheet = PIXI.Loader.shared.resources["Art/Animals/" + animal.type.toLowerCase() + ".json"].spritesheet;
    animal.sprite = new PIXI.AnimatedSprite(sheet.animations[animal.type.toLowerCase()]);
  }
  animal.sprite.scale.set(animal_scale, animal_scale);
  animal.sprite.anchor.set(0.5,0.75);

  animal.addChild(animal.sprite);

  animal.movement = animals[animal.type].movement;



  // if (pen.land == "water") {
  //   animal.water_fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
  //   animal.water_fill.width = 192 * animal_scale;
  //   animal.water_fill.height = 100 * animal_scale;
  //   animal.water_fill.tint = water_color;
  //   animal.water_fill.anchor.set(0.5,1);
  //   animal.water_fill.position.set(0,90*animal_scale);
  //   animal.addChild(animal.water_fill);
  // }

  if (pen.land == "water" || pen.land == "watergrass" || pen.land == "waterice") {
    animal.water_mask = new PIXI.Graphics();
    animal.water_mask.beginFill(water_color);
    animal.water_mask.drawRect(-128, -5, 256, -384);
    animal.water_mask.endFill();
    animal.addChild(animal.water_mask);
    if (pen.land == "water") {
      animal.mask = animal.water_mask;
      animal.water_mask.visible = true;
    } else {
      animal.water_mask.visible = false;
    }
  }

  animal.delay = 0;
  animal.delay_time = null;

  animal.vx = 2.4;
  animal.vy = 0;
  animal.direction = 1;

  animal.land_speed = 2.4;
  animal.land_angle = (Math.random() * 360) * Math.PI / 180;

  if (animal.type == "CHEETAH") animal.land_speed = 4.8;
  if (animal.type == "GAZELLE") animal.land_speed = 4.8;

  animal.undulation_counter = 0;

  animal.animated = this.markTime();

  animal.eating = false;
  animal.eating_time = this.markTime();

  animal.update = function() {

    for (let j = 0; j < self.foods.length; j++) {
      let food = self.foods[j];
      if (food.status == "ground" && (animal.movement != "fly" || animal.sprite.y == 0) &&
        distance(animal.x, animal.y + animal.sprite.y, food.x, food.y) < 70) {
        animal.delay = 500 + 2000 * Math.random();
        animal.delay_time = self.markTime();
        animal.food_target = food;
        if (animal.type in animated_animals) animal.sprite.gotoAndStop(0);

        if (self.timeSince(animal.eating_time) > 500) {
          // take a bite!
          animal.eating_time = self.markTime();
          self.soundEffect("chomp_" + Math.ceil(Math.random() * 2));
          console.log(food.currentFrame);
          if (food.currentFrame < 2) {
            food.gotoAndStop(food.currentFrame + 1);
          } else if (food.currentFrame == 2) {
            food.status = "dead";
            food.visible = false;
          }
          animal.shake = self.markTime();

          let b = animal.global_mouth_coords();
      
          let food_shard = new PIXI.Graphics();
          if (food.type == "greens") {
            food_shard.beginFill(greens_color);
          } else if (food.type == "steak") {
            food_shard.beginFill(steak_color);
          } else if (food.type == "fruit") {
            food_shard.beginFill(fruit_color);
          }
          
          food_shard.drawPolygon([
            -3, -3 - 100,
            2 + 2 * Math.random(), -2 - 2 * Math.random() - 100,
            2 + 2 * Math.random(), 2 + 2 * Math.random() - 100,
            -2 - 2 * Math.random(), 2 + 2 * Math.random() - 100,
            -3, -3 - 100,
          ]);
          food_shard.position.set(b[0], b[1] + 100);
          food_shard.endFill();

          food_shard.vx = -1 - 1.5 * Math.random();
          if (animal.direction < 0) food_shard.vx *= -1;
          food_shard.vy = 0;
          food_shard.gravity = 1;
          food_shard.floor = b[1] + 50 + 100;
          food_shard.parent = self.map.decoration_layer;
          self.map.decoration_layer.addChild(food_shard);
          self.decorations.push(food_shard);

          self.drops.push(food_shard);

          delay(function() {
            food_shard.parent.removeChild(food_shard);
            food_shard.status = "dead";
          }, 500);

        }

        break;
      }
    }

    if (animal.delay > 0 && self.timeSince(animal.delay_time) > animal.delay) {
      animal.delay = 0;
      animal.delay_time = null;
    }

    if (animals[animal.type].last_sound == null || self.timeSince(animals[animal.type].last_sound) > animals[animal.type].sound_delay) {
      if (distance(self.player.x, self.player.y, animal.pen.cx, animal.pen.cy) < 480) {
        if (Math.random() > 0.65) {
          self.soundEffect(animals[animal.type].sound);
          animals[animal.type].sound_delay = 2000 + Math.random() * 10000;
          animals[animal.type].last_sound = self.markTime();
        }
      }
    }

    if (animal.delay == 0 && animal.eating == false) {
      
      if (animal.movement == "bounce") {
        //animal.sprite.x += animal.vx;
        animal.sprite.y += animal.vy;
        animal.y += animal.land_speed * Math.sin(animal.land_angle);
        animal.x += animal.land_speed * Math.cos(animal.land_angle);

        if (Math.cos(animal.land_angle) < 0) {
          animal.direction = -1;
          animal.sprite.scale.set(-animal_scale, animal_scale);
        } else {
          animal.direction = 1;
          animal.sprite.scale.set(animal_scale, animal_scale);
        }

        let outside = false;
        for (let a = 0; a < 360; a += 45) {
          let p = [animal.x + 42 * Math.cos(a * Math.PI / 180), animal.y + 42 * Math.sin(a * Math.PI / 180)];
          if(!pointInsidePolygon(p, pen.polygon)) {
            outside = true;
          }
        }
        if (outside) {
          animal.y -= animal.land_speed * Math.sin(animal.land_angle);
          animal.x -= animal.land_speed * Math.cos(animal.land_angle);

          animal.land_angle = (Math.random() * 360) * Math.PI / 180;          
        }

        if (animal.sprite.y >= 0) {
          animal.vy = -3.6;
          animal.sprite.y = 0;

          if(Math.random() < 0.05) {
            animal.delay = 500 + 2000 * Math.random();
            animal.delay_time = self.markTime();

            if (animal.type in animated_animals) animal.sprite.gotoAndStop(0);

            if (Math.random() < 0.5) {
              animal.land_angle = (Math.random() * 360) * Math.PI / 180;
            }
          }

          if (Math.random() > 0.5) {
            if (pen.land == "water" 
              || (pen.land == "watergrass" && animal.x > pen.cx)
              || (pen.land == "waterice" && animal.x > pen.cx)) {
              let droplet = new PIXI.Sprite(PIXI.Texture.from("Art/water_droplet.png"));
              droplet.scale.set(animal_scale * 0.75);
              droplet.anchor.set(0.5,0.5);
              droplet.position.set(animal.sprite.x, animal.sprite.y - 1);
              droplet.vx = -2 + 4 * Math.random();
              droplet.vy = -3 + -2 * Math.random();
              droplet.gravity = 1;
              droplet.floor = 10;
              animal.addChild(droplet);
              self.freefalling.push(droplet);
            }
          }
        } else {
          animal.vy += 0.6;
        }
      }


      if (animal.movement == "undulate") {
        //animal.sprite.x += animal.vx;
        animal.y += animal.land_speed * Math.sin(animal.land_angle);
        animal.x += animal.land_speed * Math.cos(animal.land_angle);

        if (Math.cos(animal.land_angle) < 0) {
          animal.direction = -1;
          animal.sprite.scale.set(-animal_scale, animal_scale);
        } else {
          animal.direction = 1;
          animal.sprite.scale.set(animal_scale, animal_scale);
        }

        let outside = false;
        for (let a = 0; a < 360; a += 45) {
          let p = [animal.x + 42 * Math.cos(a * Math.PI / 180), animal.y + 42 * Math.sin(a * Math.PI / 180)];
          if(!pointInsidePolygon(p, pen.polygon)) {
            outside = true;
          }
        }
        if (outside) {
          animal.y -= animal.land_speed * Math.sin(animal.land_angle);
          animal.x -= animal.land_speed * Math.cos(animal.land_angle);

          animal.land_angle = (Math.random() * 360) * Math.PI / 180;          
        }

        animal.undulation_counter += 1;

        animal.sprite.y = 3 * Math.sin(Math.PI * animal.undulation_counter / 16);

        if (Math.abs(animal.sprite.y) < 0.0005) {
          if(Math.random() < 0.1) {
            animal.delay = 700 + 3000 * Math.random();
            animal.delay_time = self.markTime();

            if (animal.type in animated_animals) animal.sprite.gotoAndStop(0);

            if (Math.random() < 0.5) {
              animal.land_angle = (Math.random() * 360) * Math.PI / 180;
            }
          }
        }
      }


      if (animal.movement == "fly") {
        animal.sprite.x += animal.vx;
        animal.sprite.y += animal.vy;

        if (animal.sprite.y >= 0) {
          
          if(Math.random() < 0.5) {
            animal.delay = 500 + 2000 * Math.random();
            animal.delay_time = self.markTime();

            animal.sprite.y = 0;
            animal.vy = 0;

            if (animal.type in animated_animals) animal.sprite.gotoAndStop(0);
          } else {
            animal.sprite.y -= 18;
            animal.vy = -1.8;
          }
        } else {
          // fliers are always animated
          if (self.timeSince(animal.animated) > walk_frame_time) {
            if (animal.sprite.currentFrame == 0) {
              animal.sprite.gotoAndStop(1);
              // animal.vy -= (0.5 + 0.55 * Math.random())
            } else if (animal.sprite.currentFrame == 1) {
              animal.sprite.gotoAndStop(0);
              // animal.vy -= (0.2 + 0.3 * Math.random())
            }
            animal.animated = self.markTime();
          }

          animal.vy += -0.6 + Math.random() * 1.2;
          if (animal.sprite.y < -300) {
            animal.vy += 0.6;
          }
        }

        if (animal.vx > 0 && animal.sprite.x >= 120) {
          animal.direction = -1;
          animal.vx *= -1;
          animal.sprite.scale.set(-animal_scale, animal_scale);
        } else if (animal.vx < 0 && animal.sprite.x <= -120) {
          animal.direction = 1;
          animal.vx *= -1;
          animal.sprite.scale.set(animal_scale, animal_scale);
        }
      }
      



      // if (animal.water_fill != null) {
      //   animal.water_fill.x = animal.sprite.x;
      // }

      if ((animal.water_mask != null) && 
        (pen.land == "water" || (pen.land == "watergrass" && animal.x > pen.cx) 
          || (pen.land == "waterice" && animal.x > pen.cx))) {
        animal.mask = animal.water_mask;
        animal.water_mask.visible = true;
      } else if (animal.water_mask != null) {
        animal.mask = null;
        animal.water_mask.visible = false;
      }
    }



  }

  animal.global_butt_coords = function() {
    // Find coords (say for a mouth or a butt) relative to the
    // anchor point (0.5, 0.75) in a 512x512 animal sprite
    let butt = animals[animal.type].butt;
    if (animal.direction >= 0) return [animal.x + animal_scale * (animal.sprite.x + butt[0] - 256), animal.y + animal_scale * (animal.sprite.y + butt[1] - 384)];
    if (animal.direction < 0) return [animal.x + animal_scale * (animal.sprite.x + 256 - butt[0]), animal.y + animal_scale * (animal.sprite.y + butt[1] - 384)];
  }

  animal.global_mouth_coords = function() {
    // Find coords (say for a mouth or a butt) relative to the
    // anchor point (0.5, 0.75) in a 512x512 animal sprite
    let mouth = animals[animal.type].mouth;
    if (animal.direction >= 0) return [animal.x + animal_scale * (animal.sprite.x + mouth[0] - 256), animal.y + animal_scale * (animal.sprite.y + mouth[1] - 384)];
    if (animal.direction < 0) return [animal.x + animal_scale * (animal.sprite.x + 256 - mouth[0]), animal.y + animal_scale * (animal.sprite.y + mouth[1] - 384)];
  }

  return animal;
}