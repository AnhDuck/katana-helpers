# Side Panel Inventory Intel Feasibility

Date: 2026-06-14

## Question

Can the Katana Helpers missing-ingredients side panel show the same `I`
inventory-intel icon that appears in Katana's native Ingredients popup, so a
user can click a missing ingredient in the side panel and open Katana's
Inventory Intel report for that ingredient?

## Chrome DOM Test

Tested in the user's real Chrome tab on
`https://factory.katanamrp.com/salesorder/47028918` on 2026-06-14. No create,
make, export, pack, or edit actions were clicked.

Test row:

- Sales order row: `[RS-135-RESELLER] Default Ring System (Reseller Version)`.
- Ingredients cell: `[role="gridcell"][col-id="materialAvailability"]`, text
  `Not available`.

Native popup behavior:

- Clicking the Ingredients `Not available` cell opens the native
  `Missing and expected ingredients for` dialog.
- Each missing ingredient row has an `I` icon in the `missingQuantity` cell.
- The icon is a real `<button>`, but it does not have a stable `data-testid`.
- Observed selector shape for a specific popup row:
  - `.ag-row[row-id="527"] [role="gridcell"][col-id="missingQuantity"] button`
- The row IDs are AG Grid runtime IDs and should not be treated as stable across
  page reloads. A production implementation should match by parsed ingredient
  name and missing quantity instead.

Inventory Intel behavior:

- Clicking the native `I` button opens a second Material UI dialog while the
  missing-ingredients dialog remains underneath.
- The Inventory Intel dialog does not navigate away from the sales order page.
- The Inventory Intel dialog hydrates asynchronously. It initially showed a
  loading state, then filled in the product name and grid rows.
- Observed Inventory Intel selectors:
  - dialog title wrapper: `[data-testid="headerInventoryIntel"]`
  - title label: `[data-testid="cardHeaderLabelUNDEFINED"]`, text
    `Inventory Intel of`
  - product name: `[data-testid="cardHeaderName"]` or
    `[data-testid="headerNameUNDEFINED"]`
  - close button: `button[data-testid="headerInventoryIntelCloseButton"]`
  - export button: `button[data-testid="IICExport"]`
  - make button: `button[data-testid="makeOrderButton"]`
- Observed Inventory Intel movement grid columns:
  - `movementDate`
  - `causedBy`
  - `quantityChange`
  - `valuePerUnit`
  - `balanceAfter`
  - `valueInStockAfter`
  - `averageCostAfter`
- The tested item `[RS-RAIL] Unified Rail (IPP)` showed summary values:
  `In stock 16 pcs`, `Expected 0 pcs`, `Committed 17 pcs`, `Safety stock 0 pcs`,
  and `Calculated stock -1 pcs`.

Modal-stack note:

- Attempting to close the underlying missing-ingredients dialog while Inventory
  Intel was open did not close it. This suggests Katana's React/Material UI
  modal stack is enforcing focus/overlay order.
- Closing the Inventory Intel dialog first, then closing the missing-ingredients
  dialog, worked cleanly.

## Feasibility Finding

This is possible, but not by copying or moving Katana's native `I` icon DOM into
the Katana Helpers side panel.

The native `I` icon is a React/Material UI button with event handlers owned by
Katana. Cloning the button element into our side panel would likely produce a
dead button because DOM cloning does not copy React's internal event wiring.
Moving the live button out of the native AG Grid row would also be fragile
because Katana owns the grid virtualization, modal lifecycle, and React
component state.

The feasible approach is to render our own small `I` button in the Katana
Helpers side panel, then use it as a command button that replays Katana's native
flow:

1. Keep parsed metadata for each side-panel ingredient row:
   - product name from the missing-ingredients popup
   - ingredient name
   - missing quantity text
   - source sales-order row identity, if still available
2. When the helper `I` button is clicked, reopen Katana's native Ingredients
   popup for the same sales-order row.
3. Wait for the popup rows to hydrate.
4. Find the matching popup row by ingredient name and missing quantity.
5. Click that row's native `missingQuantity` info button.
6. Let Katana open its native Inventory Intel dialog.

This keeps React-owned behavior inside Katana's own DOM instead of trying to
recreate React internals.

## UX Options

Preferred:

- Show a helper-owned `I` icon/button in each side-panel row.
- On click, open Katana's native Inventory Intel dialog for that ingredient.
- Do not try to embed the full Inventory Intel report inside the side panel.
  The native report is large, scrollable, filterable, and already has Export and
  Make actions.

Possible but riskier:

- Read the Inventory Intel dialog after it opens and copy a summary into the
  side panel. This would need more selectors, scrolling logic, and a policy for
  how much of the movement history to show.

Not recommended:

- Clone Katana's native `I` button into the side panel.
- Move Katana's native `I` button out of the missing-ingredients AG Grid.
- Keep the missing-ingredients popup hidden in the DOM solely to preserve React
  handlers.

## Implementation Notes

- Extend the side-panel data model in `src/features/soEx.js` so each parsed
  row keeps enough information to match the native popup row later.
- Add a side-panel icon button only for rows where the native popup row had a
  missing-quantity info button.
- Use a helper-owned button class and title; do not reuse Katana Material UI
  classes.
- On click, temporarily remove or ignore the side panel while Katana opens its
  native modal stack.
- If the quick-add MO dialog is still open, test carefully whether reopening
  the Ingredients popup from behind that dialog works. If it does not, the
  helper should close or defer the Inventory Intel action, or show a toast
  explaining that Inventory Intel must be opened before continuing.
- Avoid clicking native `Make`, `Export`, or movement links during validation
  unless specifically requested.

## Risks

- The info icon has no stable test ID, so matching by row content is required.
- AG Grid row IDs are not stable and should only be used in immediate, live DOM
  interactions.
- Inventory Intel is a second modal on top of the missing-ingredients modal.
  Trying to close or reorder the underlying modal while Intel is open is fragile.
- The current side-panel flow closes the missing-ingredients popup before
  opening the quick-add MO dialog. A helper `I` button would need to reopen the
  native popup on demand.
- If Katana changes its Inventory Intel modal or missing-quantity cell renderer,
  this feature may need selector updates.
