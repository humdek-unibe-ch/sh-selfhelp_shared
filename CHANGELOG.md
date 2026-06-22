<!--
SPDX-FileCopyrightText: 2026 Humdek, University of Bern
SPDX-License-Identifier: MPL-2.0
-->

# Changelog

All notable changes to `@selfhelp/shared` will be documented in this file.

This project follows semantic versioning.

## v1.14.23

Contract tidy on the back of the cross-repo style audit (no runtime behaviour
change).

### Removed

- **`IImageStyle.height` / `IImageStyle.width`** — orphan optional fields with no
  backing catalog field (image sizing is web-only via `web_width`/`web_height`).
  No renderer read them as typed props; the mobile renderer's dead
  `width`/`height` fallback was dropped in the same wave.

### Changed

- `rich-text-editor` registry description updated — it is a native inline-format
  toolbar **editor** on mobile, not the old "READ-ONLY viewer on mobile v1".
- `media.ts` interface closings reformatted (`;}` on one line → `;` + `}` on its
  own line) so line-based tooling (e.g. the backend style-field audit parser)
  reads each interface cleanly.

## v1.14.22

Field-naming unification (Option B): the `shared_*` field-name prefix is dropped
so that **no prefix = applies to both platforms**. `shared_*` (cross-platform
presentation) and the unprefixed `common` fields (cross-platform behaviour) were
the same scope, so the prefix was redundant. Backend migration
`Version20260622165615` renames the catalog in lockstep; consumers read the new
unprefixed field names. Pre-1.0 coordinated breaking change.

### Changed

- **47 `shared_*` style props renamed to unprefixed** across the style
  interfaces (`size`, `spacing`, `radius`, `color`, `variant`, `gap`, `cols`,
  `justify`, `align`, `direction`, `wrap`, `full_width`, `orientation`,
  `multiple`, `clearable`, `searchable`, `max_length`, `min_rows`/`max_rows`,
  `mih`/`miw`/`mah`/`maw`, `grid_*`, `buttons_*`, `btn_*_color`, `text_align`,
  `vertical_spacing`, `line_clamp`, `label_position`, `with_close_button`,
  `*_variant`, …). The rule is now: no prefix = both platforms (translatable
  when `display=1`), `web_`/`mobile_` = platform-specific.

### Kept (reserved-name exceptions)

- **`shared_height`, `shared_width`, `shared_icon`** keep their prefix. The bare
  names `height`/`width`/`icon` already exist as **page-type** fields in the
  globally-unique backend `fields` table (page `icon` is live on real pages), so
  these three style fields cannot drop the prefix without a collision.

## v1.14.21

Style authoring upgrade contracts for the form / notification / show-user-input
styles (approved `/style` run, 2026-06-22). All additions are optional and the
two notification renames are pre-1.0 portability promotions; consumers read the
new field names.

### Added

- **`IFormStyle.title` + `description`** — optional auto-styled heading/subtitle
  rendered above `form-record` / `form-log` when set (empty = unchanged).
- **`IFormStyle.alert_success_title` + `alert_error_title`** — translatable
  headings for the success/error alerts (were hardcoded `Success`/`Error`).
- **`IFormStyle.confirm_submit` + `confirm_message`** — optional
  confirm-before-save dialog (off by default).
- **`IShowUserInputStyle.title` + `empty_text`** — optional heading and a
  configurable empty-state message (was hardcoded `No entries found.`).

### Changed

- **`INotificationStyle`** — `web_left_icon` → **`shared_icon`** and
  `web_notification_with_close_button` → **`shared_with_close_button`**: the icon
  and dismiss toggle are now portable so the mobile renderer honours them too.
  (`web_left_icon` stays a web-only field on the other 15 styles that use it.)

## v1.14.20

Type-contract drift fixes for three styles, reconciling the `@selfhelp/shared`
interfaces with the live `admin/styles/schema` catalog. All additions are
optional fields the DB already returns, so the contract stays backward
compatible.

### Added

- **`IResetPasswordStyle.shared_color`** — the `reset-password` style has a
  `shared_color` field in the CMS (the submit/link-button accent, default
  `blue`), which the web `ResetPasswordStyle` renderer already reads via an
  inline cast. Typing it removes the cast and documents the cross-platform
  button colour.
- **`IValidateStyle.label_timezone`** — the `validate` activation form renders a
  timezone select for anonymous users; its label field existed in the DB but was
  missing from the type.
- **`IShowUserInputStyle.data_table`** — the `show-user-input` style binds to a
  source data table (`data_table`, common scope); the field was in the DB and
  documented in the reference but missing from the type.

## v1.14.19

Fixes for the select renderers (web label + mobile multi-select), both additive
so the contract stays backward compatible.

### Added

- **`ISelectStyle.label`** — the `select` style has always had a `label`
  (markdown-inline, content scope) field in the CMS, but the type omitted it, so
  the web `SelectStyle` renderer never displayed it. Typing it lets the frontend
  render the label like every other form field.
- **`IMobileSelectProps.multiple`** — multi-select mode for the mobile select
  adapter (CMS `is_multiple`). The contract value stays a single string, now a
  comma-separated list in multiple mode; the adapter maps it to HeroUI Native's
  `selectionMode="multiple"`.

## v1.14.18

Mobile-only capability pass (backend migration `Version20260622145334`): HeroUI
Native props that have no web/Mantine equivalent, exposed as `mobile_*` CMS
fields so authors configure the native look from the CMS. The web renderer
ignores `mobile_*`. All additions are optional, so the contract stays backward
compatible.

### Added

- **Type aliases**: `TMobileSelectPresentation` (`'bottom-sheet' | 'dialog' |
  'popover'`), `TMobileFieldVariant` (`'primary' | 'secondary'`),
  `TMobileButtonFeedback` (`'scale-highlight' | 'scale-ripple' | 'scale' |
  'none'`).
- **`ISelectStyle` / `IComboboxStyle`**: `mobile_select_presentation` — how the
  HeroUI Native option list opens (combobox reuses the mobile select renderer).
- **`IButtonStyle`**: `mobile_button_feedback` — HeroUI Native press feedback.
- **`ISliderStyle` / `IRangeSliderStyle`**: `mobile_slider_show_value` /
  `mobile_range_slider_show_value` — toggle the HeroUI Native `Slider.Output`
  value bubble.
- **`ITextInputStyle` / `ITextareaStyle` / `ICheckboxStyle`**:
  `mobile_input_variant` / `mobile_textarea_variant` / `mobile_checkbox_variant`
  — HeroUI Native primary/secondary field variant.
- **Mobile adapter contract**: `IMobileSelectProps.presentation`,
  `IMobileButtonProps.feedbackVariant`, `IMobileInputProps.variant`,
  `IMobileTextareaProps.variant`, `IMobileCheckboxProps.variant`.

## v1.14.17

Mobile adapter contract additions for the form capability pass (so the mobile
`TextInput` / `Textarea` renderers can honour the new `shared_max_length` and
`mobile_*` fields through the adapter seam). All additions are optional.

### Added

- **`IMobileInputProps`**: `maxLength` (RN `maxLength`, from `shared_max_length`),
  `autoCapitalize` (`'none' | 'sentences' | 'words' | 'characters'`, from
  `mobile_auto_capitalize`), and `'url'` added to the `keyboardType` union.
- **`IMobileTextareaProps`**: `maxLength` + `autoCapitalize` (same mapping).

## v1.14.16

Form / interactive capability pass (backend migration
`Version20260622132034`). All additions are optional, so the contract stays
backward compatible; the one removal (`ISelectStyle.alt`) drops a field that no
renderer read.

### Added

- **`INumberInputStyle`**: `web_number_input_prefix`,
  `web_number_input_suffix`, `web_number_input_thousand_separator`,
  `web_number_input_allow_negative`, `web_number_input_hide_controls` — Mantine
  `NumberInput` currency/unit affixes + formatting/spinner toggles.
- **`IColorInputStyle`**: `web_color_input_with_eye_dropper`,
  `web_color_input_disallow_input`, `web_color_input_with_preview` — Mantine
  `ColorInput` picker behaviour toggles.
