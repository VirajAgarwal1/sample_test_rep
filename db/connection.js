import * as couchbase from 'couchbase'

const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_CONN_STR = process.env.DB_CONN_STR
const DB_BUCKET_NAME = process.env.DB_BUCKET_NAME

if (!DB_USERNAME) {
  throw new Error(
    'Please define the DB_USERNAME environment variable inside dev.env',
  )
}

if (!DB_PASSWORD) {
  throw new Error(
    'Please define the DB_PASSWORD environment variable inside dev.env',
  )
}

if (!DB_CONN_STR) {
  throw new Error(
    'Please define the DB_CONN_STR environment variable inside dev.env',
  )
}

if (!DB_BUCKET_NAME) {
  throw new Error(
    'Please define the DB_BUCKET_NAME environment variable inside dev.env',
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.couchbase

if (!cached) {
  cached = global.couchbase = { conn: null }
}

/**
 * Establishes and caches a connection to the Couchbase cluster.
 *
 * If a connection is already cached, it is returned to avoid creating multiple instances, which is particularly useful during development.
 * Otherwise, the function connects to the cluster using the configured connection string, username, and password, while applying a 
 * development configuration profile optimized for reducing latency.
 *
 * @returns {Promise<import('couchbase').Cluster>} A promise that resolves to the Couchbase cluster connection.
 */
async function createCouchbaseCluster() {
  if (cached.conn) {
    return cached.conn
  }

  // Use wan profile to avoid latency issues
  cached.conn = await couchbase.connect(DB_CONN_STR, {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    configProfile: 'wanDevelopment',
  })

  return cached.conn
}

/**
 * Connects to the Couchbase cluster and retrieves the database components.
 *
 * This function establishes a connection to the Couchbase cluster using a cached connection if available.
 * It then accesses the bucket defined by the DB_BUCKET_NAME environment variable, retrieves the 'inventory' scope,
 * and fetches the 'airline', 'airport', and 'route' collections from that scope.
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing the following properties:
 *   - **cluster**: The Couchbase cluster instance.
 *   - **bucket**: The connected bucket.
 *   - **scope**: The 'inventory' scope within the bucket.
 *   - **airlineCollection**: The 'airline' collection from the 'inventory' scope.
 *   - **airportCollection**: The 'airport' collection from the 'inventory' scope.
 *   - **routeCollection**: The 'route' collection from the 'inventory' scope.
 */
export async function connectToDatabase() {
  const cluster = await createCouchbaseCluster()
  const bucket = cluster.bucket(DB_BUCKET_NAME)
  const scope = bucket.scope('inventory')
  const airlineCollection = bucket.scope('inventory').collection('airline')
  const airportCollection = bucket.scope('inventory').collection('airport')
  const routeCollection = bucket.scope('inventory').collection('route')

  let dbConnection = {
    cluster,
    bucket,
    scope,
    airlineCollection,
    airportCollection,
    routeCollection,
  }

  return dbConnection
}
