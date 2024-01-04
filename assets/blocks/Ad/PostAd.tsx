import React from 'react'

import { useNavigate } from 'react-router-dom'
import { CharInputWidget } from '../../widgets/CharInput'
import { CharTextAreaWidget } from '../../widgets/CharTextArea'
import { AdImageInputWidget } from '../../widgets/AdImageInput'
import GenericForm from '../../elements/GenericForm'
import { CategoryModalSelectWidget } from '../../widgets/ModalSelects/CategoryModalSelect'
import { PlainModalSelectWidget } from '../../widgets/ModalSelects/PlainModalSelect'
import { AD_CONDITIONS, AD_RETURN_POLICIES, NormalizedData } from '../../Utils'

export default function PostAd (): React.ReactNode {
    const navigate = useNavigate()

    return (
        <GenericForm
            extraClass="pamphlet"
            method="POST"
            action="/api/ads/"
            title="Post Ad"
            button={{ label: 'Post Ad' }}
            hasCSRF
            fields={[
                {
                    name: 'title',
                    label: 'Title',
                    widget: CharInputWidget({
                        type: 'text',
                        maxLength: 64
                    })
                },
                {
                    name: 'price',
                    label: 'Price',
                    widget: CharInputWidget({
                        inputMode: 'numeric'
                    })
                },
                {
                    name: 'shipping',
                    label: 'Shipping Cost',
                    widget: CharInputWidget({
                        inputMode: 'numeric'
                    })
                },
                {
                    name: 'description',
                    label: 'Description',
                    widget: CharTextAreaWidget({
                        maxLength: 4096
                    })
                },
                {
                    name: 'category',
                    label: 'Category',
                    widget: CategoryModalSelectWidget({})
                },
                {
                    name: 'images',
                    label: 'Images',
                    widget: AdImageInputWidget({})
                },
                {
                    name: 'available',
                    label: 'Amount Available',
                    widget: CharInputWidget({
                        inputMode: 'numeric'
                    })
                },
                {
                    name: 'condition',
                    label: 'Condition (Optional)',
                    widget: PlainModalSelectWidget({
                        normalizedData: new NormalizedData({
                            data: AD_CONDITIONS,
                            labelKey: 'label',
                            valueKey: 'value'
                        }),
                        title: 'Select Condition',
                        placeholder: 'Select Condition'
                    })
                },
                {
                    name: 'return_policy',
                    label: 'Return Policy',
                    widget: PlainModalSelectWidget({
                        normalizedData: new NormalizedData({
                            data: AD_RETURN_POLICIES,
                            labelKey: 'label',
                            valueKey: 'value'
                        }),
                        title: 'Select Return Policy',
                        placeholder: 'Select Return Policy'
                    })
                }
            ]}
            onSuccess={async (response: Response) => {
                const ad = await response.json()
                navigate('success/', { state: ad })
            }}
        />
    )
}
