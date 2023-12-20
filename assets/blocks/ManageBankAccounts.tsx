import React from 'react'
import { useUserContext } from '../Context'

export default function ManageBankAccounts (): React.ReactNode {
    const { user } = useUserContext()

    return (
        <div className="prop prop--vertical">
            <div className="prop__header">
                <div className="prop__title">
                    Manage Bank Accounts
                </div>
            </div>
            <hr className="app__divider" />

        </div>
    )
}
