# Security Policy

Please report vulnerabilities in History Cleaner privately rather than opening a public issue.

## Reporting a vulnerability

Send reports to **contact@despical.dev**. Include the extension version, browser and version, operating system, reproduction steps and the expected impact. Attach sanitized console output or a minimal proof of concept where useful.

Do not include real browsing history, URLs from your own history, credentials or personal data. Reproduce issues with a throwaway browser profile.

## Scope

This policy covers the History Cleaner extension. Security-sensitive areas include:

- Permissions: the extension requests only `history` and `favicon`; any request for more is a bug.
- Handling of page titles and URLs from history, which are untrusted input and must never be rendered as HTML.
- Deletion logic: anything that removes entries the user did not select, or removes them without confirmation.
- The extension page itself, including the language preference stored in `localStorage`.

The extension makes no network requests and stores no browsing data. A report showing otherwise is in scope.

## Supported versions

Only the latest release receives security fixes. Report older-version findings when they also affect the latest version, or explain why upgrading is not possible.

## Response and disclosure

Reports will be reviewed and reproduced where possible. Confirmed issues will be fixed privately before disclosure, with reporter credit when agreed. Please coordinate disclosure until a fix is available; no fixed response deadline is promised.
