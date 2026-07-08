# 🔐 Authentication Controller Flowchart

## Overview

This flowchart illustrates the complete workflow of the **Authentication Controller** in the Healthcare Knowledge Base system. It covers user registration, login, authentication, current user retrieval, and logout operations.

The diagram demonstrates the security mechanisms implemented within the authentication process, including password hashing with **bcrypt**, JWT-based authentication, rate limiting, failed login tracking, temporary account locking, audit logging, and protected route verification. Together, these processes ensure secure user authentication and authorization while maintaining a complete audit trail of authentication activities.

---

## Flowchart

```mermaid
flowchart TD
    Start([Request]) --> Router{Auth Routes}

    Router -->|POST /auth/login| Login[Login Endpoint]
    Router -->|POST /auth/register| Register[Register Endpoint]
    Router -->|GET /auth/me| Me[Current User Endpoint]
    Router -->|POST /auth/logout| Logout[Logout Endpoint]

    %% REGISTER FLOW
    Register --> ValidateRegister{Validate Input<br/>name, email, password?}
    ValidateRegister -->|No| Error400[400 Bad Request]
    ValidateRegister -->|Yes| CheckExisting{Email exists?}
    CheckExisting -->|Yes| Conflict409[409 Conflict]
    CheckExisting -->|No| HashPassword[Hash password with bcrypt<br/>saltRounds: 10]
    HashPassword --> CreateUser[Create user record<br/>role defaults to VIEWER]
    CreateUser --> CreateAuditRegister[Create audit log<br/>action: REGISTER]
    CreateAuditRegister --> ReturnUser[Return user data<br/>201 Created]

    %% LOGIN FLOW
    Login --> RateLimiter[Rate Limiter Middleware<br/>windowMs: 10 min<br/>max: 5 attempts]
    RateLimiter --> ValidateLogin{Validate Input<br/>email, password?}
    ValidateLogin -->|No| Error400Login[400 Bad Request]
    ValidateLogin -->|Yes| FindUser[Find user by email]

    FindUser --> UserExists{User exists?}
    UserExists -->|No| InvalidCredentials[401 Invalid credentials]
    UserExists -->|Yes| CheckLocked{Account locked?}

    CheckLocked -->|Yes| LockedResponse[429 Locked<br/>Remaining minutes]
    CheckLocked -->|No| VerifyPassword[Verify password with bcrypt]

    VerifyPassword --> PasswordMatch{Password matches?}

    PasswordMatch -->|No| IncrementAttempts[Increment failedLoginAttempts<br/>Update lastFailedLogin]
    IncrementAttempts --> CheckMaxAttempts{Attempts >= MAX?}
    CheckMaxAttempts -->|Yes| LockAccount[Lock account<br/>set lockedUntil]
    CheckMaxAttempts -->|No| LogFailedAudit[Create audit log<br/>action: FAILED_LOGIN]
    LogFailedAudit --> InvalidCredentials

    LockAccount --> LogFailedAudit

    PasswordMatch -->|Yes| ResetAttempts[Reset failedLoginAttempts = 0<br/>Clear lockedUntil]
    ResetAttempts --> GenerateToken[Generate JWT<br/>expiresIn: 8h]
    GenerateToken --> CreateAuditLogin[Create audit log<br/>action: LOGIN]
    CreateAuditLogin --> ReturnToken[Return JWT + user data]

    %% CURRENT USER FLOW
    Me --> AuthMiddleware[Auth Middleware<br/>Verify JWT token]
    AuthMiddleware --> FindUserMe[Find user by ID from token]
    FindUserMe --> UserExistsMe{User exists?}
    UserExistsMe -->|No| NotFound404[404 Not Found]
    UserExistsMe -->|Yes| ReturnUserMe[Return user data]

    %% LOGOUT FLOW
    Logout --> AuthMiddlewareLogout[Auth Middleware<br/>Verify JWT token]
    AuthMiddlewareLogout --> CreateAuditLogout[Create audit log<br/>action: LOGOUT]
    CreateAuditLogout --> ReturnLogout[Return logout success]

   %% Styling
classDef process fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000000
classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000000
classDef database fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000000
classDef error fill:#ffcdd2,stroke:#c62828,stroke-width:2px,color:#000000
classDef success fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px,color:#000000
classDef audit fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#000000

    class Register,Login,Me,Logout process
    class ValidateRegister,CheckExisting,ValidateLogin,UserExists,CheckLocked,PasswordMatch,CheckMaxAttempts,UserExistsMe decision
    class CreateUser,FindUser,IncrementAttempts,LockAccount,ResetAttempts,FindUserMe database
    class GenerateToken,VerifyPassword,HashPassword security
    class Error400,Conflict409,Error400Login,InvalidCredentials,LockedResponse,NotFound404 error
    class ReturnUser,ReturnToken,ReturnUserMe,ReturnLogout success
```
