# Security policy

## Reporting a vulnerability

Don't open a public issue. Report it privately from the [Security tab][report]
("Report a vulnerability"): the report stays private until a fix ships.

Include the affected URL or file, the steps to reproduce and what an attacker
gains.

## Scope

Only the live site, built from `main`: the code in this repository and the
headers it ships (`_headers`, the generated Content-Security-Policy). Project
data comes from [`@galeedgutierrez/shared-assets`][shared-assets]: report a flaw
in the package there.

[report]: https://github.com/GaleedGutierrez/galeed.link/security/advisories/new
[shared-assets]: https://github.com/GaleedGutierrez/shared-assets
