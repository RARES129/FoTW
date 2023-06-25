const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const mongoURL = process.env.DB_URL;
const dbName = process.env.DB_NAME;

class Database {
  constructor(url, dbName) {
    this.url = url;
    this.dbName = dbName;
    this.client = new MongoClient(url);
    this.db = null;
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log("Connected to the database");
    } catch (error) {
      console.error("Failed to connect to the database:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.client.close();
      console.log("Disconnected from the database");
    } catch (error) {
      console.error("Failed to disconnect from the database:", error);
      throw error;
    }
  }

  async findOne(collectionName, filter) {
    try {
      const collection = this.db.collection(collectionName);
      const document = await collection.findOne(filter);
      return document;
    } catch (error) {
      console.error(`Failed to find document in collection "${collectionName}":`, error);
      throw error;
    }
  }

  async insertOne(collectionName, document) {
    try {
      const collection = this.db.collection(collectionName);
      await collection.insertOne(document);
      console.log("Document inserted");
    } catch (error) {
      console.error(`Failed to insert document into collection "${collectionName}":`, error);
      throw error;
    }
  }

  async getUsers() {
    try {
      const usersCollection = this.db.collection('users');
      const users = await usersCollection.find().toArray();
      return users;
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async deleteAllUsers() {
    try {
      const usersCollection = this.db.collection('users');
      const result = await usersCollection.deleteMany({});
      if (result.deletedCount === 1) {
        console.log(`Successfully deleted users`);
      } else {
        console.log(`Users not found`);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async deleteUser(username) {
    try {
      const usersCollection = this.db.collection('users');
      const result = await usersCollection.deleteOne({ username: username });
      if (result.deletedCount === 1) {
        console.log(`Successfully deleted user: ${username}`);
      } else {
        console.log(`User not found: ${username}`);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async setAdmin(username) {
    try {
      const usersCollection = this.db.collection('users');
      const user = await usersCollection.findOne({ username });
      await usersCollection.updateOne(
        { username },
        { $set: { admin: "1" } }
      );
    } catch (error) {
      console.error("Failed to set admin status:", error);
      throw error;
    }
  }  

  async getAdmin() {
    try {
      const usersCollection = this.db.collection('users');
      const users = await usersCollection.find().toArray();
      return users;
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  
async resetPassword(username, password) {
  try {
    const usersCollection = this.db.collection('users');
    const user = await usersCollection.findOne({ username });
    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );
  } catch (error) {
    console.error("Failed to reset password:", error);
    throw error;
  }
}
}

module.exports = Database;
