# InfoPath 2013 to Section JSON mapping

## Target shape

One file per form. Property names are case-sensitive.

```json
{
  "Name": "Expense Claim",
  "Code": "EXP",
  "Description": "Form description",
  "HeaderName": "New Expense Claim",
  "Controls": [
    {
      "Name": "EmployeeDetails",
      "Label": "Employee details",
      "Type": "section",
      "Value": null,
      "Visible": true,
      "Disabled": false,
      "Class": "grid grid-cols-2 gap-6 items-start p-16 bg-white",
      "Rules": null,
      "ChildControls": [
        {
          "Name": "EmployeeName",
          "Field": "EmployeeName",
          "Label": "Employee name",
          "Type": "text",
          "Value": "",
          "Visible": true,
          "Disabled": false,
          "PlaceHolder": "Employee name",
          "DivClass": null,
          "Validator": { "Required": true, "Message": "Enter the employee name.", "MaxLength": 100 },
          "Options": null,
          "Multiple": false,
          "Rules": null
        }
      ]
    }
  ],
  "Buttons": [
    { "Name": "Submit", "Label": "Submit", "Visible": true, "Disabled": false }
  ]
}
```

- `Name`: unique in the whole form. Use the InfoPath field name in PascalCase.
- `Field`: the data field name. Same as `Name` unless the user gives another mapping.
- `Value`: always a string (`""` when empty). Use defaults from `template.xml`.
- `Class` on a section: `grid grid-cols-N ...`, where N is the number of input columns in the InfoPath layout table (usually 2 or 3).
- `DivClass` on a child: `col-span-2` (or `col-span-3`) for a control that spans the row, otherwise `null`.

## Control mapping

| InfoPath control (`xd:xctname`) | Section `Type` | Notes |
|---|---|---|
| Text box (`PlainText`) | `text` | |
| Multi-line text box | `textarea` | `Row` = visible lines |
| Date picker (`DTPicker`) | `datetimepicker` | |
| Text box with currency format | `currency` | |
| Text box with percent format | `percent` | |
| Text box with number format | `text` | `Validator.Pattern`: `^-?\d+(\.\d+)?$` |
| Drop-down list, static values | `select` | `Options: [{ "Label": "...", "Value": "..." }]` |
| Drop-down / combo box from a data connection | `ngselect` | Static sample `Options` for now; add a gap `data-connection` |
| Multiple-selection list box | `ngselect` | `Multiple: true`; values joined with `#$#` |
| Option buttons (one field, several buttons) | `option` | One control; each button becomes an `Options` entry |
| Section / group of controls / heading | `section` | Children go in `ChildControls`; one level only |
| Calculated value / expression box | `text` | `Disabled: true`; gap `calculation` |
| Rich text box | `textarea` | Gap `rich-text` (formatting lost) |
| Check box | (none) | Gap `checkbox`. Interim, only if the user approves: `select` with Yes/No options |
| Repeating table / repeating section | (none) | Gap `repeating-table` |
| Optional section | `section` | Gap `optional-section` (no insert/remove) |
| Person / group picker | `ngselect` | Gap `people-picker` |
| File attachment | (none) | Gap `attachment` |
| Button | `Buttons[]` | Only `Submit` / `Close` (names the engine handles); other buttons: gap `action-rule` |

## Validation

| InfoPath | Section JSON |
|---|---|
| "Cannot be blank" (schema `minLength 1`, or no `nillable`) | `Validator.Required: true` + `Message` |
| Pattern / max length in schema | `Validator.Pattern` / `MaxLength` |
| Validation rule on one field with a simple pattern | `Validator.Pattern` + `Message` |
| Validation rule comparing fields, dates or rows | Gap `cross-field-validation` |

## Visibility and editability

`Rules` on a section, control or button match workflow `States` and user `Roles`. The first matching rule wins.

```json
"Rules": [
  { "Roles": ["Manager"], "States": ["SUBMITTED"], "IsOwner": null, "Visible": true, "Disabled": false,
    "EnableControls": null, "DisableControls": null, "ShowControls": null, "HideControls": null }
]
```

| InfoPath | Section JSON |
|---|---|
| Separate view per role (for example "Manager Approval") | `Rules` with that role on the sections that view shows |
| Formatting rule on a status field (`Status = "Submitted"` → read-only) | `Rules` with `States` |
| Formatting rule on a role (`get-Role() = "Manager"`) | `Rules` with `Roles` |
| Formatting rule on any other field value (hide when `IsTravel` is false) | Gap `field-driven-visibility` |
| Action rules (set a value, query, switch view on change) | Gap `action-rule` |

## Not in the JSON

Data connections, submit destinations, workflows and code are recorded in the gaps file and the migration log. Do not invent JSON keys for them.
