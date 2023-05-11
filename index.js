// import express from "express";
// import clientRouter from "./src/api/client.js";
// import serverRouter from "./src/api/server.js";
// import functions from "firebase-functions";
// import cors from "cors";

//Creating an Express.js web app instance
// const app = express();

// //Using 2 routers "client" and "/server" as middlewares
// app.use(cors());
// app.use("/client", clientRouter);
// app.use("/server", serverRouter);
// const firebaseFunction = functions.runWith({
//   memory: "2GB",
//   timeoutSeconds: 540,
// });
// //---------------------HTTP REQUEST ---------------------//
// export const api = firebaseFunction.https.onRequest(app);

import fastify from "fastify";
import cors from "@fastify/cors";
import scrapingProcess from "./src/fastify/fastify.js";
import dotenv from "dotenv";
dotenv.config();
const app = fastify({
  logger: true,
});
app.register(cors);
app.register(scrapingProcess, { prefix: "/fastify" });
const PORT = process.env.PORT || 8080;
try {
  app.listen(
    {
      port: PORT,
      host: "localhost",
    },
    (e, address) => {
      if (e) {
        throw e;
      }
      console.log("Server listening on PORT " + PORT);
    }
  );
} catch (e) {
  console.log(e);
  process.exit(1);
}
