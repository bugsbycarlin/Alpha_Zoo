

animals = {
  "LION": {},
  "HIPPO": {
    land: "watergrass",
    decorations: ["rock", "grass"],
  },
  "RHINO": {
    land: "sand",
  },
  "TURTLE": {
    land: "watergrass",
    decorations: ["rock", "grass"],
  },
  "OTTER": {
    land: "water", // should be water rock, with a tiered rock
    decorations: ["rock", "grass"],
  },
  "GORILLA": {},
  "GIRAFFE": {},
  "ZEBRA": {},
  "ELEPHANT": {
    land: "sand",
  },
  "TIGER": {},
  "CHEETAH": {},
  "PANTHER": {},
  "DOG": {},
  "BROWN_BEAR": {
    sound: "bear"
  },
  "BLACK_BEAR": {
    sound: "bear"
  },
  "POLAR_BEAR": {
    land: "waterice",
    decorations: ["rock", "rock"],
    sound: "bear"
  },
  "PANDA_BEAR": {},
  "FOX": {},
  "ALLIGATOR": {
    land: "watergrass",
    decorations: ["rock", "grass"],
  },
  "PARROT": {
    movement: "fly"
  },
  "SNAKE": {
    movement: "undulate"
  }
}

console.log("There are " + Object.keys(animals).length + " different animals available!");

omnivores = [
  "BROWN_BEAR", "BLACK_BEAR", "POLAR_BEAR", "FOX", "TURTLE"
]
carnivores = [
  "LION", "OTTER", "TIGER", "ALLIGATOR", "CHEETAH", "SNAKE"
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


Game.prototype.makeAnimal = function(animal_type, pen) {
  let self = this;

  let scale_value = 0.66;

  let animal = new PIXI.Container();

  let animal_sprite = null;
  if (!(animal_type in animated_animals)) {
    animal_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + animal_type.toLowerCase() + ".png"));
  } else {
    var sheet = PIXI.Loader.shared.resources["Art/Animals/" + animal_type.toLowerCase() + ".json"].spritesheet;
    animal_sprite = new PIXI.AnimatedSprite(sheet.animations[animal_type.toLowerCase()]);
  }
  animal_sprite.scale.set(scale_value, scale_value);
  animal_sprite.anchor.set(0.5,0.75);

  animal.addChild(animal_sprite);

  animal.movement = animals[animal_type].movement;

  animal.pen = pen;

  if (pen.land == "water") {
    animal.water_fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
    animal.water_fill.width = 192 * scale_value;
    animal.water_fill.height = 100 * scale_value;
    animal.water_fill.tint = water_color;
    // animal.water_fill.scale.set(scale_value, scale_value);
    animal.water_fill.anchor.set(0.5,1);
    animal.water_fill.position.set(0,90*scale_value);
    animal.addChild(animal.water_fill);
  }

  animal.delay = 0;
  animal.delay_time = null;

  animal.vx = 2.4;
  animal.vy = 0;

  animal.land_speed = 2.4;
  animal.land_angle = (Math.random() * 360) * Math.PI / 180;

  if (animal_type == "CHEETAH") animal.land_speed = 4.8;

  animal.undulation_counter = 0;

  animal.animated = this.markTime();

  animal.update = function() {

    if (animal.delay > 0 && self.timeSince(animal.delay_time) > animal.delay) {
      animal.delay = 0;
      animal.delay_time = null;
    }

    if (animals[animal_type].last_sound == null || self.timeSince(animals[animal_type].last_sound) > animals[animal_type].sound_delay) {
      if (distance(self.player.x, self.player.y, animal.pen.cx, animal.pen.cy) < 480) {
        if (Math.random() > 0.65) {
          self.soundEffect(animals[animal_type].sound);
          animals[animal_type].sound_delay = 2000 + Math.random() * 10000;
          animals[animal_type].last_sound = self.markTime();
        }
      }
    }

    if (animal.delay == 0) {
      
      if (animal.movement == "bounce") {
        //animal_sprite.x += animal.vx;
        animal_sprite.y += animal.vy;
        animal.y += animal.land_speed * Math.sin(animal.land_angle);
        animal.x += animal.land_speed * Math.cos(animal.land_angle);

        if (Math.cos(animal.land_angle) < 0) {
          animal_sprite.scale.set(-scale_value, scale_value);
        } else {
          animal_sprite.scale.set(scale_value, scale_value);
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

        if (animal_sprite.y >= 0) {
          animal.vy = -3.6;
          animal_sprite.y = 0;

          if(Math.random() < 0.05) {
            animal.delay = 500 + 2000 * Math.random();
            animal.delay_time = self.markTime();

            if (animal_type in animated_animals) animal_sprite.gotoAndStop(0);
          }

          if (Math.random() > 0.5) {
            if (pen.land == "water" 
              || (pen.land == "watergrass" && animal.x > pen.cx)
              || (pen.land == "waterice" && animal.x > pen.cx)) {
              let droplet = new PIXI.Sprite(PIXI.Texture.from("Art/water_droplet.png"));
              droplet.scale.set(scale_value * 0.75);
              droplet.anchor.set(0.5,0.5);
              droplet.position.set(animal_sprite.x, animal_sprite.y - 1);
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
        //animal_sprite.x += animal.vx;
        animal.y += animal.land_speed * Math.sin(animal.land_angle);
        animal.x += animal.land_speed * Math.cos(animal.land_angle);

        if (Math.cos(animal.land_angle) < 0) {
          animal_sprite.scale.set(-scale_value, scale_value);
        } else {
          animal_sprite.scale.set(scale_value, scale_value);
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

        animal_sprite.y = 3 * Math.sin(Math.PI * animal.undulation_counter / 16);

        if (Math.abs(animal_sprite.y) < 0.0005) {
          if(Math.random() < 0.1) {
            animal.delay = 700 + 3000 * Math.random();
            animal.delay_time = self.markTime();

            if (animal_type in animated_animals) animal_sprite.gotoAndStop(0);
          }
        }
      }


      if (animal.movement == "fly") {
        animal_sprite.x += animal.vx;
        animal_sprite.y += animal.vy;

        if (animal_sprite.y >= 0) {
          
          if(Math.random() < 0.5) {
            animal.delay = 500 + 2000 * Math.random();
            animal.delay_time = self.markTime();

            animal_sprite.y = 0;
            animal.vy = 0;

            if (animal_type in animated_animals) animal_sprite.gotoAndStop(0);
          } else {
            animal_sprite.y -= 18;
            animal.vy = -1.8;
          }
        } else {
          // fliers are always animated
          if (self.timeSince(animal.animated) > walk_frame_time) {
            if (animal_sprite.currentFrame == 0) {
              animal_sprite.gotoAndStop(1);
              // animal.vy -= (0.5 + 0.55 * Math.random())
            } else if (animal_sprite.currentFrame == 1) {
              animal_sprite.gotoAndStop(0);
              // animal.vy -= (0.2 + 0.3 * Math.random())
            }
            animal.animated = self.markTime();
          }

          animal.vy += -0.6 + Math.random() * 1.2;
          if (animal_sprite.y < -300) {
            animal.vy += 0.6;
          }
        }

        if (animal.vx > 0 && animal_sprite.x >= 120) {
          animal.vx *= -1;
          animal_sprite.scale.set(-scale_value, scale_value);
        } else if (animal.vx < 0 && animal_sprite.x <= -120) {
          animal.vx *= -1;
          animal_sprite.scale.set(scale_value, scale_value);
        }
      }
      



      if (animal.water_fill != null) {
        animal.water_fill.x = animal_sprite.x;
      }
    }

  }

  return animal;
}