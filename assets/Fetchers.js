export async function getCategoryData() {
    const response = await fetch('/api/categories/');
    const data = await response.json();

    for (const category of data) {
        if (!category.parent) {
            return {
                baseCategory: category,
                allCategories: data,
            };
        }
    }
}

export async function getAdData(pk) {
    const response = await fetch(`/api/ads/${pk}`);
    const data = await response.json();
    return data;
}

export async function getFrontpageData() {
    const response = await fetch('/frontpage_data/');
    const data = await response.json();
    return data;
}

export async function getUserAds(pk) {
    const response = await fetch(`/api/ads/list_user_ads/${pk}`);
    const data = await response.json();
    return data;
}

export async function getRequestUserAds(pk) {
    const response = await fetch('/api/ads/list_user_ads/');
    const data = await response.json();
    return data;
}
