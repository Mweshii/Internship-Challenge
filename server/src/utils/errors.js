// Errors that are safe to show to the person using the website.
// Throw one anywhere in a controller or model; middleware/errorHandler.js turns
// it into a JSON response with the right HTTP status.

export class AppError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// `errors` is an object of field name -> message, e.g. { email: 'Email is required.' }
// The frontend uses the field names to show each message under the right input.
export class ValidationError extends AppError {
  constructor(errors) {
    super(400, 'Please correct the highlighted fields.');
    this.errors = errors;
  }
}
