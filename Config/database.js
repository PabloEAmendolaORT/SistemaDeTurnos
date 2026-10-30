import { MongoClient } from "mongodb";

let client;
let database;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri || !dbName) {
    throw new Error("Faltan variables de configuración de MongoDB");
  }

  client = new MongoClient(uri);

  try {
    await client.connect();

    database = client.db(dbName);

    await database.command({ ping: 1 });

    console.log(`MongoDB conectado: ${dbName}`);

    return database;
  } catch (error) {
    await client.close();
    client = undefined;
    throw error;
  }
};

export const getDB = () => {
  if (!database) {
    throw new Error("La base de datos no está conectada");
  }

  return database;
};

export const closeDB = async () => {
  await client?.close();
  database = undefined;
  client = undefined;
};