import React, { useContext, useEffect } from "react";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "./App";


export function useLoginRequired() {
    const { user, setUser } = useContext(UserContext);
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => { 
        if (!user.is_authenticated) {
            navigate({
                pathname: "/login/",
                search: createSearchParams({
                    next: location.pathname
                }).toString()
            });
        }
    }, [])
}


export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};


export const CSRFToken = () => {
    return (
        <input type="hidden" name="csrfmiddlewaretoken" value={getCookie('csrftoken')} />
    );
};

export function normalizeData({data, valueKey, labelKey, parentKey}) {
    return data.map((item) => {
        return {
            value: item[valueKey],
            label: item[labelKey],
            parent: item[parentKey],
        }
    })
}

export function normalizedDataHelpers(data) {
    return {
        getRoute: function getRoute(value) {
            const parent = data.find(choice => choice.value == value).parent;
            if (parent) {
                return [...getRoute(parent), value];
            }
            else {
                return [value];
            };
        },
        getSubChoices: function getSubChoices(value) {
            return data.filter((choice) => choice.parent == value);
        },
    }
};