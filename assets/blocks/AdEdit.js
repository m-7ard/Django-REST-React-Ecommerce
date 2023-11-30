import React from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import GenericForm from '../elements/GenericForm';
import { getAdData } from '../Fetchers';

import {
    CharInput,
    CharTextArea,
    CategoryPicker,
    AdImageInput,
} from '../Widgets';

export async function loader({ params }) {
    const ad = await getAdData(params.pk);
    return { ad };
}

export default function AdEdit() {
    const navigate = useNavigate();
    const { ad } = useLoaderData();

    return (
        <GenericForm
            extraClass="pamphlet"
            method="PATCH"
            action={`/api/ads/${ad.pk}/`}
            title="Edit Ad"
            button={{ label: 'Edit Ad' }}
            hasCSRF
            resettable
            fields={[
                {
                    name: 'title',
                    label: 'Title',
                    widget: {
                        component: CharInput,
                        props: {
                            type: 'text',
                            maxLength: 64,
                            defaultValue: ad.title,
                        },
                    },
                },
                {
                    name: 'price',
                    label: 'Price',
                    widget: {
                        component: CharInput,
                        props: {
                            inputMode: 'numeric',
                            defaultValue: ad.price,
                        },
                    },
                },
                {
                    name: 'description',
                    label: 'Description',
                    widget: {
                        component: CharTextArea,
                        props: {
                            maxLength: 4096,
                            initial: ad.description,
                        },
                    },
                },
                {
                    name: 'category',
                    label: 'Category',
                    widget: {
                        component: CategoryPicker,
                        props: {
                            initial: ad.category,
                        },
                    },
                },
                {
                    name: 'images',
                    label: 'Images',
                    widget: {
                        component: AdImageInput,
                        props: {
                            initial: ad.images,
                        },
                    },
                },
            ]}
            onSuccess={async () => {
                navigate('success/', { state: ad });
            }}
        />
    );
}
