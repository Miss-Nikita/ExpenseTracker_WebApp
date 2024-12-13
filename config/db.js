const mongoose = require("mongoose")

mongoose.connect(process.env.MONGOURL).then(()=>{
    console.log("database is Established ");
    
}).catch((error) => {
    console.log(error);
 
})