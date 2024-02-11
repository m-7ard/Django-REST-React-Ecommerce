import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartContext, useUserContext } from '../../Context'
import Dropdown from '../../elements/Dropdown'
import Directory from '../../elements/AppHeader/Directory'
import { getCookie } from '../../Utils'
import Icon from '../../elements/Icon'

export default function AppHeader (): React.ReactNode {
    const navigate = useNavigate()
    const { user } = useUserContext()
    const { cart } = useCartContext()

    async function logout (): Promise<void> {
        const csrfToken = getCookie('csrftoken')

        await fetch('/api/logout/', {
            method: 'POST',
            headers: {
                ...(csrfToken != null && { 'X-CSRFToken': csrfToken })
            }
        })

        navigate('/')
    }

    function Search (): React.ReactNode {
        return (
            <form className="header@app__search-widget" action='/search/' method='GET'>
                <div className="header@app__search-field">
                    <div data-role="input">
                        <input type="text" name='q' />
                    </div>
                </div>
                <button className="header@app__search-button" type='submit'>
                    <Icon name='search' size='small' ignoreHeight />
                </button>
            </form>
        )
    }

    return (
        <div className='header@app'>
            <div className="header@app__section header@app__section--top">
                <div className='header@app__content'>
                    <Link to="/">
                        <div className='header@app__logo'>
                            DRF React E-Commerce
                        </div>
                    </Link>
                    <div className='header@app__group'>
                        {
                            (user.is_authenticated) && (
                                <Directory iconName='notifications' to='account/'/>
                            )
                        }
                        {
                            (!user.is_authenticated) && (
                                <>

                                </>
                            )
                        }
                        <Directory iconName='shopping_cart' to='/cart/' text={`(${cart.items.reduce((acc, item) => acc + item.amount, 0)})`} />
                        <Dropdown
                            extraClass={'header@app__account'}
                            trigger={
                                <Directory iconName='menu' text='Account' />
                            }
                            content={
                                <div className='header@app__menu'>
                                    {
                                        user.is_authenticated
                                            ? (
                                                <>
                                                    <Link to={'/account/'} data-role="close"> Profile </Link>
                                                    <Link to={'/ad-groups/'} data-role='close'> Ad Groups </Link>
                                                    <Link to={'/orders/'} data-role="close"> Orders </Link>
                                                    <Link to={'/sales/'} data-role="close"> Sales </Link>
                                                    <Link to={'/bookmarks/'} data-role="close"> Bookmarks </Link>
                                                    <Link to={'/settings/'} data-role="close"> Settings </Link>
                                                    <Link to={'/funds/'} data-role="close"> Funds <span data-role='funds'>{`(${user.seller_funds}€)`}</span> </Link>
                                                    <Link to={'/transactions/'} data-role="close"> Transactions </Link>
                                                    <div data-role="close"> Bids </div>
                                                    <div data-role="close"
                                                        onClick={() => {
                                                            void logout()
                                                        }}> Logout </div>
                                                </>
                                            )
                                            : (
                                                <>
                                                    <Link to={'/register/'} data-role="close"> Register </Link>
                                                    <Link to={'/login/'} data-role="close"> Login </Link>
                                                </>
                                            )
                                    }

                                </div>
                            }
                            positioning={{
                                top: '100%',
                                right: '0'
                            }}
                        />
                    </div>

                </div>

            </div>
            <div className="header@app__section header@app__section--main">
                <div className="header@app__content">
                    <Search />
                    <Link to="/post-ad/">
                        <div className="header@app__post-ad">
                            <Icon name='new_label' size='small' ignoreHeight />
                            <div data-role="text">
                                Post Ad
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
