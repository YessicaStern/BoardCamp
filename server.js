import express from 'express';
import pg from 'pg';
import joi from 'joi';

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
        res.status(500).send(err);
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
        res.status(500).send(err);
    }

});


//GAMESSSSSSSSSSSSSS


server.get("/games", async (req,res)=>{
    const { name } = req.query;
    try{
        const games = (await connection.query(
        `SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON
         games."categoryId" = categories.id `)).rows;

         if(name){
            const gamesFilter = games.filter((e)=>{
                return e.name.includes(String(name));
            });
            return res.send(gamesFilter);
        }
        res.send(games);

    }catch(err){
        res.status(500).send(err);
    }
});


server.post("/games", async (req,res)=>{
    const {name, image, stockTotal, categoryId, pricePerDay} = req.body;
    try{
        const categories = (await connection.query('SELECT * FROM categories')).rows;
        const games= (await connection.query(`SELECT * FROM games`)).rows;
        const idCategories = categories.filter((e)=>{
            return e.id===categoryId;
        });
        const nameGame = games.filter((e)=>{
            return e.name===name;
        })
        if(idCategories.length !=0 && name.length !=0 && stockTotal>0 && pricePerDay>0){
            if(nameGame.length!=0){
                return res.status(409).send({message: "jogo já existente"});
            }
            connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
            VALUES ($1,$2,$3,$4,$5)`,[name, image, Number(stockTotal), categoryId, Number(pricePerDay)]);
            res.sendStatus(201);
        }
        return res.sendStatus(400);
    }catch(err){
        res.status(500).send(err);
    }
});

//CUSTOMERSSSSSSSSSS ajeitar a validação do post , se é número ou n e a validação da data


server.get("/customers", async (req,res)=>{
    try{
        const customers = (await connection.query(`SELECT * FROM customers`)).rows;
        res.send(customers);
    }catch(err){
        res.status(500).send(err);
    }
});

server.get("/customers/:id", async (req,res)=>{
    let {id} = req.params;
    id= Number(id);
    try{
        const customers = (await connection.query(`SELECT * FROM customers`)).rows;
        const idCustomers = customers.filter((e)=>{
            return e.id===id;
        });
        if(idCustomers.length===0){
            return res.sendStatus(404);
        }
        return res.send(idCustomers);
    }catch(err){
        res.status(500).send(err);
    }
});

const userSchema = joi.object({
    name: joi.string().required(),
    phone: joi.number().required(),
    cpf: joi.number().required(),
    birthday: joi.required()
});

function validationUser(req,res,next){  //MID
    const {name,phone,cpf,birthday} =req.body;
    const user={name,phone,cpf,birthday};
    const valid = userSchema.validate(user);
    if(valid.error){
        res.sendStatus(400);
    }
    if(name.length>0 && phone.length>=10 && phone.length<=11 && cpf.length===11 && birthday.length===10){
    next();
    }else{
        res.sendStatus(400);
    }
}


server.post("/customers",validationUser, async (req,res)=>{
    const {name,phone,cpf,birthday} =req.body;
    try{
        const customers = (await connection.query(`SELECT * FROM customers`)).rows;
        let cpfValid = customers.filter((e)=>{
            return e.cpf===cpf;
        });
        if(cpfValid.length!=0){
            return res.status(409).send({message: "cliente já existente"});
        }
        connection.query(`INSERT INTO customers (name, phone,cpf, birthday) VALUES ($1,$2,$3,$4)`,
        [String(name), String(phone), String(cpf), birthday]);
        return res.sendStatus(201);
    }catch(err){
        res.status(500).send(err);
    }
});


server.put("/customers/:id",validationUser,async (req,res)=>{
    const {name,phone,cpf,birthday} =req.body;
    let {id} = req.params;
    id=Number(id);
    try{
        const customers = (await connection.query(`SELECT * FROM customers`)).rows;
        const idCustomers = customers.filter((e)=>{
            return e.id===id;
        });
        if(idCustomers.length===0){
            return res.sendStatus(404);
        }
        const cpfValid = customers.filter((e)=>{
            return e.cpf===cpf;
        });
        if(cpfValid.length!=0){
            return res.send(409);
        }
        connection.query(`UPDATE customers SET cpf = $1 WHERE id = $2`,[cpf,id]);
        return res.sendStatus(200);
    }catch(err){
        res.status(500).send(err);
    }
});

//RENTALSSSs



server.post("/rentals",async(req,res)=>{
    const {customerId, gameId, daysRented}= req.body;

    try{
        const games = (await connection.query(
            `SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON
             games."categoryId" = categories.id `)).rows;
        const gameConfirm = games.filter((e)=>{
               return e.id=== gameId;
             });
        if(gameConfirm.length===0){
            return res.sendStatus(400);
        }
        const customers = (await connection.query(`SELECT * FROM customers`)).rows;
        const idCustomers = customers.filter((e)=>{
            return e.id===customerId;
        });
        if(idCustomers.length===0 || daysRented<=0){
            return res.sendStatus(400);
        }
        let rentals ={
            customerId,
            gameId,
            daysRented,
            rentDate: new Date(),
            originalPrice: daysRented * gameConfirm[0].pricePerDay,
            returnDate: null,
            delayFee: null
        }
        console.log(rentals)



        res.send(201);
    }catch(err){
        res.status(500).send(err);
    }
})



// pricePerDay
server.listen(5000,()=>{console.log("escutando porta 5000 trocar pra 4000 dps")});