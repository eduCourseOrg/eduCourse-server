const buildFilter = (searchTerm, selectedSkills) => {
  const filter = {};
  if (searchTerm) {
    const regex = new RegExp(searchTerm, "i");
    filter.$or = [
      { name: regex },
      { email: regex },
      { "profession.designation": regex },
      { "skills.category": regex },
    ];
  }
  if (selectedSkills && selectedSkills !== "All Skills") {
    const skillsArray = Array.isArray(selectedSkills)
      ? selectedSkills
      : [selectedSkills];
    filter["skills.category"] = { $in: skillsArray };
  }
  return filter;
};
const buildBlogFilter = (searchTerm, selectedCategory) => {
  const filter = {};
  if (searchTerm) {
    const regex = new RegExp(searchTerm, "i");
    filter.$or = [
      { name: regex },
      { author: regex },
      { "profession.designation": regex },
      { "skills.category": regex },
    ];
  }
  if (selectedCategory && selectedCategory !== "All Category") {
    const skillsArray = Array.isArray(selectedCategory)
      ? selectedCategory
      : [selectedCategory];
    filter["skills.category"] = { $in: skillsArray };
  }
  return filter;
};

const buildSort = (sortBy) => {
  if (!sortBy) return {}; // Default: no sorting
  const [field, order] = sortBy.split(":");
  if (!field || !["asc", "desc"].includes(order)) return {};
  return { [field]: order === "asc" ? 1 : -1 };
};

const buildCourseFilter = (
  searchTerm,
  selectedCategory,
  selectedCheckboxes,
  selectedLevelCheckboxes
) => {
  const filter = {};

  // 🔍 Search filter (checks multiple fields)
  if (searchTerm) {
    const regex = new RegExp(searchTerm, "i");
    filter.$or = [{ name: regex }, { description: regex }, { category: regex }];
  }

  const combinedCategories = [];
  if (selectedCategory && selectedCategory !== "All Categories") {
    combinedCategories.push(selectedCategory);
  }

  if (selectedCheckboxes) {
    combinedCategories.push(...selectedCheckboxes.split(","));
  }

  if (combinedCategories.length > 0) {
    filter.category = { $in: combinedCategories };
  }
  // Level checkboxes (multi)
  if (selectedLevelCheckboxes.length > 0) {
    const levels = selectedLevelCheckboxes.split(",");
    filter.level = { $in: levels };
  }

  // Dropdown single category
  // if (selectedCategory && selectedCategory !== "All Categories") {
  //   const categoriesArray = Array.isArray(selectedCategory)
  //     ? selectedCategory
  //     : [selectedCategory];
  //   filter.category = { $in: categoriesArray };
  // }

  // Checkbox categories (multi)
  // if (selectedCheckboxes) {
  //   const categories = selectedCheckboxes.split(",");
  //   filter.category = { $in: categories };
  // }
  // Combine dropdown + checkbox categories

  return filter;
};

export { buildFilter, buildSort, buildCourseFilter, buildBlogFilter };
