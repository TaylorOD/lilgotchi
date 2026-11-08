# Launcher and care badge

Implemented for 1.1.0. The game plans and direction hotfix remain separate.

## Bigger pet icon

Keep the compact square button. Increase the visible egg and pet artwork so it mostly fills the box. Target about 48 to 52 pixels of visible art in the existing 64 pixel button, with enough room for the rounded corners. Fit visible pixels, not blank sprite padding. Keep crisp edges and never clip a pet or shell.

The selected family still controls the shell color and pet. Check every stage, especially tall antennae and wide elders.

## Logo option

Add a separate brand launcher using the website's logo egg from `widget/egg.svg` beside the text `lilgotchi`. This is the fixed logo, not the selected pet or its shell. It stays the same when switching families.

Keep the button's height and make it wider to fit the logo, label and optional badge. Use a 32 to 40 pixel egg, comfortable spacing and a single line of text. Keep it clear of the screen edges and respect all four corner placements.

Setting: `launcher="brand"`, or `data-launcher="brand"` in the one line install. Retain the existing shell and pet options. The install builder includes the brand choice.

## Count care needs across pets

Replace the single attention dot with a numeric badge when care notifications are enabled. Count unresolved needs across all started pets available in this widget, not only the selected pet. Do not create new pets just to count them. Excluded families do not count.

Count each distinct care need once per pet: food, play, medicine, cleaning or discipline. Reuse the game's care predicates. Multiple piles of poop still count as one cleaning need. For example, Slice needs food and cleaning and Cypunk needs play: badge 3.

Eggs and pets on vacation contribute zero. A dead pet contributes one separate memorial notice instead of care needs. Dismiss that notice when its memorial is viewed or the pet is restarted. Opening the widget does not clear unresolved care needs.

Hide the badge at zero. Show the exact count up to 99 and `99+` after that. Keep the badge at the upper outer corner with room to avoid clipping. It must not cover the egg, wordmark or close button.

Clicking the launcher opens the widget. Show a compact needs list outside the game screen, grouped by family, with each row opening that pet. The button's accessible name includes the count. Do not announce every polling update or rely on color alone.

## Keep the count current

Refresh after care actions, imports, resets, family changes and updates from other tabs. While the page is visible and the drawer is closed, refresh at a modest interval such as 30 seconds. Refresh immediately when the page becomes visible again.

Use the existing elapsed time rules and storage ownership. Never start a second simulation writer for a pet open elsewhere. If fresh state cannot be read safely, keep the last known count and label it as saved information in the needs list. No browser push permission or background service is needed.

## Settings and Taylor's site

Care notifications are optional for the brand launcher. Setting: `notifications="on|off"`, with matching `data-notifications` support. Offer the same switch for the other launcher styles. Default new installs to on, with no badge when nothing needs care.

Use `launcher="brand" notifications="on"` on both the home and projects pages of Taylor's site. Keep bottom right placement, the existing storage key and all four families.

## Done when

1. The compact icon mostly fills its button without clipping at any stage.
2. The brand button uses the real logo egg and reads `lilgotchi` at phone sizes.
3. Badge counts match the grouped needs list across all four families and clear only when resolved or dismissed as described above.
4. Notifications can be disabled without disabling pet care or saving.
5. Closed drawers, multiple tabs, unavailable storage and returning after an absence give consistent results without duplicate writes.
6. Both launcher styles are reviewed at desktop and mobile sizes, at every corner, with long counts and keyboard focus. Include screenshots in the implementation PR.
