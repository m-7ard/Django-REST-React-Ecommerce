from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible


@deconstructible
class BasicJsonValidator:
    def __init__(self, types=None):
        self.types = types

    def __call__(self, mydict):
        if not isinstance(mydict, dict):
            raise ValidationError("Value must be a dictionary.")
        
        if self.types is None:
            return

        for key, value in mydict.items():
            if key not in self.types:
                raise ValidationError(f"key {key} should not be present")
            if not isinstance(value, self.types[key]):
                raise ValidationError(
                    f"for {key}, {value} should be a {self.types[key]}"
                )