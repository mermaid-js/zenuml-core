# Test Cases for New Architecture

## Test Case 1: Basic Participants and Divider
```
A -> B: Hello
===Test Divider===
B -> A: Reply
```
Expected: Both participants and divider use NEW architecture

## Test Case 2: Participant Features
```
@actor <<Controller>> Alice #ff0000
@entity Bob as "Database System" #00ff00
Alice -> Bob: Query
===[blue] Data Section===
Bob -> Alice: Results
```
Expected: 
- Alice shows as actor with red color
- Bob shows as entity with green color and label "Database System"
- Divider shows with blue style

## Test Case 3: Multiple Participants
```
@actor User #ff6b6b
@boundary API #4ecdc4
@control Service #45b7d1
@entity Database #f7dc6f

User -> API: Request
API -> Service: Process
Service -> Database: Query
===Response Flow===
Database -> Service: Data
Service -> API: Result
API -> User: Response
```
Expected: All participants show with correct types and colors

## Test Case 4: Complex Diagram
```
title Authentication Flow

@actor User #3498db
@boundary WebApp #e74c3c
@control AuthService #2ecc71
@entity UserDB #f39c12

User -> WebApp: Login (username, password)
WebApp -> AuthService: authenticate(credentials)
AuthService -> UserDB: findUser(username)
UserDB -> AuthService: user data

alt user found
    AuthService -> AuthService: validatePassword()
    alt password valid
        AuthService -> WebApp: success + token
        WebApp -> User: logged in
    else password invalid
        AuthService -> WebApp: invalid credentials
        WebApp -> User: error message
    end
else user not found
    AuthService -> WebApp: invalid credentials
    WebApp -> User: error message
end

===Session Management===

User -> WebApp: Access protected resource
WebApp -> AuthService: validateToken(token)
AuthService -> WebApp: token valid
WebApp -> User: Show resource
```
Expected: All components render correctly with new architecture