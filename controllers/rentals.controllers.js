import { connection } from "../server.js";

const getRentals=async(req,res)=>{
    try{
        const rentals = await connection.query(`SELECT * FROM rentals`).rows;
        res.send(rentals);
    }catch(err){
        res.status(500).send(err);
    };
};
const postRentals=async(req,res)=>{
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
        const rentDateValue= new Date();
        const originalPriceValue= daysRented * gameConfirm[0].pricePerDay;
        let returnDateValue;
        let delayFeeValue;
        if(gameConfirm[0].stockTotal>0){
            connection.query(`INSERT INTO rentals (customerId,gameId,daysRented,rentDate,originalPrice,returnDate,delayFee)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,[Number(customerId),Number(gameId),Number(daysRented),
                Number(rentDateValue),Number(originalPriceValue),returnDateValue,delayFeeValue]);
        res.send(201);
    }
    }catch(err){
        res.status(500).send(err);
    };
};

export{getRentals,postRentals}