# Payout Management System

A robust backend system that simulates an affiliate payout workflow. The application manages advance payouts, sales reconciliation, withdrawals, and recovery operations while ensuring data consistency through database transactions.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Business Workflow](#business-workflow)
- [Database Models](#database-models)
- [Relationships](#relationships)
- [API Endpoints](#api-endpoints)
- [Validation](#validation)
- [Business Rules](#business-rules)
- [Error Handling](#error-handling)
- [Database Transactions](#database-transactions)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Seed Database](#seed-database)
- [Run Development Server](#run-development-server)
- [Example Workflow](#example-workflow)
- [Design Decisions](#design-decisions)
- [Future Improvements](#future-improvements)
- [License](#license)
- [Author](#author)

---

## Features

- Advance payout processing for eligible sales
- Sales reconciliation workflow
- User withdrawal management
- Failed withdrawal recovery
- Automatic balance management
- Transaction history tracking
- Request validation using Joi
- Centralized error handling
- Database transactions with Sequelize
- SQLite database support

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | REST API |
| Sequelize | ORM |
| SQLite | Database |
| Joi | Request Validation |
| dotenv | Environment Variables |

---

## Architecture

```
                +----------------+
                |   REST APIs    |
                +--------+-------+
                         |
                         ▼
                +----------------+
                | Controllers    |
                +--------+-------+
                         |
                         ▼
                +----------------+
                | Services       |
                +--------+-------+
                         |
                         ▼
                +----------------+
                | Sequelize ORM  |
                +--------+-------+
                         |
                         ▼
                +----------------+
                | SQLite DB      |
                +----------------+
```

---

## Project Structure

```
payout-management-system
│
├── scripts/
│   └── seed.js
│
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── jobs/
│   └── utils/
│
├── server.js
├── app.js
├── package.json
└── README.md
```

---

## Business Workflow

```
Sales Created
      │
      ▼
Advance Payout Run
      │
      ▼
Payout Created
      │
      ▼
User Balance Updated
      │
      ▼
Withdrawal Request
      │
      ├──────────────► Success
      │
      ▼
Withdrawal Failed
      │
      ▼
Recovery Process
      │
      ▼
Balance Restored
```

---

## Database Models

### User

| Field | Type | Description |
|-------|------|--------------|
| id | UUID | Primary key |
| username | String | Unique username |
| withdrawableBalance | Decimal | Current available balance |
| lastWithdrawalAt | DateTime | Timestamp of last withdrawal (used for the 24h rule) |

### Sale

| Field | Type | Description |
|-------|------|--------------|
| id | UUID | Primary key |
| userId | UUID | Owning user |
| brand | String | Brand/merchant for the sale |
| earning | Decimal | Total earning for the sale |
| status | String | Sale status |
| advancePaid | Boolean | Whether an advance has been paid out |
| advanceAmount | Decimal | Amount paid as advance |
| reconciled | Boolean | Whether the sale has been reconciled |

### Payout

| Field | Type | Description |
|-------|------|--------------|
| id | UUID | Primary key |
| userId | UUID | Recipient user |
| saleId | UUID | Related sale |
| amount | Decimal | Payout amount |
| status | String | Payout status |

### Withdrawal

| Field | Type | Description |
|-------|------|--------------|
| id | UUID | Primary key |
| userId | UUID | Requesting user |
| amount | Decimal | Withdrawal amount |
| status | String | Withdrawal status |

### Transaction

| Field | Type | Description |
|-------|------|--------------|
| id | UUID | Primary key |
| userId | UUID | Related user |
| payoutId | UUID | Related payout (nullable) |
| type | String | Transaction type |
| amount | Decimal | Transaction amount |
| description | String | Human-readable note |

---

## Relationships

```
User
 ├── hasMany Sales
 ├── hasMany Payouts
 ├── hasMany Withdrawals
 └── hasMany Transactions

Sale
 └── hasMany Payouts

Payout
 └── hasMany Transactions
```

---

## API Endpoints

All responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { },
  "message": "Description of the result"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Description of the error"
}
```

---

### Payout APIs

#### Get Sales

```
GET /api/payouts/sales
```

**Response — 200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "sale-uuid",
      "userId": "user-uuid",
      "brand": "BrandX",
      "earning": 100,
      "status": "pending",
      "advancePaid": false,
      "advanceAmount": 0,
      "reconciled": false
    }
  ]
}
```

---

#### Run Advance Payout

```
POST /api/payouts/advance/run
```

Processes all eligible pending sales and credits advances in a single transaction.

**Response — 200 OK**

```json
{
  "success": true,
  "message": "Advance payout run completed",
  "data": {
    "processed": 5,
    "totalAdvanceAmount": 350
  }
}
```

**Response — 400 Bad Request** (no eligible sales)

```json
{
  "success": false,
  "error": "No eligible sales found for advance payout"
}
```

---

#### Reconcile Sale

```
POST /api/payouts/reconcile
```

**Request Body**

```json
{
  "saleId": "<sale-id>",
  "status": "approved"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| saleId | UUID | Yes | Must reference an existing sale |
| status | String | Yes | One of: `approved`, `rejected` |

**Response — 200 OK**

```json
{
  "success": true,
  "message": "Sale reconciled successfully",
  "data": {
    "id": "sale-uuid",
    "status": "approved",
    "reconciled": true
  }
}
```

**Response — 409 Conflict** (already reconciled)

```json
{
  "success": false,
  "error": "Sale has already been reconciled"
}
```

**Response — 404 Not Found**

```json
{
  "success": false,
  "error": "Sale not found"
}
```

---

### Withdrawal APIs

#### Create Withdrawal

```
POST /api/withdrawals
```

**Request Body**

```json
{
  "userId": "<user-id>",
  "amount": 20
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| userId | UUID | Yes | Must reference an existing user |
| amount | Number | Yes | Must be greater than 0 and ≤ available balance |

**Response — 201 Created**

```json
{
  "success": true,
  "message": "Withdrawal created successfully",
  "data": {
    "id": "withdrawal-uuid",
    "userId": "user-uuid",
    "amount": 20,
    "status": "pending"
  }
}
```

**Response — 400 Bad Request** (insufficient balance)

```json
{
  "success": false,
  "error": "Insufficient withdrawable balance"
}
```

**Response — 429 Too Many Requests** (24h rule)

```json
{
  "success": false,
  "error": "Only one withdrawal is allowed every 24 hours"
}
```

---

#### Recovery

```
POST /api/withdrawals/recovery
```

**Request Body**

```json
{
  "withdrawalId": "<withdrawal-id>",
  "status": "failed"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| withdrawalId | UUID | Yes | Must reference an existing withdrawal |
| status | String | Yes | One of: `failed`, `cancelled`, `rejected` |

**Response — 200 OK**

```json
{
  "success": true,
  "message": "Withdrawal recovered and balance restored",
  "data": {
    "id": "withdrawal-uuid",
    "status": "failed",
    "restoredAmount": 20
  }
}
```

**Response — 404 Not Found**

```json
{
  "success": false,
  "error": "Withdrawal not found"
}
```

---

## Validation

The project validates all incoming requests using **Joi**. Common rules include:

- Required fields
- UUID validation for IDs
- Amount validation (positive, numeric)
- Allowed status values (restricted enums per endpoint)

Validation failures return **400 Bad Request** with a descriptive error message.

---

## Business Rules

### Advance Payout

- Processes eligible pending sales.
- Credits advance amount to user balance.
- Creates payout records.
- Creates transaction records.
- Executes inside a database transaction.

### Reconciliation

- Approves or rejects a sale.
- Marks sale as reconciled.
- Prevents duplicate reconciliation.

### Withdrawal

- Validates available balance.
- Allows only one withdrawal every 24 hours.
- Creates withdrawal record.
- Debits user balance.
- Creates transaction record.

### Recovery

Supports:

- `failed`
- `cancelled`
- `rejected`

Recovery automatically restores the deducted balance and updates the withdrawal status.

---

## Error Handling

Centralized error handling covers:

| Error Type | Status Code |
|------------|--------------|
| Validation errors | 400 |
| Business rule violations | 400 / 409 / 429 |
| Missing resources | 404 |
| Database failures | 500 |
| Transaction rollback | 500 |

---

## Database Transactions

The following operations are executed atomically using Sequelize transactions:

- Advance Payout
- Withdrawal
- Recovery

If any operation fails, the transaction is rolled back to maintain consistency.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/payout-management-system.git
```

Move into the project directory:

```bash
cd payout-management-system
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_STORAGE=./database.sqlite
```

---

## Seed Database

```bash
npm run seed
```

---

## Run Development Server

```bash
npm run dev
```

---

## Example Workflow

| Step | Action | Endpoint |
|------|--------|----------|
| 1 | Seed database | `npm run seed` |
| 2 | Run advance payout | `POST /api/payouts/advance/run` |
| 3 | Approve sale | `POST /api/payouts/reconcile` |
| 4 | Create withdrawal | `POST /api/withdrawals` |
| 5 | Recover failed withdrawal | `POST /api/withdrawals/recovery` |

---

## Design Decisions

- Layered architecture (Controllers → Services → Repositories → ORM)
- Service-oriented business logic
- Repository separation for data access
- Sequelize ORM for schema and query management
- Atomic database transactions for critical operations
- Request validation using Joi
- Centralized balance management through `BalanceService`

---

## Future Improvements

- JWT Authentication
- Role-based Authorization
- Docker Support
- Redis Queue
- Scheduled Background Jobs
- Swagger / OpenAPI Documentation
- PostgreSQL Support
- Unit Tests
- Integration Tests
- CI/CD Pipeline
- Logging & Monitoring

---

## License

This project is licensed under the MIT License.

---

## Author

**Aditya Sanskar Srivastav**

Backend Developer | Node.js | Express | Sequelize | Open Source