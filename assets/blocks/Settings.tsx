import React from 'react'
import { useUserContext } from '../Context'
import Display from '../elements/Settings/Display'

export default function Settings (): React.ReactNode {
    const { user } = useUserContext()

    return (
        <div className="settings prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Settings
                </div>
            </div>
            <hr className="app__divider" />
            <Display title='Display Name' link='/' current={(
                <>
                    <div className='prop__detail'>
                        {user.display_name}
                    </div>
                </>
            )} />
            <Display title='Email' link='/' current={(
                <>
                    <div className='prop__detail'>
                        {user.email}
                    </div>
                </>
            )} />
            <Display title='Password' link='/' current={(
                <>
                    <div className='prop__detail'>
                        ****
                    </div>
                </>
            )} />
            <Display title='Bank Accounts' link='/bank-accounts/' current={(
                <>
                    <div>
                        <div className='prop__label'>
                            Default
                        </div>
                        <div className='prop__detail'>
                            XX-0000-0000-0000-0000-00
                        </div>
                    </div>
                    <div className='prop__detail'>
                        10 Linked Accounts
                    </div>
                </>
            )} />
            <Display title='Delivery Addresses' link='/' current={(
                <>
                    <div>
                        <div className='prop__label'>
                            Default
                        </div>
                        <div className='prop__detail'>
                            <div>John Doe</div>
                            <div>Main Street 123abc</div>
                            <div>12345</div>
                            <div>Country</div>
                        </div>
                    </div>
                    <div className='prop__detail'>
                        5 Linked Addresses
                    </div>
                </>
            )} />
        </div>
    )
}
