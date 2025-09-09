// AddAssetForm.jsx
import React from "react";
import { Form, Button } from "react-bootstrap";
import { getCookie } from "../assets/utilities/token";
import "../assets/css/AddAssetForm.css";

class AddAssetForm extends React.Component {
  constructor(props) {
    super(props);
    this.assetNameRef = React.createRef();
    this.passwordRef = React.createRef();
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const assetName = this.assetNameRef.current.value.trim();
    const password = this.passwordRef.current.value;

    // Validate password only
    if (password !== "aaaa") {
      alert("Wrong Password");
      return;
    }

    try {
      // Fetch CSRF token
      await fetch("https://moonshotcgi.pythonanywhere.com/csrf/", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = getCookie("csrftoken");
      console.log("CSRF Token:", csrfToken);

      // Submit asset
      const res = await fetch("https://moonshotcgi.pythonanywhere.com/assets/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ name: assetName, password }),
      });

      if (!res.ok) throw new Error("Request Error");

      const data = await res.json();
      console.log("Asset Created Successfully:", data);
      this.props.onClose();
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to create asset. Please try again.");
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
            <Form.Label>Asset Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Asset Name"
              ref={this.assetNameRef}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
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

export default AddAssetForm;