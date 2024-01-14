const SecretsManager = require('aws-sdk/clients/secretsmanager');

const client = new SecretsManager();

const secrets = {};

async function getSecret(secretName) {
  if (!secrets[secretName]) {
    const { SecretString, SecretBinary } = await client.getSecretValue({ SecretId: secretName })
      .promise();
    secrets[secretName] = SecretBinary
      ? Buffer.from(SecretBinary, 'base64').toString('ascii')
      : SecretString;
  }
  return secrets[secretName];
}

module.exports = {
  getSecret,
};
