# Katana Workflows And Selectors

This file documents Katana DOM contracts used by Katana Helpers. Validate these
against the real Chrome tab when changing workflow automation because the Codex
in-app browser does not run the installed Tampermonkey script.

## Sales Order Row Manufacturing

- Sales order row action button: `button[data-testid="soRowActionsMenu-button"]`.
- The Katana Helpers `EX` button is inserted immediately before that native row
  action button in the same parent container.
- Row action menu items observed on the fake Codex order:
  - `li[data-testid="soRowActionsMenu-item-makeToOrder"]` - "Make to order".
  - `li[data-testid="soRowActionsMenu-item-makeInBatch"]` - "Make to stock".
  - `li[data-testid="soRowActionsMenu-item-whichOneToChoose"]`.
  - `li[data-testid="soRowActionsMenu-item-addAttribute"]`.
  - `li[data-testid="soRowActionsMenu-item-delete"]`.
- `Make to stock` opens the native quick-add manufacturing order dialog.
- Sales order row availability columns observed in Chrome:
  - Sales items: `[role="gridcell"][col-id="availability3"]`.
  - Ingredients: `[role="gridcell"][col-id="materialAvailability"]`.
  - Both use `[data-testid="agGridColoredCell"]` for the visible status pill.

## Sales Order Missing Ingredients Popup

- Trigger: click the sales order row Ingredients cell,
  `[role="gridcell"][col-id="materialAvailability"]`, when it shows
  "Not available".
- Popup root: `[role="dialog"]`.
- Popup title label: `[data-testid="cardHeaderLabelUNDEFINED"]`, observed text
  "Missing and expected ingredients for".
- Product name: `[data-testid="cardHeaderName"]` or
  `[data-testid="headerNameUNDEFINED"]`.
- Close button: `button[data-testid="headerCloseButton"]`.
- Popup grid columns observed in Chrome:
  - `name` - ingredient name.
  - `missingQuantity` - missing quantity.
  - `make-buy-button` - expected-from action column.
- Missing quantity renderer test IDs:
  - `[data-testid="number-renderer-container-missingQuantity"]`.
  - `[data-testid="number-renderer-value-missingQuantity"]`.
  - `[data-testid="number-renderer-suffix-missingQuantity"]`.
- Native popup Make button: `button[data-testid="makeOrderButton"]`.
- Clicking a native popup `Make` button opens a nested quick-add
  manufacturing order dialog for that missing ingredient. The
  missing-ingredients popup remains open underneath.
- Katana Helpers does not add EX buttons inside the native popup grid.
- The popup can initially show `Loading...`; wait for popup grid rows before
  reading ingredient data.
- Feasibility notes for adding a helper button after clicking the native popup
  `Make` button are documented in
  `docs/native-make-create-ex-feasibility.md`.
- Feasibility notes for opening Inventory Intel from the Katana Helpers
  missing-ingredients side panel are documented in
  `docs/side-panel-inventory-intel-feasibility.md`.

## Inventory Intel Dialog

- Trigger observed in Chrome: the native missing-ingredients popup has an
  unlabelled button inside each `missingQuantity` cell.
- The icon button has no stable `data-testid`; match the popup row by
  ingredient name and missing quantity, then click
  `[role="gridcell"][col-id="missingQuantity"] button`.
- Inventory Intel opens as a second `[role="dialog"]` over the
  missing-ingredients dialog.
- Dialog title wrapper: `[data-testid="headerInventoryIntel"]`.
- Product name: `[data-testid="cardHeaderName"]` or
  `[data-testid="headerNameUNDEFINED"]`.
- Close button: `button[data-testid="headerInventoryIntelCloseButton"]`.
- Export button: `button[data-testid="IICExport"]`.
- Native Make button: `button[data-testid="makeOrderButton"]`.
- Movement grid columns observed in Chrome:
  - `movementDate`.
  - `causedBy`.
  - `quantityChange`.
  - `valuePerUnit`.
  - `balanceAfter`.
  - `valueInStockAfter`.
  - `averageCostAfter`.

## New Manufacturing Order Dialog

- Dialog root: `div[role="dialog"]`.
- Dialog content marker: `[data-testid="manufacturingOrderLayoutContent"]`.
- Dialog title: `[data-testid="quickAddBulkOrdersDialogTitle"]`, usually
  "New manufacturing order".
- Product label: `[data-testid="singleMOLayoutProductNameInput"]`.
- Quantity input: `input[data-testid="singleMOLayoutQuantityInput"]`.
  - Also has `name="quantity"` and `type="text"`.
  - Katana's observed default was `1`, even when the sales order row quantity
    was `5`.
- Calculated stock label/value:
  - `[data-testid="singleMOLayoutStockLabel"]`.
  - `[data-testid="singleMOLayoutStockLabelValue"]`.
