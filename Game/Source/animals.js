
//
// The animal class makes animals and governs their behavior. This file also
// contains lists of animal properties such as diet, land type, behavior type, etc.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

animals = {
  "LION": {
    mouth: [304, 326],
    butt: [193, 350],
    food: "carnivore",
  },
  "HIPPO": {
    land: "grass",
    pond: "large",
    mouth: [320, 344],
    butt: [166, 335],
    food: "herbivore",
  },
  "RHINO": {
    land: "sand",
    mouth: [307, 355],
    butt: [179, 337],
    food: "herbivore",
  },
  "TURTLE": {
    land: "grass",
    pond: "large",
    mouth: [314, 351],
    butt: [196, 372],
    speed: 0.6,
    food: "omnivore",
  },
  "OTTER": {
    land: "rock",
    pond: "large",
    terrace: true,
    mouth: [303, 333],
    butt: [221, 405],
    min: 2,
    food: "carnivore",
  },
  "GORILLA": {
    mouth: [284, 307],
    butt: [191, 345],
    land: "forest",
    food: ["greens", "fruit"],
  },
  "CHIMPANZEE": {
    mouth: [256, 322],
    butt: [253, 391],
    min: 2,
    max: 4,
    food: "omnivore",
  },
  "BABOON": {
    land: "sand",
    mouth: [288, 328],
    butt: [192, 350],
    food: "omnivore",
  },
  "GIRAFFE": {
    mouth: [332, 198],
    pond: "small",
    butt: [168, 319],
    food: "herbivore",
  },
  "ZEBRA": {
    mouth: [317, 318],
    butt: [183, 342],
    pond: "small",
    food: "herbivore",
  },
  "HORSE": {
    mouth: [316, 347],
    butt: [179, 334],
    pond: "small",
    food: "herbivore",
  },
  "ELEPHANT": {
    land: "sand",
    pond: "small",
    mouth: [311, 307],
    butt: [167, 328],
    food: "herbivore",
  },
  "TIGER": {
    mouth: [316, 339],
    butt: [192, 354],
    food: "carnivore",
  },
  "CHEETAH": {
    mouth: [311, 342],
    butt: [194, 356],
    speed: 2,
    food: "carnivore",
  },
  "LYNX": {
    sound: "zebra",
    mouth: [307, 345],
    butt: [200, 355],
    food: "carnivore",
  },
  "PANTHER": {
    mouth: [313, 339],
    butt: [194, 359],
    food: "carnivore",
  },
  "DOG": {
    mouth: [292, 328],
    butt: [204, 348],
    food: "omnivore",
  },
  "WOLF": {
    mouth: [297, 320],
    butt: [200, 351],
    land: "forest",
    food: "carnivore",
  },
  "CAT": {
    mouth: [292, 321],
    butt: [204, 342],
    food: "carnivore",
  },
  "MOUSE": {
    mouth: [262, 341],
    butt: [242, 392],
    food: "omnivore",
  },
  "BROWN_BEAR": {
    sound: "bear",
    pond: "any",
    terrace: true,
    mouth: [314, 327],
    butt: [188, 338],
    land: "forest",
    food: "omnivore",
  },
  "BLACK_BEAR": {
    sound: "bear",
    pond: "small",
    terrace: true,
    mouth: [314, 327],
    butt: [188, 338],
    land: "forest",
    food: "omnivore",
  },
  "POLAR_BEAR": {
    land: "ice",
    terrace: true,
    sound: "bear",
    pond: "large",
    mouth: [314, 327],
    butt: [188, 338],
    food: ["steak", "fish"],
  },
  "PENGUIN": {
    land: "ice",
    terrace: true,
    pond: "large",
    mouth: [258, 341],
    butt: [257, 392],
    min: 3,
    max: 5,
    food: ["fish"],
  },
  "SEAL": {
    land: "ice",
    pond: "large",
    mouth: [299, 344],
    butt: [200, 382],
    food: ["fish"],
  },
  "PANDA_BEAR": {
    mouth: [314, 327],
    butt: [188, 338],
    food: ["bamboo"],
    land: "forest",
  },
  "FOX": {
    mouth: [279, 329],
    butt: [226, 395],
    food: "omnivore",
  },
  "ALLIGATOR": {
    land: "grass",
    pond: "large",
    mouth: [354, 364],
    butt: [165, 392],
    speed: 0.6,
    food: "carnivore",
  },
  "PARROT": {
    movement: "fly",
    mouth: [264, 324],
    butt: [235, 386],
    food: "omnivore",
  },
  "OWL": {
    movement: "fly",
    mouth: [261, 297],
    butt: [257, 388],
    food: "carnivore",
  },
  "PEACOCK": {
    mouth: [252, 308],
    butt: [253, 402],
    food: "omnivore",
  },
  "SNAKE": {
    land: "sand",
    movement: "undulate",
    mouth: [371, 383],
    butt: [191, 392],
    food: "carnivore",
  },
  "COW": {
    mouth: [316, 351],
    butt: [180, 327],
    food: "herbivore",
    pond: "small",
  },
  "YAK": {
    mouth: [316, 352],
    butt: [175, 344],
    terrace: "rock",
    food: "herbivore",
  },
  "CAPYBARA": {
    land: "sand",
    pond: "any",
    mouth: [281, 342],
    butt: [183, 376],
    food: "herbivore",
  },
  "PIG": {
    land: "sand",
    pond: "small",
    mouth: [313, 354],
    butt: [178, 319],
    food: "omnivore",
  },
  "WARTHOG": {
    land: "sand",
    pond: "small",
    mouth: [313, 354],
    butt: [178, 319],
    food: "herbivore",
    sound: "pig",
  },
  "ANTEATER": {
    land: "grass",
    terrace: "sand",
    mouth: [372, 325],
    butt: [203, 351],
    food: ["micro"],
  },
  "SHEEP": {
    mouth: [312, 349],
    butt: [181, 334],
    food: "herbivore",
  },
  "BIGHORN_SHEEP": {
    mouth: [327, 333],
    butt: [177, 317],
    food: "herbivore",
    terrace: "rock",
    land: "grass",
  },
  "DEER": {
    mouth: [317, 327],
    butt: [192, 332],
    land: "forest",
    food: "herbivore",
  },
  "GAZELLE": {
    mouth: [317, 327],
    butt: [192, 332],
    speed: 2,
    food: "herbivore",
  },
  "ELK": {
    sound: "deer",
    mouth: [314, 324],
    butt: [174, 333],
    land: "forest",
    food: "herbivore",
  },
  "MOOSE": {
    mouth: [325, 332],
    butt: [158, 312],
    land: "forest",
    food: "herbivore",
  },
  "RED_PANDA": {
    mouth: [272, 333],
    butt: [222, 396],
    food: "omnivore",
    land: "forest",
    // TO DO: arboreal red panda!
  },
  "KANGAROO": {
    mouth: [273, 295],
    butt: [217, 395],
    food: "herbivore",
  },
  "MEERKAT": {
    mouth: [266, 330],
    butt: [240, 398],
    land: "sand",
    terrace: true,
    min: 3,
    max: 5,
    food: "omnivore",
  },
  "RACCOON": {
    mouth: [305, 354],
    butt: [195, 362],
    land: "forest",
    sound: "capybara",
    food: "omnivore",
  },
  "CAMEL": {
    mouth: [343, 291],
    butt: [183, 363],
    land: "sand",
    pond: "small",
    food: "herbivore",
  },
  "GOAT": {
    mouth: [314, 329],
    butt: [187, 331],
    terrace: "rock",
    land: "sand",
    food: "herbivore",
  },
  "RABBIT": {
    mouth: [248, 343],
    butt: [249, 406],
    min: 2,
    max: 4,
    food: "herbivore",
  },
  "BEAVER": {
    mouth: [260, 316],
    butt: [229, 390],
    pond: "any",
    land: "forest",
    sound: "capybara",
    food: "herbivore",
  },
  "ALPACA": {
    mouth: [306, 256],
    butt: [172, 319],
    food: "herbivore",
  },
  "LLAMA": {
    mouth: [308, 240],
    butt: [177, 336],
    terrace: "rock",
    sound: "llama",
    food: "herbivore",
  },
  "KOALA": {
    mouth: [253, 331],
    butt: [[250, 411], [250, 411]],
    land: "forest",
    food: "herbivore",
    speed: 0.6,
    movement: "arboreal",
    min: 2,
    max: 4,
    tree_time: 9000,
  },
  "SLOTH": {
    mouth: [222, 346],
    butt: [[293, 328], [281, 415]],
    land: "forest",
    food: "herbivore",
    speed: 0.25,
    movement: "arboreal",
    min: 1,
    max: 3,
    tree_time: 14000,
  },
  "LEMUR": {
    mouth: [280, 326],
    butt: [[195, 346], [277, 410]],
    land: "forest",
    food: "omnivore",
    movement: "arboreal",
    min: 2,
    max: 4,
    tree_time: 7000,
  },
  "ORANGUTAN": {
    mouth: [258, 308],
    butt: [[255, 362], [262, 370]],
    land: "forest",
    food: "omnivore",
    movement: "arboreal",
    tree_time: 9000,
  },
  "OSTRICH": {
    mouth: [308, 211],
    butt: [228, 344],
    land: "sand",
    food: "herbivore",
    speed: 1.6,
  },
  "FLAMINGO": {
    mouth: [320, 234],
    butt: [220, 326],
    land: "grass",
    pond: "large",
    food: ["micro"],
    speed: 0.4,
    min: 3,
    max: 6,
  },
  "SWAN": {
    mouth: [321, 287],
    butt: [218, 382],
    land: "water",
    food: "herbivore",
    speed: 0.8,
    movement: "undulate",
  },
  "DUCK": {
    mouth: [314, 307],
    butt: [229, 382],
    land: "grass",
    pond: "large",
    food: ["fish", "micro", "greens"],
    min: 2,
    max: 5,
  },
  "CHICKEN": {
    mouth: [286, 311],
    butt: [219, 369],
    land: "grass",
    food: ["micro"],
    min: 3,
    max: 6,
    variations: 2,
  },
  "GOOSE": {
    mouth: [334, 267],
    butt: [219, 373],
    land: "grass",
    pond: "large",
    food: ["micro", "greens"],
    min: 2,
    max: 5,
  },
  "FROG": {
    mouth: [258, 355],
    butt: [217, 387],
    land: "forest",
    food: ["micro"],
    min: 3,
    max: 6,
    variations: 5,
  },
}


