import { connection } from "../server.js";

const getCutomers =async (req,res)=>{
    try{
        const customers = (await connection.query(`SELECT * FROM customers`)).rows;
        res.send(customers);
    }catch(err){
        res.status(500).send(err);
    };
};
const getCustomersId=async (req,res)=>{
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
    };
};
const postCustomers= async (req,res)=>{
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
    };
};

const putCustumers= async (req,res)=>{
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
    };
};
export {getCustomersId,getCutomers,postCustomers,putCustumers}