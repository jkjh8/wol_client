import { app } from 'electron'
import Datastore from 'nedb-promises'

function dbInit(file) {
  const dbPath = app.getPath('userData')
  return new Datastore({
    filename: `${dbPath}/data/${file}`,
    timestampData: true,
    autoload: true,
  })
}

const db = {
  setup: dbInit('setup'),
}

export default db
