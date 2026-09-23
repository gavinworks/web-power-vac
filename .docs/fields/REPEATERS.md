# Directus Repeater (List) Interface — Field Reference

## Overview

The Directus `list` interface (repeater) stores data as a JSON array of objects. Each object represents one row, and each key corresponds to a sub-field's `field` name. The underlying Directus field must always be `type: "json"` with `special: ["cast-json"]`.

---

## Repeater-Level Options

Options set on the repeater field itself (`meta.options`):

| Option | Type | Description |
|--------|------|-------------|
| `template` | `string` | Mustache-style display template for collapsed rows, e.g. `"{{title}} - {{subtitle}}"`. Defaults to the first field name. |
| `addLabel` | `string` | Custom label for the "Create New" button. |
| `sort` | `string` | Field name to sort repeater rows by. Populated from defined sub-fields. |
| `fields` | `Field[]` | Array of sub-field definitions (see below). |

---

## Sub-Field Structure (API Format)

When creating repeater fields via the API, **`field` and `type` must be duplicated inside `meta`**. The Directus UI reads from `meta`, not the top-level properties.

```json
{
  "field": "icon",
  "name": "Icon",
  "type": "string",
  "meta": {
    "field": "icon",
    "type": "string",
    "interface": "input-autocomplete-api",
    "width": "half",
    "required": true,
    "note": "Help text for editors",
    "options": {
      "url": "https://example.com/api/icons/search?q={{value}}",
      "resultsPath": "results",
      "textPath": "text",
      "valuePath": "value",
      "trigger": "throttle",
      "rate": 300
    }
  }
}
```

### Sub-Field Meta Properties

| Property | Required | Description |
|----------|----------|-------------|
| `field` | **Yes** | The field key (used as the JSON object key). Must be db-safe (snake_case). |
| `type` | **Yes** | The data type — one of the values from the types table below. |
| `interface` | **Yes** | Which interface component to render (filtered by `type`). |
| `width` | No | `"half"` or `"full"` (defaults to full). |
| `required` | No | Boolean — whether the field requires a value. |
| `note` | No | Help text displayed below the field. |
| `options` | No | Interface-specific options (depends on the chosen interface). |
| `display` | No | Display component for rendering in the collapsed row template. |
| `display_options` | No | Options for the display component. |

Top-level properties (`field`, `name`, `type`) should mirror `meta.field` and `meta.type`. The `name` property is the display label — if omitted, Directus auto-formats the `field` value (e.g. `hero_text` becomes "Hero Text").

Default values can be set via `schema.default_value` on each sub-field.

---

## Available Types

| Group | Value | Display Text |
|-------|-------|-------------|
| **String** | `string` | String |
| | `text` | Text |
| **Boolean** | `boolean` | Boolean |
| **Numeric** | `integer` | Integer |
| | `bigInteger` | Big Integer |
| | `float` | Float |
| | `decimal` | Decimal |
| **Geometry** | `geometry` | Geometry (All) |
| **Date/Time** | `timestamp` | Timestamp |
| | `dateTime` | DateTime |
| | `date` | Date |
| | `time` | Time |
| **Other** | `json` | JSON |
| | `csv` | CSV |
| | `uuid` | UUID |
| | `hash` | Hash |

---

## Type-to-Interface Mapping

### `string`

| Interface | Key Options |
|-----------|-------------|
| `input` | `placeholder`, `iconLeft`, `iconRight`, `softLength`, `font` (sans-serif/monospace/serif), `trim`, `masked`, `clear`, `slug` |
| `select-dropdown` | `choices` (`[{text, value, icon?, color?}]`), `allowOther`, `allowNone`, `icon`, `placeholder` |
| `select-radio` | `choices` (`[{text, value}]`), `iconOn`, `iconOff`, `color`, `allowOther` |
| `select-color` | `opacity` (boolean), `presets` (`[{name, color}]`) |
| `select-icon` | _(no options)_ |
| `input-autocomplete-api` | `url`, `resultsPath`, `textPath`, `valuePath`, `trigger` (throttle/debounce), `rate`, `placeholder`, `font`, `iconLeft`, `iconRight` |
| `input-code` | `language`, `lineNumber`, `lineWrapping`, `template` |
| `map` | _(options in separate component)_ |

### `text`

| Interface | Key Options |
|-----------|-------------|
| `input` | Same as string |
| `input-multiline` | `placeholder`, `softLength`, `trim`, `font`, `clear` |
| `input-rich-text-html` | `toolbar` (array of button IDs), `font`, `folder`, `imageToken`, `softLength`, `customFormats`, `tinymceOverrides` |
| `input-rich-text-md` | `toolbar`, `placeholder`, `folder`, `imageToken`, `softLength`, `editorFont`, `previewFont`, `defaultView`, `customSyntax` |
| `input-code` | `language`, `lineNumber`, `lineWrapping`, `template` |
| `input-autocomplete-api` | Same as string |
| `map` | _(options in separate component)_ |

