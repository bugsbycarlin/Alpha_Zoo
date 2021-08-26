

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
    land: "water",
    decorations: ["rock", "grass"],
  },
  "CHEETAH": {},
  "TIGER": {},
  "GORILLA": {},




}



for (const [name, data] of Object.entries(animals)) {
  if (!("land" in data)) data["land"] = "grass";
  if (!("decorations" in data)) data["decorations"] = ["grass", "grass", "rock", "grass", "tree", "bush", "rock"];
}


Game.prototype.makeAnimal = function(animal_type, pen) {
  let self = this;

  let animal = new PIXI.Container();

  let animal_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + animal_type.toLowerCase() + ".png"));
  animal_sprite.scale.set(0.12, 0.12);
  animal_sprite.anchor.set(0.5,0.67);

  animal.pen = pen;

  animal.direction = 1;
  animal.last_bounce = this.markTime();

  animal.update_delay = 175 + 75 * Math.random();
  
  animal.addChild(animal_sprite);

  animal.update = function() {
    if (self.timeSince(animal.last_bounce) > animal.update_delay) {
      if (animal_sprite.angle <= 0) {
        animal_sprite.angle = 2 + Math.random() * 5;
      } else {
        animal_sprite.angle = -2 - Math.random() * 5;
      }

      if (animal.direction == 1 && animal_sprite.x < 20) {
        animal_sprite.x += 2;
      } else if (animal.direction == 1 && animal_sprite.x >= 20) {
        animal_sprite.scale.set(-0.12, 0.12);
        animal.direction = -1;
      } else if (animal.direction == -1 && animal_sprite.x > -20) {
        animal_sprite.x -= 2;
      } else if (animal.direction == -1 && animal_sprite.x <= 20) {
        animal_sprite.scale.set(0.12, 0.12);
        animal.direction = 1;
      }

      animal.last_bounce = self.markTime();
    }
  }

  return animal;
}