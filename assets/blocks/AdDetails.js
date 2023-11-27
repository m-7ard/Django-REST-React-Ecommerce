import React, { useContext } from "react";
import { getAdData } from "../Fetchers";
import { useLoaderData } from "react-router-dom";
import { CategoryContext } from "../App";
import { NormalizedData, addDotsToNumber } from "../Utils";


export async function loader({params}) {
    const ad = await getAdData(params.pk);
    return { ad };
};


export default function AdDetails() {
    const { ad } = useLoaderData();
    const { allCategories } = useContext(CategoryContext);
    const NormalizedCategories = new NormalizedData({
        data: allCategories, 
        valueKey: 'pk', 
        labelKey: 'name', 
        parentKey: 'parent'
    });

    return (
        <div className="ad">
            <div className="ad__header">
                <div className="ad__category">
                    {NormalizedCategories.getRouteString(ad.category)}
                </div>
            </div>
            <div className="ad__imagebox">
                <div data-role="image-picker">
                    {ad.images.map((filename) => {
                        return (
                            <div data-role="select-image">
                                <img src={`/media/${filename}`} />
                            </div>
                        )
                    })}
                </div>
                <div data-role="active-image">
                    <img src={`/media/${ad.images[0]}`} />
                </div>
            </div>
            <div className="ad__main">
                <div className="ad__main-header">
                    <div className="ad__title">
                        {ad.title}
                    </div>
                    <div className="ad__price">
                        {addDotsToNumber(ad.price)}$
                    </div>
                </div>
                <div className="ad__seller">
                    <div className="app__avatar">
                        <div className="avatar avatar--small">
                            <img src={ad.created_by.avatar} />
                        </div>
                    </div>
                    <div className="ad__seller-body">
                        <div className="ad__seller-title">
                            {ad.created_by.display_name}
                        </div>
                        <div className="ad__seller-footer">
                            <div className="ad__seller-label">
                                {ad.created_by.account_type === 'individual' ? 'Individual Seller' : 'Business Seller'}
                            </div>
                            <div className="ad__seller-link">
                                No Ratings
                            </div>
                            <div className="ad__seller-link">
                                Seller's Profile
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="app__divider" />
                <div className="ad__button ad__button--yellow">
                    Buy Now
                </div>
                <div className="ad__button ad__button--yellow">
                    Add to Cart
                </div>
                <div className="ad__button ad__button--black">
                    Bookmark
                </div>
            </div>
            <div className="ad__footer">
                <div className="ad__label">
                    Description
                </div>
                <hr className="app__divider" />
                <div className="ad__description">
                    {ad.description}
                </div>
            </div>
        </div>
    );
};