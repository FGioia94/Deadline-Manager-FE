// FormModal.jsx
import React from "react";
import { Form, Button } from "react-bootstrap";
import { getCookie } from "../assets/utilities/token";

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.nameRef = React.createRef();
    this.surnameRef = React.createRef();
    this.emailRef = React.createRef();
    this.passwordRef = React.createRef();
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const name = this.nameRef.current.value.trim();
    const surname = this.surnameRef.current.value.trim();
    const email = this.emailRef.current.value.trim();
    const password = this.passwordRef.current.value;

    // Require password to be exactly "aaaa"
    if (password !== "aaaa") {
      alert("Wrong Password.");
      return;
    }

    try {
      // Get CSRF token
      await fetch("https://moonshotcgi.pythonanywhere.com/csrf/", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = getCookie("csrftoken");

      // Submit registration
      const res = await fetch("https://moonshotcgi.pythonanywhere.com/members/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          name,
          surname,
          email,
          password,
        }),
      });

      if (!res.ok) throw new Error("Request Error");

      const data = await res.json();
      console.log("Registration successful:", data);
      this.props.onClose();
    } catch (err) {
      console.error("Error:", err);
      alert("Registration failed. Please try again.");
    }
  };

  render() {
    const { isOpen, onClose, children } = this.props;

    if (!isOpen) return null;

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          {children}
        </div>

        <Form onSubmit={this.handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" placeholder="Name" ref={this.nameRef} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Surname</Form.Label>
            <Form.Control type="text" placeholder="Surname" ref={this.surnameRef} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Email" ref={this.emailRef} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Password <span style={{ color: "red" }}>*</span>
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              ref={this.passwordRef}
              required
            />

          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </div>
    );
  }
}

export default RegisterForm;