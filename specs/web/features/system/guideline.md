# System - Guideline

## Route

`/v3/system/guideline`

## Access

Private.

## Purpose

Guideline contains application usage guidance for operators and admins.

## Main Content

- Panduan monitoring.
- Transaction and verification guidance.
- Master data guidance.
- Panduan konfigurasi device.
- Troubleshooting umum.

## Data Request

GraphQL Hasura:

- Optional if guidelines are stored as dynamic content.

REST API:

- Optional if guidelines are fetched from a backend content service.

Default awal:

- Static content di module web.

## Redux

Tidak memerlukan Redux khusus.

## UI Components

Molecules:

- SearchInput
- EmptyState

Organisms:

- GuidelineSidebar
- GuidelineContent
- Accordion

Templates:

- DocumentationTemplate

## States

- Static loaded.
- Search empty.
- Content unavailable if remote content is used.

## Acceptance Criteria

- User can read guidelines by category.
- Guideline search is available if there is a lot of content.
- Content is not mixed with feature source code.
