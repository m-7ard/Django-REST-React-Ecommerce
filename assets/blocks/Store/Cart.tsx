import React, { useState, type Dispatch, type SetStateAction } from 'react'
import { useCartContext } from '../../Context'
import { Link } from 'react-router-dom'
import { getCookie } from '../../Utils'
import { type BaseAd } from '../../Types'

type errorsInterface = Record<number, {
    changes: Record<string, [string, string]>
    item_errors: Record<string, string>
}>

function CartItemComponent ({ ad, amount, pk, cartData }: {
    ad: BaseAd
    amount: number
    pk: number
    cartData: {
        setItemAmount: Dispatch<SetStateAction<Record<number, number>>>
        selected: number[]
        setSelected: Dispatch<SetStateAction<number[]>>
        errors?: errorsInterface
    }
}): React.ReactNode {
    const { setItemAmount, selected, setSelected, errors } = cartData
    const { setCart } = useCartContext()
    const fieldErrors = errors?.[pk]
    const changeErrors = fieldErrors != null && Object.entries(fieldErrors.changes).length !== 0 && (
        <>
            <hr className='app__divider' />
            <div>
                <div className='prop__label'>
                    Changes
                </div>
                {
                    Object.entries(fieldErrors.changes).map(([field, values], i) => {
                        const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1)

                        return (
                            <div className='prop__detail' key={i}>
                                {`• ${fieldLabel}: ${values[0]} → ${values[1]}`}
                            </div>
                        )
                    })
                }
            </div>
        </>
    )

    const removeFromCart = async (ad: BaseAd): Promise<void> => {
        const csrfToken = getCookie('csrftoken')
        const headers: HeadersInit = {}
        if (csrfToken != null) {
            headers['X-CSRFToken'] = csrfToken
        }

        const response = await fetch(`/api/ads/${ad.pk}/remove_from_cart/`, {
            method: 'POST',
            headers
        })
        if (response.ok) {
            setCart((previous) => ({ ...previous, items: previous.items.filter((item) => item.pk !== pk) }))
        }
    }

    const itemErrors = fieldErrors != null && Object.entries(fieldErrors.item_errors).length !== 0 && (
        <>
            <hr className='app__divider' />
            <div>
                <div className='prop__label'>
                    Item
                </div>
                {
                    Object.entries(fieldErrors.item_errors).map(([field, msg], i) => {
                        const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1)

                        return (
                            <div className='prop__detail' key={i}>
                                {`• ${fieldLabel}: ${msg}`}
                            </div>
                        )
                    })
                }
            </div>
        </>
    )

    return (
        <div className="prop prop--vertical prop--highlighted ad@cart">
            <div className='prop__header'>
                <div>
                    <div className='prop__detail'>
                        {ad.created_by.display_name}
                    </div>
                </div>
                <input type='checkbox' defaultChecked={selected.includes(pk)} onChange={(event) => {
                    setSelected((previous) => {
                        if (previous.includes(pk)) {
                            return previous.filter((otherPk) => otherPk !== pk)
                        }
                        return [...previous, pk]
                    })
                }}/>
            </div>
            <div className='prop__row'>
                <Link to={`/ad/${ad.pk}/`} className="avatar avatar--large prop prop--highlighted">
                    <img src={`/media/${ad.images[0]}`} />
                </Link>
                <div className="prop__column ad@cart__body">
                    <div className='prop__pairing'>
                        <div>
                            <Link to={`/ad/${ad.pk}/`} className="prop__info is-link ad@cart__title">
                                {ad.title}
                            </Link>
                            {
                                ad.condition != null && (
                                    <div className='prop__detail'>
                                        {ad.condition}
                                    </div>
                                )
                            }

                        </div>
                        <div className='prop__row prop__row--centered'>
                            <div className='prop__detail'>
                                Price
                            </div>
                            <div className='prop__label'>
                                {ad.price}€
                            </div>
                        </div>
                        <div className='prop__detail'>
                            {ad.shipping === 0 ? 'Free Shipping' : `+${ad.shipping}€ Shipping`}
                        </div>

                    </div>
                </div>
            </div>
            <div className='prop__footer'>
                <div className='prop__row prop__row--centered'>
                    <div className='prop__detail'>
                        Amount:
                    </div>
                    <input type='number' className='ad@cart__amount' defaultValue={amount} min={1} max={ad.available} onChange={(event) => {
                        setItemAmount((previous) => {
                            return { ...previous, [pk]: parseInt(event.target.value) }
                        })
                    }} />
                    <div className='prop__detail'>
                        ({ad.available} Available)
                    </div>
                </div>
            </div>
            <div className='prop__footer'>
                <div className='prop__row'>
                    <div className='prop__detail is-link'>
                        Bookmark
                    </div>
                    <div className='prop__detail is-link' onClick={() =>
                        void removeFromCart(ad)
                    }>
                        Remove
                    </div>
                </div>
            </div>
            {changeErrors}
            {itemErrors}
        </div>
    )
}

export default function Cart (): React.ReactNode {
    const { cart, setCart } = useCartContext()
    const [selected, setSelected] = useState(cart.items.map(({ pk }) => pk))
    const [itemAmount, setItemAmount] = useState(cart.items.reduce<Record<number, number>>(
        (acc, { pk, amount }) => {
            acc[pk] = amount
            return acc
        }, {}
    ))
    const [errors, setErrors] = useState<errorsInterface | undefined>()
    const cartData = { setItemAmount, selected, setSelected, itemAmount, errors }

    const confirmCheckout = async (): Promise<void> => {
        const formData = new FormData()
        const itemData = cart.items.map((item) => {
            item.amount = itemAmount[item.pk]
            return item
        })
        formData.append('items', JSON.stringify(itemData))
        const csrfToken = getCookie('csrftoken')
        const response = await fetch('/api/confirm_checkout/', {
            method: 'POST',
            body: formData,
            ...(csrfToken != null && {
                headers: {
                    'X-CSRFToken': csrfToken
                }
            })
        })

        if (!response.ok) {
            const data = await response.json()
            setCart((previous) => ({ ...previous, items: data.items }))
            setErrors(data.errors)
        }
    }

    return (
        <div className="prop prop--vertical cart pamphlet">
            <div className="prop prop__header">
                <div className="prop__title">
                    Cart
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop__body">
                {
                    cart.items.map(({ ad, amount, pk }, i) => <CartItemComponent ad={ad} amount={amount} pk={pk} key={i} cartData={cartData}/>)
                }
            </div>
            <hr className="app__divider" />
            <div className='prop__footer'>
                <div className='prop__label'>
                    Cost
                </div>
                <div className='prop__info'>
                    {cart.items.reduce((acc, { pk, ad }) => selected.includes(pk) ? acc + (ad.price * itemAmount[pk]) : acc, 0)}
                    €
                </div>
            </div>
            <div className='prop__footer'>
                <div className='prop__label'>
                    Shipping
                </div>
                <div className='prop__detail'>
                    {cart.items.reduce((acc, { pk, ad }) => selected.includes(pk) ? acc + ad.shipping : acc, 0)}
                    €
                </div>
            </div>
            <hr className="app__divider" />
            <div className='cart__checkout' onClick={() => {
                void confirmCheckout()
            }}>
                Checkout
            </div>
        </div>
    )
}
