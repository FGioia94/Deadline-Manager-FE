import { useState, useEffect } from "react";
import "./App.css";

import AddAssetForm from "./components/AddAssetForm";
import AddTaskForm from "./components/AddTaskForm";
import RegisterForm from "./components/RegisterForm";
import TaskCard from "./components/TaskCard";

function App() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [unassignedMembers, setUnassignedMembers] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);
  const openRegisterModal = () => setShowRegisterModal(true);
  const closeRegisterModal = () => setShowRegisterModal(false);
  const openAssetModal = () => setShowAssetModal(true);
  const closeAssetModal = () => setShowAssetModal(false);
  const openTaskModal = () => setShowTaskModal(true);
  const closeTaskModal = () => setShowTaskModal(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/tasks/");
        const data = await response.json();
        const sortedTasks = [...data].sort(
          (a, b) => new Date(a.deadline) - new Date(b.deadline)
        );
        setTasks(sortedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/members/");
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    const fetchAssets = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/assets/");
        const data = await response.json();
        setAssets(data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchTasks();
    fetchMembers();
    fetchAssets();
  }, []);

  useEffect(() => {
    if (tasks.length === 0 || members.length === 0) return;

    const assignedNames = tasks
      .map((task) => {
        if (typeof task.artist === "string") {
          return task.artist.trim().toLowerCase();
        }
        if (task.artist && task.artist.name && task.artist.surname) {
          return `${task.artist.name} ${task.artist.surname}`
            .trim()
            .toLowerCase();
        }
        return "";
      })
      .filter(Boolean);

    const unassigned = members.filter((member) => {
      const fullName = `${member.name} ${member.surname}`.trim().toLowerCase();
      return !assignedNames.includes(fullName);
    });

    setUnassignedMembers(unassigned);
  }, [tasks, members]);

  const memberNames = [...members]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((member) => `${member.name} ${member.surname}`);

  const idDict = members.reduce((acc, member) => {
    const fullName = `${member.name} ${member.surname}`.trim().toLowerCase();
    acc[fullName] = { id: member.id, score: member.score };
    return acc;
  }, {});

  const assetDict = assets.reduce((acc, asset) => {
    acc[asset.id] = asset.name;
    return acc;
  }, {});

  const filteredTasks = tasks.filter((task) => {
    const artistName =
      typeof task.artist === "string"
        ? task.artist.trim().toLowerCase()
        : task.artist && task.artist.name && task.artist.surname
        ? `${task.artist.name} ${task.artist.surname}`.trim().toLowerCase()
        : "";

    const matchesArtist = selectedArtist
      ? artistName === selectedArtist.trim().toLowerCase()
      : true;

    const matchesDepartment = selectedDepartment
      ? task.department?.trim().toLowerCase() ===
        selectedDepartment.trim().toLowerCase()
      : true;

    const matchesAsset = selectedAsset
      ? task.asset?.toLowerCase() === selectedAsset.toLowerCase()
      : true;

    return matchesArtist && matchesDepartment && matchesAsset;
  });

  const departmentOptions = [
    ...new Set(tasks.map((task) => task.department)),
  ].filter(Boolean);

  return (
    <div className={`App ${darkMode ? "dark" : "light"}`}>
      <h1>Moonshot Tracker</h1>
      <div id="button-div">
        <button onClick={openRegisterModal}>Register</button>
        <button onClick={openAssetModal}>Add Asset</button>
        <button onClick={openTaskModal}>Add Task</button>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light Theme" : "🌙 Dark Theme"}
        </button>
      </div>

      <RegisterForm isOpen={showRegisterModal} onClose={closeRegisterModal} />
      <AddAssetForm isOpen={showAssetModal} onClose={closeAssetModal} />
      <AddTaskForm isOpen={showTaskModal} onClose={closeTaskModal} />

      <div className="filters">
        <label>
          Filter by Artist:
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
          >
            <option value="">All</option>
            {memberNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Filter by Department:
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </label>

        <label>
          Filter by Asset:
          <select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
          >
            <option value="">All</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.name}>
                {asset.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="task-list">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.name}
            task={task}
            members={memberNames}
            idData={idDict}
            assetData={assetDict}
          />
        ))}
      </div>

      <div className="unassigned-list">
        <h2>🎨 Artists Without Tasks</h2>
        <ul>
          {unassignedMembers.map((member) => (
            <li key={member.id}>
              {member.name} {member.surname}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
