import React, { useState } from "react";
import "../assets/css/TaskCard.css";
import { Form, Button } from "react-bootstrap";

const TaskCard = ({
  task,
  members,
  idData,
  artistFilter = "all",
  assetFilter = "all",
}) => {
  if (
    (artistFilter !== "all" && artistFilter !== task.artist) ||
    (assetFilter !== "all" && assetFilter !== task.asset)
  ) {
    return null;
  }

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  console.log(deadlineDate)
  const now = new Date();
  const daysDiff = deadlineDate
    ? Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24))
    : Infinity;

  const [status, setStatus] = useState(task.status || "");
  const urgencyClass =
    status === "Pending Review"
      ? "pending-review"
      : daysDiff < 0
      ? "overdue"
      : daysDiff === 0
      ? "today"
      : daysDiff <= 7
      ? "urgent"
      : daysDiff <= 12
      ? "soon"
      : "normal";

  const assetName = task.asset || "No asset assigned";
  const [date, setDate] = useState("");
  const [artist, setArtist] = useState("");
  const [password, setPassword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [affectScore, setAffectScore] = useState(false);

  const getCookie = (name) => {
    return document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(name + "="))
      ?.split("=")[1];
  };

  const patchTask = async (payload) => {
    await fetch("https://moonshotcgi.pythonanywhere.com/csrf/", {
      method: "GET",
      credentials: "include",
    });
    const csrfToken = getCookie("csrftoken");
    const res = await fetch("https://moonshotcgi.pythonanywhere.com/tasks/", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Server response:", errorText);
      throw new Error("Update failed");
    } else {
      window.location.reload();
    }
  };

  const updateScore = async (id, change) => {
    await fetch("https://moonshotcgi.pythonanywhere.com/csrf/", {
      method: "GET",
      credentials: "include",
    });
    const csrfToken = getCookie("csrftoken");
    await fetch(`https://moonshotcgi.pythonanywhere.com/members/${id}/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ score: change }),
    });
  };

  const fetchTask = async () => {
    try {
      const res = await fetch(`https://moonshotcgi.pythonanywhere.com/tasks/${task.id}/`);
      if (!res.ok) throw new Error("Task not found");
      const updatedTask = await res.json();
      setStatus(updatedTask.status);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const handleDeadlineSubmit = async (e) => {
      e.preventDefault();
      if (password !== "aaaa") {
        alert("Incorrect password");
        return;
      }

      try {
        const today = new Date();
        const originalDue = deadlineDate;

        const normalizedArtist = task.artist?.trim().toLowerCase();
        const id = idData?.[normalizedArtist]?.id;

        let change = 0;

        if (affectScore && originalDue) {
          const daysBeforeDeadline = Math.ceil((originalDue - today) / (1000 * 60 * 60 * 24));
          

          if (daysBeforeDeadline >= 10) {
            change = 0;
          } else if (daysBeforeDeadline >= 7) {
            change = -0.25;
          } else if (daysBeforeDeadline >= 3) {
            change = -0.5;
          } else if (daysBeforeDeadline >= 1) {
            change = -0.75;
          } else {
            change = -1;
          }

          if (!id) {
            alert(`ID non trovato per l'artista: ${task.artist}`);
          } else {
            await updateScore(id, change);
          }
        }
        
        await patchTask({
          name: task.name,
          department: task.department,
          artist: task.artist,
          deadline: date,
          asset: task.asset,
          status,
        });

        await fetchTask();
      } catch (err) {
        console.error(err);
      }
    };

  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    if (password !== "aaaa") {
      alert("Incorrect password");
      return;
    }
    try {
      await patchTask({
        name: task.name,
        department: task.department,
        artist,
        deadline: task.deadline,
        asset: task.asset,
        status,
      });

      await fetchTask();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async () => {
    if (password !== "aaaa") {
      alert("Incorrect password");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    await fetch("https://moonshotcgi.pythonanywhere.com/tasks/csrf/", {
      method: "GET",
      credentials: "include",
    });
    const csrfToken = getCookie("csrftoken");

    const res = await fetch(
      `https://moonshotcgi.pythonanywhere.com/tasks/?name=${encodeURIComponent(task.name)}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
      }
    );
    if (!res.ok) {
      alert("Failed to delete task");
      return;
    }

    if (affectScore) {
      const today = new Date().toISOString().split("T")[0];
      const due = deadlineDate?.toISOString().split("T")[0] || today;
      let change = today < due ? 1 : today > due ? -1 : 0.5;

      const normalizedArtist = task.artist?.trim().toLowerCase();
      const id = idData?.[normalizedArtist]?.id;
      if (!id) {
        alert(`Could not find ID for artist: ${task.artist}`);
      } else {
        await updateScore(id, change);
      }
    }

    alert("Task deleted!");
    window.location.reload();
  };

  const togglePendingReview = async () => {
    const newStatus = status === "Pending Review" ? "" : "Pending Review";

    const payload = {
      name: task.name,
      department: task.department || "",
      artist: task.artist || "",
      deadline: task.deadline || "2025-12-31",
      asset: task.asset || null,
      status: newStatus,
    };

    try {
      await patchTask(payload);
      await fetchTask();
    } catch (err) {
      console.error("PATCH failed:", err);
      alert("Update failed — check console for details.");
    }
  };

  return (
    <div className={`card task-card ${urgencyClass}`}>
      <div
        className="card-header"
        onClick={() => setIsOpen((open) => !open)}
        style={{ cursor: "pointer" }}
      >
        <h2>{task.name.toUpperCase()}</h2>
        <h3>{assetName}</h3>
        <h3>{task.department}</h3>
        <h3>{task.artist}</h3>
        <h3>{task.deadline}</h3>
        <h3>{status}</h3>
      </div>

      {isOpen && (
        <div className="card-body">
          <Form onSubmit={handleDeadlineSubmit}>
            <Form.Group controlId="updatePassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="updateDate" className="mt-3">
              <Form.Label>Update Deadline</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="warning" type="submit" className="mt-2">
              Update Deadline
            </Button>
          </Form>

          <Form onSubmit={handleArtistSubmit} className="mt-4">
            <Form.Group controlId="updateArtist">
              <Form.Label>Update Artist</Form.Label>
              <Form.Select
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
              >
                <option value="">Select an artist</option>
                {[...new Set(members)].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="info" type="submit" className="mt-2">
              Update Artist
            </Button>
          </Form>

          <Form.Group controlId="affectScore" className="mt-3">
            <Form.Check
              type="checkbox"
              label="Affect Score"
              checked={affectScore}
              onChange={(e) => setAffectScore(e.target.checked)}
            />
          </Form.Group>

          <Button variant="danger" className="mt-4" onClick={deleteTask}>
            🗑️ Task Completed
          </Button>

          <Button
            variant="warning"
            className="mt-2"
            onClick={togglePendingReview}
          >
            {status === "Pending Review"
              ? "↩️ Remove Pending Review"
              : "🟠 Set as Pending Review"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
