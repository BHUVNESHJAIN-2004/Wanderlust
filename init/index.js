const mongoose = require("mongoose");
const Listing = require("../models/listing.js");// here we write double dot beacuse we access models so ween to out for index.js then init 

const initData = require("./data.js");

main()
.then(()=>{
    console.log("connection successful");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
};

const initDB = async () => {
    try {
        await Listing.deleteMany({}); // for delete existing data in dbs
        initData.data = initData.data.map((obj)=>({...obj,owner:'67c5e6c5997e8849065668fd'})); // define owner for all our listings
        await Listing.insertMany(initData.data); // for insert data in dbs
        console.log("Data inserted successfully");
    } catch (err) {
        console.error("Error inserting data:", err);
    }
};

initDB(); // for insert data in dbs