import React, { useContext } from 'react';
import { Link, useLoaderData } from 'react-router-dom';

import { addDotsToNumber, useLoginRequired } from '../Utils';
import { getRequestUserAds } from '../Fetchers';
import { CategoryContext } from '../Context';

export async function loader({ params }) {
    const ads = await getRequestUserAds(params.pk);
    return { ads };
}

export default function Account() {
    useLoginRequired();
    const { ads } = useLoaderData();
    const { allCategories } = useContext(CategoryContext);
    const getCategoryName = (pk) => {
        const category = allCategories.find((category) => category.pk === pk);
    };

    return (
        <div className="account prop prop--vertical pamphlet">
            <form className="prop__header" method="POST" action="/api/categories/1/">
                <div className="prop__title">
                    Account
                </div>
            </form>
            <hr className="app__divider" />
            <div className="prop__body">
                {ads.map((ad) => (
                    <div className="account__ad prop prop--vertical">
                        <div className="account__ad-main">
                            <div className="account__ad-image">
                                <img src="" />
                            </div>
                            <div className="prop__column grow">
                                <div className="prop__pairing">
                                    <div className="prop__subtitle">
                                        {getCategoryName(ad.category)}
                                    </div>
                                    <div className="prop__title">
                                        {ad.title}
                                    </div>
                                    <div className="prop__info">
                                        {addDotsToNumber(ad.price)}
                                        $
                                    </div>
                                    <div className="prop__detail">
                                        Expiry Date:
                                        {' '}
                                        {ad.expiry_date}
                                    </div>
                                    <div className="prop__row">
                                        <div className="prop__subtitle">
                                            100 Views
                                        </div>
                                        <div className="prop__subtitle">
                                            5 Bookmarks
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="account__ad-actions">
                            <Link to={`/ad/${ad.pk}/edit`}>
                                <div className="account__ad-button">
                                    Edit
                                    <div className="icon icon--small">
                                        <i className="material-icons">
                                            edit
                                        </i>
                                    </div>
                                </div>
                            </Link>
                            <div className="account__ad-button">
                                Unlist
                                <div className="icon icon--small">
                                    <i className="material-icons">
                                        flag
                                    </i>
                                </div>
                            </div>
                            <div className="account__ad-button">
                                Delete
                                <div className="icon icon--small">
                                    <i className="material-icons">
                                        delete
                                    </i>
                                </div>
                            </div>
                            <div className="account__ad-button">
                                Boost
                                <div className="icon icon--small">
                                    <i className="material-icons">
                                        fast_forward
                                    </i>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}

            </div>
        </div>
    );
}
