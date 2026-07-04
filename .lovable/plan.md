## Plan

Fix the mobile hero so it behaves like desktop/tablet instead of ending after one screen and jumping straight to the landing content.

### Changes

1. **Enable the cinematic hero scroll on mobile**
   - Remove the current mobile shortcut that disables the hero scroll experience.
   - Keep the hero wrapper at the same long scroll height used on desktop/tablet so the background/video area stays with the scroll.

2. **Keep mobile video from autoplaying incorrectly**
   - Preserve muted/inline setup, but drive the video by scroll progress instead of normal autoplay.
   - Use the same scroll-scrub logic across mobile, tablet, and desktop when reduced motion is not enabled.

3. **Match the same staged text behavior**
   - Use the same eyebrow/headline/copy/CTA reveal timing on mobile as desktop/tablet.
   - Avoid the current mobile-only forced first-frame behavior that makes the hero immediately hand off to the next section.

4. **Protect reduced-motion users**
   - Keep the non-scroll-scrub fallback only for `prefers-reduced-motion: reduce`, not for all mobile devices.

5. **Validate mobile and desktop**
   - Check mobile scrolling at the current viewport size to confirm the hero background remains pinned/scrubbed instead of jumping to the landing page.
   - Check tablet/desktop to confirm existing behavior stays intact.