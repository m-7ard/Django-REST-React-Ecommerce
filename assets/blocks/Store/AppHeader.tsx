import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUserContext } from '../../Context'
import Dropdown from '../../elements/Dropdown'
import Directory from '../../elements/app_header/Directory'
import { getCookie } from '../../Utils'
import Icon from '../../elements/Icon'

export default function AppHeader (): React.ReactNode {
    const navigate = useNavigate()
    const { user } = useUserContext()

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
                        <Directory iconName='shopping_cart' to='/' text='(0)' />
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
                                                    <div data-role="close"> Orders </div>
                                                    <div data-role="close"> Bookmarks </div>
                                                    <Link to={'/settings/'} data-role="close"> Settings </Link>
                                                    <Link data-role="close" to={'/funds/'}> Funds <span data-role='funds'>{`(${user.funds}€)`}</span> </Link>
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
                    <div className="header@app__search-widget">
                        <div className="header@app__search-field">
                            <div data-role="input">
                                <input type="text" />
                            </div>
                        </div>
                        <div className="header@app__search-button">
                            <Icon name='search' size='small' ignoreHeight />
                        </div>
                    </div>
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