- **`ITabsStyle`**: `web_tabs_grow`, `web_tabs_justify`,
  `web_tabs_keep_mounted`, `web_tabs_placement` — Mantine `Tabs` list layout +
  panel mount behaviour.
- **`ISwitchStyle`**: `web_switch_with_thumb_indicator`,
  `web_switch_thumb_icon` — Mantine `Switch` thumb indicator + optional thumb
  icon.
- **`ITextInputStyle` / `ITextareaStyle`**: `shared_max_length` (cross-platform
  max characters) plus mobile keyboard knobs `mobile_keyboard_type`,
  `mobile_auto_capitalize`, and (text-input only) `mobile_secure_entry`.
- **`IProgressRootStyle.shared_radius`** — corner radius for the progress track
  (links the existing shared radius field).

### Removed

- **`ISelectStyle.alt`** — unused legacy field; no web or mobile renderer read
  it. Backend migration unlinks it from the `select` style.

## v1.14.15

Style-catalog field additions for the typography / media / interactive pass
(backend migration `Version20260622110041`). All additions are optional, so the
contract stays backward compatible.

### Changed

- **`IBlockquoteStyle`**: the quote body now uses a dedicated
  `blockquote_content` (markdown-inline) field instead of the generic shared
  `content`, so authors can apply inline bold/italic/links inside a quote without
  affecting the `code` style (which keeps the plain `content` field). Renderers
  must read `blockquote_content`.
- **`IVideoStyle` / `IAudioStyle`** now extend `IStyleWithSpacing` (they expose
  the standard spacing block like the other media styles).

### Added

- **`IImageStyle.fallback_src`** — image shown when the main source fails to load
  (maps to Mantine `Image.fallbackSrc`).
- **`IFigureStyle.img_src` + `IFigureStyle.alt`** — optional built-in image so a
  figure can render without a child image section (renderer only; never
  auto-creates a section).
- **`ILinkStyle.shared_color`, `web_link_underline` (`'always' | 'hover' |
  'never'`), `web_left_icon`, `web_right_icon`** — link colour, Mantine `Anchor`
  underline behaviour, and optional leading/trailing icons.
- **`IActionIconStyle.aria_label`** — accessible name for the icon-only control.
- **`ISpoilerStyle.shared_color`** — colour of the show/hide control.
- **`IVideoStyle`**: `video_src`, `poster_src`, `has_controls`, `media_loop`,
  `media_autoplay`, `media_muted` playback fields (`'0' | '1'` toggles).
- **`IAudioStyle`**: `alt`, `has_controls`, `media_loop`, `media_autoplay`.
- New `TMantineAnchorUnderline` union exported from the interactive style types.

## v1.14.14

Cross-platform **inline rich-text** keystone. CMS authors can apply lightweight
inline formatting (Ctrl+B bold, Ctrl+I italic, Ctrl+U underline, links) to
`markdown-inline` content fields. Web could already render that HTML subset, but
React Native `<Text>` cannot render HTML, so mobile (and several web leaf slots)
used to strip it and the formatting was lost. This adds the canonical parser that
turns the safe subset into a flat list of formatted runs each platform can render
natively (web → `<strong>/<em>/<u>/<a>`, mobile → nested `<Text>`).

### Added (`content`)

- **`parseInlineRich(value)`** → `IInlineNode[]`: parses the safe inline subset
  (`<strong>`/`<b>`, `<em>`/`<i>`, `<u>`, `<a href>`) into `{ text, bold?,
  italic?, underline?, href? }` runs. Block tags (`<p>`, `<div>`, headings,
  lists, `<blockquote>`) and `<br>` collapse to a single space (an inline text
  slot cannot lay out blocks); unknown tags are dropped but their text kept;
  HTML entities are decoded; adjacent same-format runs are merged.
- **`hasInlineFormatting(value)`** → `boolean`: cheap check for whether a string
  carries any supported inline tag (lets renderers fast-path plain strings).
- **`stripHtmlToText(value)`**: the canonical plain-text strip (web `stripHtmlTags`
  / mobile `sanitizeContent` mirror this) — drop tags, decode entities, collapse
  whitespace, block tags → spaces.
- **JSON-aware (hard):** any value that parses as JSON is returned untouched, so
  structured content payloads are never mangled.
- New `IInlineNode` type and `./content` re-export from the package root.

Consumers (frontend web + mobile) currently use behaviour-identical local copies
of the parser/strip (mirroring the existing `stripHtmlToText` pattern); folding
them onto this shared export is a follow-up.

## v1.14.13

`css_mobile` Tailwind-class lockstep fix. The web CMS class dropdown
(`generate-css-classes.js`) offers the **standard Tailwind numeric color scale**
(`bg-blue-500`, `text-gray-800`, `border-red-500`, …), but Tailwind v4's default
palette is authored in `oklch()`, which React Native cannot parse — so the mobile
allow-list only ever accepted the hex-backed Mantine scale (`bg-blue-6`) and
silently dropped every dropdown color class on mobile. Authors saw colored
backgrounds on web and nothing on mobile.

### Fixed (`cms-classes`)

- **Standard Tailwind color scale → Mantine hex scale remap** in
  `src/cms-classes/remap.ts`: `bg-/text-/border-{name}-{50..950}` is now rewritten
  onto the RN-safe Mantine scale (`…-{0..9}`) instead of being dropped. Tailwind-only
  names (`slate`, `purple`, `sky`, `emerald`, `amber`, …) alias to their nearest
  Mantine palette. This is a deliberate, documented web→mobile remap (shade is the
  closest visual match).
- **`text-white` / `text-black`** are now allow-listed (plain colors, RN-safe).
- The web dropdown's interactive-state classes (`hover:*`, `focus:ring-*`,
  `focus:outline-none`) are remapped to drop cleanly on mobile instead of warning.

Patch bump (additive remap/allow-list; no contract change).

## v1.14.12

Layout cross-platform pass — the 13 layout styles (`container`, `box`, `flex`,
`group`, `stack`, `simple-grid`, `grid`, `grid-column`, `space`, `divider`,
`paper`, `center`, `scroll-area`) are now configurable on mobile, not just web.
The portable sizing/behaviour props that were trapped under `web_*` were promoted
to `shared_*` so the same field drives the Mantine (web) and the React-Native
(mobile) renderer through the semantic mapper. Pairs with backend migration
`Version20260622063129`. Patch bump (pre-1.0; style contracts are renamed/additive
but not guaranteed backward compatible).

### Changed (style contracts in `types/styles/layout.ts`)

- **width/height are cross-platform**: `web_width`/`web_height` → `shared_width`/
  `shared_height` on `flex`, `group`, `stack`, `grid`, `grid-column`, `simple-grid`,
  `center`, and (height only) `scroll-area`, typed `TSharedDimension`.
- **`grid`/`simple-grid` columns**: `web_cols` → `shared_cols` (`TSharedCols`);
  `simple-grid` gains `shared_gap`, `shared_vertical_spacing`, and the web-only
  responsive overrides `web_cols_sm`/`web_cols_md`/`web_cols_lg`.
- **`grid-column`**: `web_grid_span|offset|order|grow` → `shared_grid_*`; now
  extends `IStyleWithSpacing`.
- **`center`**: `web_miw|mih|maw|mah` → `shared_miw|mih|maw|mah`; now extends
  `IStyleWithSpacing`.
- **`divider`**: `web_divider_variant` → `shared_divider_variant`
  (`TSharedDividerVariant`), `web_divider_label_position` →
  `shared_divider_label_position` (`TSharedDividerLabelPosition`); now extends
  `IStyleWithSpacing`.
- **`space`**: `web_space_direction` → `shared_orientation`.
- **`paper`**: `web_border` → `shared_border` (`TSharedBorder`, matches `card`)
  plus a new optional auto-styled `title` content field; `web_px`/`web_py` removed
  (padding is the portable `shared_spacing`).
- **`container`**: `web_px`/`web_py` removed (padding via `shared_spacing`).

### Added (semantic mapper `theme/semantic.ts`)

- **`parseDimensionToReactNative`** / **`parseDimensionToWeb`**: turn a CMS
  dimension (`"320px"`/`"100%"`/`"auto"`) into an RN-safe value (a `px` suffix
  becomes a unitless number; web keeps the string verbatim).
