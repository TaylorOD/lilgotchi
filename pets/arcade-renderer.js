export function drawArcade(q, s, sprite, palette = []) {
  const ctx = q(".arcade-field").getContext("2d");
  ctx.fillStyle = "#263d45";
  ctx.fillRect(0, 0, 32, 16);
  ctx.fillStyle = "#f4d991";
  const rect = (x, y, w, h) => ctx.fillRect(Math.round(x), Math.round(y), w, h);
  const pet = (x, y) => {
    for (let row = 0; row < sprite.length; row++)
      for (let col = 0; col < sprite[row].length; col++) {
        const pixel = sprite[row][col];
        if (pixel) {
          ctx.fillStyle = palette[pixel] || "#f4d991";
          rect(x + col, y + row, 1, 1);
        }
      }
  };
  if (s.id === "get") {
    pet(s.lane * 10 + 1, 10);
    if (s.object) {
      ctx.fillStyle = s.object.kind === "note" ? "#a1f1dc" : "#ed997d";
      const x = s.object.lane * 10 + 4,
        y = Math.round(s.object.y);
      if (s.object.kind === "note") {
        rect(x + 2, y, 1, 3);
        rect(x, y + 2, 3, 1);
      } else {
        rect(x + 1, y, 1, 1);
        rect(x, y + 1, 3, 2);
      }
    }
  }
  if (s.id === "heading") {
    pet(s.x - 4, 10 - s.jump);
    ctx.fillStyle = "#f4d991";
    rect(s.ball.x, s.ball.y, 2, 2);
  }
  if (s.id === "bump") {
    const shift = s.phase === "reveal" ? 2 : 0;
    pet(3 + (s.boutWon ? shift : 0), 9);
    pet(21 + (s.boutWon ? shift : -shift), 9);
  }
  if (["memory", "flag"].includes(s.id)) pet(12, 9);
  q(".arcade-meter").hidden = !["bump", "hoops"].includes(s.id);
  if (s.id === "bump" || s.id === "hoops") {
    const target =
      s.id === "bump" ? s.target : [s.target.min * 100, s.target.max * 100];
    q(".arcade-meter span").style.cssText =
      `left:${target[0]}%;width:${target[1] - target[0]}%`;
    q(".arcade-meter i").style.left =
      `${s.id === "bump" ? s.meter : s.marker * 100}%`;
  }
  if (s.id === "sprint") {
    pet(Math.min(24, (s.progress / s.finish) * 24), 1);
    ctx.fillStyle = "#a8c8f3";
    pet(Math.min(24, (s.opponent / s.finish) * 24), 9);
  }
  if (s.id === "hoops") {
    pet(1, 10);
    ctx.fillStyle = "#f4d991";
    rect(27, 5, 5, 1);
    rect(31, 6, 1, 10);
    if (s.ball) rect(s.ball.x, s.ball.y, 2, 2);
  }
}
