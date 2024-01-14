#CreateFolder

Endpoint to create new Folder

## Environment Variables:

TABLE_NAME_STORAGE_DATA

## Input

```
{
"body": "{\"name\":\"Folder9\",\"parentFolderId\":\"26d81a27-b2fb-45b9-a6ec-fa8c305b9fe1\"}",
"pathParameters": {
    "wId": "testWallet.testnet"
  },
}
```

## Input Process

Main aim of this lambda function is to create Folder in Dynamodb. There are two arguments defined in Body. Name is the Name of folder and ParentFolderId is Id of the Parent Folder in which user wants to create subFolder. ParentFolderId is optional. User should not pass this if he wants to create folder in root level.

## Output

Give a description to lambda output here

```
{
    "_version": 1,
    "wId": "testWallet.testnet",
    "parentFolderId": "26d81a27-b2fb-45b9-a6ec-fa8c305b9fe1",
    "updatedAt": "2022-04-20T16:13:31.172Z",
    "createdAt": "2022-04-20T16:13:31.172Z",
    "_context": {
        "x-correlation-source-ip": "127.0.0.1",
        "x-debug": "true",
        "x-correlation-id": "offlineContext_resourceId",
        "call-chain-length": 1,
        "awsRequestId": "52342440-ebb2-473f-8d94-915678ebb85d",
        "user-agent": "PostmanRuntime/7.1.1"
    },
    "id": "e2a141ac-fbf0-4a05-9777-161786613607",
    "name": "Folder10"
}
```