### `boolean`

| Interface | Key Options |
|-----------|-------------|
| `boolean` | `iconOn`, `iconOff`, `colorOn`, `colorOff`, `label` |

### `integer`

| Interface | Key Options |
|-----------|-------------|
| `input` | `min`, `max`, `step`, `placeholder`, `iconLeft`, `iconRight`, `font` |
| `select-dropdown` | `choices`, `allowOther`, `allowNone`, `icon`, `placeholder` |
| `select-radio` | `choices`, `iconOn`, `iconOff`, `color`, `allowOther` |
| `slider` | `minValue`, `maxValue`, `stepInterval`, `alwaysShowValue` |

### `bigInteger`

| Interface | Key Options |
|-----------|-------------|
| `input` | `min`, `max`, `step`, `placeholder`, `iconLeft`, `iconRight`, `font` |
| `select-dropdown` | `choices`, `allowOther`, `allowNone`, `icon`, `placeholder` |
| `select-radio` | `choices`, `iconOn`, `iconOff`, `color`, `allowOther` |

### `float`

| Interface | Key Options |
|-----------|-------------|
| `input` | `min`, `max`, `step`, `placeholder`, `iconLeft`, `iconRight`, `font` |
| `select-dropdown` | `choices`, `allowOther`, `allowNone`, `icon`, `placeholder` |
| `select-radio` | `choices`, `iconOn`, `iconOff`, `color`, `allowOther` |
| `slider` | `minValue`, `maxValue`, `stepInterval`, `alwaysShowValue` |

### `decimal`

| Interface | Key Options |
|-----------|-------------|
| `input` | `min`, `max`, `step`, `placeholder`, `iconLeft`, `iconRight`, `font` |
| `select-dropdown` | `choices`, `allowOther`, `allowNone`, `icon`, `placeholder` |
| `select-radio` | `choices`, `iconOn`, `iconOff`, `color`, `allowOther` |

### `json`

| Interface | Key Options |
|-----------|-------------|
| `input-code` | `lineNumber`, `lineWrapping`, `template` (language forced to JSON) |
| `input-block-editor` | `placeholder`, `font`, `tools` (array of enabled block types), `bordered`, `folder` |
| `list` | `template`, `addLabel`, `sort`, `fields` (nested repeater!) |
| `tags` | `presets`, `placeholder`, `alphabetize`, `allowCustom`, `whitespace`, `capitalization`, `iconLeft`, `iconRight` |
| `select-multiple-checkbox` | `choices`, `allowOther`, `color`, `iconOn`, `iconOff`, `itemsShown` |
| `select-multiple-dropdown` | `choices`, `allowOther`, `allowNone`, `placeholder`, `icon`, `previewThreshold` |
| `select-multiple-checkbox-tree` | `choices` (nested with children), `valueCombining` (all/branch/leaf/indeterminate/exclusive) |
| `collection-item-dropdown` | `selectedCollection`, `template`, `filter` |
| `collection-item-multiple-dropdown` | `selectedCollection`, `template`, `filter` |
| `map` | _(options in separate component)_ |

### `csv`

| Interface | Key Options |
|-----------|-------------|
| `tags` | `presets`, `placeholder`, `alphabetize`, `allowCustom`, `whitespace`, `capitalization`, `iconLeft`, `iconRight` |
| `select-multiple-checkbox` | `choices`, `allowOther`, `color`, `iconOn`, `iconOff`, `itemsShown` |
| `select-multiple-dropdown` | `choices`, `allowOther`, `allowNone`, `placeholder`, `icon`, `previewThreshold` |
| `select-multiple-checkbox-tree` | `choices` (nested), `valueCombining` |
| `map` | _(options in separate component)_ |

### `uuid`

| Interface | Key Options |
|-----------|-------------|
| `input` | Same as string |

### `hash`

| Interface | Key Options |
|-----------|-------------|
| `input-hash` | `placeholder`, `masked` |

### `geometry`

| Interface | Key Options |
|-----------|-------------|
| `map` | _(options in separate component)_ |
| `input-code` | `language`, `lineNumber`, `lineWrapping`, `template` |

### `timestamp` / `dateTime`

| Interface | Key Options |
|-----------|-------------|
| `datetime` | `format` (long/short), `includeSeconds`, `use24` |

### `date`

| Interface | Key Options |
|-----------|-------------|
| `datetime` | `format` (long/short) |

### `time`

