// AddTaskForm.jsx
import React from "react";
import { Form, Button } from "react-bootstrap";
import { getCookie } from "../assets/utilities/token";
import "../assets/css/AddTaskForm.css";

class AddTaskForm extends React.Component {
  constructor(props) {
    super(props);
    this.taskNameRef = React.createRef();
    this.passwordRef = React.createRef();
    this.state = {
      selectedDepartment: "",
      selectedAssetId: "",
      selectedArtist: "",
      selectedDeadline: "",
      assets: [],
      artists: [],
    };
  }

  componentDidMount() {
    // Fetch assets
    fetch("https://moonshotcgi.pythonanywhere.com/assets/")
      .then((res) => res.json())
      .then((data) => {
        this.setState({ assets: data });
      })
      .catch((err) => {
        console.error("Error fetching assets:", err);
      });

    // Fetch artists
    fetch("https://moonshotcgi.pythonanywhere.com/members/")
      .then((res) => res.json())
      .then((data) => {
        const fullNames = data.map((member) => `${member.name} ${member.surname}`);
        this.setState({ artists: fullNames });
      })
      .catch((err) => {
        console.error("Error fetching artists:", err);
      });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const {
      selectedDepartment,
      selectedAssetId,
      selectedArtist,
      selectedDeadline,
    } = this.state;

    const taskName = this.taskNameRef.current.value.trim();
    const password = this.passwordRef.current.value;

    if (!taskName || !selectedDepartment || !selectedArtist) {
      alert("Please fill out all required fields.");
      return;
    }

    if (password !== "aaaa") {
      alert("Wrong Password");
      return;
    }

    await fetch("https://moonshotcgi.pythonanywhere.com/csrf/", {
      method: "GET",
      credentials: "include",
    });

    const csrfToken = getCookie("csrftoken");

    fetch("https://moonshotcgi.pythonanywhere.com/tasks/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        name: taskName,
        department: selectedDepartment,
        artist: selectedArtist,
        deadline: selectedDeadline || "2025-12-31",
        status: "Not Started",
        asset: selectedAssetId || null,
        password,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Request Error");
        return res.json();
      })
      .then((data) => {
        console.log("Task Created Successfully:", data);
        this.props.onClose();
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };

  render() {
    const {
      isOpen,
      onClose,
      children,
    } = this.props;

    const {
      selectedDepartment,
      selectedAssetId,
      selectedArtist,
      selectedDeadline,
      assets,
      artists,
    } = this.state;

    if (!isOpen) return null;

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <button className="close-btn" onClick={onClose}>×</button>
          {children}
        </div>

        <Form onSubmit={this.handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Task Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Task Name"
              ref={this.taskNameRef}
              required
            />
          </Form.Group>

          <Form.Group controlId="departmentSelect">
            <Form.Label>Department</Form.Label>
            <Form.Select
              value={selectedDepartment}
              onChange={(e) => this.setState({ selectedDepartment: e.target.value })}
              required
            >
              <option value="">-- Choose Department --</option>
              <option value="modeling">Modeling</option>
              <option value="texturing">Texturing</option>
              <option value="rigging">Rigging</option>
              <option value="lookdev">Lookdev</option>
              <option value="grooming">Grooming</option>
              <option value="animation">Animation</option>
              <option value="fx">FX</option>
              <option value="cfx-muscle">CFX Muscle</option>
              <option value="cfx-hair">CFX Hair</option>
              <option value="lighting">Lighting</option>
              <option value="pipeline">Pipeline</option>
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="artistSelect">
            <Form.Label>Artist</Form.Label>
            <Form.Select
              value={selectedArtist}
              onChange={(e) => this.setState({ selectedArtist: e.target.value })}
              required
            >
              <option value="">-- Choose Artist --</option>
              {artists.map((fullName, index) => (
                <option key={index} value={fullName}>
                  {fullName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="deadlineInput">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              type="date"
              value={selectedDeadline}
              onChange={(e) => this.setState({ selectedDeadline: e.target.value })}
            />
          </Form.Group>

          <Form.Group controlId="assetSelect">
            <Form.Label>Asset</Form.Label>
            <Form.Select
              value={selectedAssetId}
              onChange={(e) => this.setState({ selectedAssetId: e.target.value })}
            >
              <option value="">-- Choose Asset --</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              ref={this.passwordRef}
              required
            />

          </Form.Group>

          <Button variant="primary" type="submit" className="mt-3">
            Submit
          </Button>
        </Form>
      </div>
    );
  }
}

export default AddTaskForm;