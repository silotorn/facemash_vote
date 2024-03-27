import http from "http";
import { app } from "./app";

const port = process.env.port || 3000;
const server = http.createServer(app);

//web server
server.listen(port, () =>{
    console.log("server is started");
});
