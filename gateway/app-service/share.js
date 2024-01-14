const { nanoid } = require('nanoid');
const { StatusCodes } = require('http-status-codes');
const {
  send, sendEmail, getParam, verifyAccessToken,
} = require('./utils');
const { shareAppSchema } = require('./schemaValidation');
const HttpError = require('./error');
const App = require('./lib/model/apps');

const reqId = nanoid();

module.exports.main = async (event) => {
  let reqBody;
  try {
    reqBody = JSON.parse(event.body);
  } catch (err) {
    return send(StatusCodes.BAD_REQUEST, {
      errors: [{ message: 'Invalid Json payload' }],
    });
  }

  /** Validating body payload against joi schema * */
  try {
    await shareAppSchema.validateAsync(reqBody);
  } catch (err) {
    console.log(
      `reqId: ${reqId} : Validation Error: ${err.details.message}`,
      err,
    );
    const [error] = err.details;
    return send(StatusCodes.BAD_REQUEST, {
      errors: [{ message: error.message }],
    });
  }

  /** fetch contact and app by id * */
  try {
    await verifyAccessToken(event);
    const contactItemOutput = await App.contactItemOutput(reqBody.contactId);
    const appItemOutput = await App.appItemOutput(reqBody.appId);

    const FROM_EMAIL_ADDRESS = await getParam('FROM_EMAIL_ADDRESS');
    const REPLY_TO_EMAIL_ADDRESS = await getParam('REPLY_TO_EMAIL_ADDRESS');

    if (!FROM_EMAIL_ADDRESS || !REPLY_TO_EMAIL_ADDRESS) {
      throw new HttpError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Email parameter missing',
      );
    }
    if (!appItemOutput) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        'The app you are sharing does not exist',
      );
    }
    const { APP_LINK_BASE_URL } = process.env;
    // const appLink = `${APP_LINK_BASE_URL}/${appItemOutput.appName}`;
    const appLink = `${appItemOutput.appUrl}`;

    if (
      !contactItemOutput
      || !contactItemOutput.email
      || !contactItemOutput.email.length
      || !contactItemOutput.email[0].address
    ) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        'The contact does not have a valid email address',
      );
    }
    const contactEmail = contactItemOutput.email[0].address;
    const shareAppEmailSubject = 'Apps shared by your primelab contact';
    const shareAppEmailBody = `Please use the link to get the App <a href='${appLink}' target="_blank">${appLink}</a>`;

    await sendEmail(
      [contactEmail],
      FROM_EMAIL_ADDRESS,
      REPLY_TO_EMAIL_ADDRESS,
      shareAppEmailSubject,
      shareAppEmailBody,
    );
    return send(200, {
      message: "Applink sent successfully to contact's email",
      sharedAppLink: appLink,
    });
  } catch (err) {
    console.log(`reqId: ${reqId} : Error while sharing App to contact`, err);
    return send(
      500,
      {
        errors: [{ message: err.message }],
      },
      err,
    );
  }
};
