export async function getCategoryData() {
    const response = await fetch("/api/categories/");
    const data = await response.json();
    
    for (let category of data) {
        if (!category.parent) {
            return {
                baseCategory: category,
                allCategories: data,
            };
        };
    };
};


export async function getAdData(pk) {
    const response = await fetch(`/api/ads/${pk}`);
    const data = await response.json();
    return data;
};