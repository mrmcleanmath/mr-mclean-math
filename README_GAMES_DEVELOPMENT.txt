

v136: Added the supplied Juhani Junkala track as gameplay music. Music does not autoplay on page entry or mode selection. It begins from the start of the track only when Start / Restart is pressed, loops continuously during the active run, and fades out when the run is stopped or finished. Starting a new run restarts the track from the beginning. Default music volume is 26% so it supports rather than overwhelms gameplay.


v137: Restored the missing visual assets lost in v136: the cyan/purple Pi Memory Challenge title artwork, the Games-page Pi Memory Challenge thumbnail, the favicon, and wallpaper. Gameplay music from v136 remains intact. No gameplay layout/animation changes were made in this version.


v138: Added staged game presentation. On page entry only Score, Level, Lives, and the two mode buttons are shown. Choosing Practice or Challenge deploys the lower gameplay console with an animated expansion; Practice reveals its reference panel and Challenge simultaneously triggers the existing Pi entrance. The digit window remains empty until Start is pressed. Start now begins the music, animates the initial '3.' into place, then brings the blinking input cursor online about 0.86 seconds later. Gameplay input is disabled until that launch sequence finishes. Stop/end still removes the cursor and fades the music.


v139: Strengthened the Start sequence. The initial '3.' now powers in with a larger glow/blur entrance, small overshoot/bounce, and a quick energy sweep across the digit window. The glowing cursor now appears after the digit entrance completes and once again continuously breathes/pulsates like the earlier versions. All staged reveal, music, title/thumbnail assets, and Pi effects are preserved.


v140: Replaced the initial 3 animation with the user's supplied Animista roll-in-left (0.6s ease-out, translating from -800px while rotating -540deg). The decimal point now follows with a short delayed energy-pop animation. Restored the typing cursor exactly to the earlier v137 nextSlotPulse styling/animation, removing the v138/v139 cursorOnline/cursorPulse overrides. All other staged reveal, music, Pi, title, thumbnail, and layout behavior is preserved.


v141: widened the approved Pi Memory Challenge title artwork so it visually spans the same width as the main game box on desktop, while staying responsive on shorter screens and mobile. Added a new layer of periodically twinkling horizon stars to the Tron wallpaper using the same cyan / white / violet / gold palette as the game UI.


v145: rebuilt from v141 specifically to restore the exact original translucent Challenge Pi and its original pop-in animation, rather than recreating it with overrides. The Pi markup and animation code are untouched from v141. Added the supplied hover/select sounds, set the desktop title to the 760px game-box width, and added five more twinkling horizon stars.


v146: added the same hover + click UI sounds to all buttons on the Pi Memory Challenge page, not just Practice/Challenge. This includes Start/Restart, Stop, info buttons, modal buttons, expand/hide/group buttons, and report buttons. Keyboard Enter/Space on buttons also triggers the click sound.


v147: added gameplay sound cues. The supplied magical_1.ogg plays whenever a heart is earned (every level/20 correct digits). The supplied MESSAGE-B_Accept.wav plays at every 100 correct digits, delayed slightly when it coincides with a heart reward so the two cues remain distinct. Added a custom very faint synthesized metallic digit tick/clank on every typed digit; no external sound asset is required for the tick. Existing button hover/click sounds and gameplay music are preserved.


v148: doubled the per-digit metallic clank volume. Added a custom synthesized heart-loss cue made from a short metallic crack, descending drop, and soft low thud, synchronized with the existing heart-loss animation. No external sound file is needed for this cue. All existing audio remains intact.


v149: corrected the Challenge Pi fill calibration so the visible Pi reaches full exactly at 100 correct digits rather than appearing full around 80. The fill now uses the actual visible Pi glyph height. After each 100-digit milestone, the Pi remains full briefly for the milestone sound/visual payoff, then empties back to the bottom and begins a fresh 1–100 fill cycle. Total score/level progression is unchanged.


v150: increased the per-key metallic clank again and increased the heart-damage sound. Reworked Challenge Pi filling with a curved visual fill progression so it no longer appears nearly full at 85–90 digits; the final upper portion is intentionally reserved for the last stretch and 100 is the only point at which the Pi is fully illuminated. At every 100-digit milestone the Pi now supercharges with a bright cyan/white/violet/gold glow and screen bloom, then empties and begins the next 100-digit cycle.


v151: rebuilt the Challenge Pi fill progression so filling is visible from digit 1, but digits 1–99 are intentionally capped at 85% of the Pi's vertical fill range. Digit 100 alone completes the final 15%, guaranteeing the Pi cannot visually become full early. The 100-digit supercharge remains, then the Pi empties and begins the next 100-digit cycle. Heart rewards are now +1 at ordinary 20-digit levels and +3 TOTAL at every 100-digit milestone, with a special 100-DIGIT JACKPOT banner.


v152: replaced the guessed Pi fill math with a true visible-bounds measurement. The liquid now rises according to the actual rendered .pi-outline SVG text bounds that the user can see, instead of filling toward hard-coded coordinates that may not match the visible Pi. This means the Pi should begin filling from digit 1 and only reach the actual visible top at digit 100. The 3-heart 100-digit jackpot, supercharge, empty/reset cycle, music, and sound effects remain unchanged.


v153: root-cause Pi fill fix. The liquid was already using the visible Pi bounds, but the stored digits were still climbing a hard-coded 12.7px per row, which visually filled the Pi by about digit 70. Stored digits now use 20 rows across the exact same measured visible Pi height as the liquid (5 digits x 20 rows = 100), so neither component can reach the visible top early. At 100, the glowing Pi now sends three animated hearts into the Lives HUD, creating the requested give-and-take effect. The Pi then drains over ~1.05 seconds instead of snapping empty. Digits typed during the celebration are queued and restored at the bottom of the new cycle.


