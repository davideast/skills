# Organize an art research library

Read this before saving or updating a configured library. The outcome is one discoverable home for each artwork, current research, and browse pages organized by art vocabulary. Conversation order is not the organizing principle.

## Fit the existing library first

Read the root index and any organization instructions, then search existing metadata and breakdowns for the incoming title, source identity, and classification. Follow an established equivalent of this layout rather than creating a competing tree:

```text
<output_directory>/
├── index.md
├── styles/
│   ├── atmospheric-abstraction/
│   │   └── index.md
│   └── gouache-style-landscape/
│       └── index.md
├── works/
│   ├── pigment-drift/
│   │   ├── breakdown.md
│   │   ├── record.json
│   │   └── art/
│   │       └── pigment-drift.png
│   └── sunset-harbor/
│       ├── breakdown.md
│       ├── record.json
│       └── art/
│           ├── sunset-harbor.png
│           └── sunset-harbor-screen.png
└── comparisons/
    └── river-passages/
        └── breakdown.md
```

Only create folders that have content. The names in this example illustrate the convention; they do not establish that these records or style classifications already exist.

Legacy `<slug>/breakdown.md` plus `art/` directories remain valid destinations. Reuse their paths and link to them from style pages. A legacy multi-image report can remain the canonical comparison while its existing assets are referenced by new work records; do not copy those assets again just to satisfy the default tree. Record the canonical asset path using a relative link. Inspect existing `provenance.json` before creating metadata, and extend it if it already serves the record's purpose.

The configured library is the boundary for a duplicate check. Older project assets may help establish provenance, but a library should not depend on transient downloads outside its root. Copy an outside asset into the library once when the requested research requires it. Duplicate detection does not authorize processing the rest of the project.

## Decide what the incoming image represents

Inspect the image itself and the existing candidate before routing. Compute SHA-256 for original bytes; retain that value to make future exact matches cheap. A source URL, screen ID, filename, or title is a lead, not sufficient identity by itself.

| Incoming reference                                     | Action                                                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Same bytes as an existing artwork; no new findings     | Reuse its image and breakdown. Return the existing link.                                                                              |
| Same artwork, with additional research or a correction | Update the relevant existing sections, citations, classification, or location evidence.                                               |
| Different encoding or size of the same image           | Confirm visually; record the alternate identity. Keep the best available canonical asset, retaining an old asset if still referenced. |
| A new crop of the same artwork                         | Link it as a crop/context reference to that work. Save the crop only when the analysis needs it.                                      |
| Same art inside a new footer, hero, or screenshot      | Reuse the art. Add a distinct context screenshot only if the lesson discusses that presentation.                                      |
| Distinct artwork in an already known style             | Create a new work record and add it to that existing style page.                                                                      |
| Distinct artwork with a new defensible classification  | Create a work record and a style page after checking labels and aliases.                                                              |
| New artwork behind the same remote URL or screen ID    | Treat it as changed content; compare before choosing a separate work or a documented revision.                                        |
| Several works discussed together                       | Reuse or create their canonical records and save the combined response as a comparison referencing those assets.                      |

Visual resemblance or a shared prompt is not evidence of identical art. Materially different compositions are separate works, even when their filenames say `v1` and `v2`. Group them through a comparison or a confirmed project relationship. For a documented revision of the same piece, retain the previous asset when referenced and identify which revision the research analyzes. Do not erase the distinction between a reference, a generated concept, and a screenshot.

If several existing copies match, prefer an already designated canonical record, then the standalone artwork record with the best available asset and useful research. Read the other reports before merging findings. Reuse the selected asset going forward; report conflicting claims instead of silently choosing one. A save need not remove old duplicates. Moving directories, deleting copies, or consolidating the whole library belongs to a requested reorganization, with all affected links repaired.

## Name things for browsing

- **Style pages:** established terms describing the actual imagery. Examples: `atmospheric-abstraction`, `hard-edge-abstraction`, `gouache-style-landscape`, `intaglio-style-landscape`, `halftone-treated-imagery`, `interior-still-life-photography`. These can describe different classification axes; their page labels must explain which axis is meant. Use a narrower page only when the collection benefits from it.
- **Works:** a memorable title or visible subject, such as `pigment-drift`, `sunset-harbor`, or `rain-garden`. Resolve unrelated title collisions with a distinguishing subject or composition, such as `river-passage-basalt-cliffs`. Keep existing IDs and paths stable when the classification changes.
- **Images:** descriptive subjects and roles, preserving the file extension: `sunset-harbor.png`, `sunset-harbor-screen.png`, `river-passage-detail.jpg`. Original names remain in provenance. Number images only when order carries meaning.
- **Comparisons:** the works or subject plus the actual teaching relationship, such as `river-passages` or `interior-light-and-coastal-color`. A follow-up to that same comparison updates it.