//
// Diet is a complicated thing to portray.
// While broadly all animals can be sorted into the Carnivore, Herbivore and Omnivore buckets,
// in reality there are some edge cases, as well as some strong tendencies that create tension
// between what's technically correct and what looks realistic. I'm choosing to err on the side
// of realism. So, for instance, while the Polar Bear is technically an omnivore,
// in practice it eats a mostly meat diet, and I'm putting it in Carnivore for now.
//


console.log("There are " + Object.keys(animals).length + " different animals available!");
// console.log(Object.keys(animals));

section_savannah = [
  "HIPPO", "RHINO", "GIRAFFE", "ZEBRA", "ELEPHANT", "GAZELLE", "MEERKAT", "WARTHOG", "ANTEATER",
]

section_desert_special = [
  "CAMEL"
]

section_cats = [
  "LION", "TIGER", "CHEETAH", "LYNX", "PANTHER", 
]

section_primates = [
  "GORILLA", "BABOON", "CHIMPANZEE", "LEMUR", "ORANGUTAN",
]

section_north_and_water = [
  "POLAR_BEAR", "SEAL", "BLACK_BEAR", "BROWN_BEAR", "MOOSE", "ELK", "DEER",
  "YAK", "OTTER", "WOLF", "FOX", "PENGUIN", "RACCOON", "BEAVER", "BIGHORN_SHEEP"
]

