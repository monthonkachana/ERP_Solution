var db = require('../models');

const leaves = db.leaves;
var addleaves = async (req,res)=>{

    let data = await leaves.create({
        'id':'2',
        'date':'1/2/2022',
        'desc':'leave because of the illness',
       
    })
    let response = {
        'data': 'leave add'
    }
    return  res.status(200).json(response);
}
module.exports = {
    addleaves
}