- MO number field wrapper: `[data-testid="singleMOLayoutOrderNameField"]`.
  - The input inside has `name="orderNo"`.
- Native action buttons:
  - Cancel: `button[data-testid="cancelButton"]`.
  - Create: `button[data-testid="createAndCloseOrderButton"]`.
  - Create and view: `button[data-testid="createAndOpenOrderButton"]`.
- The native action buttons share one parent with Material UI classes similar
  to `MuiDialogActions-root-* MuiDialogActions-spacing-*`.
- Katana Helpers leaves the native buttons unchanged and can mount helper
  buttons into that same action parent:
  - `button#kh-create-ultra-mo-btn` - shown for the sales-order row single-click
    `EX` flow after Katana Helpers opens Make to stock.
  - `button#kh-create-ex-mo-btn` - shown when the user manually opens the
    Ingredients popup, clicks a native popup-row `Make`, and Katana opens a
    nested quick-add MO dialog for that missing ingredient.
- `button#kh-create-ex-mo-btn` is detected by the presence of both:
  - the quick-add MO dialog with `button[data-testid="createAndOpenOrderButton"]`
  - the underlying `Missing and expected ingredients for` dialog
- Both helper create buttons click Katana's native `Create and view` button,
  wait for the MO page, run Ultra ingredient verification, and return to the
  sales order if Ultra completes.

## Manufacturing Order Completion

- Entity status button: `button[data-testid="menuButton-entityStatus"]`.
- MO Done menu item: `li[data-testid="menuListItem-entityStatus-done"]`.
- Existing helper flow opens the status menu, clicks Done, and waits until the
  entity status context reads manufacturing/done.

## Ingredients Grid Availability

- Ingredients grid root: `#ingredients-grid`.
- Ultra EX scans the AG Grid body under:
  - `#ingredients-grid .ag-body.ag-layout-auto-height`, falling back to
    `#ingredients-grid .ag-body`.
  - `.ag-body-viewport`.
  - `.ag-center-cols-viewport`.
- Availability cells use `role="gridcell"` and `col-id="availability3"`.
- Availability text is classified as:
  - Empty text: loading.
  - Text containing "not available": not available.
  - Text containing "in stock": in stock.
  - Anything else: unknown.
- Ultra EX scrolls the grid viewport and merges statuses by row key. Row keys
  come from `row-id`, `row-index`, `aria-rowindex`, `dataset.rowId`,
  `dataset.rowIndex`, or `style.top`.

## Async And Fragility Notes

- The manufacturing dialog can initially render only "Loading ..."; wait for
  both the quantity input and `Create and view` button before injecting helper
  UI.
- Click-savings accounting is intentionally split by successful phase:
  - Double-click Ultra EX keeps the legacy values: `SAVED_CLICKS_EX_NORMAL`
    after the qty=1 MO opens, then `SAVED_CLICKS_ULTRA_EXTRA` only after Ultra
    marks Done and returns.
  - Single-click manual EX counts `SAVED_CLICKS_EX_MANUAL_DIALOG` only after
    the native Make to stock dialog is open and the `Create + Ultra` button is
    injected. This is estimated as two saved clicks: open row actions and choose
    Make to stock. Quantity entry is not counted because the user still does it.
  - Single-click manual EX counts `SAVED_CLICKS_ULTRA_EXTRA` only if
    `Create + Ultra` opens the MO and Ultra successfully marks it Done. This is
    estimated as two saved actions: set Done and return to the sales order.
  - The `Create + Ultra` click itself is not counted as a saved click because it
    replaces the native `Create and view` click the user would otherwise make.
- Material UI class suffixes are generated and should not be used as stable
  selectors.
- AG Grid virtualizes rows, so availability scanning must scroll the grid
  rather than only reading initially visible rows.
- Feasibility notes for showing missing ingredients beside the single-click
  `EX` quick-add manufacturing dialog are documented in
  `docs/ex-ingredients-side-panel-feasibility.md`.
- The dev userscript loads one server-side runtime and live bundle from
  `http://127.0.0.1:5174/`; normal source changes require
  `node tools/build-release.js` plus a Katana page refresh, not a Tampermonkey
  metadata edit.
- Do not update `devBootstrapVersion` in `tools/build-release.js` unless the
  dev bootstrap userscript code or metadata actually changed. A normal app
  version bump for source modules should leave the bootstrap version untouched,
  otherwise Tampermonkey will report an unnecessary bootstrap update.

## Katana Helpers Settings

- The bottom HUD includes an `Ingredient preview` checkbox.
- Setting storage key: `kh_so_ingredients_preview_enabled`.
- Default: enabled when the storage key is absent.
- When disabled, single-click `EX` does not open/read the sales order
  Ingredients popup and no missing-ingredients side panel is shown.
- When enabled, the side panel is still shown only for rows whose Ingredients
  cell text contains `Not available`.
