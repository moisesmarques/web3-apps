/**
 * A custom connector to sign ES request with AWS credentials
 *
 * Adapted from this gist : https://gist.github.com/parthdesai93/1bd3a25ad4cf788d49ce4a00a1bb3268
 */

const AWS = require('aws-sdk');
const { Connection } = require('@opensearch-project/opensearch');

const getAWSCredentials = () => new Promise((resolve, reject) => {
  AWS.config.getCredentials((err, creds) => {
    if (err) {
      reject(err);
    }

    resolve(creds);
  });
});

const signRequest = (request, creds) => {
  const signer = new AWS.Signers.V4(request, 'es');
  signer.addAuthorization(creds, new Date());
  return signer;
};

class AwsConnector extends Connection {
  async request(params, callback) {
    const creds = await getAWSCredentials();
    const req = this.createRequest(params);

    const { request: signedRequest } = signRequest(req, creds);
    super.request(signedRequest, callback);
  }

  createRequest(params) {
    const endpoint = new AWS.Endpoint(this.url.href);
    const req = new AWS.HttpRequest(endpoint);

    Object.assign(req, {
      path: `${params.path}${params.querystring ? `?${params.querystring}` : ''}`,
      body: params.body,
      headers: params.headers,
      method: params.method,
    });

    req.headers.Host = endpoint.host;
    req.region = AWS.config.region || 'us-east-1';

    return req;
  }
}

module.exports = AwsConnector;