section_starter_and_farm = [
  "CAT", "DOG", "COW", "SHEEP", "PIG", "HORSE", "GOAT", "RABBIT", "ALPACA", "LLAMA", "CHICKEN",
]

section_east_asia_south_america = [
  "PANDA_BEAR", "RED_PANDA", "KANGAROO", "KOALA", "SLOTH", "OSTRICH",
]

section_birds_reptiles_amphibians_and_rodents = [
  "TURTLE", "MOUSE", "ALLIGATOR", "PARROT", "OWL", "SNAKE", "CAPYBARA", "PEACOCK", "FLAMINGO", "SWAN", "DUCK", "GOOSE", "FROG",
]


// Current sections
let section = [];
makeSections = function() {
  section = [];
  section[0] = section_savannah.concat(section_cats, section_primates, section_desert_special);
  section[1] = section_north_and_water.concat(section_east_asia_south_america);
  section[2] = section_starter_and_farm.concat(section_birds_reptiles_amphibians_and_rodents);
}

animated_animals = {
  "PARROT":0,
  "OWL":0,
  "PEACOCK":0,
}


let animal_scale = 0.66;
let land_speed_factor = 2.4;

let arboreal_jump_distance = 200;

let tree_touch_points = {};
tree_touch_points["KOALA"] = [];
tree_touch_points["KOALA"][1] = [[-21, 107+18], [-23, 55+18], [-20, 123+18], [-47, 91+18], [31, 55+18], [26, 113+18], [67, 86+18],];
tree_touch_points["KOALA"][2] = [[35, 23+18],];
tree_touch_points["KOALA"][3] = [[31, 30+18], [48, 126+18], [20, 145+18],[-28, 106+18], [-29, 35+18], [-31, 51+18],];