- **`gridSpanToReactNativeColumn`**: convert a Mantine `Grid.Col` span into the RN
  flex layout (`flexBasis`/`flexGrow`/`flexShrink`) for the emulated mobile grid.
- **`mapDividerVariantToReactNative`**: map `shared_divider_variant` onto an RN
  `borderStyle` (identical vocabulary, validated; defaults to `solid`).

## v1.14.11

Style polish wave (card) — remove the redundant web-only card padding control.
`ICardStyle` already extends `IStyleWithSpacing` (`shared_spacing`), whose padding
side renders on web AND mobile, so the separate `web_card_padding` (Mantine
`padding` prop) was a duplicate that confused authors. Patch bump: one optional
field removed from a style contract (pre-1.0, not backward compatible). Pairs with
backend migration `Version20260619205908` (unlinks the field from `card`; it stays
on `validate`) and the web `CardStyle` renderer (fixed `padding="md"` default).

### Removed

- **`ICardStyle.web_card_padding`**: padding is now the portable `shared_spacing`
  (`pt`/`pb`/`ps`/`pe`) field exclusively. The web renderer keeps a fixed Mantine
  inner padding (`"md"`) as the default + Card.Section image-bleed reference.

## v1.14.10

Style polish wave (mobile) — extend the mobile checkbox adapter contract so the
`checkbox` style's `shared_label_position` is honoured on mobile too (it already
worked on web via Mantine `labelPosition`). Patch bump: one additive optional
adapter prop.

### Added

- **`IMobileCheckboxProps.labelPosition`** (`'left' | 'right'`, optional,
  defaults to `right`): mirrors the cross-platform `shared_label_position` field
  so the mobile `MobileCheckbox` adapter can place the label before or after the
  box, matching the web Mantine `labelPosition`.

## v1.14.9

Style polish wave (card / card-segment / checkbox / chip / code / title) — align
the typed contracts with the backend `Version20260619191224` migration and the
coupled web + mobile renderer reads. Patch bump: renamed optional style fields,
additive optional content/visual fields, and a new additive mobile mapper helper.

### Changed

- **`ICardStyle`:** border is now the cross-platform `shared_border`
  (`TSharedBorder`); the web-only `web_border` was replaced (the global
  `web_border` field stays on indicator/notification/paper/validate). Added the
  optional auto-styled `title` and `img_src` content fields (rendered only when
  non-empty) and the explicit `web_card_padding` (`TMantineCardPadding`).
- **`ICardSegmentStyle`:** added `shared_border` (Mantine `Card.Section`
  `withBorder` / themed divider on mobile) and the web-only
  `web_segment_inherit_padding` (Mantine `inheritPadding`).
- **`ICheckboxStyle`:** `web_checkbox_label_position` →
  `shared_label_position` (`TSharedLabelPosition`; honoured on both platforms).
- **`IChipStyle`:** `web_chip_variant` → `shared_chip_variant`
  (`TMantineChipVariant`; cross-platform).
- **`ICodeStyle`:** `web_code_block` → `code_block` (cross-platform
  block-vs-inline) and added `shared_radius` (`TSharedRadius`).
- **`ITitleStyle`:** added `shared_color` (`TMantineColor`); `web_title_order` →
  `title_order` (`TMantineTitleOrder`) and `web_title_line_clamp` →
  `shared_line_clamp` (`TMantineTitleLineClamp`). `web_title_text_wrap` stays
  web-only.

### Added

- **`mapChipVariantToHeroUiVariant(variant)`:** maps the chip variant token
  (`filled`/`outline`/`light`) onto the HeroUI Native Chip `variant`
  (`primary` | `secondary` | `tertiary` | `soft`): filled → primary, light →
  soft, outline → tertiary.
- **`TSharedBorder`, `TMantineCardPadding`, `TSharedLabelPosition`** helper types.

## v1.14.8

Accordion polish wave (accordion / accordion-item) — align the typed contracts
with the backend `Version20260619183601` migration and the coupled web + mobile
renderer reads. Patch bump: a renamed optional style field, one additive optional
content field, and a new additive mobile mapper helper.

### Changed

- **`IAccordionStyle`:** the variant is now the cross-platform
  `shared_accordion_variant` (`TMantineAccordionVariant`); the web-only
  `web_accordion_variant` was renamed (the backend migrated the field by id, so
  authored values + options are preserved). Web maps it to the Mantine variant;
  mobile maps it through `mapAccordionVariantToHeroUiVariant`.

### Added

- **`IAccordionItemStyle.description`:** optional translatable subtitle
  (`IContentField<string>`) rendered under the item label on both platforms;
  empty = hidden.
- **`mapAccordionVariantToHeroUiVariant(variant)`:** maps the accordion variant
  token (`default`/`contained`/`filled`/`separated`) onto the HeroUI Native
  Accordion `variant` (`default` | `surface`) — boxed Mantine variants collapse
  to `surface`.

## v1.14.7

Mobile button authored-colour parity. Patch bump: one additive optional prop on
the mobile button adapter contract.

### Added

- **`IMobileButtonProps.accentColor`:** optional resolved hex that overrides the
  HeroUI variant fill so a CMS style can colour the mobile button for
  cross-platform parity with the web Mantine `color` prop (e.g. `login`'s
  `shared_color`). The adapter keeps the variant's readable foreground (white
  label on a filled button); leave undefined to use the variant's themed colour.
  Resolve it through `resolveMantineVariant(...).accent`, never a hard-coded hex.

## v1.14.6

Style polish wave (alert/badge/avatar/button/login) — align the typed contracts
with the backend `Version20260619131830` migration. Patch bump: additive/renamed
optional style fields plus a behaviour-preserving mapper lint fix.

### Changed

- **`IButtonStyle`:** the variant is now the cross-platform `shared_variant`
  (`TMantineVariant`); the button-only `web_variant` was removed (the backend
  migrated existing values onto `shared_variant`).
- **`IBadgeStyle`:** added the cross-platform `shared_variant`
  (`TMantineBadgeVariant`) as the primary control and a `circle` toggle;
  `web_variant` stays as an optional web-only override (e.g. `dot`).
- **`IAvatarStyle`:** renamed the stale `web_avatar_variant` to `web_variant`
  (matches the DB field) and added the `name` field (auto-initials + auto colour).
- **`IAlertStyle`:** renamed `web_with_close_button` to the cross-platform
  `closable` (the DB field is now `common`-scoped so mobile can honour it).
- **`ILoginStyle`:** added the optional translatable `subtitle` and the
  `shared_color` submit-button colour (both now in the live catalog).
- **`semantic.ts`:** removed an unnecessary `as TSemanticColor` assertion
  (`TMantineColor` already collapses to `string`); resolves a pre-existing
  `@typescript-eslint/no-unnecessary-type-assertion` lint error. No behaviour
  change — `resolveSharedStyleProps`/`toHeroUiSemanticProps` already read
  `shared_variant`/`shared_color`, so the new badge/button variants flow through
  the existing mapper unchanged.

## v1.14.5

Semantic mapper completion — reconcile the shared mapper with the live DB
catalog (style-field audit, "shared semantics disconnected from the database").
Minor bump: additive new exports + the `toHeroUiSemanticProps` /
`resolveSharedStyleProps` resolvers now read the REAL cross-platform appearance
fields instead of the phantom `shared_intent`. Pairs with the coupled mobile
renderer reads (mobile `mobileStyleProps` + the layout/typography/interactive
components switched from phantom `web_*` to the real `shared_*` fields).

### Added

- **`semantic.ts` — Mantine → HeroUI Native maps:** `mapMantineColorToHeroUiColor`,
  `mapMantineColorToHeroUiButtonVariant`, `mapMantineVariantToHeroUiButtonVariant`,
  plus the `TSemanticColor` / `TSemanticVariant` types. These turn the catalog's
  Mantine palette/variant values (stored verbatim in `shared_color` /
  `shared_variant`) into the HeroUI Native button/colour vocabulary.
- **`ISharedStyleProps`:** new optional `color` / `variant` fields (the real
  cross-platform appearance inputs).

### Changed

