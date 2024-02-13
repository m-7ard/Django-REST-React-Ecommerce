import React from 'react'
import { useLoaderData } from 'react-router-dom'
import { type Transaction } from '../../Types'

export default function Transactions (): React.ReactNode {
    const { transactions } = useLoaderData() as { transactions: Transaction[] }

    return (
        <div className="funds prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Transactions
                </div>
            </div>
            <hr className="app__divider" />
            {transactions.map((transaction, i) => {
                const { kind } = transaction

                if (kind === 'order_transaction') {
                    const transactionData = transaction.transaction_data

                    return (
                        <div className='transaction prop prop--vertical prop--highlighted' key={i}>
                            <div className='prop__header'>
                                <div className='prop__label'>
                                    {transactionData.subkind === 'payment' ? 'Order Payment' : 'Order Refund'}
                                </div>
                                <div className='prop__detail'>
                                    {transaction.date_created}
                                </div>
                            </div>
                            <hr className='app__divider' />
                            <div className='prop__body'>
                                <div className='prop__pairing'>
                                    <div className='prop__label is-link'>
                                        Order #{transactionData.order.pk}
                                    </div>
                                    <div className='prop__label'>
                                        {transactionData.order.bank_account.iban}
                                    </div>
                                    <div className='prop__info'>
                                        {transaction.signed_amount}€
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                return null
            })}

        </div>
    )
}
