import joi from 'joi';

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
    };
};

export{validationUser}