- **`resolveSharedStyleProps`:** now reads `shared_color` + `shared_variant`
  (the fields the DB actually has, and the same ones the web renderer reads). The
  legacy `shared_intent` read is kept as a back-compat fallback only — it is not
  in the live catalog.
- **`toHeroUiSemanticProps`:** appearance precedence is now `shared_variant` →
  `shared_color` → legacy `intent`, mirroring the web renderer. Existing
  intent-only callers are unaffected (intent stays the final fallback).

### Notes

- The web frontend does not consume this mapper (it reads `shared_*` straight
  into Mantine), so this change is mobile-facing only; web behaviour is unchanged.
- Fixes the latent bug where CMS-authored `shared_color` / `shared_variant` were
  silently dropped on mobile because the mapper only looked for `shared_intent`.

## v1.14.4

Style-field cleanup slice 9 — spacing consolidation (RF-15). Pairs with backend
migration `Version20260619100642` and the coupled web + mobile renderer reads.
Patch bump: the legacy margin-only `web_spacing_margin` is merged into the
portable box-model `shared_spacing`, so spacing is one cross-platform field.

### Changed

- **`IStyleWithSpacing`:** dropped `web_spacing_margin`. Every spacing-capable
  style now uses the single portable `shared_spacing` box-model field (margin +
  padding), mapped to both platforms. The backend migration repoints the 39
  margin-only style links + their authored section values onto `shared_spacing`
  and drops the `web_spacing_margin` field and its `spacing-margin` field type.

### Notes

- Both fields stored the **same** box-model JSON (`{"mt":"md",…}`) and were
  mutually exclusive at the style level, so this is a value-preserving merge, not
  a format conversion.
- Web `BasicStyle` drops its `?? web_spacing_margin` fallback (now always
  `shared_spacing`). Mobile `buildSectionClasses` now reads `shared_spacing`
  first (it previously read a non-existent field name and the margin-only one,
  giving the 37 `shared_spacing` styles no mobile spacing — now fixed); the
  legacy `web_spacing_margin` is kept only as a transitional read-fallback.

## v1.14.3

Style-field cleanup slice 7 — form/validate button knobs (RF-21).
Pairs with backend migration `Version20260619100044` and the coupled web + mobile
renderer reads. Patch bump: `web_*` → `shared_*` rename of the portable button
knobs on the custom composite form styles, so the mobile custom form renders the
same authored config as the web Mantine form.

### Changed

- **`IFormStyle` (`form-log` / `form-record`):** `buttons_size` /
  `buttons_radius` / `buttons_variant` / `buttons_position` / `btn_save_color` /
  `btn_cancel_color` → the `shared_*` equivalents, and the previously-missing
  `shared_buttons_order` is added. (The catalog field is `web_buttons_*`; the web
  `FormStyle` had been reading the un-prefixed names, which matched neither the
  catalog nor the type — so its button styling silently fell back to defaults.
  This rename fixes that latent bug and unblocks mobile.)
- **`IFormRecordStyle`:** `btn_update_color` → `shared_btn_update_color`.
- **`IValidateStyle`:** `web_buttons_size` / `web_buttons_radius` /
  `web_buttons_variant` / `web_buttons_position` / `web_buttons_order` /
  `web_btn_save_color` / `web_btn_cancel_color` → the `shared_*` equivalents
  (the web `ValidateStyle` already read the `web_` names correctly; both
  renderers now agree on `shared_*`).

### Notes

- Pure web cosmetics stay `web_`: `web_card_padding`, `web_card_shadow`,
  `web_border` on `validate` (RF-16 — no clean React Native peer).
- The mobile `FormUserInput` now builds its action row from these knobs
  (`shared_btn_save_color` / `shared_btn_cancel_color`, `shared_buttons_order` /
  `_position` / `_size` / `_radius` / `_variant`), themed inline.

## v1.14.2

Style-field cleanup slice 6 — mobile configurability (RF-17, RF-18, RF-19).
Pairs with backend migration `Version20260619095732` and the coupled web + mobile
renderer reads. Patch bump: behaviour/sizing knobs promoted from the web-only
`web_*` prefix to the semantic `shared_*` prefix so the mobile renderer can read
the same authored value.

### Changed

- **`ISelectStyle` (RF-17):** the stale, DB-absent `live_search` / `allow_clear`
  are replaced by the portable `shared_searchable` / `shared_clearable`. The web
  `SelectStyle` now reads them (previously hard-coded: searchable on, clearable
  when not required — preserved as defaults). Mobile maps them to its
  search-field / clear affordance where the select adapter supports it.
- **`ITextareaStyle` (RF-18):** `web_textarea_autosize` → `shared_autosize`,
  `web_textarea_min_rows` → `shared_min_rows`, `web_textarea_max_rows` →
  `shared_max_rows`. Row sizing is portable (mobile maps to `numberOfLines` /
  auto-grow). `web_textarea_resize` / `web_textarea_variant` stay web-only (RF-16
  — no clean RN peer). The redundant `web_textarea_rows` is also renamed to
  `shared_rows` in the catalog (read by no renderer; Mantine uses min/max rows).
- **`IAccordionStyle` (RF-19):** `web_accordion_multiple` → `shared_multiple`
  (selection mode — single vs multiple open). Both the web `AccordionStyle` and
  the mobile `Accordion` already read it; only the name changes.
  `web_accordion_variant` stays web-only (Mantine-specific visual, RF-16).

### Notes

- **RF-20** (`button` / `link` `open_in_new_tab`) needed no change — the field is
  already unprefixed/common and both renderers already read it (web opens a new
  tab; mobile `Link`/`Button` open via `Linking`/in-app navigation).

## v1.14.1

Style-field cleanup slice 5 — DB↔type reconciliation tail (RF-12, RF-22, RF-23).
Pairs with backend migration `Version20260619095112` and the coupled web + mobile
renderer reads. Patch bump: type-only changes (stale-field drops + one canonical
rename); no runtime/registry code reads these by name.

### Changed

- **`IValidateStyle.cancel_url` → `btn_cancel_url` (RF-12).** The cancel-button
  target page is one concept across the form family: the DB, `form-log`/
  `form-record`, `FormStyle` (web), and the mobile `FormUserInput` all use
  `btn_cancel_url`. Only `validate` (type + web renderer) used the divergent
  `cancel_url`, so the cancel button never resolved a URL. Renamed to the
  canonical name; the web `ValidateStyle` now reads `btn_cancel_url` (the DB
  already has the field, so no migration is needed for this).

### Removed

- **`IProfileStyle`: dropped `alert_fail`, `alert_del_fail`, `alert_del_success`,
  `alert_success` (RF-22).** Runtime evidence: no web or mobile renderer reads
  these on `profile` (it uses the per-section `profile_*_success` /
  `profile_*_error_general` copy instead). They were stale type fields and never
  existed in the catalog.
- **`IValidateStyle`: dropped `label_login`, `success`, `page_keyword`,
  `value_name` (RF-12).** Not present in the catalog and read by no renderer
  (`validate` is a web-only activation surface; the web renderer reads
  `success_title`, not `success`). `page_keyword` / `value_name` were never
  catalog fields here.

### Notes

- `two-factor-auth` heading is unified on `title` (DB seeded it in slice 4; the
  mobile `TwoFactorAuth` now reads `title` instead of the divergent
  `label_title`). The unused DB `label` link on `two-factor-auth` is dropped by
  the backend migration.
- `validate.label_timezone` exists in the catalog but no renderer reads it yet
  (first-login timezone selection is a documented gap); it is intentionally NOT
  added to the type until a renderer consumes it.

## v1.14.0

Style-field cleanup slice 3 — semantic variant promotion (RF-14) plus the
translatable `web_*` un-prefix sweep (RF-35). Pairs with backend migration
`Version20260619093723` and the coupled web + mobile renderer reads. These are
pure field renames; no mapper/registry/runtime code reads them by name, so the
type surface is the only change here (pre-stable: shipped as a minor).

### Changed

- **`web_button_variant` → `shared_variant` (RF-14).** The error/surface styles
  (`missing`, `no-access`, `not-found`) carry a button variant that is a semantic
  token both platforms should honour, so it loses the `web_` prefix and its
  backend scope flips from `web` to `shared` (scope is derived from the name
  prefix). Renamed on `IMissingStyle`, `INoAccessStyle`, `INotFoundStyle` in
  `error`.
