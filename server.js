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

server.get("/categories",async (req,res)=>{
    try{ const categories = (await connection.query('SELECT * FROM categories')).rows
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
    try{ const categories = (await connection.query('SELECT * FROM categories')).rows
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

server.listen(5000,()=>{console.log("escutando porta 5000 trocar pra 4000 dps")});