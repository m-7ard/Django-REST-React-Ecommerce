import React from 'react'
import { useNavigate } from 'react-router-dom'
import GenericForm from '../../elements/GenericForm'
import { CharInputWidget } from '../../widgets/CharInput'
import { NormalizedData, listOfCountries } from '../../Utils'
import { PlainModalSelectWidget } from '../../widgets/ModalSelects/PlainModalSelect'

export default function CreateAddress (): React.ReactNode {
    const navigate = useNavigate()

    return <GenericForm
        extraClass="pamphlet"
        method="POST"
        action='/api/addresses/'
        title='Create New Address'
        button={{ label: 'Create Address' }}
        hasCSRF
        resettable
        fields={[
            {
                name: 'name',
                label: 'Name',
                widget: CharInputWidget({
                    type: 'text',
                    maxLength: 100
                })
            },
            {
                name: 'street',
                label: 'Street',
                widget: CharInputWidget({
                    type: 'text',
                    maxLength: 100
                })
            },
            {
                name: 'locality',
                label: 'Locality',
                widget: CharInputWidget({
                    type: 'text',
                    maxLength: 100
                })
            },
            {
                name: 'zip_code',
                label: 'Zip Code',
                widget: CharInputWidget({
                    type: 'text',
                    maxLength: 32
                })
            },
            {
                name: 'country',
                label: 'Country',
                widget: PlainModalSelectWidget({
                    normalizedData: new NormalizedData({
                        data: listOfCountries,
                        labelKey: 'name',
                        valueKey: 'code'
                    }),
                    title: 'Select Country',
                    placeholder: 'Select Country'
                })
            }
        ]}
        onSuccess={async () => {
            navigate('/addresses/')
        }}
    />
}
