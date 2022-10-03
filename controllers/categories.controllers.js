import { connection } from "../server.js";

const getCategories = async (req,res)=>{
    try{ const categories = (await connection.query('SELECT * FROM categories')).rows;
        res.send(categories);
    }catch(err){
        res.status(500).send(err);
    }
}
const postCategories =async (req,res)=>{
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
};

export{getCategories,postCategories}