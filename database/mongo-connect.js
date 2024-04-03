import 'dotenv/config'
import mongoose from 'mongoose';

let { MONGOUSER, MONGOPASSWORD, MONGOURL } = process.env;

mongoose.Promise = global.Promise
const uri = `mongodb+srv://${MONGOUSER}:${MONGOPASSWORD}@${MONGOURL}`;

const User = mongoose.model('user', {
    name: String,
    email: String,
    age: Number
  });

  await mongoose.connect(uri, {
}).then(() => {
  console.log("Conectado ao mongodb")
}).catch((err) => {
  console.log("Error on database:", err)
})