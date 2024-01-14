# rest-service

## About this Service

## Stages

- Production: production environment. Only CD tools can deploy stack into this env
- Staging: iso-production environment. Used to test this stack in iso-production configuration. Only CD Tools can deploy into this env
- Sandbox: team environment. This is dedicated to test integration of develop branch (specially where there is more than two devs working on the stack at the same time). Only CD Tools can deploy into this env after Pull Request acceptance.
- Dev: Your own sandbox environment. You are 100% to manage it at your taste. Only manual deployment is allowed here

## Development setup

- Ensure you have already setup your AWS Access Profile in `~/.aws/credentials`
- Set your development environment variables by customising `env.yml` file

```
accountId: <Your_Account_Id> # Your affected AWS account id
suffix: dev-<Your_Account_Id>
profile: default # Use the profile defined in your ~/.aws/credentials file
```

## Manual deployment

Run `yarn deploy:dev` to deploy your cloudformation stack to your development AWS Account.

If you would like to debug your deployment just run:
`SLS_DEBUG=* yarn deploy:dev`

## Lambda development

### Create a new Lambda function

1. Under `./lambda/` directory create a new directory and cd to it : `mkdir ./lambda/MyFunction && cd ./lambda/MyFunction`
2. Under the new created directory use Yeoman to generate a new Lambda by running: `yo @nearprime/serverless:lambda`
3. Answer the different questions
4. Different files will be generated:

- ./lambda/MyFunction directory: containing code source for your new lambda function
- ./lambda/MyFunction/config.yml: containing your serverless function declaration
- ./lambda/events/MyFunction/sampleInputs/input.json: containing empty json file to be used for your development tests

5. You will need to add a custom row under **functions** in `./serverless.yml` file in order to let serverless framework be aware of your function
   `- ${file(./lambda/MyFunction/config.yml)}`

### Debug Lambda function locally

You can run your lambda function locally by running
`yarn sls invoke local --function MyFunction --path ./lambda/MyFunction/sampleInputs/input.json --stage sandbox`

You can use process env variable `DEBUG=phileas:*` to print debug log.

You can use you IDE for step by step debugging by using the same commands in your debugger.

## Scripts

### Node.js Scripts

You can find the following scripts under `./scripts`

#### Audit

This script performs `audit-ci --moderate` inside each lambda function folder. It uses [IBM audit-ci module](https://github.com/IBM/audit-ci) that prevents integration if vulnerabilities are found inside lambda dependencies.
You can launch it (global audit) by running `yarn audit:ci`

#### mergeGraphQL

This script uses [merge-graphql-schemas](https://github.com/okgrow/merge-graphql-schemas) to facilitate merging of modularized GraphQL schemas.
The paths and output filename are hard coded inside this script to merge all `*.graphql` found inside a given folder into one `filename.schema.graphql` file and store it inside the given path.

#### npmInstallRecursive

This will run `yarn install` recursively inside `./lambda/**` folders

#### predeploy

This script is a root script that is lauched prior to `yarn deploy` script. It basically runs the two previous scripts: `mergeGraphQL` and `npmInstallRecursive`

### NPM scripts

- `"cm": "git-cz"`
  use `git add .` then `yarn cm` to commit to git following Phileas Systems commit message rules

- `"cmr": "git-cz --retry"`
  Retry using the latest commit message

- `"cmp": "git add . && yarn cm && git push"`
  Stage all modified files, commit them using Phileas Systems commit message rules and push to remote repository

- `"lint": "eslint --ignore-path .gitignore --ignore-pattern \"!**/.*\" ."`
  Run eslint

- `"fix": "yarn run lint --fix"`
  Fix eslint issues

- `"npm:upgrade": "ncu -u && yarn"`
  Upgrade this project node modules to the latest version. This script updates package.json file

- `"npm:check": "ncu"`
  Check the latests version of used node modules inside this project without installing them or updating package.json

- `"stats": "OPEN_ANALYZER=true sls webpack"`
  Use `wepack-bundle-analyzer` to display the size of generated bundle for each lambda function.

- `"test": "sls invoke test"`
  Runs Jest test scripts.

- `"predeploy": "node scripts/predeploy"`
  Runs scripts to be launched before deploying this service to AWS

- `"audit:ci": "node scripts/audit"`
  Performs `audit-ci --moderate` inside each lambda function folder.

- `"deploy": "sls deploy --verbose"`
  Deploy this service to AWS using default profile declared in `~/.aws/credentials`

- `"remove-stack": "sls remove --verbose"`
  Remove deployed cloud formation stack using default profile defined in `~/.aws/credentails`

- `"deploy:production": "yarn deploy --stage production"`
  Deploy cloud formation stack to production environment. Declared production `profile` name in `serverless.yml` must be declared in `~/.aws/credentials`

- `"deploy:staging": "yarn deploy --stage staging"`
  Deploy cloud formation stack to staging environment. Declared staging `profile` name in `serverless.yml` must be declared in `~/.aws/credentials`

- `"deploy:sandbox": "yarn deploy --stage sandbox"`
  Deploy cloud formation stack to production environment. Declared sandbox `profile` name in `serverless.yml` must be declared in `~/.aws/credentials`

- `"deploy:dev": "yarn deploy --stage dev"`
  Deploy cloud formation stack to developer AWS environment. Declared production `profile` name in `env.yml` must be declared in `~/.aws/credentials`

- `"remove:dev": "yarn remove-stack --stage dev"`
  Remove previously deployed cloud formation stack from developer AWS environment.

## Testing

Run `yarn test` to run one shot all tests
Run `yarn test --watch` to run tests in watch mode all tests
Run `yarn test -f FunctionName` to run tests for one function
Run `yarn test -f FunctionName --watch` to run tests for one function in watch mode

### Useful tips
