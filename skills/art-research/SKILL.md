---
name: art-research
description: 'Research and teach the art style of supplied images using traditional art-school vocabulary, sourced history, meaning, common uses, emotional effects, and location when verifiable. Use for art-style breakdowns of photographs, paintings, illustrations, or imagery in design references.'
---

# Art Research

Explain a supplied image as a thoughtful art teacher: name its visual language, show the evidence, connect it to art history, and help the user recognize those qualities independently. Provide the breakdown in the conversation and save the same response as a document when an output directory is configured, unless the user requests otherwise. This skill researches and explains existing imagery; generating artwork, redesigning UI, and establishing a course workspace are separate tasks.

## Scope and library destination

Analyze the references requested in the current conversation. A request to backfill recent breakdowns covers those identified exchanges, not every asset or report found in the repository. Use older files to locate a requested reference or detect duplication; discovering a file does not add it to the assignment. If the intended exchanges cannot be resolved, clarify the scope before a bulk backfill.

Resolve the output directory from an explicit destination in the current request or applicable user/project instructions first. Otherwise read `config.json` beside this `SKILL.md`, using its `output_directory` value. The user can set that value to an absolute path, a `~/` path, or a path relative to the current working directory. A missing file, missing field, `null`, or blank value means no directory is configured. The shipped configuration is unset; do not invent a default destination.

When no directory is configured, still provide the breakdown and explicitly tell the user: “No art research output directory is configured, so this breakdown was not saved as a document.” Explain that they can set `output_directory` in this skill's `config.json` or specify a directory in their request. Do not block the research to ask for a destination.

If configuration is invalid or saving fails, report the specific problem and provide the breakdown in chat. Do not claim the document was saved or silently choose another directory.

## Route and maintain the library

Before saving to a configured directory, read [references/library-organization.md](references/library-organization.md). Inspect its existing conventions, indexes, reports, and image provenance. Reuse established locations and classifications; the documented `works/`, `styles/`, and `comparisons/` layout is a default for new entries where no applicable convention exists, not an instruction to migrate the library.

Treat an artwork as the durable record, rather than creating a folder for each conversation. Match image hashes and source identities, inspect possible visual matches, and reuse an existing record for the same piece. An identical reference with no substantive new findings needs a link to its existing breakdown, not a new report or copy. Update relevant sections of an existing breakdown when the current request contributes research or corrections, preserving authored material and accurate provenance.

Browse by defensible art terms through style pages that link to canonical artwork records. A piece can appear under several styles or techniques without acquiring extra image copies or duplicate breakdowns. Keep movement, medium, handling, and genre distinct in metadata. Use qualified labels such as “gouache-style landscape” when materials are unverified. Consult existing labels and aliases before creating a new style page.

For a new piece, save the full analysis and copied art in its canonical record and update the relevant style page and root browse index. For a multi-image lesson, save the full comparative response in `comparisons/` or its existing equivalent, link to the canonical works, and embed their existing images with relative paths. Reuse an existing comparison for the same works and topic. New single-work entries should contain their own substantive analysis; the comparison explains the relationship without creating another copy of the artwork.

Copy only newly required references, preserving original bytes, resolution, and format. Retain underlying art and a UI screenshot when its framing is discussed; label screenshots as context. If only a screenshot is accessible, identify that limitation rather than claiming it is standalone art. Copying does not authorize replacements or artwork modification. Original filenames or durable source URLs and hashes belong in provenance. Use relative document and image links so the library root remains portable; a separate portable export is only needed when requested.

Verify saved documents, image identity, and local links, including the indexes changed by this save. Report missing assets and unresolved routing honestly. Link to the saved or reused breakdown and, when helpful, its style page in the final response. Keep the full conversational breakdown unless the user requests document-only delivery. Honor requested document formats while retaining the same canonical identity and artwork routing.

## Inspect the actual reference

Resolve which images the user means from the current conversation. Inspect local images with the available image viewer. If the image is embedded in a UI screenshot, distinguish the underlying artwork from typography, controls, and framing. Analyze the UI's contribution only when relevant to the request.

