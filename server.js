import express from 'express';
import pg from 'pg';

const server=express();
server.use(express.json());

const { Pool }= pg;

const connection= new Pool ({
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: '1234',
    database: 'boardcamp'
});

// CATEGORIAAAAAASSS

server.get("/categories",async (req,res)=>{
    try{ const categories = (await connection.query('SELECT * FROM categories')).rows;
        res.send(categories);
    }catch(err){
        res.send(err);
    }
}); 

server.post("/categories", async (req,res)=>{
    const {name} = req.body;
    if(name.length===0){
        return res.send(400);
    }
    try{ const categories = (await connection.query('SELECT * FROM categories')).rows;
         if(categories.length===0){
            connection.query(`INSERT INTO categories (name) VALUES ($1)`,[name]);
            return res.send(201);
         }
         const validate= categories.filter((e)=>{
                if(name===e.name){
                    return e.name;
        }});
        if(validate.length!=0){
            res.status(409).send({message: "categoria já existente"});
        }else{
            connection.query(`INSERT INTO categories (name) VALUES ($1)`,[name]);
            return res.send(201);
        }
    }catch(err){
        res.send(err);
    }

});


//GAMESSSSSSSSSSSSSS


server.get("/games", async (req,res)=>{
    const { name } = req.query;
    const games = (await connection.query(
        `SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON
         games."categoryId" = categories.id `)).rows; //fazer um JOIN aqui 
    res.send(games);
});


server.post("/games", async (req,res)=>{
    const {name, image, stockTotal, categoryId, pricePerDay} = req.body;
    try{
        const categories = (await connection.query('SELECT * FROM categories')).rows;
        const idCategories = categories.filter((e)=>{
            return e.id===categoryId;
        });
        const nameCategories = categories.filter((e)=>{
            return e.name===name;
        })
        if(idCategories.length !=0 && name.length !=0 && stockTotal>0 && pricePerDay>0){
            if(nameCategories.length!=0){
                return res.status(409).send({message: "jogo já existente"});
            }
            console.log("name====", name)
            connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
            VALUES ($1,$2,$3,$4,$5)`,[name, image, Number(stockTotal), categoryId, Number(pricePerDay)]);
            res.sendStatus(201);
        }
        return res.sendStatus(400);
    }catch(err){
        res.send(err);
    }
});







server.listen(5000,()=>{console.log("escutando porta 5000 trocar pra 4000 dps")});