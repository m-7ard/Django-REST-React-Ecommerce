import React from 'react'
import { useUserContext } from '../Context'

export default function ManageFunds (): React.ReactNode {
    const { user } = useUserContext()

    return (
        <div className="funds prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Manage Funds
                </div>
            </div>
            <hr className="app__divider" />
            <div className="funds__balance prop prop--vertical">
                <div className="prop__header">
                    <div className="prop__title">
                        {user.funds}€
                    </div>
                    <div className='app__icon'>
                        <div className='icon icon--small icon--hoverable'>
                            <i className="material-icons">
                                menu
                            </i>
                        </div>
                    </div>
                </div>
                <div className='prop__row'>
                    <div className="prop__label is-link">
                        Add Funds
                    </div>
                    <div className="prop__label is-link">
                        Withdraw Funds
                    </div>
                </div>
            </div>
            <div className="prop__header">
                <div className="prop__title">
                    Transactions
                </div>
            </div>
            <hr className="app__divider" />
            <div className='funds__transactions'>
                <div>
                    <div>
                        Test
                    </div>
                    <div>
                        100€
                    </div>
                </div>
                <div>
                    <div>
                        Test
                    </div>
                    <div>
                        100€
                    </div>
                </div>
                <div>
                    <div>
                        Test
                    </div>
                    <div>
                        100€
                    </div>
                </div>
            </div>
        </div>
    )
}
