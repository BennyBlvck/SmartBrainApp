const handleProfileGet = (req, res, db) => {
    const { id } = req.params;
   db.select('*').from('users').where({id})
   .then(user => {
    if (user.length){
        res.json(user[0])
    } else {
        res.status(400).json('Please We Do Not Know You')
    }
   })
   .catch(err => res.status(400).json('We Cannot Find You'))
}

export default handleProfileGet;