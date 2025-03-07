const { CouchbaseError } = require('couchbase')

/**
 * Executes an asynchronous action and sends its result as a JSON HTTP response.
 *
 * The function awaits the provided asynchronous action. On success, it sends the returned result
 * using the response object's `json` method. If the action throws an error, the function logs the
 * error and sends a JSON response containing the error message. The HTTP status code is determined
 * by the error type:
 * - A CouchbaseError with 'not found' in its message results in a 404 status.
 * - Any other CouchbaseError results in a 400 status.
 * - All other errors result in a 500 status.
 *
 * @example
 * makeResponse(res, async () => {
 *   const data = await fetchData();
 *   return data;
 * });
 *
 * @param {Function} action - An asynchronous function that returns the data to be sent in the response.
 */
async function makeResponse(res, action) {
  try {
    const result = await action()
    res.json(result)
  } catch (e) {
    console.error(e)
    let status

    if (e instanceof CouchbaseError && e.message.indexOf('not found') !== -1) {
      status = 404
    } else {
      status = e instanceof CouchbaseError ? 400 : 500
    }

    res.status(status)
    res.json({ message: e.message })
  }
}

module.exports = {
  makeResponse,
}
