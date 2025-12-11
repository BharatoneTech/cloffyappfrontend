import React, { useEffect, useState } from "react";
import AdmnSidebar from "../../components/admin/admnsidebar";
import { useNavigate } from "react-router-dom";
import { getRewards, deleteReward } from "../../api/admin/rewardsApi";

export default function RewardsList() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const perPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await getRewards();
      const d = res.data;

      let arr =
        (Array.isArray(d) && d) ||
        (Array.isArray(d.data) && d.data) ||
        (Array.isArray(d.rewards) && d.rewards) ||
        (Array.isArray(d.result) && d.result) ||
        [];

      // SAFE CLEANED LIST
      arr = arr.map((x, i) => ({
        id: x.id || x.reward_id || i, // guaranteed key
        coupon_code: x.coupon_code || "",
        apply_on: x.apply_on || "",
        buy: x.buy || "",
        get: x.get || "",
        percentage: x.percentage || "",
      }));

      console.log("FINAL CLEAN REWARD LIST:", arr);

      setList(arr);
    } catch (err) {
      console.error("Failed to load rewards:", err);
      setList([]);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete reward?")) return;
    await deleteReward(id);
    load();
  };

  // ---------------- FILTER ----------------
  const filtered = list.filter((item) =>
    item.coupon_code.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- SORT ----------------
  const sorted = [...filtered];

  if (sortField) {
    sorted.sort((a, b) => {
      const A = a[sortField] ?? "";
      const B = b[sortField] ?? "";

      if (A < B) return sortOrder === "asc" ? -1 : 1;
      if (A > B) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(sorted.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const paginated = sorted.slice(start, end);

  const toggleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const headers = [
    { label: "#", field: null },
    { label: "Coupon", field: "coupon_code" },
    { label: "Apply On", field: "apply_on" },
    { label: "Buy", field: "buy" },
    { label: "Get", field: "get" },
    { label: "% Off", field: "percentage" },
    { label: "Actions", field: null },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{ width: "250px", position: "fixed", left: 0, top: 0 }}>
        <AdmnSidebar />
      </div>

      <div
        style={{
          marginLeft: "270px",
          padding: "35px 30px",
          width: "calc(100% - 260px)",
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "20px" }}>
          Rewards / Coupons
        </h2>

        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Search coupon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "10px 12px",
              width: "250px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={() => navigate("/admin/rewards/add")}
            style={{
              background: "#28a745",
              padding: "10px 18px",
              border: "none",
              color: "white",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            + Add Reward
          </button>
        </div>

        {/* TABLE CARD */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f3f3" }}>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    onClick={h.field ? () => toggleSort(h.field) : undefined}
                    style={{
                      padding: "12px",
                      borderBottom: "2px solid #ddd",
                      cursor: h.field ? "pointer" : "default",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h.label}
                    {sortField === h.field &&
                      (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 20, textAlign: "center" }}>
                    No rewards found.
                  </td>
                </tr>
              ) : (
                paginated.map((rw, i) => (
                  <tr
                    key={rw.id}
                    style={{ transition: "0.2s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9f9f9")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <td style={td}>{start + i + 1}</td>
                    <td style={td}>{rw.coupon_code}</td>
                    <td style={td}>{rw.apply_on}</td>
                    <td style={td}>{rw.buy}</td>
                    <td style={td}>{rw.get}</td>
                    <td style={td}>{rw.percentage}</td>

                    <td style={td}>
                      <button
                        onClick={() => navigate(`/admin/rewards/edit/${rw.id}`)}
                        style={editBtn}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => remove(rw.id)}
                        style={deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  background: page === i + 1 ? "#007bff" : "white",
                  color: page === i + 1 ? "white" : "black",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ------- STYLES -------
const td = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  whiteSpace: "nowrap",
};

const editBtn = {
  padding: "6px 12px",
  background: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  marginRight: "6px",
  cursor: "pointer",
};

const deleteBtn = {
  padding: "6px 12px",
  background: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};
