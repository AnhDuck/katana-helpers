# Native Make Create + EX Feasibility

Date: 2026-06-14

## What The Request Means

The desired workflow is:

1. The user clicks a sales order row's Ingredients cell when it says
   `Not available`.
2. Katana opens its native `Missing and expected ingredients for` popup.
3. The user can inspect the missing ingredients and Inventory Intel `I` icons
   in that native popup.
4. The user clicks Katana's native `Make` button for one missing ingredient.
5. Katana opens the native quick-add `New manufacturing order` dialog for that
   specific ingredient.
6. Katana Helpers should add a helper button in that quick-add MO dialog, beside
   `Create` and `Create and view`, so the user can run the helper create/view
   flow from there.

This is not asking for an `EX` button beside every native `Make` row inside the
Ingredients popup. The native Ingredients popup should remain visually and
functionally Katana-owned.

## Chrome DOM Test

Tested in the user's real Chrome tab on
`https://factory.katanamrp.com/salesorder/47028918` on 2026-06-14. No
manufacturing order was created; the quick-add dialog was canceled.

Test row:

- Sales order row: `[RS-135-RESELLER] Default Ring System (Reseller Version)`.
- Ingredients cell: `[role="gridcell"][col-id="materialAvailability"]`, text
  `Not available`.

Native Ingredients popup:

- Trigger: click `[role="gridcell"][col-id="materialAvailability"]`.
- Popup title: `Missing and expected ingredients for`.
- Missing rows observed:
  - `[RS-OTA] Set of 135mm OTA Rings (IPP) (V6.7)`, `-7 pcs`
  - `[RS-RAIL] Unified Rail (IPP)`, `-1 pcs`
  - `Ring System Printed Insert (IPP) / Reseller`, `-3 pcs`
- Native `Make` buttons in the popup use
  `button[data-testid="makeOrderButton"]`.

Native `Make` result:

- Clicking the native `Make` button for `[RS-RAIL] Unified Rail (IPP)` opened a
  second dialog over the Ingredients popup.
- The original missing-ingredients popup remained open underneath.
- The quick-add MO dialog used the same selectors as the existing sales-order
  EX flow:
  - content: `[data-testid="manufacturingOrderLayoutContent"]`
  - title: `[data-testid="quickAddBulkOrdersDialogTitle"]`
  - product: `[data-testid="singleMOLayoutProductNameInput"]`
  - quantity: `input[data-testid="singleMOLayoutQuantityInput"]`
  - calculated stock: `[data-testid="singleMOLayoutStockLabelValue"]`
  - cancel: `button[data-testid="cancelButton"]`
  - create: `button[data-testid="createAndCloseOrderButton"]`
  - create and view: `button[data-testid="createAndOpenOrderButton"]`
- The action parent was the native Material UI dialog-actions container. Its
  observed text was `Cancel Create Create and view`.
- For the tested ingredient, the quick-add dialog showed:
  - product: `[RS-RAIL] Unified Rail (IPP)`
  - quantity: `1`
  - calculated stock: `-1 pcs`

## Feasibility Finding

This is feasible.

The dialog opened by the native popup `Make` button has the same quick-add MO
surface that Katana Helpers already knows how to work with. The existing
`Create + Ultra` injection logic in `src/features/soEx.js` already mounts a
helper button beside Katana's native `Create and view` button, but it currently
does so only after the single-click sales-order `EX` flow sets internal manual
Ultra state.

For this workflow, the helper can detect a quick-add MO dialog that was opened
from the native Ingredients popup and inject a similar helper button there.

## Recommended Behavior

- Keep the native Ingredients popup unchanged.
- Do not add an `EX` button beside each popup-row `Make` button.
- When a native popup-row `Make` button opens the quick-add MO dialog, inject a
  helper button into that quick-add dialog action row.
- Name should be decided during implementation, but `Create + EX` is clearer for
  this workflow than reusing `EX` inside the popup row.
- The helper button should probably behave like the existing `Create + Ultra`:
  click native `Create and view`, wait for the MO page, scan ingredients, and
  only mark Done when safe.

## Implementation Options

Preferred:

- Refactor the current manual Ultra dialog injection so it can run in two modes:
  - sales-order `EX` mode, which has a known return URL and click-savings
    accounting
  - native Ingredients `Make` mode, which starts from an already-open quick-add
    MO dialog
- Detect native Ingredients `Make` mode by checking:
  - a `New manufacturing order` dialog is present
  - a `Missing and expected ingredients for` dialog is also present underneath
  - the quick-add MO dialog has `createAndOpenOrderButton`
- Inject one helper button into the quick-add MO dialog actions parent.
- Use the same native `Create and view` click path as existing `Create + Ultra`.

Fallback:

- Inject the helper button into any quick-add MO dialog that has
  `createAndOpenOrderButton`, regardless of how it was opened.
- This is simpler, but broader. It may show the helper in global `Create MO`
  dialogs where the user did not come from a sales order Ingredients shortage.

## Return-URL Question

The existing `Create + Ultra` flow stores the sales order URL before it clicks
`Create and view`, then returns to the sales order after finishing.

For native Ingredients `Make`, the current page is still the sales order, so the
same return URL strategy should work. However, because the missing-ingredients
popup remains open under the quick-add MO dialog, implementation should verify
whether cancel/close cleanup needs to close both dialogs or whether Katana
handles that when navigating to the new MO page.

## Risks

- Katana may change the quick-add MO dialog selectors, though these are already
  used by the existing helper flow.
- The missing-ingredients popup and quick-add MO dialog form a nested modal
  stack. Helper code should not try to move or close the underlying popup unless
  explicitly needed.
- If the helper marks the ingredient MO Done and returns to the sales order, the
  original missing-ingredients popup may no longer be valid and should not be
  assumed to remain usable.
- Click-savings accounting should be treated separately from the sales-order
  row `EX` flow because the user manually clicked Ingredients and native Make.

## Conclusion

Adding a `Create + EX` style helper button to the quick-add MO dialog opened by
the native Ingredients popup `Make` button is feasible and is cleaner than
adding EX buttons directly inside the native Ingredients popup grid.