## Build a defensible classification

Lead with a concise, useful description in established art vocabulary. Separate the following axes where they help:

- **Medium or technique:** photography, oil, gouache, watercolor, etching, collage, and so on. Appearance can suggest a medium without proving actual materials or process; use “gouache-style” or “photographic appearance” when appropriate.
- **Genre or subject:** landscape, seascape, still life, portrait, domestic interior, architectural view, abstraction, etc.
- **Representation and handling:** naturalistic, stylized, representational, painterly, linear, geometric; support each label with visible features.
- **Aesthetic, tradition, or historical movement:** picturesque, plein-air landscape, travel illustration, Impressionism, and others only when the evidence warrants them.

A movement has a historical and cultural context, not merely a look. Distinguish descriptive terms such as “impressionistic” and “minimalist” from membership in Impressionism or Minimalism. Explain traditional terms in plain language on first use. Treat contemporary marketing labels as such rather than substituting them for art-history categories.

Do not force every image into a named movement. A precise descriptive classification is a complete answer. Separate stylistic resemblance, a useful historical comparison, and documented direct influence. Digital texture does not prove physical brushwork; soft focus does not prove Pictorialism; an asset host or missing metadata does not prove AI generation.

## Research the relevant history

Browse for historical claims, technical definitions, attributions, dates, or geographical identifications that need verification. Prefer museum collection records and curatorial essays, artist archives, scholarly publications, and recognized conservation or educational institutions. Open relevant sources and confirm that they actually support the claim; search snippets are leads. Explain any research limitation honestly.

Choose a few historical threads tied to visible features rather than a catalog of loosely related artists. Explain when and where a tradition developed, what its practitioners sought, and how its uses changed. Distinguish a technique's history from a movement's history; related methods can precede the term used today. Include non-Western traditions when relevant and supported, without inferring cultural origin from generic styling.

Cite sourced claims with descriptive Markdown links near the claims. Original visual observations and clearly marked interpretations do not require a borrowed authority. Avoid attaching a citation to a paragraph whose main claim the source does not support.

## Cover the user's six questions

Scale the depth to the request, but a full teaching breakdown should address:

1. **What is the style?** Give the classification and explain the visible marks, edges, palette, light, surface, and composition that justify it.
2. **What is its history?** Explain the relevant origins, period, geography, purposes, and a small number of useful artists or works to study. Label comparisons as comparisons, not attributions.
3. **What does it mean?** Discuss documented symbolism when available. For an unattributed image, offer a contextual interpretation grounded in its objects, setting, and presentation; do not invent authorial intent or symbolic codes.
4. **Where and when is it used?** Distinguish documented historical uses from contemporary applications. Source claims of prevalence or trends. If suggesting suitable design applications, identify them as recommendations based on the image's qualities.
5. **How does it make us feel?** Connect particular choices to plausible responses: for example, spacious composition to stillness or a curving path to visual wandering. Frame these as interpretations that can vary by person and culture, not universal color psychology.
6. **Where is the depicted place, if real?** State a verified location with supporting evidence, a tentative regional resemblance with explicit uncertainty, or “location unverified.” A place named in UI text is not proof that its background image depicts that place. Keep the depicted location separate from the artist's home, a museum's address, or an artwork's current collection.

Investigate location when meaningful landmarks, provenance, captions, or metadata provide a useful lead. A generic room or coastline rarely supports a specific address or town. Do not turn weak resemblance into a named location, and do not call an unverified scene fictional merely because no location was found.

## Teach through close looking

Prefer connected explanations that move from visible evidence to terminology, history, and interpretation. Use a small table when it clarifies categories or compares multiple images; keep each image's provenance and history distinct. Match detail to the user's curiosity without imposing identical sections or word counts on every request.

End a substantial lesson with a short looking exercise, a small set of grounded terms to reuse, or a concise art-direction sentence when useful to the user's task. Invite a next observation rather than claiming the user has mastered the topic. Do not reproduce the whole analysis of previous images when a focused comparison would suffice.
