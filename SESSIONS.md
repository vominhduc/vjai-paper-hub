# Managing Session Information

To update or add a new session (cycle):

1. **Edit `data/cycles.json`**
   - Each entry is a cycle (session/month).
   - Add or update the following fields:
     - `id`: Unique string (e.g. `2026-q2-c1`)
     - `month`: Month name (e.g. `April`)
     - `year`: Year (e.g. `2026`)
     - `session_date`: Date of the session (YYYY-MM-DD)
     - `nominations`: Array of nominated papers
     - `session`:
         - `date`: Session date (YYYY-MM-DD)
         - `presenter`: Name
         - `presenter_role`: Role/title
         - `agenda`: Array of agenda items

2. **Save your changes.**

3. **The UI will automatically reflect the new session/month.**

---

**Example:**
```json
{
  "id": "2026-q2-c3",
  "month": "May",
  "year": 2026,
  "session_date": "2026-05-10",
  "nominations": [],
  "session": {
    "date": "2026-05-10",
    "presenter": "",
    "presenter_role": "",
    "agenda": []
  }
}
```
