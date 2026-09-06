# Accessible Multi-Page Layout

This project demonstrates an accessible multi-page HTML5 layout.

## Pages

- `index.html` — dashboard overview, sidebar, data table, and modal
- `users.html` — users table and accessible add-user form/modal
- `reports.html` — report table
- `settings.html` — accessible settings form

## Structure

```text
accessible-multipage-layout/
├── index.html
├── users.html
├── reports.html
├── settings.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
```

## Accessibility features

- Semantic HTML5: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`
- Skip-to-content link
- Visible keyboard focus states
- Accessible navigation with `aria-current`
- Proper table captions, column scopes, and row headers
- Form labels associated with controls
- `fieldset` and `legend`
- Required, minlength, email, and URL validation
- `aria-label`, `aria-describedby`, and live status messages
- Native `<dialog>` modal
- Responsive sidebar navigation

## Validation

Open each HTML file and validate it with the W3C Markup Validation Service:

https://validator.w3.org/

Use the validator's "Validate by File Upload" option and check each HTML file.

## Run locally

No build tool is required. Open `index.html` in a browser, or use VS Code Live Server.
