require("dotenv").config();
const { MongoClient } = require("mongodb");
const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

async function deleteAllUsers() {
    const client = new MongoClient(mongoURL);
    try {
      await client.connect();
  
      const db = client.db(dbName);
  
      const usersCollection = db.collection('users');
  
      const result = await usersCollection.deleteMany({});
  
      if (result.deletedCount === 1) {
        console.log(`Successfully deleted users`);
      } else {
        console.log(`Users not found`);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      await client.close();
    }
  }

  async function deleteUser(username) {
    const client = new MongoClient(mongoURL);
    try {
      await client.connect();
  
      const db = client.db(dbName);
  
      const usersCollection = db.collection('users');
  
      const result = await usersCollection.deleteOne({ username: username });
  
      if (result.deletedCount === 1) {
        console.log(`Successfully deleted user: ${username}`);
      } else {
        console.log(`User not found: ${username}`);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      await client.close();
    }
  }

  module.exports = { deleteAllUsers, deleteUser };