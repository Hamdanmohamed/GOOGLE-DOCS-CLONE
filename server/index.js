// // getting-started.js
// const mongoose = require('mongoose');
// const Document = require("./models/Document")
// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/google-docs-clone');

//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }



// const io = require("socket.io")(5000,{
//     cors:{
//         origin:"http://localhost:5174",
//         methods:["GET","POST"]
//     },
// })

// io.on("connection", (socket)=>{
//     socket.on("get-document",async(documentid)=>{
//         const document = await findcreatedocument(documentid)
//         socket.join(documentid)
//         socket.emit("load-document",document.data);
//         socket.on("send-changes",(delta)=>{
//             socket.broadcast.to(documentid).emit("receive-changes",delta)
//         })
//         socket.on("save-document",async(data)=>{
//             return Document.findByIdAndUpdate(documentid,{data})

//         })
//     })
   
//     console.log("connect");  
// })
// let defaultvalue = ""
// async function findcreatedocument(id){
//     if(id==null) return;
//     const document = await Document.findById(id)
//     if(document) return document;
//     return await Document.create({_id:id,data:defaultvalue})
// }
const mongoose = require('mongoose');
const Document = require("./models/Document");

main().catch(err => console.log(err));

async function main() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/google-docs-clone');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

const io = require("socket.io")(5000, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("get-document", async (documentId) => {
    try {
      const document = await findOrCreateDocument(documentId);
      socket.join(documentId);
      socket.emit("load-document", document.data);
      
      socket.on("send-changes", (delta) => {
        socket.broadcast.to(documentId).emit("receive-changes", delta);
      });

      socket.on("save-document", async (data) => {
        await Document.findByIdAndUpdate(documentId, { data });
      });
    } catch (error) {
      console.error("Error handling document:", error);
    }
  });
});

const defaultValue = "";

async function findOrCreateDocument(id) {
  if (!id) return;

  try {
    let document = await Document.findById(id);
    if (!document) {
      document = await Document.create({ _id: id, data: defaultValue });
    }
    return document;
  } catch (error) {
    console.error("Error finding or creating document:", error);
  }
}
