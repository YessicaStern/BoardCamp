import { connection } from "../server.js";

const getGames=async (req,res)=>{
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
        };
        res.send(games);

    }catch(err){
        res.status(500).send(err);
    };
};
const postGames= async (req,res)=>{
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
            };
            connection.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
            VALUES ($1,$2,$3,$4,$5)`,[name, image, Number(stockTotal), categoryId, Number(pricePerDay)]);
            res.sendStatus(201);
        };
        return res.sendStatus(400);
    }catch(err){
        res.status(500).send(err);
    };
};

export{getGames,postGames}