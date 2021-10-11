
// https://www.schemecolor.com/pastel-rainbow.php
let ferris_wheel_colors = [
  0xCC99C9, // purple,
  0x9EC1CF, // blue,
  0x9EE09E, // green,
  0xFDFD97, // yellow,
  0xFEB144, // orange,
  0xFF6663, // red,
]



Game.prototype.makeFerrisWheel = function(pen) {
  let self = this;

  shuffleArray(ferris_wheel_colors);
  let fwc = ferris_wheel_colors;

  let ferris_wheel = new PIXI.Container();
  let fw = ferris_wheel;

  fw.pen = pen;

  fw.wheel_shadow = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/wheel.png"));
  fw.wheel_shadow.anchor.set(0.5, 0.5);
  fw.wheel_shadow.position.set(0, -1346 + 8); // 2370 - 1024 = 1346. 2370 is how far the base is from the center on the drawing.
  let c = PIXI.utils.hex2rgb(fwc[0]);
  let shadow_color = PIXI.utils.rgb2hex([c[0] * 0.8, c[1] * 0.8, c[2] * 0.8]);
  fw.wheel_shadow.tint = shadow_color
  fw.addChild(fw.wheel_shadow);

  fw.wheel = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/wheel.png"));
  fw.wheel.anchor.set(0.5, 0.5);
  fw.wheel.position.set(0, -1346); // 2370 - 1024 = 1346. 2370 is how far the base is from the center on the drawing.
  fw.wheel.tint = fwc[0];
  fw.addChild(fw.wheel);

  fw.carts = [];
  for (let i = 0; i < 12; i++) {
    fw.carts.push(new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/cart.png")));
    fw.carts[i].anchor.set(0.5, 0.0);
    fw.carts[i].position.set(
      0 + 850 * Math.cos(i * 30 * Math.PI / 180),
      -1346 + 850 * Math.sin(i * 30 * Math.PI / 180)
    );
    fw.carts[i].tint = fwc[1 + (i % 3)];
    fw.addChild(fw.carts[i]);
  }

  fw.base = new PIXI.Sprite(PIXI.Texture.from("Art/Ferris_Wheel/base.png"));
  fw.base.anchor.set(0.5, 1.0);
  fw.base.tint = fwc[0];
  fw.addChild(fw.base);



  


  // animal.sprite = null;
  // if (!(animal.type in animated_animals)) {
  //   animal.sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Animals/" + animal.type.toLowerCase() + ".png"));
  // } else {
  //   var sheet = PIXI.Loader.shared.resources["Art/Animals/" + animal.type.toLowerCase() + ".json"].spritesheet;
  //   animal.sprite = new PIXI.AnimatedSprite(sheet.animations[animal.type.toLowerCase()]);
  // }
  // animal.sprite.scale.set(animal_scale, animal_scale);
  // animal.sprite.anchor.set(0.5,0.75);

  // animal.addChild(animal.sprite);


  return ferris_wheel;
}