v154: completely rebuilt the internal Challenge Pi fill subsystem instead of patching the old rectangle calculations. The previous liquid rectangles and legacy stored-digit layer are now hidden. A new identical Pi-shaped gradient layer is revealed by one progress clip. Crucially, its top and bottom are calculated at runtime from Canvas TextMetrics.actualBoundingBoxAscent/Descent using the same Georgia italic 700 font as the visible Pi, so invisible font-box whitespace and CSS resizing cannot make the fill complete early. 70 digits literally exposes 70% of the painted Pi height; 100 exposes 100%. Stored digits are also distributed as exactly 20 rows of 5 across those same painted bounds. The 3-heart Pi-to-Lives jackpot animation is preserved, and the post-100 drain is now a smooth 1.35-second bottomward drain.


v155: fixed the one-sided Pi fill without touching the now-correct 100-digit vertical timing. The v154 horizontal clip was based on Canvas text metrics and could crop the left side of the italic Pi. The progress clip now always spans the full 360-unit SVG width while only its vertical edge moves. Restored the original colorful liquid look by filling a full gradient rectangle clipped to the Pi shape, plus the repeated Pi-number texture and a bright liquid surface wave. This preserves exact 1–100 vertical progression while both halves of the visible Pi fill together.


v156: removed the mouse-hover/focus UI sound from every button; buttons now use only the menu-select sound when actually pressed. Increased the synthesized digit clank again (master peak 0.19 -> 0.27). Fixed the title-width issue at its real cause: the older 194px max-height was forcing the browser to preserve the artwork aspect ratio and visually shrink the requested 760px width. On desktop, the title is now explicitly 760x194px and shifted left 24px to line up with the 760px game card, so it is visibly as wide as the game box without making the page taller.


v157: added the supplied newthingget.ogg as the report-card reveal sound. It plays once when the run report card appears after Stop or run completion. Added six more periodically twinkling stars above the Tron horizon, using the existing cyan / white / violet / gold palette. All v156 behavior, including click-only button sounds, louder key clank, full-width title, correct 100-digit Pi fill, colorful numbered fluid, jackpot hearts, and music, is preserved.


v158: made the Challenge Pi hover a little more noticeable and slightly faster (3.7s cycle, 14px rise, versus 4.8s / 10px). Added a temporary achievement badge to the report card. Audio analysis of the supplied report jingle found the bright high-register melody begins at approximately 2.55 seconds, so the badge reveal is synchronized to that point. The badge pops/spins into place, settles, and then periodically shines with cyan/violet/gold rays. The badge is deliberately generic and easy to replace when final performance-based badge designs are created.


v159: optimized the 100-digit celebration to reduce the small frame-rate hitch. All three jackpot-heart elements are now created in one DOM batch and animated with GPU-friendly translate3d/opacity transforms. The Lives HUD reaction now runs once after all three hearts arrive instead of being forcibly restarted three times. The Pi's large supercharge filter stack was reduced while preserving the bright outline/screen bloom. The ordinary tank-pop reflow is skipped specifically on digit 100, and the Pi drain no longer overlaps the final heart flight: it begins 180ms after all three hearts land. Visual behavior and rewards remain the same.


v160 — CUSTOM NEON DIGITS
- Built from v159, preserving the current music, sound effects, Pi fill system, 100-digit celebration, title, and gameplay.
- Split the approved generated 0–9 artwork into ten transparent PNG digit assets.
- Your Digits So Far now renders those exact custom chrome/cyan/purple digits instead of ordinary font numerals.
- The opening 3. animation still runs, now using the custom 3 artwork.
- The expanded Full Run view uses the custom digits too.
- In Challenge Mode, the digit that flies from the cursor into the Pi now uses the same custom artwork.
- Practice reference digits, Score, Level, and tiny stored digits inside the Pi remain unchanged for readability.


v161 — DIGIT SHIMMER + DECIMAL FIX
- Added a periodic left-to-right shimmer across the custom live typed digits, using the same long-rest / quick-sweep rhythm as the green, yellow, and red practice-app orbs.
- The shimmer is clipped to the digit artwork itself, so it does not sweep across the empty gaps between numbers.
- Neighboring digits are slightly staggered so the highlight visibly travels across the sequence.
- Lowered the decimal point so it sits at the proper visual baseline beside the custom numerals.


v162 — CURSOR + VISIBLE SHIMMER + MORE STARS
- Fixed the live cursor so it remains visible after the custom digit row grows beyond the visible width.
- The row now reserves space for the expand button and re-scrolls after custom digit images finish loading.
- Replaced the v161 mask-based shimmer with a reliable bright duplicate-image sweep clipped across each digit.
- Added a subtle brightness lift during the sweep so the shimmer is clearly visible.
- Added 18 additional small shimmering stars to the active Tron/Grid sky layer.


v163 — CLEAN, FULLY VISIBLE CURSOR
- Removed the dark halo/shadow around the live typing cursor.
- Kept the cursor alive with a clean cyan pulse using only border/fill opacity; no shadow and no scale growth.
- Increased the right-side safety zone between the live cursor and the expand button.
- Reworked auto-scroll to measure the cursor's actual on-screen rectangle and correct any clipping, with retries after digit images load.


v164 — CLEAN BLINKING CURSOR
- Restored the live cursor's obvious blinking/breathing pulse.
- Preserved the v163 clean cursor: no dark shadow or halo.
- The blink changes opacity and cyan brightness only; it does not scale, so the full cursor stays safely visible.
