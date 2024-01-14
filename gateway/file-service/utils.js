const crypto = require('crypto');
const SNS = require('aws-sdk/clients/sns');
const { nanoid } = require('nanoid');
const {
  APIClient,
  SendEmailRequest,
  RegionUS,
  RegionEU,
} = require('customerio-node');

const customerIoApi = new APIClient(process.env.CUSTOMER_IO_API_KEY, {
  region: RegionUS,
});

const algorithm = 'aes-256-ctr';
const reqId = nanoid();

const send = (statusCode, data, err = null, multiValueHeaders = {}) => {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
  };

  if (err) {
    if (err.name === 'TokenExpiredError') {
      const { message } = err;
      return {
        statusCode: 401,
        headers: responseHeaders,
        body: JSON.stringify({
          message,
        }),
      };
    }
  }

  return {
    statusCode,
    headers: responseHeaders,
    multiValueHeaders,
    body: JSON.stringify(data),
  };
};

const bytesToMegaBytes = (bytes) => bytes / (1024 * 1024);

const encrypt = (buffer, key) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, generateKey(key), iv);
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};

const decrypt = (encrypted, key) => {
  const iv = encrypted.slice(0, 16);
  encrypted = encrypted.slice(16);
  const decipher = crypto.createDecipheriv(algorithm, generateKey(key), iv);
  const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return result;
};

const generateKey = (key) => crypto
  .createHash('sha256')
  .update(String(key))
  .digest('base64')
  .substr(0, 32);

const sanitize = (input) => input.replace(/[^\w\s\.]+/gi, '_');

async function sendEmail(
  toEmailAddresses,
  fromEmailAddress,
  subject,
  messageBody,
  html,
) {
  const msg = {
    to: toEmailAddresses,
    from: fromEmailAddress,
    subject,
    text: messageBody,
    html,
  };
  try {
    // const response = await sgMail.send(msg);

    const request = new SendEmailRequest({
      identifiers: {
        email: toEmailAddresses,
      },
      to: toEmailAddresses,
      from: fromEmailAddress,
      subject,
      body: messageBody,
    });

    console.log(`reqId: ${reqId}, sendEmail request`, request);

    const response = await customerIoApi.sendEmail(request);

    console.log(`reqId: ${reqId}, sendEmail response`, response);

    return response;
  } catch (e) {
    console.error('error sending Sendgrid mail', e);
    throw e;
  }
}

const sendSMS = async function (toNumber, message) {
  const params = {
    Message: message,
    PhoneNumber: toNumber,
  };

  try {
    const publishTextPromise = await new SNS({ apiVersion: '2010-03-31' })
      .publish(params)
      .promise();
    return publishTextPromise.MessageId;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const schemaOptions = {
  errors: {
    wrap: {
      label: '',
    },
  },
};

module.exports = {
  send,
  bytesToMegaBytes,
  encrypt,
  decrypt,
  sanitize,
  sendEmail,
  sendSMS,
  schemaOptions,
};
