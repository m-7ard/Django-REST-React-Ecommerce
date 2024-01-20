import React from 'react'

import { useLoaderData, useNavigate } from 'react-router-dom'
import { CharInputWidget } from '../../widgets/CharInput'
import { CharTextAreaWidget } from '../../widgets/CharTextArea'
import { AdImageInputWidget } from '../../widgets/AdImageInput'
import GenericForm from '../../elements/GenericForm'
import { CategoryModalSelectWidget } from '../../widgets/ModalSelects/CategoryModalSelect'
import { PlainModalSelectWidget } from '../../widgets/ModalSelects/PlainModalSelect'
import { AD_CONDITIONS, AD_RETURN_POLICIES, NormalizedData } from '../../Utils'
import { SpecificationInputWidget } from '../../widgets/SpecificationInput'
import { type AdGroup } from '../../Types'

export default function PostAd (): React.ReactNode {
    const navigate = useNavigate()
    const { adGroups } = useLoaderData() as {
        adGroups: AdGroup[]
    }
    const normalizedAdGroups = new NormalizedData({
        data: adGroups,
        labelKey: 'name',
        valueKey: 'pk'
    })

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
                    }),
                    optional: true
                },
                {
                    name: 'category',
                    label: 'Category',
                    widget: CategoryModalSelectWidget({})
                },
                {
                    name: 'images',
                    label: 'Images',
                    widget: AdImageInputWidget({}),
                    optional: true
                },
                {
                    name: 'specifications',
                    label: 'Specifications',
                    widget: SpecificationInputWidget({}),
                    optional: true
                },
                {
                    name: 'group',
                    label: 'Group',
                    widget: PlainModalSelectWidget({
                        title: 'Select Ad Group',
                        normalizedData: normalizedAdGroups,
                        placeholder: 'Select Ad Group'
                    }),
                    optional: true
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
                    label: 'Condition',
                    widget: PlainModalSelectWidget({
                        normalizedData: new NormalizedData({
                            data: AD_CONDITIONS,
                            labelKey: 'label',
                            valueKey: 'value'
                        }),
                        title: 'Select Condition',
                        placeholder: 'Select Condition'
                    }),
                    optional: true
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
