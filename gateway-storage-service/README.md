# gateway-storage-service

## About this Service

## Before you start

### NPM packages access

In order to be able to access `@nearprime/*` npm packages:

- Go to your Github account -> [Developer settings](https://github.com/settings/tokens)
- Generate an access token that have `repo` and `read:packages` access.
- Copy the access token and make sure you authorize the SSO login
- You need to make sure to run this command at least once:

```bash
$ npm login --scope=@nearprime --registry=https://npm.pkg.github.com
```

- Use your Github username and the generated access token as a password

### AWS Access

Ensure you have already set up your AWS Access using:

```bash
$ aws configure sso
```

Then login using sso:

```bash
$ aws sso login --profile gateway-storage-sandbox
```

## Stages

- Production (main branch): production environment. Only CD tools can deploy stack into this env
- Staging (staging branch): iso-production environment. Used to test this stack in iso-production configuration by QAs. Only CD Tools can deploy into this env
- Dev (devqa branch): devops environment. This is dedicated to test integration of sandbox branch. Only CD Tools can deploy into this env after Pull Request acceptance.
- Sandbox (sandbox branch): Your own sandbox environment. You are 100% to manage it at your taste. Only manual deployment is allowed here

## Manual deployment

Run `yarn deploy:sandbox --aws-profile gateway-storage-sandbox` to deploy your cloudformation stack to your sandbox AWS Account.

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

You can use process env variable `DEBUG=nearprime:*` to print debug log.

You can use you IDE for step by step debugging by using the same commands in your debugger.

## Scripts

### Node.js Scripts

You can find the following scripts under `./scripts`

#### Audit

This script performs `audit-ci --moderate` inside each lambda function folder. It uses [IBM audit-ci module](https://github.com/IBM/audit-ci) that prevents integration if vulnerabilities are found inside lambda dependencies.
You can launch it (global audit) by running `yarn audit:ci`

#### npmInstallRecursive

This will run `yarn install` recursively inside `./lambda/**` folders

#### predeploy

This script is a root script that is lauched prior to `yarn deploy` script. It basically runs the script `npmInstallRecursive`

### NPM scripts

- `"cm": "git-cz"`
  use `git add .` then `yarn cm` to commit to git following PrimeLab commit message rules

- `"cmr": "git-cz --retry"`
  Retry using the latest commit message if the last commit failed

- `"cmp": "git add . && yarn cm && git push"`
  Stage all modified files, commit them using PrimeLab commit message rules and push to remote repository

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

- `"deploy:sandbox": "yarn deploy --stage sandbox"`
  Deploy cloud formation stack to production environment. You can append `--aws-profile gateway-storage-sandbox` when you run `yarn deploy:sandbox` to use sandbox profile

- `"remove:sandbox": "yarn remove-stack --stage sandbox"`
  Remove previously deployed cloud formation stack from developer AWS environment. You can append `--aws-profile gateway-storage-sandbox` when you run `yarn remove:sandbox` to use sandbox profile

## Testing

Run `yarn test` to run one shot all tests
Run `yarn test --watch` to run tests in watch mode all tests
Run `yarn test -f FunctionName` to run tests for one function
Run `yarn test -f FunctionName --watch` to run tests for one function in watch mode

### Useful tips
