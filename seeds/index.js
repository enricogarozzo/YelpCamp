//BASIC SEEDING SETUP TO HAVE SOME DATA TO WORK WITH, AT THE STARTING PHASE

const Campground =require('../models/campground');
const cities = require('./cities');
const mongoose = require('mongoose');
const {places, descriptors} = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelp-camp-maptiler', {
    //these are deprecated options in the new versions
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random()* array.length)];


const seedDb = async()=>{
    await Campground.deleteMany({});

    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const lorem = '  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Excepturi, porro iure explicabo cum voluptates natus omnis rerum ex eaque harum illo beatae optio error asperiores? Sit et iusto doloribus excepturi!'
        const camp = new Campground({
         author:   '697e0439ec0c1b5dd9b67969',
         location: `${cities[random1000].city}, ${cities[random1000].state}`,
         title: `${sample(descriptors)} ${sample(places)}`, 
         description: lorem,
         price,
         geometry: {
            type: "Point",
            coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
            ]
        },
         images: [
            {
                url: 'https://res.cloudinary.com/dbmh2z1rl/image/upload/v1769704678/YelpCamp/zhvyn1uqxygjbvv2xhbn.jpg',
                filename: 'YelpCamp/zhvyn1uqxygjbvv2xhbn',
              },
              {
                url: 'https://res.cloudinary.com/dbmh2z1rl/image/upload/v1769704678/YelpCamp/zhvyn1uqxygjbvv2xhbn.jpg',
                filename: 'YelpCamp/zhvyn1uqxygjbvv2xhbn',
              }

         ]       
        })
    
    await camp.save();
    }
  
}

seedDb().then(()=>{
    mongoose.connection.close();
})