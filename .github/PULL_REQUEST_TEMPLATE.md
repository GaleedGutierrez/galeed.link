<!-- markdownlint-disable-file MD041 -->
<!--
Title: a Conventional Commit, e.g. `fix(seo): …`. commitlint checks it and it
sets the `type:` label; the files you touch set the `area:` labels.
-->

## Summary

<!-- Why the change, and what it does. Link an issue with "Closes #123". -->

## Test plan

<!--
What you ran (`npm run verify`, `npm run test:e2e`, Lighthouse) and what you
checked by hand.
-->

## UI checklist

<!--
Only for UI changes; delete the section otherwise. CI already runs axe in both
themes at desktop and mobile widths: these are the checks it can't make.
-->

- [ ] Light and dark themes
- [ ] Keyboard: tab order and a visible focus ring
- [ ] Touch targets of at least 44px
- [ ] Reduced motion
- [ ] Contrast axe can't measure: the `h1` with the portrait, nav links under
      the sticky bar
- [ ] The `DESIGN_SYSTEM.md` checklist (§10)

## Docs

- [ ] `DESIGN_SYSTEM.md`
- [ ] `CLAUDE.md`
- [ ] `README.md`
- [ ] No docs needed
