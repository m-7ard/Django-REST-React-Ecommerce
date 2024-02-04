import React, { useRef, useState } from 'react'
import { Link, useLoaderData, useLocation } from 'react-router-dom'
import AddressModalSelect, { AddressModalSelectWidget } from '../../widgets/ModalSelects/AddressModalSelect'
import { getRequestUserAddresses, getRequestUserBankAccounts } from '../../Fetchers'
import { type Address, type BankAccount, type CartItem } from '../../Types'
import FormField from '../../elements/FormField'
import BankAccountModalSelect, { BankAccountModalSelectWidget } from '../../widgets/ModalSelects/BankAccountModalSelect'
import { getCookie } from '../../Utils'

interface LoaderData {
    addresses: Address[]
    bankAccounts: BankAccount[]
}

interface CartItemErrorsInterface {
    amount: string[]
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
    const { state } = useLocation() as { state: {
        items: CartItem[]
    } }
    const { addresses, bankAccounts } = useLoaderData() as LoaderData
    const [items, setItems] = useState(state.items)
    const [errors, setErrors] = useState()
    const checkoutFormRef = useRef<HTMLFormElement>(null)
    const shippingTotal = items.reduce((acc, { ad }) => acc + ad.shipping, 0)
    const itemTotal = items.reduce((acc, { ad, amount }) => acc + (ad.price * amount), 0)
    const cartTotal = shippingTotal + itemTotal
    const confirmCheckout = async (): Promise<void> => {
        const formData = new FormData(checkoutFormRef.current as HTMLFormElement)
        formData.append('items', JSON.stringify(items))
        const headers: HeadersInit = {}
        const csrfToken = getCookie('csrftoken')
        if (csrfToken != null) {
            headers['X-CSRFToken'] = csrfToken
        }

        const response = await fetch('/api/perform_checkout/', {
            method: 'POST',
            body: formData,
            headers
        })

        if (!response.ok) {
            console.log(await response.json())
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
                    </div>
                    <hr className='app__divider' />
                    <div className='prop__pairing'>
                        <div className='prop__label'>
                            Review Items
                        </div>
                        {items.map(({ pk, ad, amount }, i) => (
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
                            </div>
                        ))}
                    </div>
                    <hr className="app__divider" />
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
