---
name: emoji-eval
description: Evaluate emoji rendering quality in ZenUML diagrams. Renders test cases in both DOM and SVG modes, takes screenshots, and scores emoji visibility, position, spacing, box fit, and decorator coexistence. Reports per-case scores with HTML-vs-SVG parity check. Use when testing emoji rendering, after emoji-related code changes, or when the user asks to evaluate/score emoji rendering.
---

# Emoji Rendering Evaluator

Automatically score emoji rendering quality in ZenUML diagrams by rendering test cases in both DOM and SVG modes, taking screenshots, and evaluating what the agent sees.

## Prerequisites

- Dev server running on `http://localhost:8080` (`bun dev`)
- Playwright MCP available for browser automation

## Test Cases

Run ALL of these cases unless the user specifies a subset:

```javascript
const EMOJI_TEST_CASES = {
  "emoji-basic": "[rocket] Production\nA->Production.deploy()",
  "emoji-multi": "[rocket] Production\n[lock] AuthService\n[fire] Cache\nProduction->AuthService.validate()\nAuthService->Cache.get()",
  "emoji-with-type": "@Database [fire] HotDB\n@Actor [star] Admin\nAdmin->HotDB.query()",
  "emoji-with-stereotype": '<<service>> [lock] Auth\n<<gateway>> [globe] API\nAPI->Auth.validate()',
  "emoji-inline": "[rocket]User->[fire]Server.request()",
  "emoji-async-message": "A->B: [check] validated\nB->C: [warning] review needed",
  "emoji-comment": "// [eyes] review phase\nA->B.process()",
  "emoji-colon-override": "[:red:] Alert\nA->Alert.trigger()",
  "emoji-css-combo": "// [rocket, red] deploy note\nA->B.deploy()",
  "emoji-complex": "@Database [fire] HotDB\n[rocket] Production\n<<service>> [lock] Auth\nProduction->Auth.validate(token)\n  Auth->HotDB.check(token)\n  Auth-->Production: [check] valid",
};
```

## Procedure

For each test case:

### Step 1: Render in DOM mode

1. Navigate to `http://localhost:8080`
2. Set the code via CodeMirror:
   ```javascript
   page.evaluate((code) => {
     const cm = document.querySelector('.CodeMirror');
     cm.CodeMirror.setValue(code);
   }, testCode);
   ```
3. Click the "DOM" button to switch to DOM view
4. Wait 1 second for rendering to complete
5. Take a screenshot of the diagram area — save as `emoji-eval-{caseName}-dom.png`

### Step 2: Render in SVG mode

1. Click the "SVG" button to switch to SVG view
2. Wait 1 second for rendering to complete
3. Take a screenshot of the diagram area — save as `emoji-eval-{caseName}-svg.png`

### Step 3: Evaluate both screenshots

Read each screenshot and score on the criteria below. Use your understanding of sequence diagrams to judge:

- A participant header should be a box with the name inside
- Emoji should appear inline to the LEFT of the participant name
- @Type icons (actor, database) should appear ABOVE the name, in their own row
- Stereotypes (`<<name>>`) should appear ABOVE the name, below the icon
- Messages should be horizontal arrows with labels
- Comments should be italicized text above messages

## Scoring Criteria

Score each criterion 0-3:

### 1. Emoji Visibility (per participant with emoji)
- **0**: Emoji not visible, blank box, or tofu character
- **1**: Something visible but wrong character or garbled
- **2**: Correct emoji visible but poor contrast or very small
- **3**: Correct emoji clearly visible

### 2. Emoji Position (per participant with emoji)
- **0**: Emoji in wrong location (after name, outside box, overlapping other elements)
- **1**: Before name but overlapping the name text
- **2**: Correct position with minor vertical misalignment
- **3**: Perfectly aligned inline before the name

### 3. Spacing (per participant with emoji)
- **0**: Emoji and name overlap or no gap
- **1**: Too tight (characters touching) or too wide (looks disconnected)
- **2**: Acceptable gap, slightly off
- **3**: Natural, comfortable spacing

### 4. Box Fit (per participant with emoji)
- **0**: Emoji or name overflows the participant box boundary
- **1**: Box boundary clips the emoji or text
- **2**: Box fits but looks cramped
- **3**: Box comfortably accommodates emoji + name with padding

### 5. Decorator Coexistence (only for cases with @Type or stereotype)
- **0**: @Type icon or stereotype is missing or broken
- **1**: Both present but overlapping or misaligned
- **2**: Both present, minor layout issues
- **3**: Perfect layout — icon above, stereotype below icon, emoji inline with name

### 6. Message/Comment Emoji (only for cases with emoji in messages or comments)
- **0**: Emoji not visible in message/comment text
- **1**: Emoji visible but breaks the message layout
- **2**: Emoji visible, minor alignment issues
- **3**: Emoji renders naturally inline with message/comment text

## Parity Check

For each criterion scored in both DOM and SVG:
- **Match**: Both scores are equal → mark as `=`
- **Close**: Scores differ by 1 → mark as `~`
- **Divergent**: Scores differ by 2+ → mark as `!=` (flag for investigation)

## Output Format

Present results as a markdown report:

```markdown
# Emoji Rendering Evaluation Report

**Date:** YYYY-MM-DD
**Branch:** {current git branch}
**Total cases:** {N}

## Summary

| Case | DOM Score | SVG Score | Parity | Status |
|------|----------|-----------|--------|--------|
| emoji-basic | 12/12 | 10/12 | ~ | PASS |
| emoji-multi | 12/12 | 11/12 | ~ | PASS |
| ... | ... | ... | ... | ... |

**Overall DOM:** {total}/{max} ({percentage}%)
**Overall SVG:** {total}/{max} ({percentage}%)
**Parity divergences:** {count}

## Detailed Results

### emoji-basic
**DSL:**
\`\`\`
[rocket] Production
A->Production.deploy()
\`\`\`

**DOM render:**
[screenshot: emoji-eval-emoji-basic-dom.png]

| Criterion | Score | Notes |
|-----------|-------|-------|
| Emoji visibility | 3 | Rocket emoji clearly visible |
| Emoji position | 3 | Correctly before "Production" |
| Spacing | 3 | Natural gap |
| Box fit | 3 | Box fits comfortably |
| **Total** | **12/12** | |

**SVG render:**
[screenshot: emoji-eval-emoji-basic-svg.png]

| Criterion | Score | Notes |
|-----------|-------|-------|
| Emoji visibility | 3 | Rocket emoji visible |
| Emoji position | 2 | Slightly tighter than DOM |
| Spacing | 2 | Tighter spacing than DOM |
| Box fit | 3 | Box fits |
| **Total** | **10/12** | |

**Parity:** Spacing is tighter in SVG (~ close)

---
(repeat for each case)
```

## Pass/Fail Thresholds

- **PASS**: All criteria >= 2, total >= 75%
- **WARN**: Any criterion at 1, or total 50-75%
- **FAIL**: Any criterion at 0, or total < 50%

## When to use this skill

- After emoji-related code changes
- Before creating a PR that touches emoji rendering
- When the user asks to "evaluate emoji", "score emoji rendering", "check emoji quality"
- When debugging emoji visual issues
