" use strict";

const axios = require("axios");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT;
const server = express();
server.use(cors());
server.use(express.json());

mongoose.connect("mongodb://localhost:27017/Digimons", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

server.listen(PORT, () => {
  console.log(`listining on PORT ${PORT}`);
});

server.get("/", homeRouteHandler);
function homeRouteHandler(req, res) {
  res.send(`Home route server`);
}

//create Schema
const DigimonSchema = new mongoose.Schema({
  name: String,
  img: String,
  level: String,
});

//create model
const MyDigimonModels = mongoose.model("userdigimon", DigimonSchema);

// routes
server.get("/getAllDigimons", getAllDigimonsHandler);
server.post("/addFavDigimon", addFavDigimonHandler);
server.get("/getAllFavDigimons", getAllFavDigimonsHandler);
server.delete("/deleteDigimon/:id", deleteDigimonHandler);
server.put("/updateDigimon/:id", updateDigimonHandler);

// 1st
async function getAllDigimonsHandler(req, res) {
  const url = `https://digimon-api.vercel.app/api/digimon`;
  let responseFromAPI = await axios.get(url);
  let allDigimons = responseFromAPI.data.map((item, idx) => {
    let digimon = new Digimon(item);
    return digimon;
  });
  res.send(allDigimons);
}

// create class
class Digimon {
  constructor(data) {
    this.name = data.name;
    this.img = data.img;
    this.level = data.level;
  }
}

// 2nd
function addFavDigimonHandler(req, res) {
  const { name, img, level } = req.body;

  const favDigimon = new MyDigimonModels({
    name: name,
    img: img,
    level: level,
  });

  favDigimon.save();
}

// 3rd
function getAllFavDigimonsHandler(req, res) {
  MyDigimonModels.find({}, (error, data) => {
    res.send(data);
  });
}

// 4th
function deleteDigimonHandler(req, res) {
  const id = req.params.id;
  MyDigimonModels.remove({ _id: id }, (error, data) => {
    MyDigimonModels.find({}, (error, allData) => {
      res.send(allData);
    });
  });
}

// 5th
function updateDigimonHandler(req, res) {
  const id = req.params.id;
  const { name, img, level } = req.body;
  MyDigimonModels.findOne({ _id: id }, (error, data) => {
    data.name = name;
    data.img = img;
    data.level = level;
    data.save().then(() => {
      MyDigimonModels.find({}, (error, allData) => {
        res.send(allData);
      });
    });
  });
}
