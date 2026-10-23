---
"@zenuml/core": minor
---

`onEventEmit` fires again. Each completed in-diagram edit now calls it once with `("trackEvent", { label, action, category: "sequence" })`. The actions are `title_edited`, `participant_added`, `participant_renamed`, `message_inserted`, `message_label_edited`, `message_reordered`, `divider_inserted` and `fragment_condition_edited`. The payload carries no diagram text. The unused internal `EventBus` module is removed.
