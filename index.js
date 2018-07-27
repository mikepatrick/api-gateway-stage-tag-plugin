'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;

    this.hooks = {
      'after:deploy:deploy': this.addTags.bind(this),
    };
  }
  addTags() {
    const stackName = `${this.serverless.service.service}-${this.options.stage}`;
    const params = { StackName: stackName };
    const awsService = this.serverless.getProvider('aws');
    const credentials = awsService.getCredentials()
    const cloudFormation = new awsService.sdk.CloudFormation(credentials);

    cloudFormation.describeStackResources(params, (err, data) => {
      if (err) {
        this.serverless.cli.log('[ERROR]: Could not describe stack resources.');
        this.serverless.cli.log(err);
      } else {
        const apiObj = data.StackResources.find((element) => {
          return element.ResourceType === 'AWS::ApiGateway::RestApi';
        });

        const restApiId = apiObj.PhysicalResourceId;

        const apigateway = new awsService.sdk.APIGateway(credentials);

        const apiParams = {
          resourceArn: `arn:aws:apigateway:${this.options.region}::/restapis/${restApiId}/stages/${this.options.stage}`,
          tags: this.serverless.service.custom.apiStageTags
        };

        apigateway.tagResource(apiParams, (apiErr, apiData) => {
          if (apiErr) {
            this.serverless.cli.log('[ERROR]: Could not tag API Gateway resource');
            this.serverless.cli.log(apiErr, apiErr.stack);
          } else {
            this.serverless.cli.log(`Tagged API gateway stage ${restApiId}/${this.options.stage}`);
          }
        });
      }
    });
  }
}

module.exports = ServerlessPlugin;