- **Translatable `web_*` content fields lose the `web_` prefix (RF-35).** Every
  `display = 1` field is already grouped as `content` by the backend regardless
  of prefix (so it was always shipped to both platforms) — the `web_` prefix was
  a naming lie. Un-prefixed across `forms`, `typography`, `layout`, and
  `composite`:
  - `web_radio_options` → `radio_options`,
    `web_combobox_options` → `combobox_options`,
    `web_segmented_control_data` → `segmented_control_data`,
    `web_slider_marks_values` → `slider_marks_values`,
    `web_range_slider_marks_values` → `range_slider_marks_values`
  - `web_switch_on_label` → `switch_on_label`,
    `web_switch_off_label` → `switch_off_label`
  - `web_spoiler_show_label` → `spoiler_show_label`,
    `web_spoiler_hide_label` → `spoiler_hide_label`
  - `web_color_picker_saturation_label` → `color_picker_saturation_label`,
    `web_color_picker_hue_label` → `color_picker_hue_label`,
    `web_color_picker_alpha_label` → `color_picker_alpha_label`
  - `web_datepicker_placeholder` → `datepicker_placeholder`,
    `web_rich_text_editor_placeholder` → `rich_text_editor_placeholder`
  - `web_tooltip_label` → `tooltip_label`,
    `web_highlight_highlight` → `highlight_highlight`,
    `web_divider_label` → `divider_label`,
    `web_list_item_content` → `list_item_content`
  - The web-only *presentation* twins keep their prefix (e.g.
    `web_divider_label_position`, `web_radio_card`, `web_color_format`).

## v1.13.0

Style-field cleanup slice 2 — semantic colour promotion (RF-13) plus two
field-name fixes (RF-36, RF-37). Pairs with backend migration
`Version20260619092612` and the coupled web + mobile renderer reads. No
mapper/registry/runtime code reads these fields by name (the
`resolveMantineVariant(variant, color)` resolver is value-based), so the type
surface is the only change here (pre-stable: shipped as a minor).

### Changed

- **`web_color` → `shared_color` (RF-13).** Colour is a semantic token both
  platforms use — an author setting a login / alert / button colour must have it
  apply on mobile too — so it loses the `web_` prefix and its backend scope flips
  from `web` to `shared` (scope is derived from the name prefix). Renamed on
  every interface that carried it across `forms`, `interactive`, `typography`,
  `layout`, `composite`, and `error`. The web-only colour-widget config fields
  (`web_color_format`, `web_color_input_*`, `web_color_picker_*`) are
  intentionally left `web_` — they configure the colour-picker UI, not a
  semantic colour.
- **`web_checkbox_labelPosition` → `web_checkbox_label_position` (RF-37).** The
  catalog field name now follows the `snake_case` field-naming rule.

### Removed

- **`web_image_src` / `web_image_alt` removed from `IImageStyle` family
  context (RF-36).** They duplicated the `img_src` / `alt` content fields the
  renderers already read; the catalog drops the duplicates. (They were already
  absent from the shared types; this entry records the coupled catalog removal.)

## v1.12.0

Style-field cleanup slice 1 — the type surface now matches backend migration
`Version20260619090609`. No mapper/registry/runtime code consumed any of these
fields, so this is a type-only change (pre-stable: shipped as a minor).

### Removed

- **`use_web_style` removed from every style interface (RF-01).** The
  Mantine/raw toggle is retired — the web renderer always renders Mantine. The
  optional `use_web_style` field is dropped from all 59 style interfaces across
  `forms`, `interactive`, `composite`, `layout`, `typography`, `media`, and
  `unknown`.
- **`is_log` removed from `IFormStyle` (RF-04/05).** Record vs log is decided by
  the style (`form-record` / `form-log`), never a content field — separate form
  styles already encode it.
- **Stale auth fields removed:** `type` from `ILoginStyle` and
  `IResetPasswordStyle` (RF-02; never existed in the DB) and the legacy
  email-send leftovers `subject_user` + `is_html` from `IResetPasswordStyle`
  (RF-06; reset email now goes through the mail templates).
- **`close_button_label` removed from `IAlertStyle`** (stale; not in the DB).

### Changed

- **`IAlertStyle.web_alert_title` → `alert_title` (RF-10).** The alert heading is
  translatable content shared by web and mobile, so it loses the `web_` prefix.

## v1.11.0

### Added

- **Mobile UI adapter contract is now a single public source
  (`IMobileUiAdapters` + the `IMobile*Props` capability interfaces).** Mobile
  rendering plan sections 8.3 / 9: both mobile tiers (the public app's
  open-source adapters and the private `@selfhelp/mobile-pro-ui` overrides) now
  consume one contract from `@selfhelp/shared` instead of each repo keeping a
  hand-synced copy. The module is type-only (it imports `react` types and the
  shared semantic scales `THeroUiSize`/`THeroUiButtonVariant`; it pulls in no
  React Native runtime dependency), which is why it lives here rather than in a
  separate contract package. The milestone-one capability set is
  `MobileButton`, `MobileText`, `MobileContainer`, `MobileCard`, `MobileInput`,
  `MobileTextarea`, `MobileSwitch`, `MobileCheckbox`, `MobileSelect`, and
  `MobileModal`. Covered by a contract test (`src/types/__tests__`) that locks
  the exact set; consumers enforce the shape at compile time
  (`ossAdapters`/`proAdapters: IMobileUiAdapters`).

## v1.10.0

### Changed

- **Style catalog reconciled to the established 90-style backend catalog
  (mobile rendering plan, milestone one).** The experimental registry/union had
  drifted to 98 entries: it included 16 speculative styles and omitted 8
  established ones. Removed the 16 speculative styles (`dialog`, `popover`,
  `menu`, `menu-item`, `bottom-sheet`, `skeleton`, `skeleton-group`, `spinner`,
  `toast`, `tag-group`, `tag`, `input-group`, `input-otp`, `search-field`,
  `fab-button`, `biometric-login-button`) from `BASE_STYLE_REGISTRY`, the
  `TStyle` union, and the type files (deleted `src/types/styles/catalog.ts`).
  Added the 8 established styles that were missing from the registry/union:
  `no-access`, `missing`, `not-found`, `version`, `ref-container`,
  `data-container`, `show-user-input`, `timeline-item`. The applications may
  still use dialogs/menus/etc. internally — they are simply not author-selectable
  CMS styles.
- **Field naming taxonomy aligned with the backend re-prefix migration.** The
  11 portable visual-semantic fields are now `shared_*` (was the experimental
  `web_*`): `shared_align`, `shared_justify`, `shared_gap`, `shared_direction`,
  `shared_wrap`, `shared_orientation`, `shared_full_width`, `shared_size`,
  `shared_radius`, `shared_text_align`, and `shared_spacing` (was
  `web_spacing_margin_padding`). Genuinely web-specific fields keep `web_*`; the
  margin-only `web_spacing_margin` stays `web_` (not consolidated). This matches
  backend migration `Version20260618143216`.
- Documented that the registry `platforms`/`TStylePlatform` value mirrors the
  backend `renderTarget` (`styleRenderTargets` lookup); page render target is
  the existing `pageAccessTypes` value, never a duplicate page-platform field.
- **Semantic mapper reworked to a non-clamping common scale (plan §6.2/§8.2).**
  `shared_size` is now `sm | md | lg` and `shared_radius` is `none | sm | md |
  lg | full` — the true cross-platform common denominator (HeroUI Native has no
  `xs`/`xl`). New `TSharedSize`/`TSharedRadius` types
  (`src/types/mantine/common.ts`) back the `shared_size`/`shared_radius` catalog
  fields across `layout`, `composite`, `interactive`, `forms`, and `error`.
  `src/theme/semantic.ts` no longer clamps unsupported sizes (out-of-domain
  values are ignored, not silently coerced) and exposes the plan's pure
  functions `resolveSharedStyleProps`, `toMantineSemanticProps`,
  `toHeroUiSemanticProps`, and `toReactNativeSemanticStyle(props, theme)`; the
  earlier `resolveSharedStyleForWeb` / `resolveSharedStyleForMobile` names remain
  as deprecated aliases. The backend enforces the same narrowed domain (migration
  `Version20260618195450`).

