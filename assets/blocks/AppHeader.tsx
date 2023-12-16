import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CategorySearchbar from '../elements/CategorySearchbar'
import { useUserContext } from '../Context'

export default function AppHeader (): React.ReactNode {
    const navigate = useNavigate()
    const { user } = useUserContext()

    async function logout (): Promise<void> {
        await fetch('/api/logout/', {
            method: 'POST'
        })

        navigate('/')
    }

    return (
        <>
            <div className="app__header app__header--top">
                <Link to="/" className='left'>
                    <div className='app__logo'>
                        <div>
                            DRF React
                        </div>
                        <div>
                            E-Commerce
                        </div>
                    </div>
                </Link>
                {(user.is_authenticated) && (
                    <Link to="account/">
                        <div className="app__go-to right">
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
                )}
                {
                    (!user.is_authenticated) && (
                        <>
                            <Link to="login/">
                                <div className="app__go-to">
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
                            <Link to="register/">
                                <div className="app__go-to">
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
                        </>
                    )
                }
                <div className="app__go-to">
                    <div className="icon icon--small icon--hoverable">
                        <i className="material-icons">
                            shopping_cart
                        </i>
                    </div>
                    <div>
                        Cart
                    </div>
                </div>
                {(user.is_authenticated) && (
                    <button type="button" className="app__go-to" onClick={() => {
                        void logout()
                    }}>
                        <div className="icon icon--small icon--hoverable">
                            <i className="material-icons">
                                logout
                            </i>
                        </div>
                        <div>
                            Logout
                        </div>
                    </button>
                )}
            </div>
            <div className="app__header app__header--main">
                <CategorySearchbar />
                <Link to="/post-ad/">
                    <div className="app__post-ad">
                        <div className="icon icon--small">
                            <i className="material-icons">
                                add_box
                            </i>
                        </div>
                        <div data-role="text">
                            Post Ad
                        </div>
                    </div>
                </Link>
            </div>
        </>
    )
}
