const handleSignin = (req, res, db, bcrypt) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json('Take a second look at your submission')
    };
    db.select('email', 'hash').from('login')
         .where('email', '=', email)
         .then(data => {
             const isValid = bcrypt.compareSync(password, data[0].hash);
             if (isValid) {
                 return db.select('*').from('users')
                     .where('email', '=', email)
                     .then(user => {
                         res.json(user[0])
                     })
                 .catch(err => res.status(400).json('Are you sure you belong here?'))
             } else {
                 res.status(400).json('If we knew you, you would have been let in')
             }
         })
     .catch(err=> res.status(400).json('You are not in our records'))
 }

 export default handleSignin;