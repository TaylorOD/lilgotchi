# Slice evolution proposal

Review only. These sprites and names are not connected to the game. The proposal preserves every original evolution branch, with pizza types replacing the original adult identities. Names describe appearances, not the quality of those foods.

## Growing up

Dough becomes Dough Drop, then Pizza Round. At the child evolution check, zero or one care mistake produces Little Slice. Two or more produces Folded Slice.

Both teens can become different adult pizzas. Care mistakes and discipline are evaluated at the adult evolution check, in the order below. The internal original IDs are listed so the mapping can be reviewed without changing save compatibility.

## Little Slice adult paths

| Original ID | Proposed pizza | Condition |
| --- | --- | --- |
| mametchi | Margherita | At most 2 care mistakes and 100% discipline |
| ginjirotchi | Pepperoni | At most 2 care mistakes and 75% to 99% discipline |
| maskutchi | BBQ Chicken | At most 4 care mistakes and at least 50% discipline, after the first two checks fail |
| kuchipatchi | Meat Lovers | At least 50% discipline, after the earlier checks fail |
| nyorotchi | Anchovy | 25% to 49% discipline |
| tarakotchi | Pineapple | Below 25% discipline |

The BBQ Chicken branch therefore includes 0 to 2 care mistakes with 50% to 74% discipline, or 3 to 4 care mistakes with any discipline from 50% to 100%. Meat Lovers from Little Slice requires more than 4 care mistakes with at least 50% discipline.

## Folded Slice adult paths

| Original ID | Proposed pizza | Condition |
| --- | --- | --- |
| kuchipatchi | Meat Lovers | At least 75% discipline |
| nyorotchi | Anchovy | 50% to 74% discipline |
| tarakotchi | Pineapple | Below 50% discipline |

## Special elder

BBQ Chicken uses the original Maskutchi identity. It becomes eligible for Spoiled Slice at age 10 or older with 100% discipline. Each eligible simulation tick has a 5% chance to change it. The pet must still be alive. Other adult pizzas do not use this elder route.

This matches the cracked egg path. The live game currently calls the Maskutchi pizza Calzone. Renaming that branch to BBQ Chicken is part of this proposal and is not wired yet. The proposed elder artwork keeps the pale cheese, green mold patches and drooping tip already requested for Spoiled Slice.

## Art direction

All sprites fit 12 by 12 pixels. Every hatched form has idle, alternate idle, happy, sad, eating and sleeping expressions. The dough has two idle poses. Toppings sit above or beside the small face so expressions do not erase what identifies the pizza.

Margherita has pale mozzarella, red tomato and green basil. Pepperoni uses red discs on a broad wedge. BBQ Chicken uses tan chunks and dark sauce stripes. Meat Lovers is a thick square pan slice with alternating red and brown toppings. Anchovy has silvery blue fish marks on a narrow slice. Pineapple uses bright yellow chunks on a wide cheese wedge. Spoiled Slice has a bent tip and mold patches.

Only the proposal module and this document are added. Runtime sprites, catalog entries, saves and evolution logic stay unchanged until approved.
