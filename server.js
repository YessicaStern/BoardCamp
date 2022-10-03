import express from 'express';
import { getCategories,postCategories } from './controllers/categories.controllers.js';
import pg from 'pg';

import { getGames, postGames } from './controllers/games.controllers.js';
import { getCustomersId, getCutomers, postCustomers, putCustumers } from './controllers/custoumers.controller.js';
import { getRentals, postRentals } from './controllers/rentals.controllers.js';

import { validationUser } from './middlewares/middlewares.js';

const server=express();
server.use(express.json());

const { Pool }= pg;

const connection = new Pool({
    connectionString: process.env.DATABASE_URL,
});
export {connection}


server.get("/categories",getCategories); 
server.post("/categories",postCategories);

server.get("/games", getGames);
server.post("/games", postGames );

server.get("/customers", getCutomers);
server.get("/customers/:id", getCustomersId);
server.post("/customers",validationUser, postCustomers);
server.put("/customers/:id",validationUser,putCustumers);

server.get("/rentals",getRentals);
server.post("/rentals",postRentals);

server.listen(4000,()=>{console.log("escutando porta 4000")});