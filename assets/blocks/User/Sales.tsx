import React, { useState } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import { type Order } from '../../Types'
import { getCookie } from '../../Utils'

function SaleComponent ({ initial }: { initial: Order }): React.ReactNode {
    const [order, setOrder] = useState(initial)

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
                    {order.status === 'pending_shipping' && (
                        <Link className='order__button order__button--highlighted' to={`/order/${order.pk}/confirm-shipping/`}>
                            Confirm Shipping
                        </Link>
                    )}
                    {!['completed', 'pending_return', 'canceled', 'returned', 'pending_payment', 'pending_shipping'].includes(order.status) && (
                        <Link className='order__button order__button--normal' to={'edit-shipping/'}>
                            Edit Shipping Information
                        </Link>
                    )}
                    {['pending_payment', 'pending_shipping'].includes(order.status) && (
                        <div className='order__button order__button--normal'>
                            Cancel Order
                        </div>
                    )}
                    <div className='order__button order__button--normal'>
                        Problem with Order
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Sales (): React.ReactNode {
    const { sales } = useLoaderData() as {
        sales: Order[]
    }

    return (
        <div className="account prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Sales
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop__body">
                {sales.map((sales, i) => <SaleComponent initial={sales} key={i} />)}
            </div>
        </div>
    )
}
