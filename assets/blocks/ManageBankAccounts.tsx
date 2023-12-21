import React from 'react'
import Icon from '../elements/Icon'
import { Link } from 'react-router-dom'

export default function ManageBankAccounts (): React.ReactNode {
    return (
        <div className="prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Manage Bank Accounts
                </div>
            </div>
            <hr className="app__divider" />
            <Link className='prop prop--vertical prop--highlighted'>
                <div className='prop prop__header'>
                    <div className='prop__label'>
                        Add New Bank Account
                    </div>
                    <Icon name='add' wrapperClass='app__icon' size='small' />
                </div>
            </Link>
        </div>
    )
}
