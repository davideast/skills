# Retrieve the actual Stitch source

Use this reference only when the user supplies a Stitch screen. Extract the project ID from `/projects/PROJECT` and screen ID from `node-id=SCREEN`; retain both.

Check the installed CLI's help/schema if its interface differs. The CLI supports:

```sh
stitch get screen SCREEN_ID --project PROJECT_ID --no-cache --json
```

Save the complete response locally. Inspect its HTML-code and screenshot download fields; field names and envelope structure may vary. The HTML URL is the code export, not the Stitch project URL. Use the actual returned URL rather than constructing one.

Download each selected asset with redirects and HTTP-error checking:

```sh
curl --location --fail --silent --show-error \
  --output reference.html 'ACTUAL_HTML_DOWNLOAD_URL'
curl --location --fail --silent --show-error \
  --output reference.png 'ACTUAL_SCREENSHOT_DOWNLOAD_URL'
```

Use structured argument arrays or proper shell quoting for URLs. Keep signed URLs and credentials out of reusable instructions and verification reports.

Check actual file contents, not the filename: code should contain the expected page markup; an image must decode as an image. A redirect is not itself a download failure. If the response is a login page or network error, identify the failed command and actual result rather than claiming the code export is absent. Do not switch to computer-use browsing or recreate the screen as a workaround for export failure.

Inspect the downloaded screenshot against the user's chosen screen before cropping. If it appears stale, fetch without cache and compare the fresh payload/assets. An unresolved source discrepancy is a reason to resolve the source, not permission to redesign it.

An approved screenshot is the strongest reference for preserving exact appearance. HTML is useful for understanding content and obtaining a render when necessary; rendering with missing fonts, lower-resolution artwork, or a different viewport can drift from the approved screenshot.

Convert a non-PNG image to lossless PNG with an available image decoder before using the exporter. Do not change dimensions or add another lossy encoding step. Keep the original download as provenance.
