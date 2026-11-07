// Review proposals only. Nothing in the live game imports this module.
const palette = ['', '#d9fcff', '#102238', '#22dbe7', '#ec4cb4', '#53718c', '#70f79a', '#f4d45b', '#a97ef5', '#3569c8'];
const expressions = {
  idle1:['101','000','010'], idle2:['101','000','111'],
  happy:['101','000','101'], sad:['000','101','010'],
  eat:['101','010','111'], sleep:['000','101','000'],
};
const glyphs = {
  J:['111','001','001','101','111'], S:['111','100','111','001','111'],
  C:['111','100','100','100','111'], '#':['101','111','101','111','101'],
  '4':['101','101','111','001','001'], '0':['111','101','101','101','111'],
};
const drawings = [
  {id:'egg',name:'Binary Seed',stage:'egg',rows:['000033330000','000322223000','003212122300','032112122230','032212112230','032212122230','032111122230','003222222300','000333333000','000000000000']},
  {id:'babytchi',name:'Bit',stage:'baby',face:[4,6],rows:['000000000000','000000000000','000000000000','000333330000','003222223000','003222223000','003222223000','003222223000','003222223000','000333330000','000320230000','000330330000']},
  {id:'marutchi',name:'Byte',stage:'child',face:[4,5],rows:['000004000000','000003000000','003333333000','032222222300','032222222300','332222222330','322222222230','332222222330','032222222300','003333333000','000320230000','000330330000']},
  {id:'tamatchi',name:'Compiler',stage:'teen',face:[4,5],rows:['000033330000','000322223000','003222222300','003333333300','003222222300','033222222330','032222222230','003222222300','000344430000','000322230000','003300033000','003000003000']},
  {id:'kuchitamatchi',name:'Syntax Error',stage:'teen',face:[4,5],rows:['000440000000','000030330000','000333223000','043222222300','003222222300','003222222340','003222222300','003222222300','000334433000','003220030000','000330233000','000030003000']},
  {id:'mametchi',name:'JavaScript',stage:'adult',face:[4,7],background:7,ink:2,label:['JS',2,1,2],rows:['077777777770','077777777770','077777777770','077777777770','077777777770','077777777770','077777777770','077777777770','077777777770','077777777770','007777777700','000770077000']},
  {id:'ginjirotchi',name:'C#',stage:'adult',face:[4,7],background:8,label:['C#',2,1,1],rows:['008888888800','088888888880','088888888880','088888888880','088888888880','088888888880','088888888880','088888888880','088888888880','008888888800','000880088000','000880088000']},
  {id:'maskutchi',name:'Matrix',stage:'adult',face:[4,7],ink:6,rows:['006006006000','003006001000','001003006000','006001003000','003006001000','006003006000','001006003000','006222220000','003222226000','006222223000','000660066000','000600006000']},
  {id:'kuchipatchi',name:'404',stage:'adult',face:[4,8],label:['404',0,2,1],rows:['033333333330','322222222223','222222222222','222222222222','222222222222','222222222222','222222222222','322222222223','032222222230','003222223300','000222220000','003300033000']},
  {id:'nyorotchi',name:'MissingNumber',stage:'adult',face:[4,5],rows:['033000000000','032300040000','033330033000','032233322300','043222222330','003222222230','033222222300','032222222330','033444333030','000322233000','000033003300','000330000030']},
  {id:'tarakotchi',name:'Blue Screen',stage:'adult',face:[4,4],background:9,rows:['055555555550','059999999950','059111999950','059999999950','059999999950','059999999950','059999999950','059999999950','059111119950','055555555550','000055550000','000555555000']},
  {id:'oyajitchi',name:'Glitch Elder',stage:'adult',face:[4,4],rows:['003000004000','004033330000','000322223300','043222222300','003222222340','003222222300','003222222300','000334443330','043222230000','000322223040','003330033000','000300003300']},
];
function canvas(rows) {
  if(rows.length>12||rows.some(row=>row.length>12))throw new Error('Proposal exceeds 12 by 12');
  return [...Array(12-rows.length).fill(''),...rows].map(row=>[...row.padEnd(12,'0')].map(Number));
}
function draw(definition,expression) {
  const pixels=canvas(definition.rows);
  if(definition.label){
    const [text,x,y,color]=definition.label;
    [...text].forEach((letter,index)=>glyphs[letter].forEach((row,dy)=>[...row].forEach((pixel,dx)=>{
      if(pixel==='1')pixels[y+dy][x+index*4+dx]=color;
    })));
  }
  if(definition.face){
    const [x,y]=definition.face;
    expressions[expression].forEach((row,dy)=>[...row].forEach((pixel,dx)=>{
      pixels[y+dy][x+dx]=pixel==='1'?(definition.ink||1):(definition.background||2);
    }));
  }
  // Tiny accent movements preserve the label and body. No flashing or random noise.
  if(expression==='idle2'){
    if(definition.id==='egg')pixels[9][7]=4;
    else if(definition.id==='maskutchi'){pixels[1][2]=1;pixels[2][2]=6;}
    else if(definition.id==='oyajitchi'){pixels[0][8]=0;pixels[0][9]=4;}
    else if(definition.id==='nyorotchi'){pixels[1][7]=0;pixels[1][8]=4;}
  }
  return pixels.map(Object.freeze);
}
export const proposal = {
  type:'Cypunk', palette,
  pets:drawings.map(definition=>({
    id:definition.id,name:definition.name,stage:definition.stage,
    frames:Object.fromEntries((definition.stage==='egg'?['idle1','idle2']:Object.keys(expressions)).map(expression=>[expression,draw(definition,expression)])),
  })),
};
