import React, { useRef, useState } from 'react'
import { Link, useLoaderData, useLocation, useNavigate } from 'react-router-dom'
import AddressModalSelect, { AddressModalSelectWidget } from '../../widgets/ModalSelects/AddressModalSelect'
import { getRequestUserAddresses, getRequestUserBankAccounts } from '../../Fetchers'
import { type Address, type BankAccount, type CartItem } from '../../Types'
import BankAccountModalSelect, { BankAccountModalSelectWidget } from '../../widgets/ModalSelects/BankAccountModalSelect'
import { getCookie } from '../../Utils'

interface LoaderData {
    addresses: Address[]
    bankAccounts: BankAccount[]
}

interface CartItemErrorsInterface {
    amount?: string[]
    ad?: Record<string, string[]>
}

interface CheckoutErrorsInterface {
    bank_account: string[]
    shipping_address: string[]
    items: {
        non_field_errors: string[]
        [pk: number]: CartItemErrorsInterface
    }
}

export async function loader (): Promise<LoaderData> {
    const addresses = await getRequestUserAddresses()
    const bankAccounts = await getRequestUserBankAccounts()
    return { addresses, bankAccounts }
}

export default function Checkout (): React.ReactNode {
    const { state } = useLocation() as {
        state: {
            items: CartItem[]
        }
    }
    const navigate = useNavigate()
    const { addresses, bankAccounts } = useLoaderData() as LoaderData
    const [items, setItems] = useState(state.items)
    const [errors, setErrors] = useState<CheckoutErrorsInterface | undefined>()
    const checkoutFormRef = useRef<HTMLFormElement>(null)
    const shippingTotal = items.reduce((acc, { ad }) => acc + ad.shipping, 0)
    const itemTotal = items.reduce((acc, { ad, amount }) => acc + (ad.price * amount), 0)
    const cartTotal = shippingTotal + itemTotal
    const confirmCheckout = async (): Promise<void> => {
        const formData = new FormData(checkoutFormRef.current as HTMLFormElement)
        const headers: HeadersInit = {}
        headers['Content-Type'] = 'application/json'
        const csrfToken = getCookie('csrftoken')
        if (csrfToken != null) {
            headers['X-CSRFToken'] = csrfToken
        }

        const response = await fetch('/api/perform_checkout/', {
            method: 'POST',
            body: JSON.stringify({ items, ...Object.fromEntries(formData) }),
            headers
        })

        if (!response.ok) {
            const checkoutErrors = await response.json()
            console.log(checkoutErrors)
            setErrors(checkoutErrors)
        }
        else {
            navigate('/orders/')
        }
    }

    return (
        <div className="prop prop--vertical checkout pamphlet">
            <div className="prop prop__header">
                <div className="prop__title">
                    Checkout
                </div>
            </div>
            <hr className="app__divider" />
            <div className="prop__row checkout__body">
                <div className="prop prop--vertical prop--highlighted checkout__total">
                    <div className="prop__label">
                        Order Summary
                    </div>
                    <hr className="app__divider" />
                    <div className='prop__pairing'>
                        <div className='prop__header'>
                            <div className='prop__detail'>
                                Items ({items.length})
                            </div>
                            <div className='prop__detail'>
                                {itemTotal}€
                            </div>
                        </div>
                        <div className='prop__header'>
                            <div className='prop__detail'>
                                Shipping
                            </div>
                            <div className='prop__detail'>
                                {shippingTotal}€
                            </div>
                        </div>
                        <hr className="app__divider" />
                        <div className='prop__header'>
                            <div className='prop__detail'>
                                Total
                            </div>
                            <div className='prop__detail'>
                                {cartTotal}€
                            </div>
                        </div>
                    </div>
                    <hr className="app__divider" />
                    <div className='checkout__button'>
                        Checkout
                    </div>
                </div>
                <form className="prop__column checkout__form" ref={checkoutFormRef}>
                    <div className='prop__pairing'>
                        <div className='prop__label'>
                            Shipping Address
                        </div>
                        <AddressModalSelect
                            name='shipping_address'
                            title='Select Shipping Address'
                            placeholder='Select Shipping Address'
                            addressList={addresses}
                        />
                        {errors?.shipping_address?.map((msg, i) => (
                            <div className='prop__detail' key={i}>
                                {msg}
                            </div>
                        ))}
                    </div>
                    <hr className='app__divider' />
                    <div className='prop__pairing'>
                        <div className='prop__label'>
                            Bank Account
                        </div>
                        <BankAccountModalSelect
                            name='bank_account'
                            title='Select Bank Account'
                            placeholder='Select Bank Account'
                            bankAccountList={bankAccounts}
                        />
                        {errors?.bank_account?.map((msg, i) => (
                            <div className='prop__detail' key={i}>
                                {msg}
                            </div>
                        ))}
                    </div>
                    <hr className='app__divider' />
                    <div className='prop__pairing'>
                        <div className='prop__label'>
                            Review Items
                        </div>
                        {errors?.items?.non_field_errors?.map((msg, i) => (
                            <div className='prop__detail' key={i}>
                                {msg}
                            </div>
                        ))}
                        {items.map(({ pk, ad, amount }, i) => {
                            const itemErrors = errors?.items?.[pk]

                            return (
                                <div key={i} className='prop prop--vertical prop--highlighted'>
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
                                                        ad.condition_display != null && (
                                                            <div className='prop__detail'>
                                                                {ad.condition_display}
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
                                                <div className='prop__row prop__row--baselined'>
                                                    <div className='prop__detail'>
                                                        Amount:
                                                    </div>
                                                    <div className='prop__label'>
                                                        {amount}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {itemErrors?.amount != null && (
                                        <div>
                                            {itemErrors?.amount.map((msg) => (
                                                <div className='prop__detail' key={i}>
                                                    {msg}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {itemErrors?.ad != null && Object.entries(itemErrors.ad).map(([fieldName, fieldErrors], i) => (
                                        <div key={i}>
                                            {fieldErrors.map((msg, j) => (
                                                <div className='prop__detail' key={j}>
                                                    {msg}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                    <hr className="app__divider" />
                    {errors?.items != null && (
                        <div className='prop__title is-error'>
                            Invalid Item Data. Please go back to cart and retry checkout.
                        </div>
                    )}
                    <div className='checkout__button' onClick={() => {
                        void confirmCheckout()
                    }}>
                        Checkout
                    </div>
                </form>
            </div>
        </div>
    )
}
