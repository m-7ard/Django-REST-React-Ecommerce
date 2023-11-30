import React from "react";

import { useLoginRequired } from "../Utils";
import CharInput from "../widgets/CharInput";
import CharTextArea from "../widgets/CharTextArea";
import CategoryPicker from "../widgets/CategoryPicker";
import AdImageInput from "../widgets/AdImageInput";
import GenericForm from "../elements/GenericForm";


export default function PostAd() {
    useLoginRequired();

    return (
        <GenericForm 
            extraClass={"pamphlet"}
            method={"POST"}
            action={`/api/ads/`}
            title={"Post Ad"}
            button={{"label": "Post Ad"}}
            hasCSRF={true}
            resettable={true}
            fields={[
                {
                    name: 'title',
                    label: 'Title',
                    widget: {
                        component: CharInput,
                        props: {
                            type: 'text',
                            maxLength: 64,
                        }
                    }
                },
                {
                    name: 'price',
                    label: 'Price',
                    widget: {
                        component: CharInput,
                        props: {
                            inputMode: 'numeric',
                        }
                    }
                },
                {
                    name: 'description',
                    label: 'Description',
                    widget: {
                        component: CharTextArea,
                        props: {
                            maxLength: 4096,
                        }
                    }
                },
                {
                    name: 'category',
                    label: 'Category',
                    widget: {
                        component: CategoryPicker,
                        props: {},
                    }
                },
                {
                    name: 'images',
                    label: 'Images',
                    widget: {
                        component: AdImageInput,
                        props: {},
                    }
                },
            ]}
            onSuccess={async (response) => {
                const ad = await response.json();
                navigate('success/', {state: ad});
            }}
        />
    )
};