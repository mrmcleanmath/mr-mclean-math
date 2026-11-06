THE ORDER - v331 layout fix

INSTALL
Replace the-order.html in your existing website with the file in this ZIP,
then redeploy your existing Vercel project. Keep the filename the-order.html.
This is a game-only update, matching the supplied ZIP, not a complete website.

CHANGES
- Restores the fixed console height in short desktop/Chromebook windows so
  the console does not shrink when Collect appears.
- Restores the original desktop stage-height budget at viewport heights
  801-850px so the bottom action button remains visible without fullscreen.
- Only two desktop CSS overrides were added. No game scripts were changed.
  Phone/tablet CSS, protected encoded scripts, source-copy deterrents,
  copyright notices, embedded media, and Analytics are retained unchanged.

VERCEL ANALYTICS
The existing Analytics queue, /_vercel/insights/script.js loader, and
game-start event are preserved. Web Analytics must be enabled for the Vercel
project. Redeploy after enabling it. Actual dashboard receipt cannot be
verified from this ZIP or a local file preview.
https://vercel.com/docs/analytics/troubleshooting

VALIDATION
Chrome browser tests check desktop controls across viewport heights from
600 to 1080px and complete solve/diamond/Collect/next-round cycles at 650px
and 820px. Phone/tablet comparisons cover 375x667, 390x844, 430x932 and
768x1024. These are browser viewport tests, not tests on a physical Chromebook.
All nine original script blocks were compared byte-for-byte. Removing the
new CSS block reproduces the exact original HTML.