### Notes / follow-ups

- Consumer dependency-range updates and `release-manifest.json` compatibility
  floors land with the coordinated cross-repo release (plan section 16 / Phase 6)
  as the frontend and mobile consumers adopt `@selfhelp/shared@1.10.0`.

## v1.8.0

### Changed

- **BREAKING (shipped as a minor by request): CMS style names are now
  kebab-case.** The `style_name` discriminator on the core style contracts was
  renamed from camelCase to kebab-case so the cross-repo style catalog uses one
  casing everywhere (backend `styles` seeds/DB, this package, the frontend
  `BasicStyle` dispatcher, and the mobile renderers). Renamed: `resetPassword` →
  `reset-password`, `twoFactorAuth` → `two-factor-auth`, `noAccess` →
  `no-access`, `notFound` → `not-found`, `entryList` → `entry-list`,
  `entryRecord` → `entry-record`, `entryRecordDelete` → `entry-record-delete`,
  `showUserInput` → `show-user-input`. The TypeScript interface names
  (`IResetPasswordStyle`, `IEntryListStyle`, …) are unchanged — only the
  `style_name` string literal moved.
- Because this is a breaking contract change released as a **minor** (1.8.0),
  consumers on a `^1.7.x` range pick it up on their next install. It must land in
  lockstep: the backend renames the matching `styles.name` rows (sections
  reference styles by FK id, so it is a metadata rename, not a content
  migration), and the frontend/mobile update their local style-name unions +
  dispatcher keys in the same release.
- `AGENTS.md` now mandates kebab-case style names; the previous "preserve legacy
  camelCase names" guidance was reversed.

## v1.7.2

### Added

- `InstanceManifest` now models the optional `backupSchedule`
  (`BackupSchedulePolicy` + `BackupRetentionPolicy`) and `envOverrides` fields,
  mirroring the manager's authoritative manifest contract
  (`sh-manager/packages/schemas/src/types.ts`). Both are optional — additive and
  backward compatible. This restores the cross-repo `distribution.test.ts`
  parity check, which was red against the manager's `instance-manifest.json`
  example fixture.

### Changed

- **Lint is now a blocking CI gate.** `npm run lint -- --max-warnings=0` runs on
  every PR/push to `main` (`plugin-sdk-check.yml`) and before npm publish
  (`publish.yml` now runs headers → lint → typecheck → build → test before
  `npm publish`). The strict, type-aware ESLint flat config already existed but
  was not enforced by any workflow; no lint rules were changed and no runtime
  behavior changed.

## v1.7.1

### Changed

- Documented the `frontend_compatibility` preflight check code in the
  system-maintenance contract (`types/api/system.ts`). The frontend-only update
  preflight (`IFrontendUpdatePreflight`) now carries the standardized
  `ICompatibilityError` fields under a `frontend_compatibility` check when the
  running core forbids the target frontend, or the target frontend needs a
  different core — the bidirectional frontend ⇄ core rule the SelfHelp Manager
  enforces, now mirrored by the CMS so its verdict matches the manager's instead
  of always reporting "OK". No shape change: `IUpdatePreflightCheck` already
  carries `code` plus the compatibility fields, so this is a documentation /
  contract-clarification release (additive, backward compatible).

## v1.7.0

### Added

- Error-page style contracts in a new `styles/error.ts` (re-exported from the
  package root): `INoAccessStyle` (the 403 `no-access` / `no-access-guest`
  pages), `INotFoundStyle` (the 404 page) and `IMissingStyle`. Each carries the
  shared `title` / `message` / `button_label` (plus `login_label` /
  `show_login` for the access-denied variants) copy fields and the
  `mantine_color` / `mantine_radius` / `mantine_shadow` /
  `mantine_button_variant` / `show_icon` presentation fields that the new
  styled system error pages render.
- `IShowUserInputStyle` + `IShowUserInputEntry` (`styles/forms.ts`): the
  contract for the new **showUserInput** style, which renders a form's
  collected entries as a table. It covers the data-table feature flags
  (`dt_sortable` / `dt_searching` / `dt_paginate` / `dt_info` /
  `dt_default_order_column` / `dt_default_order_dir`), `csv_export`,
  `delete_entry` with translatable `delete_modal_title` / `delete_modal_body`,
  column remapping via `fields_map`, `own_entries_only` / `show_timestamp`, the
  full `mantine_table_*` styling set, and the `entries` array — where each row
  exposes `record_id`, `id_users` and the per-row `_can_delete` flag the
  renderer uses to show a trash icon only for rows the current user may delete.

## v1.6.1

### Added

- Frontend-only update contracts (the frontend ships independently of the core,
  so an instance on the newest core can still move to a newer compatible
  frontend): the `SYSTEM_ENDPOINTS.UPDATE_FRONTEND_RELEASES` /
  `UPDATE_FRONTEND_PREFLIGHT` / `UPDATE_FRONTEND_REQUEST` path constants, the
  `TUpdateKind = 'core' | 'frontend'` discriminator, `IFrontendUpdateRequest`
  (`target_version` + `preflight_id` — no `accepted_migration_risk`, a frontend
  swap is stateless), `IFrontendUpdateRequestResponse` (carries
  `kind: 'frontend'` + `target_frontend_version`), and the
  `IFrontendUpdateReleases(Response)` / `IFrontendUpdatePreflight(Response)`
  aliases (the frontend reuses the core releases/preflight shapes).

### Changed

- `IUpdateStatus` gains two **required** fields: `kind` (`TUpdateKind`) and
  `target_frontend_version` (`string | null`), so the status UI can label a
  frontend-only operation correctly. Additive but required in the response (the
  backend schema `responses/admin/update_status.json` requires both); consumers'
  fixtures/mocks must add them (`kind: 'core'`, `target_frontend_version: null`
  for a core/idle status).

## v1.6.0

### Added

- `IUpdateStatus.manager` (`IUpdateStatusManager`): manager-loop visibility on
  the update status — `configured` (instance has a manager token),
  `last_seen_at` (last authenticated manager poll, null = never), and
  `requested_stale` (the latest operation sat in `requested` too long without
  the manager claiming it). Additive but **required** in the response — the
  backend schema `responses/admin/update_status.json` requires it; consumers'
  fixtures/mocks must add the block.

## [Unreleased]

## [1.5.0]

### Added

- `ISystemVersion.deployment` (`TSystemDeployment = 'docker' | 'source'`): the
  backend now reports how it is deployed so the admin maintenance UI can
  distinguish a managed Docker-image install from a source/dev checkout.
  Additive but **required** in the response — consumers' fixtures/mocks must
  add the field (the backend schema `responses/admin/system_version.json`
  requires it).
- Update-picker contracts for `GET /admin/system/update/releases`:
  `IUpdateRelease`, `IUpdateReleases`, `IUpdateReleasesResponse`, and the
  `SYSTEM_ENDPOINTS.UPDATE_RELEASES` path constant. The endpoint lists
  registry-published core versions (newest first) and fails soft to
  `available: false` when the registry is unreachable.
- `check-schema-parity.mjs` now also guards
  `responses/admin/update_releases.json` against `IUpdateReleases`.

## [1.4.0]

### Added

- `TUpdateOperationStatus` gains the `idle` member: the honest state the backend
  returns for an instance that has never run an update (instead of a misleading
  `succeeded`/100%). Additive contract change — exhaustive consumers (e.g. a
  `Record<TUpdateOperationStatus, …>`) must add an `idle` branch. Ship as the
  next minor (`1.5.0`); the frontend mirror in
  `sh-selfhelp_frontend/src/types/responses/admin/system.types.ts` already
  tracks it.

- Instance-scoped **system maintenance / update** contracts under
  `src/types/api/system.ts` for the SelfHelp Manager (`sh-manager`) ↔ CMS ↔
  admin-UI flow (SelfHelp Manager / Docker Distribution MVP): `ISystemVersion`
  / `ISystemVersionResponse`, `IUpdatePreflight` / `IUpdatePreflightResponse`,
  `IUpdateRequest`, `IUpdateStatus` / `IUpdateStatusResponse`,
  `IUpdateRequestResponse`, plus the `SYSTEM_ENDPOINTS` path constants and the
  supporting unions (`TUpdatePreflightStatus`, `TUpdateOperationStatus`, …).
