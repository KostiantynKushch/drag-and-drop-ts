interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate({
  value,
  required,
  minLength,
  maxLength,
  min,
  max,
}: Validatable) {
  let isValid = true;

  if (required) {
    isValid = value.toString().trim().length !== 0;
  }

  if (typeof value === "string") {
    const inputString = value.trim();

    if (minLength != null && isValid) {
      isValid = inputString.length >= minLength;
    }
    if (maxLength != null && isValid) {
      isValid = inputString.length <= maxLength;
    }
  }

  if (typeof value === "number") {
    if (min != null && isValid) {
      isValid = value >= min;
    }
    if (max != null && isValid) {
      isValid = value <= max;
    }
  }

  return isValid;
}
