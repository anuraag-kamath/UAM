const mongoose = require('mongoose')


var url = process.env.UAM_MONGODB_URL || "mongodb://localhost:27017/uam"

mongoose.connect(url, { useNewUrlParser: true }, () => {
    console.log("UAM DB connected successfully @ ", url);
})



module.exports = {
    mongoose
} 