import React, {
    useContext
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CategorySearchbar from '../element_groups/CategorySearchbar'
import { useUserContext, useCategoryContext } from '../Context'

export default function AppHeader (): React.ReactNode {
    const navigate = useNavigate()
    const { user, setUser } = useUserContext()
    const { baseCategory, allCategories } = useCategoryContext()

    const categorySelectRoot = {
        value: baseCategory.pk,
        label: baseCategory.name
    }
    const categorySelectOptions = allCategories.map((category) => ({
        value: category.pk,
        label: category.name
    }))

    async function logout (): Promise<void> {
        await fetch('/api/logout/', {
            method: 'GET'
        })

        setUser({ is_authenticated: false })
        navigate('/')
    }

    return (
        <div className="app__header">
            <div className="app__header-section app__header-section--top">
                {(user.is_authenticated) && (
                    <Link to="account/">
                        <div className="app__go-to">
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
                {(!user.is_authenticated) && (
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
                )}
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
                <Link to="/">
                    <div className="app__go-to">
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

                {(user.is_authenticated) && (
                    <button type="button" className="app__go-to" onClick={logout}>
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
            <div className="app__header-section app__header-section--main">
                <CategorySearchbar
                    baseCategory={categorySelectRoot}
                    categories={categorySelectOptions}
                />
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
            <div className="app__header-section app__header-section--bottom" />
        </div>
    )
}
