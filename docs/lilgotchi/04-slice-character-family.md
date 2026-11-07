# lilgotchi Slice character family

Slice starts as dough and grows into a pizza character. Every stage needs its own silhouette and complete animation frames. A few changed toppings on the same body are not enough to communicate growth.

## Proposed forms

| Original identity | Slice form | Shape and distinguishing detail |
| --- | --- | --- |
| `egg` | Dough | Round pale dough mound with two proofing frames. A small rise and settling motion replaces the egg wobble |
| `babytchi` | Dough Drop | Small dough ball with eyes and two tiny feet |
| `marutchi` | Pizza Round | Flattened round dough with a sauce center and short arms |
| `tamatchi` | Little Slice | Neat triangular slice with a short crust and a little cheese |
| `kuchitamatchi` | Folded Slice | Bent triangle with an uneven crust and drooping cheese |
| `mametchi` | Margherita | Tall clean triangle, round crust and a readable basil accent |
| `ginjirotchi` | Pepperoni | Broad triangle with large pepperoni spots and springy feet |
| `maskutchi` | Calzone | Closed half moon body with a crimped edge and visible face |
| `kuchipatchi` | Deep Dish | Short thick wedge with a deep crust wall |
| `nyorotchi` | Cheese Pull | Narrow slice with a long flexible cheese tail |
| `tarakotchi` | Crispy Slice | Broad uneven wedge with a dark crust and sturdy feet |
| `oyajitchi` | Pizza Chef | Secret Calzone evolution with a small chef hat and mustache |

Names are proposed display labels. Game state continues to store the original identity and branch conditions. Keep art readable without relying only on color. The egg is visibly dough, not the classic egg with a new palette.

## Art direction

Use a restrained palette of dough cream, crust brown, tomato red, cheese gold and a dark outline. Green is an optional topping accent. Keep face contrast strong against cheese. Avoid details that disappear at the logical pixel size.

Author each frame as a complete matrix with a stable foot anchor. Design the body, limbs and accessories for the actual 32 by 16 screen and its shared effects. Do not shrink or cut off the chef hat to hide a placement bug. If a silhouette does not fit its allocation, redesign it before approval.

## Reactions

| State | Slice treatment |
| --- | --- |
| Egg idle and hatch | Dough gently rises and settles, then reveals Dough Drop at the original hatch moment |
| Idle | Small foot shifts and body bounce using complete frames |
| Happy and game win | Bright face and lifted arms. Toppings stay attached |
| Sad and game loss | Lowered face and relaxed crust |
| Eat and refuse | Readable mouth motion or head turn using the original action duration |
| Sleep | Closed eyes and still body with the shared sleep effect |
| Sick and attention | Clear expression plus the original status effect |
| Evolve | The new silhouette appears at the original transition timing |
| Death and restart | Preserve the original grave and restart flow. Restart returns to dough |

Map every original frame key and composed reaction before coding. No missing key may silently fall back to a classic pet. Shared UI symbols can remain original for clarity and parity.

## Acceptance

Show all 12 identities together in a labeled contact sheet, then preview every frame at native and enlarged integer scale. All forms must be distinguishable by silhouette. Run the same evolution fixtures as Default and exercise each reaction in the widget. Inspect the dough hatch and secret adult at phone size. No frame loses toppings, limbs or outline pixels when it moves.
