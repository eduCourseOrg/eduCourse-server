//approch One Key benefits:

// Approch 01 for Larger Data
// Key Optimizations:
// Two-Phase Filtering:

// First apply user filters to get matching documents

// Then use those pre-filtered docs for pagination/counts

// Get filter options from completely unfiltered collection

// Reduced Duplicate Processing:

// Avoids reprocessing the same filters multiple times

// Only scans full collection once for filter options

// Memory Efficiency:

// Processes filtered docs first to reduce memory usage

// Uses $lookup to get fresh options from source

// Better Output Structure:

// Flattens the result for easier frontend consumption

// Directly returns totalCount as number instead of array

// Index Utilization:

// Ensure you have these indexes:

// javascript
// db.blogs.createIndex({ "category.categoryId": 1 });
// db.blogs.createIndex({ "tags": 1 });
// db.blogs.createIndex({ "publishedAt": -1 });
// When to Use This Approach:
// Large Collections (10,000+ documents)

// Complex Filters (multiple simultaneous conditions)

// Real-Time Requirements (when cache isn't suitable)

// Approch 01 for Larger Data

const resultOne = await blogCollection
  .aggregate([
    // First stage - apply filters only to paginated results
    { $match: filter }, // Store the filtered docs in memory

    // Facet stage for parallel processing
    {
      $facet: {
        // Paginated results (using already filtered docs)
        paginatedResults: [
          { $sort: { publishedAt: -1 } },
          { $skip: skip },
          { $limit: limitInt },
          {
            $project: {
              title: 1,
              slug: 1,
              excerpt: 1,
              publishedAt: 1,
              authorName: 1,
              category: 1,
              thumbnailUrl: 1,
              tags: 1,
            },
          },
        ],

        // Total count (using already filtered docs)
        totalCount: [{ $count: "count" }],

        // All filter options (from unfiltered collection)
        filterOptions: [
          // Lookup original collection for unfiltered options
          {
            $lookup: {
              from: "blogs",
              pipeline: [
                {
                  $facet: {
                    categories: [
                      {
                        $group: {
                          _id: "$category.categoryId",
                          name: { $first: "$category.categoryName" },
                          count: { $sum: 1 },
                        },
                      },
                      { $sort: { name: 1 } },
                    ],
                    tags: [
                      { $unwind: "$tags" },
                      {
                        $group: {
                          _id: "$tags",
                          count: { $sum: 1 },
                        },
                      },
                      { $sort: { _id: 1 } },
                    ],
                    archives: [
                      {
                        $project: {
                          year: { $year: "$publishedAt" },
                          month: { $month: "$publishedAt" },
                        },
                      },
                      {
                        $group: {
                          _id: { year: "$year", month: "$month" },
                          count: { $sum: 1 },
                        },
                      },
                      { $sort: { "_id.year": -1, "_id.month": -1 } },
                    ],
                  },
                },
              ],
              as: "options",
            },
          },
          { $unwind: "$options" },
          { $replaceRoot: { newRoot: "$options" } },
        ],
      },
    },

    // Final projection to clean up output
    {
      $project: {
        paginatedResults: 1,
        totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
        categories: "$filterOptions.categories",
        tags: "$filterOptions.tags",
        archives: "$filterOptions.archives",
      },
    },
  ])
  .toArray();

//   Approch 01 End

//   Approch 02 for Smaller Data <10000 blogs data

const resultTwo = await blogCollection
  .aggregate([
    {
      $facet: {
        // Get filter options first (unfiltered)
        options: [
          {
            $group: {
              _id: null,
              categories: { $addToSet: "$category" },
              allTags: { $push: "$tags" },
            },
          },
          {
            $project: {
              _id: 0,
              categories: {
                $map: {
                  input: "$categories",
                  as: "cat",
                  in: {
                    value: "$$cat.categoryId",
                    label: "$$cat.categoryName",
                  },
                },
              },
              tags: {
                $reduce: {
                  input: "$allTags",
                  initialValue: [],
                  in: { $concatArrays: ["$$value", "$$this"] },
                },
              },
            },
          },
        ],

        // Get filtered results
        results: [
          { $match: filter },
          { $sort: { publishedAt: -1 } },
          { $skip: skip },
          { $limit: limitInt },
        ],

        // Get count
        count: [{ $match: filter }, { $count: "total" }],
      },
    },
    { $unwind: "$options" },
    {
      $project: {
        categories: "$options.categories",
        tags: { $setUnion: ["$options.tags", []] },
        posts: "$results",
        total: { $arrayElemAt: ["$count.total", 0] },
      },
    },
  ])
  .toArray();

//   Approch 02 End
