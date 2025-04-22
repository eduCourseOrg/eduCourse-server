router.get("/", async (req, res) => {
    try {
      const {
        searchTerm = "",
        page = 1,
        limit = 10,
      } = req.query;
  
      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const skip = (pageInt - 1) * limitInt;
  
      // Build your filter dynamically (e.g., search by name or skills)
      const filter = {};
  
      if (searchTerm) {
        filter.$or = [
          { name: { $regex: searchTerm, $options: "i" } },
          { "bio.skills": { $regex: searchTerm, $options: "i" } },
        ];
      }
  
      const result = await instructorCollection.aggregate([
        {
          $facet: {
            // Paginated and filtered instructors
            paginatedResults: [
              { $match: filter },
              { $skip: skip },
              { $limit: limitInt },
              {
                $project: {
                  name: 1,
                  image: 1,
                  ratings: 1,
                  "bio.skills": 1,
                  "bio.profession": 1,
                  totalEnrolledStudents: 1,
                  socialLinks: 1,
                },
              },
            ],
            // Total matching count for pagination
            totalCount: [
              { $match: filter },
              { $count: "count" },
            ],
            // All unique skills (from all instructors)
            allSkills: [
              { $unwind: "$bio.skills" },
              { $group: { _id: "$bio.skills" } },
              { $sort: { _id: 1 } },
              { $project: { _id: 0, value: "$_id", label: "$_id" } },
            ],
          },
        },
      ]).toArray();
  
      const { paginatedResults, totalCount, allSkills } = result[0];
      const total = totalCount[0]?.count || 0;
      const totalPages = Math.ceil(total / limitInt);
  
      res.status(200).json({
        success: true,
        message: "Instructor data retrieved successfully",
        data: paginatedResults,
        filterOptions: {
          skills: allSkills || [],
        },
        pagination: {
          totalCount: total,
          page: pageInt,
          limit: limitInt,
          totalPages,
        },
      });
    } catch (error) {
      console.error(`Error fetching instructors: ${error.message}`);
      res.status(500).json({
        success: false,
        message: "Error fetching instructors",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });
  