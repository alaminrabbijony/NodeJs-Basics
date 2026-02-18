const mongoose = require('mongoose');
const Tour = require('./TourModels');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review must be filled'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1.0, 'the review must be min 1'],
      max: [5.0, 'review must be max 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a valid user'],
    },
  },
  {
    // to get the virtual properties that are calc to be shown in res
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/*------------------------------------------- INDEX --------------------------------------*/

/*-----------------------------Duplicate Prevention----------*/

//Duplicate review Prevention by a user on a tour
//“One user cannot review the same tour twice.”
reviewSchema.index({tour: 1, user: 1}, {unique: true})

/*---------------------------------------------STATICS FUNCTIONS-------------------------*/
//Static Fn => Entire Model
reviewSchema.statics.calcAvgRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numOfReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numOfReviews,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
/*----------------------------------------------QUERY MIDDLEWARE-------------------------*/

reviewSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name email',
  });
});



reviewSchema.post('save', function () {
  this.constructor.calcAvgRatings(this.tour);
});



/*
* findByIdAndUpdate
* findByIdAndDelete
* These are query based so we need query middleware for their recalc

*/
reviewSchema.pre(/^findOneAnd/, async function () {
    //In query middleware=> this = the query object
  this.r = await this.model.findOne(this.getQuery()); //Mannually fetch the doc
  //We need to get the doc
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) await this.r.constructor.calcAvgRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
