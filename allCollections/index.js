import dotenv from "dotenv";
dotenv.config();

import { MongoClient, ServerApiVersion, GridFSBucket } from "mongodb";
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
console.log(uri);

export const courseCollection = client.db("eduCourse").collection("courses");
export const studentCollection = client.db("eduCourse").collection("students");
export const instructorCollection = client
  .db("eduCourse")
  .collection("instructors");
export const paymentCollection = client.db("eduCourse").collection("payments");
export const bucket = new GridFSBucket(client.db("eduCourse"), {
  bucketName: "videos",
});
