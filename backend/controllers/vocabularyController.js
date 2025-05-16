const { sql, poolPromise } = require('../config/db');

const addWord = async (req,res) =>{
    const pool = await poolPromise;
    const {userId,word} = req.body;
    try{
        const [check] = await pool.query('select * from vocabulary where userId = ? and word = ?',
            [userId,word]
        )
        if (check.length>0){
            res.status(500).json({
                status:'failed',
                message:'Từ đã tồn tại'
            })
            return;
        }
        await pool.query('insert into vocabulary (word,userId) values (?,?)',
            [word,userId]
        )
        res.status(200).json({
            status: 'success',
            message: 'Thêm từ thành công'
        })

    }catch(err){
        res.status(500).json({
            status:'failed',
            message: err
        })
    }
}

module.exports = {
    addWord
}