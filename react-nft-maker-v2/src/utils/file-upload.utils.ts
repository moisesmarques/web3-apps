// Default file size allowed per file upload
const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 104857600;

/**
 * Converts a number of bytes to number of Megabytes
 * @param {number} bytes number of bytes
 * @returns number of megabytes
 */
function convertBytesToMB(bytes: number) {
  const MEGA_BYTES_PER_BYTE = 1048576;
  return Math.round(bytes / MEGA_BYTES_PER_BYTE);
}

// Map for the different types of errors a file upload may encounter
const errorTypesMap = {
  tooLarge: (fileSize: number) => ({
    errorTitle: 'File Size Is Too Large',
    message: `The maximum file size allowable for an upload is ${convertBytesToMB(fileSize)} MB.`,
  }),
  typeNotValid: (requiredTypes: string) => ({
    errorTitle: 'File Type not Accepted',
    message: `That file type is not accepted for the target upload. Please upload a ${requiredTypes}`,
  }),
  tooManyDocs: () => ({
    errorTitle: 'Multiple Files Detected',
    message: 'Only one file may be uploaded for a requested document upload.',
  }),
};

/**
 * Dynamically creates a regex to check file type from array of accepted file types
 * @param {array} requiredTypes array of allowed file types for upload
 * @returns regex
 */
function buildFileTypeRegex(requiredTypes: string[]) {
  const formattedRequiredTypes = requiredTypes.reduce(
    (string, type, index) =>
      index === requiredTypes.length - 1 ? (string += `\\${type})$`) : (string += `\\${type}|`),
    '('
  );
  return new RegExp(formattedRequiredTypes, 'i');
}

/**
 * Validates files available for upload, checks by file type, file size, and number of files
 * @param {array} newFiles array of new files for upload
 * @param {number} allowedNumberOfFiles number of allowed uploads
 * @param {array} requiredTypes array of allowed file types for upload
 * @param {number} maxFileSizeInBytes max file size allowed for upload, defaults to 52428800 (50MB)
 * @returns errorObject - error object to display
 */
const validateFilesForUpload = (
  newFiles: FileList,
  allowedNumberOfFiles: number,
  requiredTypes: Array<any>,
  maxFileSizeInBytes: number = DEFAULT_MAX_FILE_SIZE_IN_BYTES
) => {
  let errorObject;
  let regexFileType;

  if (requiredTypes) {
    regexFileType = buildFileTypeRegex([...requiredTypes]);
  }

  for (let i = 0; i < newFiles.length; i++) {
    const file = newFiles[i];
    if (allowedNumberOfFiles && i > allowedNumberOfFiles - 1) {
      errorObject = errorTypesMap.tooManyDocs();
    }
    if (regexFileType && !regexFileType.exec(file.name)) {
      const typesStringified = `${requiredTypes.slice(0, requiredTypes.length - 1).join(', ')} or ${
        requiredTypes[requiredTypes.length - 1]
      }`;
      errorObject = errorTypesMap.typeNotValid(typesStringified);
    }
    if (file.size > maxFileSizeInBytes) {
      errorObject = errorTypesMap.tooLarge(maxFileSizeInBytes);
    }
    if (errorObject) return errorObject;
  }
  return errorObject;
};

export default {
  DEFAULT_MAX_FILE_SIZE_IN_BYTES,
  convertBytesToMB,
  buildFileTypeRegex,
  validateFilesForUpload,
};
