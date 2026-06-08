# ZenUML DSL Syntax Reference

ZenUML uses a Markdown-inspired text format to describe sequence diagrams. This reference covers all supported constructs.

---

## Table of Contents

1. [Title](#title)
2. [Participants](#participants)
3. [Groups](#groups)
4. [Starter](#starter)
5. [Messages](#messages)
6. [Async Messages](#async-messages)
7. [Return Statements](#return-statements)
8. [Object Creation](#object-creation)
9. [Fragments](#fragments)
   - [Conditional (if/else)](#conditional-ifelse)
   - [Loop (while/for/loop)](#loop)
   - [Optional (opt)](#optional-opt)
   - [Parallel (par)](#parallel-par)
   - [Critical (critical)](#critical)
   - [Section / Frame (section/frame)](#section--frame)
   - [Try/Catch/Finally (tcf)](#trycatchfinally)
   - [Reference (ref)](#reference-ref)
10. [Dividers](#dividers)
11. [Comments](#comments)
12. [Expressions and Conditions](#expressions-and-conditions)
13. [Annotations](#annotations)
14. [Unicode and Emoji](#unicode-and-emoji)

---

## Title

A diagram title appears at the top. It must be the very first line.

```
title My Sequence Diagram

A.method()
```

The `title` keyword is only recognized as a directive when it is the first non-comment token in the file and is not followed by `.`, `(`, or `=`.

---

## Participants

Participants are the columns (lifelines) in the diagram. They can be declared explicitly in the `head` section or inferred implicitly from message statements.

### Implicit participants

Any name used in a message is automatically a participant:

```
A.method()
// Participants A is inferred
```

### Explicit declaration

```
participant A
participant B
```

### Participant types (stereotypes via annotation)

Use an `@Annotation` before the participant name to set its type. The annotation controls the icon displayed on the lifeline header.

```
@Actor Alice
@Boundary PaymentGateway
@Control OrderService
@Entity Order
@Database UserDB
@Collections Items
@Queue MessageBroker
```

Supported type annotations: `@Actor`, `@Boundary`, `@Control`, `@Entity`, `@Database`, `@Collections`, `@Queue`.

### Stereotype labels

Use `<<StereotypeName>>` syntax to add a stereotype label:

```
participant <<Service>> OrderService
@Control <<API>> Gateway
```

### Color

Append a hex color code to set the participant's header color:

```
participant Alice #FF5733
@Actor Bob #4287f5
```

### Display label (alias)

Use `as` to give a participant a display name different from its identifier:

```
participant OrderService as "Order Service"
@Actor user as "End User"
```

### Emoji

Add an emoji using shortcode syntax `[shortcode]` or Unicode emoji directly:

```
participant [rocket] Deployer
participant 🚀 Deployer
```

### Width

Specify a minimum pixel width as an integer:

```
participant Alice 120
```

### Full syntax

```
@Type <<Stereotype>> [emoji] ParticipantName Width as "Label" #COLOR
```

All parts are optional except the name.

---

## Groups

Participants can be visually grouped:

```
group "Frontend" {
  @Actor User
  @Boundary WebApp
}
group "Backend" {
  @Control API
  @Entity DB
}
```

Groups appear as boxes that span the contained participants' lifelines.

---

## Starter

The `@Starter` annotation declares which participant initiates the sequence. Without it, the first message sender is used.

```
@Starter(Alice)

Alice.placeOrder()
```

---

## Messages

Messages represent method calls between participants.

### Basic call

```
A.methodName()
```

The caller is inferred from context (the enclosing participant or `_STARTER_`).

### Explicit sender

```
A -> B.methodName()
```

### Call with arguments

```
A.transfer(amount, currency)
```

### Named parameters

```
A.create(id=123, name="Alice")
```

### Typed declaration parameters

```
A.process(String message, int count)
```

### Assignment (capture return value)

```
result = A.compute()
```

### Typed assignment

```
String result = A.compute()
```

### Chained calls

```
A.service.doWork()
```

### Nested block (occurrence)

A message with a `{ }` block shows an activation box and renders nested statements inside:

```
A.process() {
  B.validate()
  C.persist()
}
```

### Semicolon terminator

A trailing `;` is optional and treated as a no-op (for compatibility):

```
A.method();
```

---

## Async Messages

Async messages use the `to: content` syntax with a colon separator. They render with an open arrowhead.

```
A -> B: message text
```

Content extends to end-of-line. The sender is optional:

```
B: event payload
```

### Async return

```
A --> B: response text
```

Or using annotation:

```
@Return A --> B: response
```

---

## Return Statements

```
return value
```

Returns from the current activation. The value is optional:

```
return
return result
return computedValue
```

With semicolon:

```
return value;
```

---

## Object Creation

Use `new` to create a new participant instance. The created participant appears at the point in the diagram where `new` is called.

### Simple creation

```
new OrderService()
```

### Assigned creation

```
service = new OrderService()
```

### Typed creation

```
OrderService service = new OrderService()
```

### Creation with arguments

```
service = new OrderService(config, timeout)
```

### Creation with block

```
service = new OrderService() {
  service.init()
}
```

---

## Fragments

Fragments are UML combined fragments — boxes drawn around grouped statements.

### Conditional (if/else)

```
if (condition) {
  A.method()
} else if (otherCondition) {
  B.method()
} else {
  C.method()
}
```

Conditions support full expressions (see [Expressions](#expressions-and-conditions)).

### Loop

The `while`, `for`, `foreach`, `forEach`, and `loop` keywords all render as a loop fragment:

```
while (items.hasNext()) {
  process(item)
}

for (i = 0; i < 10; i++) {
  A.step()
}

loop (retryCount > 0) {
  A.retry()
}
```

Condition is optional:

```
while {
  A.poll()
}
```

### Optional (opt)

```
opt (userIsAdmin) {
  Admin.grantAccess()
}
```

### Parallel (par)

```
par {
  A.fetchData()
  B.loadConfig()
}
```

### Critical

```
critical (mutex) {
  DB.write()
}
```

### Section / Frame

Sections (`section` or `frame` keyword) group statements with an optional label:

```
section(Authentication) {
  User -> Auth: login
  Auth -> DB: verify
}

frame(Validation) {
  A.validate()
}
```

Anonymous section (just a brace block):

```
{
  A.internal()
}
```

### Try/Catch/Finally

```
try {
  A.riskyCall()
} catch (IOException e) {
  Logger.log(e)
} finally {
  Connection.close()
}
```

Multiple catch blocks are supported. The catch parameter is optional:

```
try {
  A.call()
} catch {
  A.handleError()
}
```

### Reference (ref)

Use `ref` to reference another sequence diagram by name:

```
ref(AuthFlow)
ref(PlaceOrder, ProcessPayment)
```

---

## Dividers

Dividers are horizontal separator lines with an optional note. A divider must start at column 0 and begin with `==`.

```
== Setup Phase ==

A.init()

== Execution Phase ==

A.run()
```

Any characters after `==` are the divider note. Spaces between `==` and the note are allowed.

---

## Comments

Line comments use `//`:

```
// This is a comment
A.method() // inline comment
```

Comments are associated with the following statement and rendered as a small note above it in the diagram.

---

## Expressions and Conditions

Conditions inside `if`, `while`, `opt`, `par`, and `critical` support:

### Comparison

```
if (x == y) { ... }
if (count != 0) { ... }
if (value >= threshold) { ... }
if (score < 100) { ... }
```

### Boolean

```
if (isReady && !isCancelled) { ... }
if (a || b) { ... }
if (!flag) { ... }
```

### Arithmetic

```
while (retries * delay < timeout) { ... }
if (balance - amount >= 0) { ... }
```

### Function calls

```
if (list.isEmpty()) { ... }
if (queue.size() > 0) { ... }
```

### In expression

```
if (item in collection) { ... }
```

### Text expression (free-form)

Plain text without operators is also valid as a condition:

```
if (user is authenticated) { ... }
loop (for each order) { ... }
```

### Literals

- Boolean: `true`, `false`
- Null: `nil`, `null`
- Number: `42`, `3.14`
- Number with unit: `500ms`, `1s`, `2GB`, `100px`
- Money: `$99.99`
- String: `"hello world"`

---

## Annotations

Annotations start with `@` and serve multiple purposes:

| Annotation | Purpose |
|---|---|
| `@Actor` | Participant type: person icon |
| `@Boundary` | Participant type: boundary icon |
| `@Control` | Participant type: control icon |
| `@Entity` | Participant type: entity icon |
| `@Database` | Participant type: database icon |
| `@Collections` | Participant type: collections icon |
| `@Queue` | Participant type: queue icon |
| `@Starter` / `@starter` | Designate the initiating participant |
| `@Return` / `@return` | Mark an async return message |
| `@Reply` / `@reply` | Alias for `@Return` |

Any other `@Name` token is treated as a participant type annotation.

---

## Unicode and Emoji

### Unicode identifiers

Participant names, method names, and labels support Unicode letters (Chinese, Japanese, Korean, Arabic, etc.):

```
@Actor 用户
用户 -> 系统: 登录请求
系统.validateCredentials(用户名, 密码)
```

### Emoji shortcodes

Emoji shortcodes in square brackets can appear in participant names and method names:

```
participant [rocket] Deploy
[robot].processQueue()
```

### Unicode emoji

Unicode emoji characters can be used directly:

```
participant 🚀 Deployment
🤖.start()
```

See [UNICODE_SUPPORT.md](./UNICODE_SUPPORT.md) for the full list of supported Unicode ranges and usage rules.

---

## Variable Modifiers

Variable modifiers appear in assignments and are parsed but treated as decorative:

```
const result = A.compute()
readonly config = A.getConfig()
static instance = new Service()
await response = A.fetchAsync()
```

---

## Complete Example

```
title Order Processing

@Actor Customer
@Boundary WebApp
@Control OrderService
@Entity OrderDB
@Queue NotificationQueue

group "Frontend" {
  Customer
  WebApp
}

@Starter(Customer)

// Place order
Customer -> WebApp: submitOrder(cartId)

WebApp.processOrder(cartId) {
  // Validate input
  if (cart.isEmpty()) {
    return error("Empty cart")
  }

  String orderId = new OrderService(cart) {
    OrderService -> OrderDB: persist(order)
    return orderId
  }

  // Notify async
  WebApp -> NotificationQueue: orderCreated(orderId)
}

== Confirmation ==

WebApp --> Customer: orderConfirmed(orderId)

try {
  Payment.charge(orderId)
} catch (PaymentException e) {
  Logger.log(e)
  return error("Payment failed")
} finally {
  Session.cleanup()
}
```
