

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
  // "OTTER": {
  //   land: "water",
  //   decorations: ["rock", "grass"],
  // },
  // "CHEETAH": {},
  // "TIGER": {},
  // "GORILLA": {},




}



for (const [name, data] of Object.entries(animals)) {
  if (!("land" in data)) data["land"] = "grass";
  if (!("decorations" in data)) data["decorations"] = ["grass", "grass", "rock", "grass", "tree", "bush", "rock"];
}


Game.prototype.makeAnimal = function(animal_type, pen) {
  let self = this;

  let animal = new PIXI.Container();

  let animal_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + animal_type.toLowerCase() + ".png"));
  let scale_value = 0.11;
  animal_sprite.scale.set(scale_value, scale_value);
  animal_sprite.anchor.set(0.5,0.75);

  animal.pen = pen;

  animal.direction = 1;
  animal.last_bounce = this.markTime();

  animal.delay = 0;
  animal.delay_time = null;

  animal.vx = 0.4;
  animal.vy = 0;
  
  animal.addChild(animal_sprite);

  animal.update = function() {

    if (animal.delay > 0 && self.timeSince(animal.delay_time) > animal.delay) {
      animal.delay = 0;
      animal.delay_time = null;
    }

    if (animal.delay == 0) {
      animal_sprite.x += animal.vx;
      animal_sprite.y += animal.vy;

      if (animal_sprite.y >= 0) {
        animal.vy = -0.6;
        animal_sprite.y = 0;

        if(Math.random() < 0.03) {
          animal.delay = 500 + 2000 * Math.random();
          animal.delay_time = self.markTime();
        }
      } else {
        animal.vy += 0.1;
      }

      if (animal.vx > 0 && animal_sprite.x >= 20) {
        animal.vx *= -1;
        animal_sprite.scale.set(-scale_value, scale_value);
      } else if (animal.vx < 0 && animal_sprite.x <= -20) {
        animal.vx *= -1;
        animal_sprite.scale.set(scale_value, scale_value);
      }
    }

  }

  return animal;
}