- Hard cross-repo invariant encoded in the types and a regression test:
  `IUpdateRequest` has **no** `instance_id` — the browser never targets another
  instance; the backend derives and verifies the instance identity server-side.
- `check-schema-parity.mjs` now also guards the three new admin response schemas
  (`responses/admin/system_version.json`, `update_preflight.json`,
  `update_status.json`) and the `requests/admin/update_request.json` request
  schema against the shared TS mirrors.
- `ICompatibilityError` in `src/types/api/system.ts` — the standardized
  compatibility-error shape (`component`, `component_id`, `current_version`,
  `target_version`, `required_range`, `blocking`, `message`) shared verbatim by
  the backend `CompatibilityError`, the SelfHelp Manager resolver, and the
  frontend Available/preflight UI, with a parity test
  (`compatibility-error-parity.test.ts`).

### Changed

- **Unified registry types** (`src/plugin-sdk/registry.ts`). `IPluginRegistry`
  now mirrors the unified `registry.json`: required `schemaVersion`,
  `requiresManager`, `baseUrl`, and the five release-ref arrays `core` /
  `frontend` / `scheduler` / `worker` / `plugins`. New `IRegistryReleaseRef`
  (`{id, version, channel, releaseUrl, blocked?}`) and `IPluginRelease` (the
  standalone signed plugin release document: `compatibility.{core,pluginApi}`,
  `artifacts.{manifestUrl,archiveUrl,sha256}`, Ed25519 `security`). The legacy
  single-version inline `IPluginRegistryEntry` / `IPluginRegistryVersionEntry`
  were removed (no consumer; replaced by the multi-version release-ref model).
  Mirrors the backend `plugin-registry.schema.json` +
  `config/schemas/registry/plugin-release.schema.json`.

## [1.3.2]

### Changed

- Maintenance release: cut a clean published version for consumers to pin.
  Supersedes the `1.3.1` test publish; no functional or API changes since
  `1.3.0`.

## [1.3.0]

### Added

