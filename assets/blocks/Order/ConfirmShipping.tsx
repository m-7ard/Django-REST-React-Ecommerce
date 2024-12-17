import React, { useEffect, useLayoutEffect } from 'react'
import { Navigate, useLoaderData, useNavigate } from 'react-router-dom'
import GenericForm from '../../elements/GenericForm'
import { useUserContext } from '../../Context'
import { type Order } from '../../Types'
import { CharInputWidget } from '../../widgets/CharInput'

export default function ConfirmShipping (): React.ReactNode {
    const navigate = useNavigate()
    const { order } = useLoaderData() as {
        order: Order
    }
    const { user } = useUserContext()

    if (user.pk !== order.seller.pk) {
        return <Navigate to={'/'} />
    }

    return (
        <GenericForm
            extraClass="pamphlet"
            method="PATCH"
            action={`/api/orders/${order.pk}/confirm_shipping/`}
            title="Confirm Shipping"
            button={{ label: 'Confirm Shipping' }}
            hasCSRF
            fields={[
                {
                    name: 'tracking_number',
                    label: 'Tracking Number',
                    widget: CharInputWidget({
                        type: 'text',
                        maxLength: 64
                    })
                }
            ]}
            onSuccess={async () => {
                navigate('/sales/')
            }}
        />
    )
}
