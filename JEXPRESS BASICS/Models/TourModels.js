const mongoose = require('mongoose');
const slugify = require('slugify');

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
      set: (val) => Math.round(val * 10) / 10, // 4.6666, 46.666, 47, 4.7
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durrationWeeks').get(function () {
  return this.duration / 7;
});
/* 
//DOCUMENT MIDDLEWARE: runs before .save() and .create()
// pre-save hook doesnt run for .insertMany() or .update()

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

//QUERY MIDDLEWARE

tourSchema.pre(/^find/, function (next) {
  this.find({ secrateTour: { $ne: true } });
  this.start = Date.now();
  //next();
});

tourSchema.post(/^find/, function (docs) {
  console.log(`Query completed in ${Date.now() - this.start}ms`, docs.length);
});

//AGGREGATION MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  // console.log(this.pipeline());

  this.pipeline().unshift({ $match: { secrateTour: { $ne: true } } });

  // next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
