import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Groups({ user }) {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMembers, setEditMembers] = useState([]);

  // Load all groups
  async function load() {
    const { data } = await api.get("/groups");
    setGroups(data);
  }

  useEffect(() => {
    load();
  }, []);

  // Create group
  async function createGroup(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const newGroup = {
      name,
      members: [],
    };
    await api.post("/groups", newGroup);
    setName("");
    await load();
  }

  // Delete group
  async function remove(id) {
    await api.delete(`/groups/${id}`);
    if (selectedGroup && selectedGroup.id === id) {
      setSelectedGroup(null);
      setEditing(null);
    }
    await load();
  }

  // Start editing group
  function startEdit(group) {
    setEditing(group);
    setEditName(group.name);
    setEditMembers(group.members.map(m => ({ ...m })));
    setSelectedGroup(group);
  }

  // View group details
  function viewGroup(group) {
    setSelectedGroup(group);
    setEditing(null);
  }

  // Add new member
  function addMember() {
    setEditMembers(prev => [...prev, { id: Date.now().toString(), name: "", contribution: "0" }]);
  }

  // Update member details
  function updateMember(index, field, value) {
    const updated = [...editMembers];
    updated[index][field] = value;
    setEditMembers(updated);
  }

  // Remove a member
  function removeMember(index) {
    const updated = [...editMembers];
    updated.splice(index, 1);
    setEditMembers(updated);
  }

  // Save edits
  async function saveEdit(e) {
    e.preventDefault();
    await api.put(`/groups/${editing.id}`, {
      name: editName,
      members: editMembers.map(m => ({
        id: m.id,
        name: m.name.trim(),
        contribution: Number(m.contribution) || 0
      })).filter(m => m.name !== ""),
    });
    setEditing(null);
    setSelectedGroup(null);
    await load();
  }

  // Calculate total contribution
  const totalContribution = editMembers.reduce((sum, m) => sum + (Number(m.contribution) || 0), 0);

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
      {/* ===== left panel ===== */}
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Groups</h2>

        <form onSubmit={createGroup} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            className="input"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button className="button">Create</button>
        </form>

        <ul className="list" style={{ marginTop: 0 }}>
          {groups.map((group) => (
            <li key={group.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: '8px 0', borderBottom: '1px solid #444' }}>
              <span
                className="group-name"
                style={{ cursor: "pointer" }}
                onClick={() => viewGroup(group)}
              >
                {group.name}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="icon-pencil" onClick={() => startEdit(group)} title="Edit">✏</button>
                <button className="icon-delete" onClick={() => remove(group.id)} title="Delete">✖</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ===== right panel ===== */}
      <div className="panel" style={{ width: "400px" }}>
        <h2 style={{ marginTop: 0 }}>Balances / Edit</h2>

        {editing ? (
          <form onSubmit={saveEdit}>
            <div style={{ marginBottom: 10 }}>
              <label>Name</label>
              <input
                className="input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>Members</label>
              {editMembers.map((m, index) => (
                <div key={m.id} style={{ display: "flex", gap: "8px", marginBottom: "6px", alignItems: "center" }}>
                  <input
                    className="input"
                    placeholder="Name"
                    value={m.name}
                    onChange={(e) => updateMember(index, "name", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    className="input"
                    type="text"
                    placeholder="Contribution"
                    value={m.contribution}
                    onChange={(e) => updateMember(index, "contribution", e.target.value)}
                    style={{ width: "100px" }}
                  />
                  <button
                    className="icon-delete"
                    type="button"
                    onClick={() => removeMember(index)}
                    title="Remove"
                  >
                    ✖
                  </button>
                </div>
              ))}
              <button type="button" className="button" onClick={addMember}>Add Member</button>
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong>Total Contribution: ₹{totalContribution}</strong>
            </div>
            <button className="button" type="submit">Save</button>
          </form>
        ) : selectedGroup ? (
          <div>
            <p><strong>Group Name:</strong> {selectedGroup.name}</p>
            <p><strong>Total Members:</strong> {selectedGroup.members.filter(m => m.name.trim() !== "").length}</p>
            <p><strong>Total Contribution:</strong> ₹{selectedGroup.members.reduce((sum, m) => sum + (Number(m.contribution) || 0), 0)}</p>
            <p><strong>Members:</strong></p>
            <ul>
              {selectedGroup.members
                .filter(m => m.name.trim() !== "")
                .map(m => (
                  <li key={m.id}>{m.name}</li>
                ))}
            </ul>
          </div>
        ) : (
          <p>No group selected.</p>
        )}
      </div>
    </div>
  );
}
