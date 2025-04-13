const buildFilter = (searchTerm, selectedSkills) => {
  const filter = {};
  if (searchTerm) {
    const regex = new RegExp(searchTerm, "i");
    filter.$or = [{ name: regex }, { email: regex }, { "bio.skills": regex }];
  }
  if (selectedSkills && selectedSkills !== "All Skills") {
    const skillsArray = Array.isArray(selectedSkills)
      ? selectedSkills
      : [selectedSkills];
    filter["bio.skills"] = { $in: skillsArray };
  }
  return filter;
};

const buildSort = (sortBy) => {
  if (sortBy === "Ascending") return { ratings: 1 };
  if (sortBy === "Descending") return { ratings: -1 };
  return {};
};

export { buildFilter, buildSort };

export const buildCourseFilter = ({
  searchTerm,
  selectedCategory,
  selectedCheckboxes,
  selectedLevelCheckboxes,
}) => {
  const filter = {};

  // 🔍 Search filter (checks multiple fields)
  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { description: { $regex: searchTerm, $options: "i" } },
      { category: { $regex: searchTerm, $options: "i" } },
    ];
  }

  // Dropdown single category
  if (selectedCategory && selectedCategory !== "All Categories") {
    filter.category = selectedCategory;
  }

  // Checkbox categories (multi)
  if (selectedCheckboxes) {
    const categories = selectedCheckboxes.split(",");
    filter.category = { $in: categories };
  }

  // Level checkboxes (multi)
  if (selectedLevelCheckboxes) {
    const levels = selectedLevelCheckboxes.split(",");
    filter.courseLevel = { $in: levels };
  }

  return filter;
};
