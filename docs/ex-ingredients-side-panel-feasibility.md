# EX Ingredients Side Panel Feasibility

Date: 2026-06-14

## Question

Can a single click on the sales order `EX` button open the native "New
manufacturing order" dialog and also show the missing ingredients view on the
right side, so the user can see shortages without clicking Ingredients?

## Current Code Path

- The sales order `EX` button is created in `src/features/soEx.js`.
- A single click runs `runSoManualUltraDialogFlow`.
- That flow opens the row action menu, chooses Katana's native
  `Make to stock` item, waits for the quick-add manufacturing order dialog,
  and injects `Create + Ultra` into the dialog actions.
- The quick-add dialog readiness check only waits for:
  - `input[data-testid="singleMOLayoutQuantityInput"]`
  - `button[data-testid="createAndOpenOrderButton"]`
- No existing code reads ingredients while the quick-add dialog is open.
- Ingredient availability reading currently lives in `src/features/ultraEx.js`
  and depends on the full manufacturing order page grid:
  - `#ingredients-grid`
  - `.ag-body-viewport`
  - grid cells with `col-id="availability3"`

## Chrome DOM Test

Tested in the user's real Chrome tab on `https://factory.katanamrp.com/` on
2026-06-14. No orders were created; the quick-add MO dialog was canceled after
inspection.

- The visible sales order row availability columns are AG Grid cells:
  - Sales items: `[role="gridcell"][col-id="availability3"]`
  - Ingredients: `[role="gridcell"][col-id="materialAvailability"]`
- The colored status pill inside both cells uses
  `[data-testid="agGridColoredCell"]`.
- Clicking the Ingredients `Not available` cell opens Katana's native modal
  titled `Missing and expected ingredients for`.
- The modal is a Material UI dialog:
  - popup root: `[role="dialog"]`
  - title label: `[data-testid="cardHeaderLabelUNDEFINED"]`
  - product name: `[data-testid="cardHeaderName"]` or
    `[data-testid="headerNameUNDEFINED"]`
  - close button: `button[data-testid="headerCloseButton"]`
- The popup contents are an AG Grid with these observed column IDs:
  - `name` - ingredient name
  - `missingQuantity` - missing quantity
  - `make-buy-button` - expected-from action column
- Missing quantity cells include:
  - `[data-testid="number-renderer-container-missingQuantity"]`
  - `[data-testid="number-renderer-value-missingQuantity"]`
  - `[data-testid="number-renderer-suffix-missingQuantity"]`
- The native `Make` action in the popup uses
  `button[data-testid="makeOrderButton"]`.
- On the tested row, the popup data was readable after the initial loading
  state. Example parsed row:
  - ingredient: `[2.5-RISER-IPP] 2.5 " Riser Block (IPP)`
  - missing quantity: `-6 pcs`
- After closing the ingredients popup, a single click on the same row's `EX`
  button opened the native `New manufacturing order` dialog as expected.
- The `EX` dialog used the existing documented selectors, including:
  - `[data-testid="manufacturingOrderLayoutContent"]`
  - `[data-testid="singleMOLayoutProductNameInput"]`
  - `input[data-testid="singleMOLayoutQuantityInput"]`
  - `button[data-testid="cancelButton"]`
  - `button[data-testid="createAndOpenOrderButton"]`
  - injected `Create + Ultra`

## Feasibility Finding

This is possible, but not by directly reusing the existing Ultra EX scanner
inside the quick-add dialog.

The existing scanner can only evaluate ingredients after Katana has opened a
real manufacturing order page that contains `#ingredients-grid`. The "New
manufacturing order" dialog shown by single-click `EX` does not currently expose
that grid in the documented selectors. Because of that, the script cannot simply
reuse `ultraEx.collectAllAvailabilityWithScrolling()` inside the dialog.

The best implementation path is:

1. In the single-click `EX` flow, click the row's
   `[col-id="materialAvailability"]` cell before opening Make to stock.
2. Wait for the `Missing and expected ingredients for` dialog to load.
3. Read and cache the popup product name and AG Grid rows.
4. Close the popup with `button[data-testid="headerCloseButton"]`.
5. Continue the existing `EX` flow to open Katana's quick-add manufacturing
   order dialog.
6. Render a Katana Helpers-owned side panel beside the quick-add dialog using
   the cached missing-ingredient rows.

This matches the requested workflow: the user clicks `EX` once, Katana Helpers
does the temporary Ingredients popup read in the background, then the user sees
the new MO dialog plus the missing-ingredients side panel.

The side panel should only render when the clicked sales order row's Ingredients
cell says `Not available`. Rows whose Ingredients cell is `In stock`, blank, or
anything other than `Not available` should keep the existing EX behavior without
opening the side panel.

The feature is controlled by the persistent `Ingredient preview` checkbox in
the Katana Helpers HUD. When it is off, single-click `EX` skips the Ingredients
popup read and behaves like the previous manual Ultra flow.

## Recommended Build Plan

Recommended implementation:

- Add a sales-order ingredient-popup reader module or helper in `soEx.js`.
- Scope reads to the same `.ag-row` as the clicked `EX` button.
- Use `[role="gridcell"][col-id="materialAvailability"]` as the popup trigger.
- Only run the popup reader when that cell text contains `Not available` and
  the HUD `Ingredient preview` toggle is enabled.
- Treat popup loading as asynchronous and wait until at least one `.ag-row`
  inside the dialog has cells for `name` and `missingQuantity`, or until a short
  timeout.
- Cache a plain data model, not Katana DOM nodes:
  - product
  - ingredient name
  - missing quantity value
  - missing quantity suffix
  - whether a native `Make` button was present
- Close the native popup before opening the Make to stock dialog.
- Render the side panel as Katana Helpers DOM attached near the quick-add dialog,
  and remove it when the dialog closes.
- Store the HUD toggle in localStorage under
  `kh_so_ingredients_preview_enabled`.

If the popup content can be read before or during the `EX` flow, implement a
new helper panel owned by Katana Helpers rather than trying to move Katana's
native popup DOM. Moving Material UI modal DOM is likely fragile because Katana
controls focus traps, overlays, escape handling, and modal cleanup.

## Risk Notes

- The full MO ingredients scanner cannot run until an MO page exists.
- Katana's modal/focus behavior may close one dialog when another opens.
- Missing quantities may depend on the quantity entered in the new MO dialog.
  If the native sales order popup uses sales order row quantity and the user
  changes the MO quantity, a cached preview may be wrong unless it is refreshed
  or clearly tied to the sales order quantity.
- The Chrome test was performed on a live sales order, not a fake Codex order,
  so validation was limited to opening/reading/canceling dialogs only.
- If this becomes user-facing behavior, bump the app version in both
  `tools/build-release.js` and `src/core/constants.js`, then run
  `node tools/build-release.js`.