| Interface | Key Options |
|-----------|-------------|
| `datetime` | `format` (long/short), `includeSeconds`, `use24` |

---

## Interfaces Excluded from Repeaters

### Relational interfaces (`relational: true`)

These are permanently excluded — repeaters cannot contain relational fields:

| Interface | Reason |
|-----------|--------|
| `file` | Relational |
| `file-image` | Relational |
| `files` | Relational |
| `list-m2m` | Relational |
| `list-o2m` | Relational |
| `list-m2a` | Relational |
| `list-o2m-tree-view` | Relational |
| `select-dropdown-m2o` | Relational |
| `translations` | Relational |

### System interfaces (`system: true`)

All 27 interfaces in `app/src/interfaces/_system/` are excluded.

### Presentation / Group interfaces

These have `types: ['alias']` which is not in the type dropdown, so they cannot be selected:

`presentation-divider`, `presentation-header`, `presentation-notice`, `presentation-links`, `group-detail`, `group-accordion`, `group-raw`

---

## Common Recipes

### Short text (title, label)

```json
{
  "field": "title",
  "name": "Title",
  "type": "string",
  "meta": {
    "field": "title",
    "type": "string",
    "interface": "input",
    "width": "full",
    "options": { "softLength": 80 }
  }
}
```

### Long text (description)

```json
{
  "field": "description",
  "name": "Description",
  "type": "text",
  "meta": {
    "field": "description",
    "type": "text",
    "interface": "input-multiline",
    "width": "full",
    "options": { "softLength": 250 }
  }
}
```

### Dropdown select

```json
{
  "field": "category",
  "name": "Category",
  "type": "string",
  "meta": {
    "field": "category",
    "type": "string",
    "interface": "select-dropdown",
    "width": "half",
    "options": {
      "choices": [
        { "text": "Option A", "value": "option_a" },
        { "text": "Option B", "value": "option_b" }
      ]
    }
  }
}
```

### Toggle

```json
{
  "field": "enabled",
  "name": "Enabled",
  "type": "boolean",
  "meta": {
    "field": "enabled",
    "type": "boolean",
    "interface": "boolean",
    "width": "half",
    "options": { "label": "Enable this item" }
  }
}
```

### Icon picker (Lucide autocomplete)

```json
{
  "field": "icon",
  "name": "Icon",
  "type": "string",
  "meta": {
    "field": "icon",
    "type": "string",
    "interface": "input-autocomplete-api",
    "width": "half",
    "note": "Search for icons or browse all at https://lucide.dev/icons",
    "options": {
      "url": "https://YOUR_SITE_URL/api/icons/search?q={{value}}",
      "resultsPath": "results",
      "textPath": "text",
      "valuePath": "value",
      "trigger": "throttle",
      "rate": 300
    }
  }
}
```

### Color picker

```json
{
  "field": "color",
  "name": "Color",
  "type": "string",
  "meta": {
    "field": "color",
    "type": "string",
    "interface": "select-color",
    "width": "half",
    "options": {
      "presets": [
        { "name": "Primary", "color": "#1e40af" },
        { "name": "Accent", "color": "#f97316" }
      ]
    }
  }
}
```

### Number with slider

```json
{
  "field": "rating",
  "name": "Rating",
  "type": "integer",
  "meta": {
    "field": "rating",
    "type": "integer",
    "interface": "slider",
    "width": "half",
    "options": {
      "minValue": 1,
      "maxValue": 5,
      "stepInterval": 1,
      "alwaysShowValue": true
    }
  }
}
```

---

## Complete Repeater Field Example (API Creation)

Creating a full repeater field with multiple sub-fields:

```json
{
  "field": "hero_cards",
  "type": "json",
  "meta": {
    "interface": "list",
    "special": ["cast-json"],
    "width": "full",
    "note": "Trust badge cards below the hero. Max 4 displayed.",
    "options": {
      "template": "{{text}}",
      "addLabel": "Add Card",
      "fields": [
        {
          "field": "icon",
          "name": "Icon",
          "type": "string",
          "meta": {
            "field": "icon",
            "type": "string",
            "interface": "input-autocomplete-api",
            "width": "half",
            "note": "Search for icons or browse all at https://lucide.dev/icons",
            "options": {
              "url": "https://example.com/api/icons/search?q={{value}}",
              "resultsPath": "results",
              "textPath": "text",
              "valuePath": "value",
              "trigger": "throttle",
              "rate": 300
            }
          }
        },
        {
          "field": "text",
          "name": "Text",
          "type": "string",
          "meta": {
            "field": "text",
            "type": "string",
            "interface": "input",
            "width": "half",
            "options": {
              "softLength": 30
            }
          }
        }
      ]
    }
  },
  "schema": {
    "data_type": "json"
  }
}
```
