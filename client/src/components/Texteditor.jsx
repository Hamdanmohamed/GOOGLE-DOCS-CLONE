import React, { useEffect, useState } from 'react'
import Quill from "quill";
import "./Texteditor.css"
import "quill/dist/quill.snow.css";
import { useCallback } from 'react';
import io from "socket.io-client"
import { useParams } from 'react-router-dom';
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6,false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["image", "blockquote", "code-block"],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction
    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ color: [] }, { background: ['red','blue'] }], // dropdown with defaults from theme
    [{ align: [] }],
    ["clean"],
  ];
  const save_ms= 2000
export default function Texteditor() {
    const [socket,setsocket] = useState()
    const [qill,setqill] = useState()
    const {id:documentid} = useParams()
    useEffect(()=>{
        const s = io("http://localhost:5000")
        setsocket(s)
        // s.emit("data","hey iam connected")
       return ()=>{
        s.disconnect()
       }
    },[])
    useEffect(()=>{
        if(socket == null || qill == null) return;
        socket.once("load-document",(document)=>{
         qill.setContents(document)
        })
        socket.emit("get-document",documentid)
    },[socket,qill,documentid])
    useEffect(()=>{
       if(socket == null || qill == null) return;
       const handler = (delta,olddelta,source)=>{
        if(source!== "user")return;
        socket.emit("send-changes",delta);

       }
       qill.on("text-change",handler)
       return ()=>{
        qill.off("text-change",handler)
       }
    },[socket,qill])
    useEffect(()=>{
        if(socket == null || qill == null) return;
        const handler = (delta)=>{
            qill.updateContents(delta)
        }
        socket.on("receive-changes",handler)
        return ()=>{
            socket.off("receive-changes",handler)
        }
    },[socket,qill])
    useEffect(()=>{
        if(socket == null || qill == null) return;
        const interval = setInterval(()=>{
            socket.emit("save-document",qill.getContents())
        },save_ms)
        return ()=>{
            clearInterval(interval)
    }
    },[socket,qill])
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return;
        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        const q = new Quill(editor, {
          theme: "snow",
          modules: {
            toolbar: TOOLBAR_OPTIONS,
          },
        });      
        setqill(q)  
      }, []);
  return (
    <div className="container" ref={wrapperRef}></div>
  )
}
