const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

export function loginErrors({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required";
  else if (!emailPattern.test(email.trim())) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Use at least 6 characters";
  return errors;
}

export function signupErrors(values, people) {
  const errors = loginErrors(values);
  if (!values.name.trim()) errors.name = "Name is required";
  else if (values.name.trim().length < 2) errors.name = "Name looks too short";
  else if (values.name.trim().length > 40) errors.name = "Keep your name under 40 characters";

  if (!values.username.trim()) errors.username = "Username is required";
  else if (!usernamePattern.test(values.username.trim())) {
    errors.username = "Use 3–20 letters, numbers, or underscores";
  } else if (people.some((person) => person.username.toLowerCase() === values.username.trim().toLowerCase())) {
    errors.username = "That username is taken";
  }

  if (people.some((person) => person.email.toLowerCase() === values.email.trim().toLowerCase())) {
    errors.email = "An account with this email already exists";
  }

  if (!values.confirm) errors.confirm = "Confirm your password";
  else if (values.confirm !== values.password) errors.confirm = "Passwords do not match";

  return errors;
}

export function profileErrors(values, people, currentId) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  else if (values.name.trim().length < 2) errors.name = "Name looks too short";
  else if (values.name.trim().length > 40) errors.name = "Keep your name under 40 characters";

  if (!values.username.trim()) errors.username = "Username is required";
  else if (!usernamePattern.test(values.username.trim())) {
    errors.username = "Use 3–20 letters, numbers, or underscores";
  } else if (
    people.some(
      (person) => person.id !== currentId && person.username.toLowerCase() === values.username.trim().toLowerCase(),
    )
  ) {
    errors.username = "That username is taken";
  }

  if (values.bio.trim().length > 160) errors.bio = "Bio can be 160 characters";
  if (values.location.trim().length > 40) errors.location = "Keep location under 40 characters";
  if (values.website.trim().length > 80) errors.website = "That website is too long";
  return errors;
}

export function passwordStrength(password) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(4, score);
}
