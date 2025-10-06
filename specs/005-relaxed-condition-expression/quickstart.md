# Quickstart: Relaxed Condition Expressions

This guide demonstrates how to use the new relaxed condition expressions feature in ZenUML.

## Prerequisites

- ZenUML Core library installed
- Basic understanding of ZenUML syntax

## Quick Examples

### 1. Natural Language Conditions (NEW!)

You can now write conditions without quotes:

```zenuml
// Before (required quotes)
if("has more items") {
  A.processNext()
}

// After (no quotes needed!)
if(has more items) {
  A.processNext()
}
```

### 2. Loop Conditions

```zenuml
// Natural language in loops
loop(streaming response) {
  Server.sendChunk()
  Client.receive()
}

// Still supports expressions
loop(count < 10) {
  A.doWork()
}
```

### 3. Parallel Blocks with Conditions (NEW!)

```zenuml
// Par now supports conditions
par(concurrent processing) {
  ServiceA.process()
  ServiceB.process()
}

// Complex expressions work too
par(threads > 1) {
  Worker1.execute()
  Worker2.execute()
}
```

### 4. Optional Blocks with Conditions (NEW!)

```zenuml
// Opt now supports conditions
opt(user is authenticated) {
  SecureService.getData()
}

// With expressions
opt(role == "admin") {
  Admin.specialAction()
}
```

### 5. Critical Sections Enhanced

```zenuml
// Critical now supports full expressions
critical(resource is locked) {
  Resource.access()
}

// Complex expressions
critical(semaphore.count > 0) {
  SharedResource.modify()
}
```

## Step-by-Step Tutorial

### Step 1: Basic Natural Language Condition

Create a simple diagram with a natural language condition:

```zenuml
@Starter(Client)

if(user is logged in) {
  Client.showDashboard()
} else {
  Client.showLogin()
}
```

### Step 2: Multiple Word Conditions

Use multiple words without operators:

```zenuml
loop(more data available) {
  DataService.fetchBatch()
  Processor.process()
}
```

### Step 3: Combining with Existing Syntax

Mix natural language with expressions:

```zenuml
if(session is active) {
  opt(cache.size > 1000) {
    Cache.flush()
  }
  par(multiple workers available) {
    Worker1.process()
    Worker2.process()
  }
}
```

## Complete Example

Here's a comprehensive example using all features:

```zenuml
title Authentication Flow

@Starter(User)
User.login(credentials)

if(credentials are valid) {
  AuthService.authenticate()

  opt(two factor enabled) {
    AuthService.send2FA()
    User.enter2FA(code)

    if(code is correct) {
      AuthService.grantAccess()
    }
  }

  par(initialize user session) {
    SessionService.create()
    ProfileService.load()
    PreferencesService.fetch()
  }

  loop(pending notifications exist) {
    NotificationService.getNext()
    User.displayNotification()
  }

  critical(database transaction) {
    AuditLog.recordLogin()
  }
} else {
  AuthService.reject()
  User.showError()
}
```

## Testing Your Implementation

### Test Case 1: Backward Compatibility

Ensure existing diagrams still work:

```zenuml
// These should all continue to work
if(x > 0) { A.method() }
if("some condition") { B.method() }
loop(i < 10) { C.method() }
par { D.method() }
opt { E.method() }
```

### Test Case 2: Natural Language

Test natural language conditions:

```zenuml
if(user wants to continue) { A.proceed() }
loop(more items in queue) { B.process() }
par(parallel execution needed) { C.run() }
opt(feature is enabled) { D.execute() }
critical(resource needs protection) { E.access() }
```

### Test Case 3: Edge Cases

```zenuml
// Empty conditions treated as no condition
par() { A.method() }  // Same as par { A.method() }
opt() { B.method() }  // Same as opt { B.method() }

// Very long conditions (truncated in display)
if(this is a very long condition that exceeds the maximum display length of eighty characters and will be truncated) {
  A.method()
}
```

## Validation Checklist

- [ ] Natural language conditions parse without errors
- [ ] Existing quoted strings still work
- [ ] Complex expressions still work
- [ ] Par accepts conditions
- [ ] Opt accepts conditions
- [ ] Critical accepts full expressions
- [ ] Empty parentheses treated as no condition
- [ ] Long conditions truncate at 80 characters
- [ ] Tooltips show full condition text
- [ ] No commas in natural language conditions

## Common Patterns

### Business Logic

```zenuml
if(payment is successful) {
  Order.confirm()
  opt(express shipping selected) {
    Shipping.expedite()
  }
}
```

### System Operations

```zenuml
loop(queue has messages) {
  MessageBroker.consume()
  par(distributed processing) {
    Node1.process()
    Node2.process()
  }
}
```

### Error Handling

```zenuml
try {
  Service.operation()
} catch(error) {
  if(error is retryable) {
    loop(retry attempts remaining) {
      Service.retry()
    }
  }
}
```

## Troubleshooting

### Issue: Condition not recognized
**Solution**: Ensure no commas in natural language conditions

### Issue: Parser error
**Solution**: Check for unmatched parentheses or invalid operators

### Issue: Condition truncated
**Solution**: This is by design; hover for full text

## Next Steps

1. Try converting existing diagrams to use natural language
2. Experiment with par/opt conditions
3. Test with your specific use cases
4. Report any issues or suggestions