const mongoose = require("mongoose")
const Document = mongoose.model("Documents",{
    _id:String,
    data:Object,
})
module.exports= Document;