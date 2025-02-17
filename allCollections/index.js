import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ServerApiVersion } from "mongodb";
const uri = process.env.DB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const courseCollection = client.db("eduCourse").collection("courses");
export const studentCollection = client.db("eduCourse").collection("students");
export const instructorCollection = client
  .db("eduCourse")
  .collection("instructors");
export const paymentCollection = client.db("eduCourse").collection("payments");
