const mongoose =require("mongoose");

const Dbconnection=()=>{


    mongoose.connect('mongodb://127.0.0.1:27017/CA')
    .then((con)=>console.log(`MongoDB is connected to the host :${con.connection.host}`))
    .catch((err)=>{
        console.log(err)
    })

}

module.exports = Dbconnection