Use lowercase kebab-case for new paths and readable display titles in documents. Dates, batch numbers, generated IDs, hero/footer placement, or project brands may be metadata; they usually do not explain an art style. Retain established names instead of renaming every record to enforce a preference.

Before adding a classification, search existing display labels, aliases, and definitions. “Gouache-style,” “gouache-like,” and “opaque watercolor appearance” may describe the same relevant browse category; avoid automatically creating three folders. Related but distinct terms remain separate: atmospheric abstraction does not automatically establish Color Field painting, and halftone is not Pointillism. An alias is a search aid, not a claim of historical equivalence.

## Record the identity and classification

For a new record without an existing metadata convention, use `record.json` with a stable ID, display title, breakdown path, classifications, and image provenance. For example:

```json
{
  "id": "sunset-harbor",
  "title": "Sunset harbor",
  "breakdown": "breakdown.md",
  "styles": ["gouache-style-landscape"],
  "classification": {
    "medium_or_technique": "Digital image; gouache-like appearance",
    "genre": ["landscape", "architectural view"],
    "handling": ["stylized", "painterly"],
    "movement": null
  },
  "images": [
    {
      "path": "art/sunset-harbor.png",
      "role": "artwork",
      "sha256": "<computed SHA-256>",
      "original_filename": "coastal-artwork.png",
      "sources": []
    }
  ],
  "related_works": [],
  "comparisons": []
}
```

This is a schema example: compute real hashes and record actual sources when creating an entry. Metadata paths are relative to the record directory; style IDs refer to the library's style pages. Label images `artwork`, `context`, or `detail`. Use the primary artwork for identity matching; a screenshot hash identifies a presentation, not necessarily the underlying work.

Keep durable source identifiers and original filenames, plus bytes/dimensions if useful. Do not store credentials or signed query parameters in provenance. Record generation only when known, and location confidence only when supported. Existing metadata remains authoritative unless the current evidence warrants a correction.

If the library already has a machine-readable catalog, update the matched entry by stable ID. Do not append a new row for every invocation. A catalog is a finding aid derived from canonical records, not a second home for the analysis; a new catalog is optional when the existing indexes and metadata suffice.

## Maintain useful browse pages

The root `index.md` should lead with art styles or techniques, grouped by useful headings where the collection warrants them. Project, comparison, subject, and genre views can provide additional routes without moving the underlying art. Keep old direct links discoverable when improving an existing index.

Each style page should have:

- A readable name, a brief definition, and the visible criteria that justify membership.
- Search aliases and related style links where helpful, with distinctions explained.
- One entry per canonical work: title, relative breakdown link, a modest thumbnail from the existing asset when useful, and one sentence explaining its distinctive handling.

Order works by readable title or another stated browse convention, rather than appending in conversation order. A rejected UI can still provide an art reference; preserve its status in the record instead of treating an indexed piece as approved. Avoid filling style pages with every screenshot, renderer preview, and export of the same work.

Reuse the existing style page for a new piece that fits. For new classification evidence about an existing piece, update its record and the affected pages; do not move its canonical folder. Multiple style pages may link the same work. If merging synonymous pages is part of the requested organization, retain the former slug as a redirect page or alias and repair inbound links.

Where an index mixes authored prose with managed listings, preserve prose and unrelated entries. Use the library's existing managed blocks; otherwise delimit new listings with `<!-- art-research:entries:start -->` and `<!-- art-research:entries:end -->`. Update the identified entry instead of replacing the whole file. A freshly created page can be maintained as a whole until it gains user-authored material.

## Update research without making a ledger

Read the current breakdown before editing. Integrate new supported findings into the relevant section; correct superseded claims and explain material classification or location changes. Preserve unique observations, citations, and authored notes. Repeated conversations should not become appended copies of the same six-question lesson.

For multi-image requests, keep the full requested response in the comparison document. Individual work records retain their own art-specific explanations and link to the comparison. Reuse existing work analyses where they already cover the findings; do not manufacture near-identical lessons just to populate folders. Relative cross-folder image embeds keep the library portable as a whole. If a self-contained export is requested, make that export separately rather than duplicating canonical storage.

Before completing a save, check the changed breakdown, records, style pages, and root index: referenced files exist, hashes match the copied source, records point to the analyzed revision, and links stay inside the library unless intentionally external. State whether the action created a piece, updated one, or reused existing research. If only a screenshot could be recovered, retain that limitation in the lesson and final response.
