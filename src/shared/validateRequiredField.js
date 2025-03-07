/**
 * Validates that the request body contains all required fields.
 *
 * Iterates through the specified list of required fields and checks if each field is present in the request body.
 * If any field is missing, sends a 400 response with an error message indicating the missing field(s) and returns false;
 * otherwise, returns true.
 *
 * @param {string[]} requiredFields - An array of field names that must exist in the request body.
 * @returns {boolean} True if all required fields are present; otherwise, false.
 */
function validateRequiredFields(req, res, requiredFields) {
  const missingFields = []

  for (const field of requiredFields) {
    if (!req.body[field]) {
      missingFields.push(field)
    }
  }

  if (missingFields.length > 0) {
    const errorMessage =
      missingFields.length === 1
        ? `${missingFields[0]} is required`
        : `The following fields are required: ${missingFields.join(', ')}`

    res.status(400).send({ message: errorMessage })
    return false
  }
  return true
}

module.exports = {
  validateRequiredFields,
}
