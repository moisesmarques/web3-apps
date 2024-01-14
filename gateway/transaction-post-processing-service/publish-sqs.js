const { SQS } = require('aws-sdk');

const publishSqs = async (data, queueUrl, messageGroupId, region = 'us-east-1') => {
  try {
    console.log('Publishing on SQS:', queueUrl, data);

    const sqs = new SQS({
      region,
    });

    const message = {
      MessageBody: JSON.stringify(data),
      QueueUrl: queueUrl,
    };

    if (messageGroupId) message.MessageGroupId = messageGroupId;

    const response = await sqs.sendMessage(message).promise();

    console.log('Message published on SQS:', queueUrl, response);
  } catch (err) {
    console.log('Error when publishing on SQS:', queueUrl, err);
    throw err;
  }
};

module.exports = {
  publishSqs,
};
