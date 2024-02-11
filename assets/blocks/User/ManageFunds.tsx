import React from 'react'
import { useUserContext } from '../../Context'
import { Link } from 'react-router-dom'

export default function ManageFunds (): React.ReactNode {
    const { user } = useUserContext()

    return (
        <div className="prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Manage Seller Funds
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop prop--vertical prop--highlighted">
                <div className="prop__header">
                    <div className="prop__title">
                        {user.seller_funds}€
                    </div>
                    <div className='app__icon'>
                        <div className='icon icon--small icon--hoverable'>
                            <i className="material-icons">
                                menu
                            </i>
                        </div>
                    </div>
                </div>
                <Link className="prop__label is-link" to={'withdraw/'}>
                    Withdraw Funds
                </Link>
            </div>
        </div>
    )
}
