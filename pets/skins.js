import { sliceSprites, slicePalette, sliceNames } from './slice-sprites.js';
import { classicSprites } from './classic-sprites.js';
import { petType } from './storage.js';

export const SP = structuredClone(classicSprites);
export const palette = petType === 'pizza'
  ? slicePalette
  : petType === 'cyberpunk' ? ['', '#8cebdc', '#285262', '#ff78bf', '#8fffe3', '#ffe191'] : [];
const pixels = rows => rows.map(row => [...row].map(Number));
const robot = pixels(['0003300000','0111111110','1222222221','1244144421','1244144421','1222552221','0111111110','3032230300','0012210000','0010010000']);

if (petType === 'pizza') Object.assign(SP, sliceSprites);
export const characterName = name => petType === 'pizza' ? sliceNames[name] : name.charAt(0).toUpperCase()+name.slice(1);

if (petType === 'cyberpunk') {
  const names = ['babytchi','marutchi','tamatchi','kuchitamatchi','mametchi','ginjirotchi','maskutchi','kuchipatchi','nyorotchi','tarakotchi','oyajitchi'];
  names.forEach((name, index) => {
    const art = structuredClone(robot);
    // Different evolutions keep their own toppings or antenna and body markings.
    if (index > 0) art[2][2 + index % 5] = petType === 'pizza' ? 4 : 3;
    if (index > 2) art[0][1 + index % 7] = petType === 'pizza' ? 2 : 5;
    if (index === 0) { art.splice(6, 2); }
    const happy = structuredClone(art);
    happy[4][4] = 5;
    const sad = structuredClone(art);
    sad[4][4] = 1;
    const padded=matrix=>matrix.map(row=>[...row,0]);
    SP[name] = { idle1: padded(art), idle2: art.map(row => [0, ...row]), happy:padded(happy), sad:padded(sad), eat:padded(happy) };
  });
}
