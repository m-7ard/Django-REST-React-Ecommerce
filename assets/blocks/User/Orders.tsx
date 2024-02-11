import React, { useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import { type Order } from '../../Types'
import { getCookie } from '../../Utils'

function OrderComponent ({ initial }: { initial: Order }): React.ReactNode {
    const [order, setOrder] = useState(initial)

    const confirmPayment = async (): Promise<void> => {
        const headers: HeadersInit = {}
        headers['Content-Type'] = 'application/json'
        const csrfToken = getCookie('csrftoken')
        if (csrfToken != null) {
            headers['X-CSRFToken'] = csrfToken
        }

        const response = await fetch(`/api/orders/${order.pk}/confirm_payment/`, {
            method: 'POST',
            headers
        })

        if (!response.ok) {
            return
        }

        const updatedOrder = await response.json()
        setOrder(updatedOrder)
    }

    return (
        <div className='prop prop--highlighted order'>
            <div className='order__header'>
                <div>
                    <div className='prop__label'>
                        Order Placed
                    </div>
                    <div className='prop__detail'>
                        {order.date_created}
                    </div>
                </div>
                <div>
                    <div className='prop__label'>
                        Total
                    </div>
                    <div className='prop__detail'>
                        {order.total}
                    </div>
                </div>
                <div>
                    <div className='prop__label'>
                        Ship To
                    </div>
                    <div className='prop__detail is-link'>
                        {order.shipping_address.name}
                    </div>
                </div>
                <div>
                    <div className='prop__label'>
                        Order ID
                    </div>
                    <div className='prop__detail'>
                        {order.pk}
                    </div>
                </div>
            </div>
            <hr className="app__divider" />
            <div className='order__body'>
                <div className='prop__column'>
                    <div className='prop__label'>
                        Order Status: {order.status_display}
                    </div>
                    <div className='prop__row'>
                        <div className='avatar avatar--large'>
                            <img src={`/media/${order.ad.images[0]}`} />
                        </div>
                        <div className='prop__pairing'>
                            <div className='prop__info is-link'>
                                {order.ad.title}
                            </div>
                            <div className='prop__row prop__row--baselined'>
                                <div className='prop__label'>
                                    Seller:
                                </div>
                                <div className='prop__detail is-link'>
                                    {order.ad.created_by.display_name}
                                </div>
                            </div>
                            <div className='prop__detail'>
                                Returnable Until {order.ad.return_policy === 'warranty' ? 'Warranty Period' : order.return_date_expiry}
                            </div>
                            <div className='prop__row'>
                                <div className='order__button order__button--normal'>
                                    Buy Again
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='prop__pairing'>
                    {order.status === 'pending_payment'
                        ? (
                            <div className='order__button order__button--highlighted' onClick={() => {
                                void confirmPayment()
                            }}>
                                Confirm Payment
                            </div>
                        )
                        : (
                            <div className='order__button order__button--highlighted'>
                                Track Order
                            </div>
                        )}
                    {['pending_payment', 'pending_shipping'].includes(order.status) && (
                        <div className='order__button order__button--normal'>
                            Cancel Order
                        </div>
                    )}
                    {order.status === 'completed' && (
                        <div className='order__button order__button--highlighted'>
                            Write A Review
                        </div>
                    )}
                    {['completed', 'returned', 'canceled'].includes(order.status)
                        ? (
                            <div className='order__button order__button--normal'>
                                Return Order
                            </div>
                        )
                        : (
                            <div className='order__button order__button--normal'>
                                View or Edit Order
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}

export default function Orders (): React.ReactNode {
    const { orders } = useLoaderData() as {
        orders: Order[]
    }
    console.log(orders)
    console.log(123)
    return (
        <div className="account prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Orders
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop__body">
                {orders.map((order, i) => <OrderComponent initial={order} key={i} />)}
            </div>
        </div>
    )
}
