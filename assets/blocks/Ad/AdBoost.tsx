import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdBoostSelectWidget } from '../../widgets/AdBoostSelect'
import GenericForm from '../../elements/GenericForm'

export default function AdBoost (): React.ReactNode {
    const { pk } = useParams()
    const navigate = useNavigate()

    return (
        <GenericForm
            extraClass="pamphlet"
            method="POST"
            action={`/api/ads/${pk}/boost/`}
            title="Boost Ad"
            button={{ label: 'Boost Ad' }}
            hasCSRF
            fields={[
                {
                    name: 'boosts',
                    label: 'Select one or more Boosts',
                    widget: AdBoostSelectWidget({})
                }
            ]}
            onSuccess={async () => {
                navigate('/account/')
            }}
        />
    )
}
