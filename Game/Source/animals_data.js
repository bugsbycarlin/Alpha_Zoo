

// animals_data.js contains animal definitions, properties, and configuration data.
//
//
// The animal class makes animals and governs their behavior. This file also
// contains lists of animal properties such as diet, land type, behavior type, etc.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin

animals = {
  "LION": {
    movement: "walk",
    mouth: [304, 326],
    butt: [193, 350],
    food: "carnivore",
  },
  "HIPPO": {
    land: "grass",
    pond: "large",
    movement: "walk",
    mouth: [320, 344],
    butt: [166, 335],
    food: "herbivore",
  },
  "RHINO": {
    land: "sand",
    movement: "walk",
    mouth: [307, 355],
    butt: [179, 337],
    food: "herbivore",
  },
  "TURTLE": {
    land: "grass",
    pond: "large",
    movement: "walk",
    mouth: [314, 351],
    butt: [196, 372],
    speed: 0.4,
    food: "omnivore",
  },
  "OTTER": {
    movement: "walk_and_swim",
    land: "rock",
    pond: "large",
    terrace: true,
    mouth: [303, 333],
    butt: [221, 405],
    min: 2,
    food: "carnivore",
  },
  "GORILLA": {
    movement: "walk",
    mouth: [284, 307],
    butt: [191, 345],
    land: "forest",
    food: ["greens", "fruit"],
  },
  "CHIMPANZEE": {
    movement: "walk",
    speed: 1.1,
    mouth: [256, 322],
    butt: [203, 371],
    min: 2,
    max: 4,
    food: "omnivore",
  },
  "BABOON": {
    land: "sand",
    movement: "walk",
    mouth: [288, 328],
    butt: [192, 350],
    food: "omnivore",
  },
  "GIRAFFE": {
    movement: "walk",
    mouth: [332, 198],
    pond: "small",
    butt: [168, 319],
    food: "herbivore",
  },
  "ZEBRA": {
    movement: "walk",
    mouth: [317, 318],
    butt: [183, 342],
    pond: "small",
    food: "herbivore",
  },
  "HORSE": {
    speed: 1.5,
    movement: "walk",
    mouth: [316, 347],
    butt: [179, 334],
    pond: "small",
    food: "herbivore",
  },
  "ELEPHANT": {
    land: "sand",
    pond: "small",
    movement: "walk",
    mouth: [311, 307],
    butt: [167, 328],
    food: "herbivore",
  },
  "TIGER": {
    movement: "walk",
    mouth: [316, 339],
    butt: [192, 354],
    food: "carnivore",
  },
  "CHEETAH": {
    movement: "walk",
    mouth: [311, 342],
    butt: [194, 356],
    speed: 2,
    food: "carnivore",
  },
  "LYNX": {
    sound: "zebra",
    movement: "walk",
    mouth: [307, 345],
    butt: [200, 355],
    food: "carnivore",
  },
  "PANTHER": {
    movement: "walk",
    mouth: [313, 339],
    butt: [194, 359],
    food: "carnivore",
  },
  "DOG": {
    movement: "walk",
    mouth: [292, 328],
    butt: [204, 348],
    food: "omnivore",
  },
  "WOLF": {
    movement: "walk",
    mouth: [297, 320],
    butt: [200, 351],
    land: "forest",
    food: "carnivore",
  },
  "CAT": {
    movement: "walk",
    mouth: [292, 321],
    butt: [204, 342],
    food: "carnivore",
  },
  "MOUSE": {
    movement: "walk",
    mouth: [262, 341],
    butt: [229, 360],
    food: "omnivore",
  },
  "BROWN_BEAR": {
    sound: "bear",
    pond: "any",
    terrace: true,
    movement: "walk",
    mouth: [314, 327],
    butt: [188, 338],
    land: "forest",
    food: "omnivore",
  },
  "BLACK_BEAR": {
    sound: "bear",
    pond: "small",
    terrace: true,
    movement: "walk",
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
    movement: "walk",
    speed:0.9,
    mouth: [314, 327],
    butt: [188, 338],
    food: ["steak", "fish"],
  },
  "PENGUIN": {
    land: "ice",
    terrace: true,
    pond: "large",
    movement: "walk",
    speed:0.5,
    mouth: [258, 341],
    butt: [257, 392],
    min: 3,
    max: 5,
    food: ["fish"],
  },
  "SEAL": {
    movement: "jump",
    speed: 0.7,
    land: "ice",
    pond: "large",
    mouth: [299, 344],
    butt: [200, 382],
    food: ["fish"],
  },
  "PANDA_BEAR": {
    movement: "walk",
    speed: 0.7,
    mouth: [314, 327],
    butt: [188, 338],
    food: ["bamboo"],
    land: "forest",
  },
  "FOX": {
    movement: "walk",
    speed:0.7,
    mouth: [279, 329],
    butt: [226, 395],
    food: "omnivore",
  },
  "ALLIGATOR": {
    land: "grass",
    pond: "large",
    mouth: [354, 364],
    butt: [165, 392],
    speed: 0.4,
    movement: "walk",
    food: "carnivore",
  },
  "PARROT": {
    movement: "fly",
    mouth: [264, 324],
    butt: [235, 386],
    food: "omnivore",
    variations: 5,
  },
  "OWL": {
    movement: "fly",
    mouth: [261, 297],
    butt: [257, 388],
    food: "carnivore",
  },
  "PEACOCK": {
    movement: "walk",
    speed:0.4,
    mouth: [252, 308],
    butt: [253, 402],
    food: "omnivore",
  },
  "SNAKE": {
    land: "sand",
    movement: "walk",
    speed:0.5,
    mouth: [371, 383],
    butt: [191, 392],
    food: "carnivore",
    variations: 3,
    min:4,
    max:7,
  },
  "COW": {
    movement: "walk",
    mouth: [316, 351],
    butt: [180, 327],
    food: "herbivore",
    pond: "small",
  },
  "YAK": {
    movement: "walk",
    mouth: [316, 352],
    butt: [175, 344],
    terrace: "rock",
    food: "herbivore",
  },
  "CAPYBARA": {
    movement: "walk",
    speed: 0.5,
    land: "sand",
    pond: "any",
    mouth: [281, 342],
    butt: [183, 376],
    food: "herbivore",
  },
  "PIG": {
    land: "sand",
    pond: "small",
    movement: "walk",
    mouth: [313, 354],
    butt: [178, 319],
    food: "omnivore",
  },
  "WARTHOG": {
    land: "sand",
    pond: "small",
    speed:0.5,
    movement: "walk",
    mouth: [313, 354],
    butt: [178, 319],
    food: "herbivore",
    sound: "pig",
  },
  "ANTEATER": {
    land: "grass",
    terrace: "sand",
    movement: "walk",
    mouth: [372, 325],
    butt: [203, 351],
    food: ["micro"],
  },
  "SHEEP": {
    movement: "walk",
    mouth: [312, 349],
    butt: [181, 334],
    food: "herbivore",
  },
  "BIGHORN_SHEEP": {
    movement: "walk",
    speed:0.6,
    mouth: [327, 333],
    butt: [177, 317],
    food: "herbivore",
    terrace: "rock",
    land: "grass",
  },
  "DEER": {
    movement: "walk",
    mouth: [317, 327],
    butt: [192, 332],
    land: "forest",
    food: "herbivore",
  },
  "GAZELLE": {
    movement: "walk",
    mouth: [317, 327],
    butt: [192, 332],
    speed: 2,
    food: "herbivore",
  },
  "ELK": {
    sound: "deer",
    movement: "walk",
    mouth: [314, 324],
    butt: [174, 333],
    land: "forest",
    food: "herbivore",
  },
  "MOOSE": {
    speed:0.7,
    movement: "walk",
    mouth: [325, 332],
    butt: [158, 312],
    land: "forest",
    food: "herbivore",
  },
  "RED_PANDA": {
    movement: "arboreal",
    mouth: [272, 333],
    butt: [222, 396],
    arboreal_contact: [263,406],
    food: "omnivore",
    land: "forest",
    tree_time: 7000,
  },
  "KANGAROO": {
    movement: "jump",
    still_frames: [0,1,2,3,4,19,20,21,22,23],
    speed: 1.2,
    mouth: [273, 295],
    butt: [217, 395],
    food: "herbivore",
  },
  "MEERKAT": {
    movement: "walk_and_stand",
    mouth: [266, 330],
    butt: [240, 398],
    land: "sand",
    terrace: true,
    min: 7,
    max: 14,
    food: "omnivore",
  },
  "RACCOON": {
    movement: "walk",
    speed:1,
    mouth: [305, 354],
    butt: [195, 362],
    land: "forest",
    sound: "capybara",
    food: "omnivore",
  },
  "CAMEL": {
    speed: 0.4,
    movement: "walk",
    mouth: [343, 291],
    butt: [183, 363],
    land: "sand",
    pond: "small",
    food: "herbivore",
  },
  "GOAT": {
    movement: "walk",
    mouth: [314, 329],
    butt: [187, 331],
    terrace: "rock",
    land: "sand",
    food: "herbivore",
  },
  "RABBIT": {
    movement: "jump",
    still_frames: [0,1,2,3,4,5],
    speed: 0.95,
    mouth: [248, 343],
    butt: [249, 406],
    min: 4,
    max: 10,
    food: "herbivore",
  },
  "BEAVER": {
    movement: "walk_and_stand",
    speed:0.8,
    mouth: [260, 316],
    butt: [229, 390],
    pond: "any",
    land: "forest",
    sound: "capybara",
    food: "herbivore",
  },
  "ALPACA": {
    movement: "walk",
    mouth: [306, 256],
    butt: [172, 319],
    food: "herbivore",
  },
  "LLAMA": {
    movement: "walk",
    speed:0.6,
    mouth: [308, 240],
    butt: [177, 336],
    terrace: "rock",
    sound: "llama",
    food: "herbivore",
  },
  "KOALA": {
    mouth: [253, 331],
    butt: [250, 411],
    arboreal_contact: [250, 411],
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
    butt: [293, 328],
    arboreal_contact: [281, 415],
    land: "forest",
    food: "herbivore",
    speed: 0.20,
    movement: "arboreal",
    min: 1,
    max: 3,
    tree_time: 14000,
  },
  "LEMUR": {
    speed:1.2,
    mouth: [280, 326],
    butt: [195, 346],
    arboreal_contact: [277, 410],
    land: "forest",
    food: "omnivore",
    movement: "arboreal",
    min: 2,
    max: 4,
    tree_time: 7000,
  },
  "ORANGUTAN": {
    mouth: [258, 308],
    butt: [255, 362],
    arboreal_contact: [262, 370],
    land: "forest",
    food: "omnivore",
    movement: "arboreal",
    tree_time: 9000,
  },
  "OSTRICH": {
    movement: "walk",
    mouth: [308, 211],
    butt: [228, 344],
    land: "sand",
    food: "herbivore",
    speed: 1.2,
  },
  "FLAMINGO": {
    movement: "walk",
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
    speed: 0.5,
    movement: "undulate",
  },
  "DUCK": {
    movement: "walk",
    mouth: [314, 307],
    butt: [229, 382],
    land: "grass",
    pond: "large",
    food: ["fish", "micro", "greens"],
    min: 2,
    max: 5,
  },
  "CHICKEN": {
    movement: "walk",
    mouth: [286, 311],
    butt: [219, 369],
    land: "grass",
    food: ["micro"],
    min: 3,
    max: 6,
    variations: 2,
  },
  "GOOSE": {
    movement: "walk",
    mouth: [334, 267],
    butt: [219, 373],
    land: "grass",
    pond: "large",
    food: ["micro", "greens"],
    min: 2,
    max: 5,
  },
  "FROG": {
    movement: "jump",
    still_frames: [0,1,2,22,23,24],
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
  "PARROT":1,
  "OWL":1,
  "PEACOCK":0.3,
  "COW":1,
  "BROWN_BEAR":1,
  "BLACK_BEAR":1,
  "ALPACA":1,
  "DOG":1,
  "BABOON":1,
  "ZEBRA":1,
  "DEER":1,
  "SHEEP":1,
  "PIG":1,
  "HIPPO":1,
  "YAK":1,
  "RHINO":1,
  "GIRAFFE":0.5,
  "ELEPHANT":1,
  "GAZELLE":0.75,
  "LYNX":1.15,
  "PANTHER":1,
  "TIGER":1,
  "CHEETAH":1,
  "LION":1,
  "CAMEL":0.5,
  "ELK":0.6,
  "WOLF":1,
  "CAT":0.75,
  "GOAT":0.75,
  "HORSE":0.6,
  "MOOSE":0.4,
  "WARTHOG":0.4,
  "BIGHORN_SHEEP":1,
  "LLAMA":0.6,
  "POLAR_BEAR":0.7,
  "TURTLE":0.5,
  "PANDA_BEAR":0.6,
  "SWAN":0.4,
  "FOX":0.7,
  "GOOSE":0.6,
  "CHICKEN":0.3,
  "DUCK":0.4,
  "PENGUIN":0.6,
  "OSTRICH":0.6,
  "FLAMINGO":0.4,
  "GORILLA":0.6,
  "ALLIGATOR":0.6,
  "MEERKAT":0.6,
  "ANTEATER":0.5,
  "KANGAROO":0.8,
  "SEAL":0.8,
  "RABBIT":0.6,
  "FROG":0.8,
  "MOUSE":0.6,
  "RACCOON":0.5,
  "RED_PANDA":0.5,
  "LEMUR":0.3,
  "ORANGUTAN":0.5,
  "KOALA":0.3,
  "SLOTH":0.2,
  "BEAVER":0.2,
  "CAPYBARA":0.5,
  "SNAKE":0.4,
  "OTTER":0.5,
  "CHIMPANZEE":0.5,
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

tree_touch_points["RED_PANDA"] = [];
tree_touch_points["RED_PANDA"][1] = [[51, 106+18], [-39, 113+18],];
tree_touch_points["RED_PANDA"][2] = [];
tree_touch_points["RED_PANDA"][3] = [[63, 151+18], [-34, 180+18], [-45, 90+18],];



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
  if (!("still_frames" in data)) data["still_frames"] = [];
  if (!("variations" in data)) data["variations"] = 1;
  if ("food" in data && data["food"] == "herbivore") data["food"] = ["greens"];
  if ("food" in data && data["food"] == "omnivore") data["food"] = ["steak", "greens", "fruit"];
  if ("food" in data && data["food"] == "carnivore") data["food"] = ["steak"]; 
}





