import React, { useState } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import Icon from '../../elements/Icon'
import { type Address } from '../../Types'
import { getCookie } from '../../Utils'
import { useUserContext } from '../../Context'

export default function ManageAddresses (): React.ReactNode {
    const addresses = useLoaderData() as Address[]
    const { user } = useUserContext()
    const [defaultAddress, setDefaultAddress] = useState(user.default_address)

    return (
        <div className="prop prop--vertical pamphlet">
            <div className="prop__header">
                <div className="prop__title">
                    Manage Addresses
                </div>
            </div>
            <hr className="app__divider" />
            <div className='prop prop--vertical prop--highlighted'>
                <div className='prop prop__header'>
                    <div className='prop__label'>
                        Add New Addresses
                    </div>
                    <Link to={'add/'}>
                        <Icon name='add' size='small' hoverable />
                    </Link>
                </div>
            </div>
            <div className='card-grid'>
                {
                    addresses.map((address, i) => {
                        const updateDefaultAddress = async (): Promise<void> => {
                            const csrfToken = getCookie('csrftoken')
                            const response = await fetch(`/api/addresses/${address.pk}/set-as-default/`, {
                                method: 'PATCH',
                                ...(csrfToken != null && {
                                    headers: {
                                        'X-CSRFToken': csrfToken
                                    }
                                })
                            })
                            if (response.ok) {
                                setDefaultAddress(address.pk)
                            }
                        }

                        return (
                            <div className='address prop prop--vertical prop--highlighted' key={i}>
                                <div className="prop__header">
                                    <div className="prop__label">
                                        {address.name}
                                    </div>
                                </div>
                                <hr className="app__divider" />
                                <div>
                                    <div className='prop__detail'> {address.street} </div>
                                    <div className='prop__detail'> {address.locality} </div>
                                    <div className='prop__detail'> {address.zip_code} </div>
                                    <div className='prop__detail'> {address.country_display} </div>
                                </div>
                                <div className='prop__row'>
                                    <Link className='prop__detail is-link' to={`${address.pk}/edit/`}>
                                        Edit
                                    </Link>
                                    <Link className='prop__detail is-link' to={`${address.pk}/delete/`}>
                                        Delete
                                    </Link>
                                    {
                                        address.pk === defaultAddress
                                            ? (
                                                <div className="prop__detail">
                                                    Default
                                                </div>
                                            )
                                            : (
                                                <div className='prop__detail is-link' onClick={() => {
                                                    void updateDefaultAddress()
                                                }}>
                                                    Set as Default
                                                </div>
                                            )
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}
