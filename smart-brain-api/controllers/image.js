import Clarifai from 'clarifai';
// import { json } from 'express';

const app = new Clarifai.App ({
    apiKey: '54076fc27651405f872041b7f4fd6158' 
  });

 const handleApiCall = (req, res) => {
    app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(data => {
        res.json(data);
    })
    .catch (err => res.status(400).json('API is messing up'));
 }

const handleImage = (req, res, db) => {
    const { id } = req.body;
   db('users').where('id', '=', id)
   .increment('entries', 1)
   .returning('entries')
   .then(entries => {
    res.json(entries[0].entries)
   })
   .catch(err => res.status(400).json('Nice Faces Only'))
}

const funcs = {
    handleImage,
    handleApiCall
}
    

export default  funcs;