tree_touch_points["SLOTH"] = [];
tree_touch_points["SLOTH"][1] = [[26, 80+18], [29, 38+18], [50, 96+18],[-25, 100+18], [-46, 63+18],];
tree_touch_points["SLOTH"][2] = [[75, 62+18],];
tree_touch_points["SLOTH"][3] = [[-24, 25+18], [-34, 112+18], [47, 84+18], [29, 75+18],];

tree_touch_points["LEMUR"] = [];
tree_touch_points["LEMUR"][1] = [[51, 106+18], [-39, 113+18],];
tree_touch_points["LEMUR"][2] = [];
tree_touch_points["LEMUR"][3] = [[63, 151+18], [-34, 180+18], [-45, 90+18],];

tree_touch_points["ORANGUTAN"] = [];
tree_touch_points["ORANGUTAN"][1] = [[-59, 37+18], [-24, 22+18], [82, 39+18], [28, 37+18],];
tree_touch_points["ORANGUTAN"][2] = [[102, 2+18],];
tree_touch_points["ORANGUTAN"][3] = [[-24, 22+18], [-68, 55+18], [27, 54+18], [98, 27+18], [60, 29+18],];





for (const [name, data] of Object.entries(animals)) {
  if (!("land" in data)) data["land"] = "grass";
  if (!("pond" in data)) data["pond"] = false;
  if (!("terrace" in data)) data["terrace"] = false;
  if (!("movement" in data)) data["movement"] = "bounce";
  if (!("last_sound" in data)) data["last_sound"] = null;
  if (!("sound_delay" in data)) data["sound_delay"] = 500;
  if (!("sound" in data)) data["sound"] = name.toLowerCase();
  if (!("speed" in data)) data["speed"] = 1;
  if (!("min" in data)) data["min"] = 1;
  if (!("max" in data)) data["max"] = 3;
  if (!("variations" in data)) data["variations"] = 1;
  if ("food" in data && data["food"] == "herbivore") data["food"] = ["greens"];
  if ("food" in data && data["food"] == "omnivore") data["food"] = ["steak", "greens", "fruit"];
  if ("food" in data && data["food"] == "carnivore") data["food"] = ["steak"]; 
}





