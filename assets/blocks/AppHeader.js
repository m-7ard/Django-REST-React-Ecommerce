import React, { Fragment, useContext, useEffect } from 'react';
import { useLoaderData, Link, useNavigate, useRevalidator } from "react-router-dom";
import CategorySearchbar from '../element_groups/CategorySearchbar';
import { UserContext } from '../App';


export default function AppHeader() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const { baseCategoryData } = useLoaderData();

    const baseCategory = {
        value: baseCategoryData.pk,
        label: baseCategoryData.name
    };
    const categories = [baseCategory, ...baseCategoryData.subcategories.map((category) => {
        return {
            value: category.pk,
            label: category.name
        }
    })];

    async function logout() {
        await fetch('/api/logout/', {
            method: 'GET'
        });

        setUser(null);
        navigate('/');
    }

    return (
        <div className="app__header">
            <div className="app__header-section app__header-section--top">
                {user && (
                    <Link to={'account/'}>
                        <div className='app__go-to'>
                            <div className="icon icon--small icon--hoverable">
                                <i className="material-icons">
                                    person
                                </i>
                            </div>
                            <div>
                                User
                            </div>
                        </div>
                    </Link>
                ) || (
                    <Fragment>
                        <Link to={'login/'}>
                            <div className='app__go-to'>
                                <div className="icon icon--small icon--hoverable">
                                    <i className="material-icons">
                                        login
                                    </i>
                                </div>
                                <div>
                                    Login
                                </div>
                            </div>
                        </Link>
                        <Link to={'register/'}>
                            <div className='app__go-to'>
                                <div className="icon icon--small icon--hoverable">
                                    <i className="material-icons">
                                        person_add
                                    </i>
                                </div>
                                <div>
                                    Register
                                </div>
                            </div>
                        </Link>
                    </Fragment>
                )}
                <div className='app__go-to'>
                    <div className="icon icon--small icon--hoverable">
                        <i className="material-icons">
                            shopping_cart
                        </i>
                    </div>
                    <div>
                        Cart
                    </div>
                </div>
                <Link to={'/'}>
                    <div className='app__go-to'>
                        <div className="icon icon--small icon--hoverable">
                            <i className="material-icons">
                                home
                            </i>
                        </div>
                        <div>
                            Home
                        </div>
                    </div>
                </Link>

                {user && (
                    <div className='app__go-to' onClick={logout}>
                        <div className="icon icon--small icon--hoverable">
                            <i className="material-icons">
                                logout
                            </i>
                        </div>
                        <div>
                            Logout
                        </div>
                    </div>
                )}
            </div>
            <div className="app__header-section app__header-section--main">
                <CategorySearchbar
                    baseCategory={baseCategory}
                    categories={categories}
                />
                
            </div>
            <div className="app__header-section app__header-section--bottom">
                {categories.map((category) => {
                    return (
                        <div className="app__header-link">
                            {category.label}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};