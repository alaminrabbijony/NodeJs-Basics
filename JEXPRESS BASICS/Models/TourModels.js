const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./UserModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      // minLength: [10, 'A tour name must have more or equal then 10 characters'],
      maxLength: [40, 'A tour name must have less or equal then 40 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Rating must be above 1.0'],
      max: [5.0, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.6666 => 46.666=> 47=> 4.7
      //set is use to set a value for surgery
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1.0, 'Rating must be above 1.0'],
      max: [5.0, 'Rating must be below 5.0'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        message: 'Discount price ({VALUE}) should be below regular price',
        validator: function (vals) {
          return vals < this.price;
        },
      },
    },
    summary: {
      type: String,
      trim: true,
      //required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // array of strings of image file names
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // hide from output
    },

    startDates: [Date], // array of dates of start dates
    secrateTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    location: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    // guides: [{
    //   _id: mongoose.Schema.ObjectId,
    //   name: String,
    //   email: String,
    //   role: String
    // }]

    //guides: Array
    guides: [
      {
        type: mongoose.Schema.ObjectId, // for referncing
        ref: 'User',
      },
    ],

    /*Child ref*/
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Review'
    //   }
    // ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/*------------------------------------INDEX -> for optimizing quering time------------ ***/

// Single index quering
tourSchema.index({ price: -1 });

//Compund indexing
tourSchema.index({ price: 1, ratingsAverage: -1 });

//GeoSpatial tour indexing

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durrationWeeks').get(function () {
  return this.duration / 7;
});
//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //the field that is in the Review Model
  localField: '_id', //The field that is in this model
});

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
// pre-save hook doesnt run for .insertMany() or .update()

/**
 * EMBEDDING
 *
 */
//Jona's method
// tourSchema.pre('save', async function () {
//   const guidesPromise = this.guides.map( async id => await User.findById(id))
//   this.guides = await Promise.all( guidesPromise)
// })

/*------------------------------INSTANCE => Only on Current doc-------------------------------- */

// Standard embedding method

tourSchema.pre('save', async function () {
  if (!this.guides || this.guides.length === 0) return;

  const users = await Promise.all(this.guides.map((id) => User.findById(id)));

  this.guides = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));
});

/*
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  // creates a slug from the name before saving to database
  console.log(`🥗🥗🥗 slug created: 🥗🥗🥗\n ${this.slug}`);
   //next();
});

tourSchema.pre('save', function (next) {
  console.log('🥗🥗🥗 Will save document... 🥗🥗🥗');
  //next();
});

// post save hook/middleware
tourSchema.post('save', function (doc) {
  console.log('🥗🥗🥗 Document saved:🥗🥗🥗 \n', doc);
});
*/

//QUERY MIDDLEWARE =>

tourSchema.pre(/^find/, function () {
  this.find({ secrateTour: { $ne: true } });
  this.start = Date.now();
});

tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guides',
    select: '-__v -updatePasswordAt -active',
  });
});

tourSchema.post(/^find/, function (docs) {
  console.log(`Query completed in ${Date.now() - this.start}ms`, docs.length);
});

//AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function () {
  // console.log(this.pipeline());
  const firstStage = this.pipeline()[0];

  if (firstStage && firstStage.$geoNear) return;
  this.pipeline().unshift({ $match: { secrateTour: { $ne: true } } });
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