Game.prototype.makeAnimal = function(animal_type, pen) {
  let self = this;

  let animal = new PIXI.Container();
  animal.height_container = new PIXI.Container();
  animal.addChild(animal.height_container);

  animal.pen = pen;
  animal.type = animal_type;

  animal.animated = (animal.type in animated_animals);

  animal.sprite = null;
  let filename = animal.type.toLowerCase();
  if (animals[animal_type].variations > 1) filename += "_" + Math.ceil(Math.random() * animals[animal_type].variations);
  if (!animal.animated && animals[animal.type].movement != "arboreal") {
    animal.sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + filename + ".png"));
  } else {
    var sheet = PIXI.Loader.shared.resources["Art/Animals/" + filename + ".json"].spritesheet;
    animal.sprite = new PIXI.AnimatedSprite(sheet.animations[filename]);
  }
  animal.sprite.scale.set(animal_scale, animal_scale);
  animal.sprite.anchor.set(0.5,0.75);

  animal.height_container.addChild(animal.sprite);

  animal.movement = animals[animal.type].movement;

  if (animal.movement == "arboreal") {
    animal.arboreal_state = "on_ground";
    animal.last_arboreal = self.markTime();
    animal.arboreal_duration = 0;
  }

  if (pen.land == "water" || pen.pond != null) {
    animal.water_mask = new PIXI.Graphics();
    animal.water_mask.beginFill(water_color);
    animal.water_mask.drawRect(-128, -5, 256, -384);
    animal.water_mask.endFill();
    animal.height_container.addChild(animal.water_mask);
    if (pen.land == "water") {
      animal.mask = animal.water_mask;
      animal.water_mask.visible = true;
      animal.height_container.y = 20;
    } else {
      animal.water_mask.visible = false;
      animal.height_container.y = 0;
    }
  }

  animal.delay = 0;
  animal.delay_time = null;

  animal.vx = land_speed_factor * animals[animal.type].speed;
  animal.vy = 0;
  animal.direction = 1;

  animal.land_angle = (Math.random() * 360) * Math.PI / 180;

  animal.land_speed = land_speed_factor * animals[animal.type].speed;

  // if (animal.type == "CHEETAH") animal.land_speed = 4.8;
  // if (animal.type == "GAZELLE") animal.land_speed = 4.8;

  animal.undulation_counter = 0;
  animal.last_animated = this.markTime();

  animal.eating = false;
  animal.eating_time = this.markTime();
  animal.eating_target = null;

  animal.update = function() {

    animal.eating_target = null;
    for (let j = 0; j < self.foods.length; j++) {
      let food = self.foods[j];
      if (food.status == "ground" && food.animal_target == animal.type) {
        animal.eating_target = food;
      }
    }

    for (let j = 0; j < self.foods.length; j++) {
      let food = self.foods[j];
      if (food.status == "ground" && (animal.movement != "fly" || animal.sprite.y == 0) &&
        distance(animal.x, animal.y + animal.sprite.y, food.x, food.y) < 70) {
        animal.delay = 500 + 2000 * Math.random();
        animal.delay_time = self.markTime();
        // animal.food_target = food;
        if (animal.animated) animal.sprite.gotoAndStop(0);

        if (self.timeSince(animal.eating_time) > 500) {
          // take a bite!
          animal.eating_time = self.markTime();
          if (distance(self.player.x, self.player.y, animal.x, animal.y) < 1000) soundEffect("chomp_" + Math.ceil(Math.random() * 2));
          if (food.currentFrame < 2) {
            food.gotoAndStop(food.currentFrame + 1);
          } else if (food.currentFrame == 2) {
            food.status = "dead";
            food.visible = false;
            game.dollar_bucks += 1;
            game.updateAnimalCount();
          }
          animal.shake = self.markTime();

          let b = animal.global_mouth_coords();
      
          let food_shard = new PIXI.Graphics();
          if (food.type == "greens" || food.type == "bamboo") {
            food_shard.beginFill(greens_color);
          } else if (food.type == "steak" || food.type == "fish" || food.type == "micro") {
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

    if (animal.movement == "arboreal" && animal.arboreal_state == "in_tree" 
      && self.timeSince(animal.last_arboreal) > animal.arboreal_duration) {
      
      if (distance(animal.x, animal.y, self.player.x, self.player.y) < 1000) soundEffect("tree_shake");
      animal.tree.shake = self.markTime();
      animal.sprite.gotoAndStop(0);
      animal.arboreal_duration = 0;
      animal.arboreal_state = "jumping_down";

      new TWEEN.Tween(animal.sprite)
        .to({x: 0, y: 0})
        .duration(300)
        .easing(TWEEN.Easing.Quadratic.In)
        .start()
        .onComplete(function() {
          animal.arboreal_state = "on_ground";
          animal.tree = null;
        });      
    }

    if (animals[animal.type].last_sound == null || self.timeSince(animals[animal.type].last_sound) > animals[animal.type].sound_delay) {
      let px = self.player.x;
      let py = self.player.y;
      if (self.zoo_mode == "train_ride" || self.zoo_mode == "train_control" || self.zoo_mode == "train_fade") {
        px = self.trains[1].x;
        py = self.trains[1].y - 150;
      }
      if (distance(px, py, animal.x, animal.y) < 1000) {
        if (Math.random() > 0.65) {
          soundEffect(animals[animal.type].sound);
          animals[animal.type].sound_delay = 3000 + Math.random() * 11000;
          animals[animal.type].last_sound = self.markTime();
        }
      }
    }

    if (animal.delay == 0 && animal.eating == false) {
      
      if (animal.movement == "bounce" || (animal.movement == "arboreal" && animal.arboreal_state == "on_ground")) {
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

        // animation test for bouncers
        if (animal.animated) {
          if (self.timeSince(animal.last_animated) > walk_frame_time) {
            if (animal.sprite.currentFrame == 0) {
              animal.sprite.gotoAndStop(1);
              // animal.vy -= (0.5 + 0.55 * Math.random())
            } else if (animal.sprite.currentFrame == 1) {
              animal.sprite.gotoAndStop(0);
              // animal.vy -= (0.2 + 0.3 * Math.random())
            }
            animal.last_animated = self.markTime();
          }
        }

        if (animal.sprite.y >= 0) {
          animal.vy = -3.6;
          if (animal.type == "KANGAROO" || animal.type == "FROG") animal.vy = -5;
          if (animal.type == "SLOTH") animal.vy = -2.4;
          animal.sprite.y = 0;

          if(Math.random() < 0.05) {
            animal.delay = 500 + 2000 * Math.random();
            animal.delay_time = self.markTime();

            if (animal.animated) animal.sprite.gotoAndStop(0);

            if (Math.random() < 0.75) animal.maybeJumpIntoATree();

            if (animal.movement != "arboreal" || animal.arboreal_state == "on_ground") {
              animal.maybeChangeDirection();
            }
          }

          if (Math.random() < 0.1) animal.maybeJumpIntoATree();

          if (Math.random() > 0.5) {
            if (pen.land == "water" ||
              (pen.pond != null && pointInsidePolygon([animal.x, animal.y], pen.pond) == true)) {
              let droplet = new PIXI.Sprite(PIXI.Texture.from("Art/water_droplet.png"));
              droplet.scale.set(animal_scale * 0.75);
              droplet.anchor.set(0.5,0.5);
              droplet.position.set(animal.sprite.x, animal.sprite.y - 1);
              droplet.vx = -2 + 4 * Math.random();
              droplet.vy = -3 + -2 * Math.random();
              droplet.gravity = 1;
              droplet.floor = 10;
              animal.height_container.addChild(droplet);
              self.freefalling.push(droplet);
            }
          }
        } else {
          animal.vy += 0.6;
          if (animal.type == "SLOTH") animal.vy -= 0.3;
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

            if (animal.animated) animal.sprite.gotoAndStop(0);

            animal.maybeChangeDirection();
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

            if (animal.animated) animal.sprite.gotoAndStop(0);
          } else {
            animal.sprite.y -= 18;
            animal.vy = -1.8;
          }
        } else {
          // fliers are always animated
          if (self.timeSince(animal.last_animated) > walk_frame_time) {
            if (animal.sprite.currentFrame == 0) {
              animal.sprite.gotoAndStop(1);
              // animal.vy -= (0.5 + 0.55 * Math.random())
            } else if (animal.sprite.currentFrame == 1) {
              animal.sprite.gotoAndStop(0);
              // animal.vy -= (0.2 + 0.3 * Math.random())
            }
            animal.last_animated = self.markTime();
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

      animal.height_container.y = 0;
      if ((animal.water_mask != null) && 
        (pen.land == "water" || (pen.pond != null && pointInsidePolygon([animal.x, animal.y], pen.pond) == true))) {
        animal.mask = animal.water_mask;
        animal.water_mask.visible = true;
        animal.height_container.y = 20;
      } else if (animal.water_mask != null) {
        animal.mask = null;
        animal.water_mask.visible = false;
        animal.height_container.y = 0;
      }

      if (pen.terrace != null && pen.terrace.length > 0) {
        let height = 0;
        for (let k = 0; k < pen.terrace.length; k++) {
          let terrace = pen.terrace[k];
          if (pointInsidePolygon([animal.x, animal.y], terrace)) {
            height += edging_depth;
          }
        }
        animal.height_container.y -= height;
      }
    }
  }

  animal.maybeChangeDirection = function() {
    let dice = Math.random();

    if ((animal.eating_target == null && dice < 0.5)
      || (animal.eating_target != null && dice < 0.25)) {
      animal.land_angle = (Math.random() * 360) * Math.PI / 180;
    } else if (animal.eating_target != null && dice >= 0.25 && dice < 0.75) {
      animal.land_angle = Math.atan2(animal.eating_target.position.y - animal.y, animal.eating_target.position.x - animal.x);
    }
  }

  animal.maybeJumpIntoATree = function() {
    if (animal.movement == "arboreal" && animal.arboreal_state == "on_ground") {
      contact_points = [];
      for (let p = 0; p < animal.pen.decoration_objects.length; p++) {
        let decoration = animal.pen.decoration_objects[p];
        if (decoration.type == "tree" 
          && distance(decoration.x, decoration.y, animal.x, animal.y) < arboreal_jump_distance
          && Math.abs(decoration.x - animal.x) < Math.abs(decoration.y - animal.y) * 0.9
          && animal.y < decoration.y + 80) {
          for (let c = 0; c < tree_touch_points[animal.type][decoration.tree_number].length; c++) { // hey, c++
            let cling_point = tree_touch_points[animal.type][decoration.tree_number][c];
            if ((cling_point[0] > 0 && animal.x > decoration.x)
              || (cling_point[0] < 0 && animal.x < decoration.x)) {
              contact_points.push([decoration, cling_point[0], cling_point[1]]);
            }
          }
        }
      }

      if (contact_points.length > 0) {
        let contact_point = pick(contact_points);
        animal.arboreal_state = "in_tree";
        if (distance(animal.x, animal.y, self.player.x, self.player.y) < 1000) soundEffect("jump");
        animal.last_arboreal = self.markTime();
        animal.arboreal_duration = 3000 + Math.random() * animals[animal.type].tree_time;
        animal.tree = contact_point[0];

        animal.sprite.gotoAndStop(1);
        if (contact_point[1] > 0) {
          animal.direction = -1;
          animal.sprite.scale.set(-animal_scale, animal_scale);
        } else {
          animal.direction = 1;
          animal.sprite.scale.set(animal_scale, animal_scale);
        }

        new TWEEN.Tween(animal)
          .to({x: contact_point[0].x, y: contact_point[0].y + 5})
          .duration(300)
          .easing(TWEEN.Easing.Quadratic.In)
          .start();
        new TWEEN.Tween(animal.sprite)
          .to({x: contact_point[1], y: -1 * contact_point[2] - 5})
          .duration(300)
          .easing(TWEEN.Easing.Quadratic.In)
          .start()
          .onComplete(function() {
            if (distance(animal.x, animal.y, self.player.x, self.player.y) < 1000) soundEffect("tree_shake");
            contact_point[0].shake = self.markTime();
          });
      }
    }
  }

  animal.global_butt_coords = function() {
    // Find coords (say for a mouth or a butt) relative to the
    // anchor point (0.5, 0.75) in a 512x512 animal sprite
    let butt = animals[animal.type].butt;
    if (animal.movement == "arboreal") {
      butt = animals[animal.type].butt[animal.sprite.currentFrame];
    }
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


  // The "visible" property is used by the system, and I need several different things to feed into it,
  // such as culling, and whether something should be hidden from view.
  // So I've made hidden and culled into properties that can be controlled independently.
  animal.hidden = false;
  animal.culled = false;

  animal.computeVisibility = function() {
    if (animal.hidden || animal.culled) {
      animal.visible = false;
    } else {
      animal.visible = true;
    }
  }

  animal.hide = function() {
    animal.hidden = true;
    animal.computeVisibility();
  }

  animal.show = function() {
    animal.hidden = false;
    animal.computeVisibility();
  }

  animal.computeCulling = function(x, y) {
    if(game.map_visible == true || (Math.abs(x - animal.x) < 900 && Math.abs(y - (animal.y - 128)) < 700)) {
      animal.culled = false;
    } else {
      animal.culled = true;
    }
    animal.computeVisibility();
  }

  return animal;
}