- `ENDPOINTS.AUTH.FORGOT_PASSWORD` (`/cms-api/v1/auth/forgot-password`) and
  `ENDPOINTS.AUTH.RESET_PASSWORD` (`/cms-api/v1/auth/reset-password`) so the
  password-recovery flow is part of the shared API contract (issue #31). The
  web frontend and the mobile app now build these requests from shared
  constants instead of local/ad-hoc paths.
- Request DTOs `IForgotPasswordRequest` and `IResetPasswordRequest`, and
  response types `IForgotPasswordResponse` / `IResetPasswordResponse`,
  mirroring the backend `requests/auth/forgot_password.json` and
  `reset_password.json` schemas. `scripts/check-schema-parity.mjs` now covers
  these request schemas.

## [1.2.5]

### Changed

- `IResetPasswordStyle` now models the full two-step reset flow instead of
  just the "request a recovery mail" screen. Added optional CMS fields for
  the set-password mode: `reset_title`, `reset_label_pw`,
  `reset_pw_placeholder`, `reset_label_pw_confirm`,
  `reset_pw_confirm_placeholder`, `reset_label_submit`,
  `reset_success_title`, `reset_alert_success`, `reset_redirect_text`,
  `reset_error_invalid_token`, `reset_error_pw_short`, and
  `reset_error_pw_mismatch`.
- Removed the stale legacy `text_md` and `email_user` fields from
  `IResetPasswordStyle` so the shared contract matches the backend
  `resetPassword` style schema.

## [1.2.4] - 2026-06-05

### Added

- Communication preferences support in profile section. `IUserData` gains
  `receives_notifications` and `receives_emails` boolean fields.
- New CMS endpoint `UPDATE_COMMUNICATION_PREFERENCES` for updating user
  communication preferences.
- Communication preferences CMS label fields on `IProfileStyle`: 
  `profile_communication_preferences_title`,
  `profile_communication_preferences_description`,
  `profile_receive_notifications_label`,
  `profile_receive_notifications_description`,
  `profile_receive_emails_label`,
  `profile_receive_emails_description`,
  `profile_communication_preferences_button`,
  `profile_communication_preferences_success`, and
  `profile_communication_preferences_error_general`.
- New permission `ADMIN_SCHEDULED_JOB_MANAGE` for scheduled job management.

## [1.2.3] - 2026-06-04

### Added

- Registration-lifecycle CMS label fields on the auth styles so the
  previously hardcoded frontend UI text becomes admin-managed. All are
  optional `IContentField<string>` (additive, no consumer break):
  `IRegisterStyle` gains `label_code`, `code_placeholder`,
  `label_go_home`, `label_go_to_login`; `ILoginStyle` gains
  `label_register`; `IValidateStyle` gains the activation status text
  `loading_title`, `loading_text`, `error_title`, `error_heading`,
  `error_text`, `success_title`, and `redirect_text` (use `{seconds}`
  as the countdown placeholder). Defaults + en-GB/de-CH translations are
  seeded backend-side by `Version20260604111011`.
- Blocking Vitest coverage gate (ecosystem testing strategy, Slice 10).
  Added `@vitest/coverage-istanbul`, a `vitest.config.ts` with a coverage
  threshold (>= 60% lines/functions/statements/branches) scoped to the
  framework-free runtime-helper bundle (interpolation, condition,
  asset-URL, CMS-class classifier, page transform), and a `test:coverage`
  script. `shared-tests.yml` now runs `npm run test:coverage`, so a
  coverage regression on those shared contracts fails CI (currently ~97%
  lines). Implements canonical Testing Rule 20 (warning -> blocking). The
  istanbul provider is used instead of v8 because v8 double-counts files on
  Windows (phantom 0% entries) and would fail the gate locally.
- New public subpath export `@selfhelp/shared/testing` — the plugin
  certification kit (`CERTIFICATION_KIT_VERSION` `1.0.0`).
  `definePluginCertification(config).run(manifest)` now performs the real
  **static manifest certification** and returns a typed
  `IPluginCertificationReport`: ordered checks `manifest-valid`,
  `capabilities-vs-trust-level`, `compatibility-shape`,
  `lookup-ownership`, `db-naming` (also exported individually as
  `checkManifestValid`, `checkCapabilitiesVsTrustLevel`,
  `checkCompatibilityShape`, `checkLookupOwnership`, `checkDbNaming`, and
  `runCertificationChecks`). Built on the existing plugin SDK
  (`IPluginManifest` + semver helpers) so manifest typing/range parsing is
  not re-implemented. Runtime install/lifecycle remains the backend host
  certification's responsibility — the kit gates the manifest before
  publishing; the host gates the actual install. Also ships the
  fully-working in-memory `mockMercureHub` (Mercure recorder, no polling)
  and `seedFromLockFile`.
- `IPluginManifestDataAccess` now mirrors the manifest schema's
  `ownedTables` and `ownedDataTablePrefix` fields (previously only
  `read`/`write`/`delete` were typed), so the `db-naming` certification
  check is fully typed against the real manifest.
- Vitest unit tests for the runtime helpers (`replaceCalcedValues`,
  `evaluateCondition`/`buildConditionContext`, `resolveAssetUrl`/
  `resolveAssetSources`, `classifyClass`/`classifyClassString`,
  `transformPageData`/`transformPagesData`) and the testing kit.

### Changed

- `scripts/check-schema-parity.mjs` now also checks API response
  contracts (`config/schemas/api/v1`: response envelope, auth login,
  form submit) against the shared TS types, not only the plugin SDK
  schemas. The form-submit data shape is flagged as a tracked
  `knownDrift` warning pending cross-repo reconciliation
  (`submitted_at` / `user_authenticated` are in the backend schema but
  not in `IFormSubmitData`).

## [1.2.1] - 2026-05-28

### Fixed

- `IPluginRegistry` in `@selfhelp/shared/plugin-sdk` is now back in
  sync with the canonical `plugin-registry.schema.json` shipped by
  `sh-selfhelp_backend`. The root version field is the schema's
  `schemaVersion: '1.0'` again (the `registryVersion: number` rename
  introduced in `1.0.4` mis-described the wire format). Added the two
  other canonical root fields, `baseUrl` and `publisher`, as optional
  so the type matches what `scripts/publish-to-registry.mjs` actually
  emits. The pre-existing `name` / `homepage` / `trustKey` /
  `channels` properties are kept as optional legacy helpers and
  flagged in the JSDoc as not part of the canonical schema; they will
  be removed in the next major release once the deeper drift in
  `IPluginRegistryEntry` / `IPluginRegistryVersionEntry` is rewritten
  to match the canonical schema.
- `npm run check:schemas` is green again — previously failed because
  `schemaVersion` was missing from the TS mirror after the `1.0.4`
  rename.

### Migration notes

```ts
// before (1.2.0, broken)
const registry: IPluginRegistry = {
    registryVersion: 1,
    name: 'my-registry',
    plugins: [],
};

// after (1.2.1, matches plugin-registry.schema.json)
const registry: IPluginRegistry = {
    schemaVersion: '1.0',
    publisher: { name: 'my-registry' },
    plugins: [],
};
```

No runtime/installation behaviour changed — this only corrects the
shape of the published TS contract that plugin authors compile
against. The backend's `RegistryClient` already reads the canonical
wire format, so installed registries keep working.

## [1.2.0] - 2026-05-28

### Added

- Canonical plugin runtime-shim contract exported from
  `@selfhelp/shared/plugin-sdk`. This is the single source of truth
  every consumer (host import map, host `globalThis` stash, host
  `/api/plugins/runtime-shim/*` BFF route, plugin Vite build, plugin
  dev-runtime server) now reads from, so the three pieces cannot
  drift apart again:
  - `PLUGIN_RUNTIME_SHIM_SPECIFIERS` — readonly list of every bare
    specifier the host shims to plugins. Includes the previously
    missing `react/jsx-dev-runtime` (needed by Vite's React plugin in
    dev mode) and `@mantine/notifications` (consumed by plugins that
    show toast notifications), so dev-server bundles can resolve them
    instead of bundling a second copy of React or Mantine.
  - `PLUGIN_RUNTIME_SHIM_BASE_PATH` — `/api/plugins/runtime-shim/`
    constant; the host frontend owns this route.
  - `PLUGIN_RUNTIME_GLOBAL_KEY` — `__SELFHELP_RUNTIME__` constant.
  - `PLUGIN_RUNTIME_IMPORT_MAP` — frozen `Record` derived from the
    specifier list, ready to be `JSON.stringify`ed into the host's
    `<script type="importmap">` tag.
  - `buildPluginRuntimeShimPath(specifier)` — string builder for a
    single specifier.
  - `isPluginRuntimeShimSpecifier(value)` — runtime type guard.
  - `TPluginRuntimeShimSpecifier` — string-literal type union of the
    supported specifiers.
- The plugin SDK contract version bumps from `1.1` to `1.2` to
  reflect the additive surface. Hosts on SDK `1.2+` still accept
  plugins declaring `pluginApiVersion: "1.1"`, so existing plugins
  remain compatible.

### Changed

- `PLUGIN_API_VERSION` constant: `1.1` → `1.2`. No behavioural
  change for plugins that do not consume the runtime-shim contract
  directly; this only signals which optional SDK surface the host
  exposes.

## [1.1.0] - 2026-05-25

### Added

- Plugin SDK field-renderer contracts:
  `IFieldRendererDefinition`, `IPluginFieldRendererProps`, and
  `fieldRenderers` on `IPluginRegistration`, so plugins can contribute
  custom CMS section-field editor controls for plugin-owned field types.

### Changed

- Bumped `PLUGIN_API_VERSION` from `1.0` to `1.1` to reflect the new
  additive plugin SDK surface.
- Re-exported the new field-renderer types from `@selfhelp/shared/plugin-sdk`.

## [1.0.4] - 2026-05-22

### Added

- New `plugin-sdk` surface for the SelfHelp plugin ecosystem:
  - `definePlugin()` / `defineMobilePlugin()` helpers for typed plugin
    manifests.
  - `definePluginRealtimeTopic()` topic helpers with template expansion.
  - `usePluginRealtime()` React hook for Mercure topic subscription. The
    hook accepts a `transportFactory` so frontend hosts can inject
    `EventSource` and mobile hosts can inject `react-native-sse` without
    forcing the SDK to depend on either runtime.
- TypeScript mirrors for `IPluginManifest`, `IPluginRegistry`, and
  `IPluginLock` plus the `scripts/check-schema-parity.mjs` script that
  verifies the JSON schemas stay in lockstep with the TS types.
- React is now declared as an **optional peer dependency**
  (`react ^18 || ^19`). Non-React consumers can keep using the package
  without installing React; the `usePluginRealtime` hook is only required
  if you opt into realtime updates.

### Changed (breaking type contracts)

These changes broaden the schema-mirroring types so they actually match
the canonical JSON Schemas the backend publishes. Plugin authors
upgrading from `1.0.3` need to update any code that constructed these
shapes literally:

- `IPluginRegistry`
  - Renamed `schemaVersion` (string `'1.0'`) to **`registryVersion`**
    (`number`, currently `1`).
  - Added required field `name: string`.
  - Added optional `homepage`, `publishedAt`, `trustKey`, and `channels`
    fields to align with `plugin-registry.schema.json`.
- `IPluginLock`
  - Added required field **`lockfileVersion: number`** (currently `1`).
  - Added required nested object **`sdk: { version: string; pluginApiVersion: string }`**
    so lockfiles always advertise which SDK version they were generated
    against.
  - `plugins` is now `Record<string, IPluginLockEntry>` instead of an
    array — keyed by plugin id, which matches the schema and removes
    the need for clients to do an extra lookup.
  - `installMode` is now optional at the top level (per-entry
    `installMode` already exists inside each plugin entry).
- `IPluginManifest`
  - `dataAccess` gained `ownedTables: string[]` and
    `ownedDataTablePrefix?: string` so plugins can declare their owned
    tables for the install-time validator and the purger.

### Migration notes for plugin authors

```ts
// before (1.0.3)
const registry: IPluginRegistry = {
    schemaVersion: '1.0',
    plugins: [],
};

// after (1.0.4)
const registry: IPluginRegistry = {
    registryVersion: 1,
    name: 'my-registry',
    plugins: [],
};
```

```ts
// before (1.0.3)
const lock: IPluginLock = {
    generatedAt: '...',
    plugins: [],
    installMode: 'managed',
};

// after (1.0.4)
const lock: IPluginLock = {
    lockfileVersion: 1,
    generatedAt: '...',
    sdk: { version: '1.0.4', pluginApiVersion: '1.0' },
    plugins: {},
};
```

Run `npm run check:schemas` (from `sh-selfhelp_shared`) to verify your
TypeScript matches the canonical JSON schemas after the upgrade.

## [1.0.3] - 2026-05-19

 - Adjust types after the DB refactoring

## [1.0.0] - 2026-05-08

First stable release of `@selfhelp/shared`.

### Added

- Shared TypeScript contracts for pages, styles, auth models, and API payloads.
- A typed `STYLE_REGISTRY` for CMS-driven rendering.
- Common theme token exports and a shared Tailwind preset surface.
- Runtime helpers for:
  - interpolation via `replaceCalcedValues()`
  - condition evaluation via `evaluateCondition()`
  - asset URL normalization via `resolveAssetUrl()`
  - spacing parsing and page-data transformation utilities
- CMS class allow-listing, remapping, and classification helpers.
- Public npm packaging setup for reuse across multiple projects.

### Included in this release

- Root package exports for the main shared API.
- Subpath exports for:
  - `@selfhelp/shared/registry`
  - `@selfhelp/shared/theme`
  - `@selfhelp/shared/tailwind`
- Generated CJS, ESM, and TypeScript declaration output in `dist/`.
- README publishing instructions and package documentation.

### Purpose of the 1.0.0 release

This release establishes `@selfhelp/shared` as the source of truth for shared
frontend and mobile contracts in the SelfHelp ecosystem. The goal of `1.0.0` is
to provide a stable base that other applications can install, build against, and
upgrade using normal npm versioning.
