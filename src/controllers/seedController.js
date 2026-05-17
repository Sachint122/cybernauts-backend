const { seedData } = require('../seeder/seeder');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

exports.runSeed = asyncHandler(async (req, res) => {
  const result = await seedData();
  res.status(200).json(new ApiResponse(200, { 
    message: 'Data seeded successfully',
    data: result
  }));
});
