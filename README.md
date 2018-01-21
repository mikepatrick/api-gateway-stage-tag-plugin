A shim to tag API Gateway stages until CloudFormation/Serverless support arrives.

Usage
======

In Serverless template:

```
plugins: 
  - api-gateway-stage-tag-plugin

custom:
  apiStageTags:
    TagName1: TagValue1
    TagName2: TagValue2
```