import { MongoClient } from "mongodb";

const connectionString = "mongodb+srv://jueprt_db_user:jueprt_db_password@practice-mongo.rmilndi.mongodb.net/";

export const client = new MongoClient(connectionString, {
  useUnifiedTopology: true,
});

export const db = client.db("practice-mongo");
