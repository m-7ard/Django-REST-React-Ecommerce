import React from 'react'
import { useUserContext } from '../../Context'
import { Link, useLoaderData } from 'react-router-dom'
import { type Transaction } from '../../Types'

export default function ManageFunds (): React.ReactNode {
    const { user } = useUserContext()
    const { transactions } = useLoaderData() as { transactions: Transaction[] }

    return (
        <div className="funds prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Manage Funds
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop prop--vertical prop--highlighted">
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
                <Link className="prop__label is-link" to={'withdraw/'}>
                    Withdraw Funds
                </Link>
            </div>
            <div className="prop__header">
                <div className="prop__title">
                    Transactions
                </div>
            </div>
            <hr className="app__divider" />
            {
                transactions.map((transaction, i) => {
                    console.log(transaction)
                    return (
                        <div className='transaction prop prop--horizontal prop--highlighted' key={i}>
                            <div className='prop__pairing transaction__info'>
                                <div className='prop__info transaction__title'>
                                    {transaction.label}
                                </div>
                                <div className='prop__label'>
                                    {transaction.subkind}
                                </div>
                                <div className='prop__detail'>
                                    {transaction.date}
                                </div>
                            </div>
                            <div className='prop__label'>
                                {transaction.signed_amount}€
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}
