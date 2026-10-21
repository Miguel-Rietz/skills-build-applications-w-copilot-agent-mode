# Backend API

## Create an activity

`POST /api/activities` links an activity to existing records using their MongoDB
IDs. Send `userId` and `teamId`; the API does not resolve users or teams by name.

```json
{
  "userId": "64b000000000000000000001",
  "teamId": "64b000000000000000000002",
  "type": "run",
  "minutes": 30
}
```

Both IDs must refer to existing records. `type` must be non-empty and `minutes`
must be a positive number.
