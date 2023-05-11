import express from "express";
import cors from "cors";
import { getPlayerFromSites } from "../../utils/utils.js";
import { searchViaAlgolia } from "../database/fetch/algolia/searchViaAlgolia.js";
import { searchViaFirestore } from "../database/fetch/firestore/searchViaFirestore.js";

const clientRouter = express.Router();
clientRouter.use(express.json());
clientRouter.use(cors());

//----------------------CLIENT ACCESSIBLES----------------//
clientRouter.get("/", (req, res) => {
  res.send("Welcome to anime-scraper project!");
});
clientRouter.get("/search", async (req, res) => {
  let results = [];
  const query = req.query.q?.toLowerCase() || "";
  if (!query) {
    res.status(404).statusMessage = "Error: Please Check your query";
    return;
  }
  try {
    results = await searchViaAlgolia(query);
  } catch (e) {
    console.log(e);
    const queryOption = {
      keywords: query.toLowerCase(),
      operator: "array-contains",
    };
    results = await searchViaFirestore(queryOption);
  } finally {
    return res.send(results);
  }
});
clientRouter.get("/search-full", async (req, res) => {
  if (!req.query.q) {
    return (res.status(400).statusMessage = "Error: Please Check your query");
  }
  let results = [];
  const query = req.query.q?.toLowerCase() || "";
  try {
    const queryOption = {
      keywords: query,
      operator: "array-contains",
    };
    results = await searchViaFirestore(queryOption);
  } catch (e) {
    console.log(e);
  } finally {
    console.log(results);
    return res.send(results);
  }
});
clientRouter.get("/searchById", async (req, res) => {
  if (!req.query.id) {
    return res
      .status(400)
      .send(
        "Please input id!\nFollow this format: api/client/searchById?id={id}"
      );
  }
  const id = req.query.id || "";
  if (!id) {
    res.status(404).statusMessage = "Error: Please Check your id";
    return;
  }
  let results = {};
  try {
    const queryOption = {
      mal_id: id,
      operator: "==",
    };
    results = await searchViaFirestore(queryOption);
  } catch (e) {
    console.log(e);
    results = await searchViaAlgolia(id);
  } finally {
    return res.send(results[0]);
  }
});
clientRouter.get("/watch/:serverName/:epId", async (req, res) => {
  const serverName = req.params.serverName || "";
  const epId = req.params.epId || "";
  if (!serverName && !epId) {
    res.status(404).statusMessage = "Error: Please Check your query";
  } else if (!serverName) {
    res.status(404).statusMessage = "Error: Please Specify serverName";
  } else if (!epId) {
    res.status(404).statusMessage = "Error: Please Specify epId";
  }
  const result = await getPlayerFromSites(serverName, epId);
  console.log(result);
  res.send(result);
});

export default clientRouter;
